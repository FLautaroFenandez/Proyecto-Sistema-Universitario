/**
 * @file cobranza.js
 * @description Servicio de cobranza de la app (patrón **Facade**).
 * Las pantallas piden "mis hijos", "las cuotas de este alumno" o "emitir el
 * comprobante"; solo este archivo sabe qué tablas, vistas y funciones se usan.
 *
 *   HU-M1 · consultar cuotas ............ misHijos, facturasDe, factura
 *   HU-M2 · elegir ítems y pagar ........ emitirComprobante, comprobante
 *   HU-M4 · adjuntar la transferencia ... adjuntarTransferencia, enlaceDelArchivo
 *   HU-M3 · historial y deuda ........... cicloVigente, historial
 *
 * Regla del enunciado: "un padre solamente puede consultar la información de sus
 * hijos". La aplica la base (función alumnos_a_cargo y políticas RLS de
 * docs/supabase-cobranza.sql): aunque acá se pidiera otro alumno, no devolvería nada.
 *
 * La familia no escribe en las tablas de cobranza. Las dos únicas escrituras son
 * llamadas a funciones de la base (`rpc`), que validan todo y hacen el cambio completo
 * en una sola transacción: un pago nunca queda a medias.
 */

import { File } from 'expo-file-system'
import { ARCHIVO_COMPROBANTE } from '../config/institucion'
import { supabase } from '../lib/supabase'
import { ejecutar, ErrorDeServicio } from './base'

/** Bucket privado de Supabase Storage donde van las transferencias. */
const BUCKET = 'comprobantes'

const ALUMNO_CON_CURSO =
  'id, legajo, apellido, nombre, ' +
  'matriculas(estado, curso:cursos(anio, division, nivel:niveles(nombre), ciclo:ciclos_lectivos(activo)))'

/** Curso de la matrícula activa del ciclo vigente: "3.º A · Primario". Vacío si no tiene. */
function cursoVigente(alumno) {
  const matricula = (alumno.matriculas ?? []).find(m => m.estado === 'activa' && m.curso?.ciclo?.activo)
  if (!matricula) return ''
  const { anio, division, nivel } = matricula.curso
  const nombreNivel = nivel?.nombre ?? ''
  return `${anio}.º ${division} · ${nombreNivel.charAt(0).toUpperCase()}${nombreNivel.slice(1)}`
}

