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
 *   Etapa 4b · consultar servicios ...... inscripcionesDe
 *   HU-M5 · inscribir y dar de baja ..... serviciosParaInscribir, mesesParaCambiar,
 *                                         inscribir, inscripcion, darDeBaja
 *   Avisos de cobranza .................. avisos
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
import { inicioDeMes, sumarMeses } from '../utils/formato'
import { ejecutar, ErrorDeServicio } from './base'

/** Bucket privado de Supabase Storage donde van las transferencias. */
const BUCKET = 'comprobantes'

const ALUMNO_CON_CURSO =
  'id, legajo, apellido, nombre, ' +
  'matriculas(estado, curso:cursos(anio, division, nivel_id, nivel:niveles(nombre), ciclo:ciclos_lectivos(activo)))'

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
   * es lo que permite ver la deuda discriminada por ítem. Desde la versión 1.1 trae
   * también el tipo de concepto (cuota, deporte, transporte o comedor), para su ícono.
   * @returns {Promise<{factura: object, items: object[]} | null>} null si no existe o no es de un hijo.
   */
  async factura(facturaId) {
    const [factura, filas] = await Promise.all([
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
          .select('id, descripcion, importe, concepto:conceptos(tipo), comprobante:comprobantes(id, numero, estado)')
          .eq('factura_id', facturaId)
          .order('importe', { ascending: false }),
        'cargar el detalle de la factura',
      ),
    ])
    const items = filas.map(({ concepto, ...item }) => ({ ...item, tipo: concepto?.tipo }))
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

  // ── Etapa 4b y versión 1.1: inscripciones a servicios (HU-M5 · REQ-29) ────

  /**
   * Inscripciones de un alumno a deportes, transporte y comedor, con su período, el
   * precio vigente y, en los deportes, el grupo (días, horario y profesor).
   *
   * Regla del enunciado: "los padres pueden acceder a… inscripción a deportes, servicio
   * de transporte y comedor" de cada hijo. La política `insc_servicio_lectura` de la base
   * devuelve únicamente las de los alumnos a cargo.
   *
   * @returns {Promise<Array<{id: string, tipo: 'deporte'|'transporte'|'comedor', nombre: string,
   *   importe: number, desde: string, hasta: string | null, grupo: object | null}>>}
   */
  async inscripcionesDe(alumnoId) {
    const filas = await ejecutar(
      supabase
        .from('inscripciones_servicio')
        .select(`id, desde, hasta, concepto:conceptos(tipo, nombre, importe), grupo:deporte_grupos(${CAMPOS_DEL_GRUPO})`)
        .eq('alumno_id', alumnoId)
        .order('desde'),
      'cargar las inscripciones',
    )
    return filas.filter(fila => fila.concepto).map(aInscripcion)
  },

  /** Una inscripción, para darla de baja. null si no existe o no es de un hijo. */
  async inscripcion(inscripcionId) {
    const fila = await ejecutar(
      supabase
        .from('inscripciones_servicio')
        .select(`id, alumno_id, desde, hasta, concepto:conceptos(tipo, nombre, importe), grupo:deporte_grupos(${CAMPOS_DEL_GRUPO})`)
        .eq('id', inscripcionId)
        .maybeSingle(),
      'cargar la inscripción',
    )
    return fila?.concepto ? { ...aInscripcion(fila), alumnoId: fila.alumno_id } : null
  },

  /**
   * Meses en los que puede empezar o terminar un servicio: desde el primero todavía sin
   * facturar (lo calcula la base, la misma regla que valida al inscribir) hasta el final
   * del ciclo lectivo.
   * @returns {Promise<string[]>} Períodos 'AAAA-MM-01'
   */
  async mesesParaCambiar(alumnoId) {
    const [primero, ciclo] = await Promise.all([
      ejecutar(supabase.rpc('primer_mes_sin_facturar', { p_alumno: alumnoId }), 'calcular el primer mes disponible'),
      this.cicloVigente(),
    ])
    if (!primero || !ciclo) return []
    const ultimo = inicioDeMes(ciclo.fecha_fin)
    const meses = []
    for (let mes = inicioDeMes(primero); mes <= ultimo; mes = sumarMeses(mes, 1)) meses.push(mes)
    return meses
  },

  /**
   * Lo que se puede contratar para un alumno: deportes con los grupos de su nivel,
   * recorridos de transporte y comedor, cada uno con su precio vigente.
   * @returns {Promise<{nivel: string, servicios: Array<object>}>}
   */
  async serviciosParaInscribir(alumnoId) {
    const alumno = await ejecutar(
      supabase.from('alumnos').select(ALUMNO_CON_CURSO).eq('id', alumnoId).maybeSingle(),
      'cargar el alumno',
    )
    const matricula = (alumno?.matriculas ?? []).find(m => m.estado === 'activa' && m.curso?.ciclo?.activo)
    if (!matricula) throw new ErrorDeServicio('El alumno no tiene una matrícula activa en el ciclo lectivo.')

    const [conceptos, grupos] = await Promise.all([
      ejecutar(
        supabase.from('conceptos').select('id, tipo, nombre, importe')
          .eq('activo', true).in('tipo', ['deporte', 'transporte', 'comedor']).order('nombre'),
        'cargar los servicios',
      ),
      ejecutar(
        supabase.from('deporte_grupos').select(`id, concepto_id, ${CAMPOS_DEL_GRUPO}`)
          .eq('nivel_id', matricula.curso.nivel_id).eq('activo', true).order('hora_inicio'),
        'cargar los grupos de cada deporte',
      ),
    ])
    return {
      nivel: matricula.curso.nivel?.nombre ?? '',
      servicios: conceptos.map(c => ({ ...c, grupos: grupos.filter(g => g.concepto_id === c.id) })),
    }
  },

  /**
   * Inscribe al alumno. La base controla todo: que sea un hijo, dos deportes como máximo,
   * un solo recorrido, sin duplicados, el nivel del grupo y los conflictos de horario.
   * Si algo no se cumple, devuelve el motivo y la pantalla lo muestra.
   */
  async inscribir({ alumnoId, conceptoId, grupoId, desde }) {
    return ejecutar(
      supabase.rpc('inscribir_a_servicio', {
        p_alumno: alumnoId, p_concepto: conceptoId, p_grupo: grupoId ?? null, p_desde: desde,
      }),
      'registrar la inscripción',
    )
  },

  /**
   * Da de baja un servicio a partir de un mes (ese mes ya no se factura).
   * @returns {Promise<'baja' | 'cancelada'>} 'cancelada' si todavía no había empezado.
   */
  async darDeBaja(inscripcionId, desde) {
    return ejecutar(
      supabase.rpc('dar_de_baja_servicio', { p_inscripcion: inscripcionId, p_desde: desde }),
      'registrar la baja',
    )
  },

  // ── Versión 1.1: avisos de cobranza (último día hábil y día 20) ───────────

  /**
   * Avisos de cobranza de los hijos, ordenados por fecha. Los arma la base en la vista
   * `avisos_cobranza`: la misma que podría leer un envío programado por correo.
   * @param {string[]} alumnoIds
   */
  async avisos(alumnoIds) {
    if (!alumnoIds?.length) return []
    return ejecutar(
      supabase.from('avisos_cobranza')
        .select('factura_id, numero, alumno_id, periodo, vencimiento, estado, tipo, fecha_envio, importe, detalle')
        .in('alumno_id', alumnoIds)
        .order('fecha_envio').order('tipo', { ascending: false }),
      'cargar los avisos',
    )
  },
}

const CAMPOS_DEL_GRUPO = 'dias, hora_inicio, hora_fin, profesor'

/** Fila de la base → inscripción que usan las pantallas. */
function aInscripcion(fila) {
  return {
    id: fila.id,
    tipo: fila.concepto.tipo,
    nombre: fila.concepto.nombre,
    importe: fila.concepto.importe,
    desde: fila.desde,
    hasta: fila.hasta,
    grupo: fila.grupo ?? null,
  }
}