export const cobranza = {

  /**
   * Hijos vinculados al tutor, con su curso.
   * @param {string} tutorId
   * @returns {Promise<Array<{id: string, nombre: string, apellido: string, legajo: string, curso: string}>>}
   */
  async misHijos(tutorId) {
    if (!tutorId) return []
    const vinculos = await ejecutar(
      supabase.from('alumno_tutor').select(`alumno:alumnos(${ALUMNO_CON_CURSO})`).eq('tutor_id', tutorId),
      'cargar tus hijos',
    )
    return vinculos
      .filter(v => v.alumno)
      .map(({ alumno }) => ({
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        legajo: alumno.legajo,
        curso: cursoVigente(alumno),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  },

  /**
   * Facturas de un alumno, de la más nueva a la más vieja, con su estado calculado.
   * Lee la vista `facturas_estado`: total, pagado, saldo, estado y vencida no se
   * guardan, se calculan en la base, así la web y la app ven siempre lo mismo.
   */
  async facturasDe(alumnoId) {
    return ejecutar(
      supabase
        .from('facturas_estado')
        .select('id, numero, periodo, vencimiento, total, pagado, en_proceso, saldo, estado, vencida')
        .eq('alumno_id', alumnoId)
        .order('periodo', { ascending: false }),
      'cargar las cuotas',
    )
  },

  /**
   * Una factura con el detalle de sus ítems. Cada ítem trae su comprobante, si tiene:
   * es lo que permite ver la deuda discriminada por ítem.
   * @returns {Promise<{factura: object, items: object[]} | null>} null si no existe o no es de un hijo.
   */
  async factura(facturaId) {
    const [factura, items] = await Promise.all([
      ejecutar(
        supabase
          .from('facturas_estado')
          .select('id, numero, periodo, vencimiento, total, pagado, en_proceso, saldo, estado, vencida')
          .eq('id', facturaId)
          .maybeSingle(),
        'cargar la factura',
      ),
      ejecutar(
        supabase
          .from('factura_items')
          .select('id, descripcion, importe, comprobante:comprobantes(id, numero, estado)')
          .eq('factura_id', facturaId)
          .order('importe', { ascending: false }),
        'cargar el detalle de la factura',
      ),
    ])
    return factura ? { factura, items } : null
  },

  // ── HU-M2: elegir los ítems y emitir el comprobante ───────────────────────

  /**
   * Emite el comprobante de pago por los ítems elegidos de una factura.
   * La base comprueba que la factura sea de un hijo, que los ítems sean de esa factura
   * y que ninguno tenga ya un pago; si algo no se cumple, rechaza todo con un mensaje.
   *
   * @param {string} facturaId
   * @param {string[]} itemIds - Ítems tildados por el padre
   * @returns {Promise<string>} id del comprobante emitido
   */
  async emitirComprobante(facturaId, itemIds) {
    return ejecutar(
      supabase.rpc('emitir_comprobante', { p_factura: facturaId, p_items: itemIds }),
      'emitir el comprobante',
    )
  },

  /**
   * Un comprobante con su factura y los ítems que cubre.
   * @returns {Promise<object | null>} null si no existe o no es de un hijo.
   */
  async comprobante(comprobanteId) {
    return ejecutar(
      supabase
        .from('comprobantes')
        .select(
          'id, numero, importe, estado, archivo_path, created_at, informado_at, ' +
          'factura:facturas(id, numero, periodo, alumno_id), ' +
          'items:factura_items(id, descripcion, importe)',
        )
        .eq('id', comprobanteId)
        .maybeSingle(),
      'cargar el comprobante',
    )
  },

  // ── HU-M4: adjuntar la transferencia ──────────────────────────────────────

  /**
   * Sube el archivo de la transferencia y la informa.
   *
   * Son dos pasos: primero el archivo va al bucket privado, a la carpeta del alumno;
   * después la base comprueba que ese archivo exista y marca el comprobante como
   * informado. Cada archivo lleva la hora en el nombre: nunca pisa a otro.
   *
   * @param {{id: string, factura: {alumno_id: string}}} comprobante
   * @param {{uri: string, mimeType?: string, size?: number}} archivo - Elegido por el padre
   */
  async adjuntarTransferencia(comprobante, archivo) {
    const extension = ARCHIVO_COMPROBANTE.tipos[archivo.mimeType]
    if (!extension) {
      throw new ErrorDeServicio('El comprobante tiene que ser una imagen JPG o PNG, o un PDF.')
    }
    if (archivo.size > ARCHIVO_COMPROBANTE.tamanioMaximo) {
      throw new ErrorDeServicio('El archivo supera los 5 MB. Elegí uno más liviano.')
    }

    const ruta = `${comprobante.factura.alumno_id}/${comprobante.id}-${Date.now()}.${extension}`
    const contenido = await new File(archivo.uri).arrayBuffer()

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(ruta, contenido, { contentType: archivo.mimeType })
    if (error) {
      console.error('[servicios] Falló al subir el comprobante:', error)
      throw new ErrorDeServicio('No se pudo subir el archivo. Revisá tu conexión e intentá de nuevo.', error)
    }

    await ejecutar(
      supabase.rpc('informar_transferencia', { p_comprobante: comprobante.id, p_archivo: ruta }),
      'informar la transferencia',
    )
  },

  /**
   * Enlace temporal (60 segundos) para abrir el archivo de una transferencia.
   * El bucket es privado: solo lo puede generar el tutor del alumno o la Administración.
   * @returns {Promise<string>}
   */
  async enlaceDelArchivo(ruta) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 60)
    if (error) {
      console.error('[servicios] Falló al abrir el comprobante:', error)
      throw new ErrorDeServicio('No se pudo abrir el archivo. Intentá de nuevo.', error)
    }
    return data.signedUrl
  },

  // ── HU-M3: historial de facturas y deuda ──────────────────────────────────

  /**
   * Fechas del ciclo lectivo vigente: marcan entre qué meses se puede filtrar el historial.
   * @returns {Promise<{fecha_inicio: string, fecha_fin: string} | null>}
   */
  async cicloVigente() {
    return ejecutar(
      supabase.from('ciclos_lectivos').select('fecha_inicio, fecha_fin').eq('activo', true).maybeSingle(),
      'cargar el ciclo lectivo',
    )
  },

  /**
   * Facturas de un alumno entre dos períodos, con sus comprobantes, y la deuda
   * discriminada por ítem.
   *
   * Un ítem se considera adeudado mientras su transferencia no esté informada: es el
   * mismo criterio con el que la base calcula el saldo de la factura.
   *
   * @param {string} alumnoId
   * @param {string} desde - Período inicial, 'AAAA-MM-01'
   * @param {string} hasta - Período final, 'AAAA-MM-01'
   * @returns {Promise<{facturas: object[], deuda: object[], totalAdeudado: number}>}
   */
  async historial(alumnoId, desde, hasta) {
    const facturas = await ejecutar(
      supabase
        .from('facturas_estado')
        .select('id, numero, periodo, vencimiento, total, pagado, saldo, estado, vencida')
        .eq('alumno_id', alumnoId)
        .gte('periodo', desde)
        .lte('periodo', hasta)
        .order('periodo', { ascending: false }),
      'cargar el historial',
    )
    if (facturas.length === 0) return { facturas: [], deuda: [], totalAdeudado: 0 }

    const idsDeFacturas = facturas.map(f => f.id)
    const [comprobantes, items] = await Promise.all([
      ejecutar(
        supabase
          .from('comprobantes')
          .select('id, numero, importe, estado, created_at, factura_id')
          .in('factura_id', idsDeFacturas)
          .order('numero'),
        'cargar los comprobantes',
      ),
      ejecutar(
        supabase
          .from('factura_items')
          .select('id, descripcion, importe, factura_id, comprobante:comprobantes(estado)')
          .in('factura_id', idsDeFacturas),
        'cargar la deuda',
      ),
    ])

    const periodoDe = Object.fromEntries(facturas.map(f => [f.id, f.periodo]))
    const deuda = items
      .filter(item => item.comprobante?.estado !== 'informado')
      .map(item => ({
        id: item.id,
        descripcion: item.descripcion,
        importe: item.importe,
        periodo: periodoDe[item.factura_id],
        enProceso: item.comprobante?.estado === 'emitido',
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo) || b.importe - a.importe)

    return {
      facturas: facturas.map(f => ({ ...f, comprobantes: comprobantes.filter(c => c.factura_id === f.id) })),
      deuda,
      totalAdeudado: deuda.reduce((suma, item) => suma + item.importe, 0),
    }
  },
}
