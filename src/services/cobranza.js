/**
 * @file cobranza.js
 * @description Cobranza en la web del administrador (Parte 3 · Etapa 4) — patrón Facade.
 *
 *   Precios ............... conceptos, actualizarImporte, validarImporte
 *   Facturas del mes ...... mesesDelCiclo, generarFacturas
 *   Reporte (REQ-32) ...... reporte, resumirCobranza
 *   Listados .............. resumirPorAlumno, agruparPorServicio (por deporte y por recorrido)
 *
 * Las reglas viven en la base (docs/supabase-cobranza.sql):
 *   - Solo el rol admin escribe en `conceptos` (RLS) y cada cambio queda en la auditoría.
 *   - `generar_facturas()` rechaza a cualquier otro rol y no duplica facturas.
 *   - Total, pagado, saldo y estado los calcula la vista `facturas_estado`, la
 *     misma que lee la app: la web y el teléfono no pueden mostrar números distintos.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar, ErrorDeServicio } from './base'

/** Tipos de concepto, en el orden en que se muestran. */
export const TIPOS_CONCEPTO = [
  { clave: 'cuota',      etiqueta: 'Cuota mensual' },
  { clave: 'comedor',    etiqueta: 'Comedor' },
  { clave: 'deporte',    etiqueta: 'Deportes' },
  { clave: 'transporte', etiqueta: 'Transporte' },
]

/** Estados de la factura que calcula la vista, con su etiqueta y color de Badge. */
export const ESTADOS_FACTURA = {
  pendiente: { etiqueta: 'Pendiente',    color: 'orange', completa: false },
  parcial:   { etiqueta: 'Pago parcial', color: 'blue',   completa: false },
  pagada:    { etiqueta: 'Pagada',       color: 'green',  completa: true },
}

/** Tope de la columna NUMERIC(12,2). */
const IMPORTE_MAXIMO = 9_999_999_999.99

/**
 * Valida el importe que escribe el administrador. Devuelve el mensaje de error
 * o null si es válido. La base también lo controla (CHECK importe > 0).
 * @param {string} texto
 */
export function validarImporte(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.')
  if (limpio === '') return 'Ingresá un importe.'
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return 'Ingresá un número, con hasta dos decimales.'
  const valor = Number(limpio)
  if (valor <= 0) return 'El importe tiene que ser mayor que cero.'
  if (valor > IMPORTE_MAXIMO) return 'El importe es demasiado grande.'
  return null
}

/**
 * Meses facturables de un ciclo lectivo, como primer día de cada mes:
 * ciclo del 01/03 al 15/12 → ['2027-03-01', …, '2027-12-01'].
 * Se arma con texto y no con new Date() para no depender de la zona horaria.
 * @param {{fecha_inicio: string, fecha_fin: string}} ciclo
 */
export function mesesDelCiclo(ciclo) {
  if (!ciclo) return []
  let [anio, mes] = ciclo.fecha_inicio.split('-').map(Number)
  const [anioFin, mesFin] = ciclo.fecha_fin.split('-').map(Number)
  const meses = []
  while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
    meses.push(`${anio}-${String(mes).padStart(2, '0')}-01`)
    mes += 1
    if (mes > 12) { mes = 1; anio += 1 }
  }
  return meses
}

/**
 * Totales del reporte. Se suma en centavos para que 0,1 + 0,2 no dé 0,30000000000000004.
 * @param {Array<{total:number, pagado:number, en_proceso:number, saldo:number, estado:string}>} facturas
 */
export function resumirCobranza(facturas) {
  const centavos = valor => Math.round(Number(valor ?? 0) * 100)
  const suma = campo => facturas.reduce((acc, f) => acc + centavos(f[campo]), 0) / 100
  const completas = facturas.filter(f => ESTADOS_FACTURA[f.estado]?.completa).length
  return {
    cantidad:    facturas.length,
    facturado:   suma('total'),
    cobrado:     suma('pagado'),
    enProceso:   suma('en_proceso'),
    saldo:       suma('saldo'),
    completas,
    incompletas: facturas.length - completas,
    vencidas:    facturas.filter(f => f.vencida).length,
  }
}

// ── Listados por alumno, por deporte y por recorrido (REQ-32, plantilla del 3.er parcial) ──

const aCentavos = valor => Math.round(Number(valor ?? 0) * 100)

/** Estado de pago de un ítem según su comprobante: informado = pagado. */
export const ESTADOS_ITEM = {
  pagado:     { etiqueta: 'Pagado',     color: 'green' },
  en_proceso: { etiqueta: 'En proceso', color: 'blue' },
  pendiente:  { etiqueta: 'Pendiente',  color: 'orange' },
}

/** @param {{comprobante?: {estado: string} | null}} item */
export function estadoDeItem(item) {
  if (item.comprobante?.estado === 'informado') return 'pagado'
  if (item.comprobante?.estado === 'emitido') return 'en_proceso'
  return 'pendiente'
}

/** Curso de la matrícula activa del ciclo vigente: { curso: '3.º A', nivel: 'Primario' }. */
export function cursoDelAlumno(alumno) {
  const matricula = (alumno?.matriculas ?? []).find(m => m.estado === 'activa' && m.curso?.ciclo?.activo)
  if (!matricula) return { curso: 'Sin matrícula activa', nivel: 'Sin nivel' }
  const { anio, division, nivel } = matricula.curso
  const nombre = nivel?.nombre ?? ''
  return { curso: `${anio}.º ${division}`, nivel: nombre.charAt(0).toUpperCase() + nombre.slice(1) }
}

/**
 * Pagos completos e incompletos por año y por alumno.
 * @param {Array<object>} facturas - Filas del reporte, con `alumno` y `periodo`
 * @returns {Array<{anio: string, alumnos: Array<object>}>}
 */
export function resumirPorAlumno(facturas) {
  const porAnio = new Map()
  for (const f of facturas) {
    const anio = f.periodo.slice(0, 4)
    if (!porAnio.has(anio)) porAnio.set(anio, new Map())
    const delAnio = porAnio.get(anio)
    if (!delAnio.has(f.alumno_id)) delAnio.set(f.alumno_id, [])
    delAnio.get(f.alumno_id).push(f)
  }
  return [...porAnio.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([anio, delAnio]) => ({
    anio,
    alumnos: [...delAnio.values()]
      .map(lista => ({ alumno: lista[0].alumno, ...cursoDelAlumno(lista[0].alumno), ...resumirCobranza(lista) }))
      .sort((a, b) => (a.alumno?.apellido ?? '').localeCompare(b.alumno?.apellido ?? '')),
  }))
}

/**
 * Ítems de un tipo de servicio agrupados por concepto (cada deporte, cada recorrido) y,
 * dentro de cada uno, por nivel educativo.
 * @param {Array<object>} items - Ítems con `concepto`, `importe`, `estado`, `alumno`, `curso`, `nivel`, `periodo`
 * @param {'deporte'|'transporte'} tipo
 */
export function agruparPorServicio(items, tipo) {
  const porConcepto = new Map()
  for (const item of items.filter(i => i.concepto?.tipo === tipo)) {
    const nombre = item.concepto.nombre
    if (!porConcepto.has(nombre)) porConcepto.set(nombre, [])
    porConcepto.get(nombre).push(item)
  }
  const totales = lista => {
    const facturado = lista.reduce((s, i) => s + aCentavos(i.importe), 0)
    const cobrado = lista.filter(i => i.estado === 'pagado').reduce((s, i) => s + aCentavos(i.importe), 0)
    return { facturado: facturado / 100, cobrado: cobrado / 100, pendiente: (facturado - cobrado) / 100 }
  }
  return [...porConcepto.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([nombre, lista]) => {
    const porNivel = new Map()
    for (const item of lista) {
      if (!porNivel.has(item.nivel)) porNivel.set(item.nivel, [])
      porNivel.get(item.nivel).push(item)
    }
    return {
      nombre,
      totales: totales(lista),
      niveles: [...porNivel.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([nivel, filas]) => ({
        nivel,
        filas: [...filas].sort((a, b) => a.periodo.localeCompare(b.periodo)
          || (a.alumno?.apellido ?? '').localeCompare(b.alumno?.apellido ?? '')),
      })),
    }
  })
}

/**
 * Grupo (días, horario y profesor) del deporte que se facturó en un ítem: el de la
 * inscripción del alumno a ese deporte que estaba vigente en el mes de la factura.
 * null si no tiene grupo (por ejemplo, transporte o comedor).
 */
export function grupoDelItem(inscripciones, alumnoId, conceptoId, periodo) {
  const vigente = (inscripciones ?? []).find(i =>
    i.alumno_id === alumnoId && i.concepto_id === conceptoId
    && i.desde.slice(0, 7) <= String(periodo).slice(0, 7)
    && (!i.hasta || i.hasta >= periodo))
  return vigente?.grupo ?? null
}

const DIAS = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/** Días y horario de un grupo: "Lun y Mié · 17:00 a 18:30". Vacío si no hay grupo. */
export function horarioDeGrupo(grupo) {
  if (!grupo) return ''
  const dias = [...grupo.dias].sort((a, b) => a - b).map(d => DIAS[d] ?? '?')
  const lista = dias.length > 1 ? `${dias.slice(0, -1).join(', ')} y ${dias.at(-1)}` : dias[0]
  return `${lista} · ${String(grupo.hora_inicio).slice(0, 5)} a ${String(grupo.hora_fin).slice(0, 5)}`
}

const ALUMNO_DEL_REPORTE =
  'id, legajo, apellido, nombre, ' +
  'matriculas(estado, curso:cursos(anio, division, nivel:niveles(nombre), ciclo:ciclos_lectivos(activo)))'

export const cobranza = {

  /** Conceptos vigentes, agrupables por tipo. Los lee cualquier usuario con sesión. */
  async conceptos() {
    return ejecutar(
      supabase.from('conceptos').select('id, tipo, nombre, importe, updated_at')
        .eq('activo', true).order('tipo').order('nombre'),
      'cargar los precios',
    )
  },

  /**
   * Cambia el importe de un concepto. Las facturas ya emitidas no cambian:
   * copiaron el precio al generarse.
   *
   * Si RLS no deja modificar la fila, Supabase no devuelve error sino cero filas
   * actualizadas. Por eso se pide la fila de vuelta y, si no llega, se avisa: sin
   * este control, la pantalla diría "guardado" aunque la base lo haya ignorado.
   */
  async actualizarImporte(id, texto) {
    const error = validarImporte(texto)
    if (error) throw new ErrorDeServicio(error)
    const filas = await ejecutar(
      supabase.from('conceptos')
        .update({ importe: Number(String(texto).trim().replace(',', '.')) })
        .eq('id', id)
        .select('id, tipo, nombre, importe, updated_at'),
      'guardar el precio',
    )
    if (!filas?.length) throw new ErrorDeServicio('Tu rol no tiene permiso para cambiar los precios.')
    return filas[0]
  },

  /**
   * Genera las facturas de un mes para todos los alumnos con matrícula activa.
   * Devuelve cuántas creó: 0 si ese mes ya estaba facturado.
   * @param {string} periodo - Primer día del mes: '2027-06-01'
   */
  async generarFacturas(periodo) {
    return ejecutar(
      supabase.rpc('generar_facturas', { p_periodo: periodo }),
      'generar las facturas',
    )
  },

  /**
   * Facturas de un rango de meses con el alumno y los totales (REQ-32).
   * @param {{desde: string, hasta: string}} rango - Primeros días de mes, inclusive
   */
  async reporte({ desde, hasta }) {
    const facturas = await ejecutar(
      supabase.from('facturas_estado')
        .select('id, numero, alumno_id, periodo, vencimiento, total, pagado, en_proceso, saldo, estado, vencida')
        .gte('periodo', desde).lte('periodo', hasta)
        .order('periodo').order('numero'),
      'cargar el reporte de cobranza',
    )

    if (facturas.length === 0) return { facturas: [], items: [], totales: resumirCobranza([]) }

    const ids = [...new Set(facturas.map(f => f.alumno_id))]
    const [alumnos, items, inscripciones] = await Promise.all([
      ejecutar(
        supabase.from('alumnos').select(ALUMNO_DEL_REPORTE).in('id', ids),
        'cargar los alumnos del reporte',
      ),
      ejecutar(
        supabase.from('factura_items')
          .select('id, factura_id, concepto_id, descripcion, importe, concepto:conceptos(tipo, nombre), comprobante:comprobantes(estado)')
          .in('factura_id', facturas.map(f => f.id)),
        'cargar los ítems del reporte',
      ),
      ejecutar(
        supabase.from('inscripciones_servicio')
          .select('alumno_id, concepto_id, desde, hasta, grupo:deporte_grupos(dias, hora_inicio, hora_fin, profesor)')
          .in('alumno_id', ids),
        'cargar los grupos de los deportes',
      ),
    ])
    const porId = new Map(alumnos.map(a => [a.id, a]))
    const filas = facturas.map(f => ({ ...f, alumno: porId.get(f.alumno_id) ?? null }))
    const facturaDe = new Map(filas.map(f => [f.id, f]))

    return {
      facturas: filas,
      totales: resumirCobranza(filas),
      items: items.map(item => {
        const factura = facturaDe.get(item.factura_id)
        return {
          ...item,
          estado: estadoDeItem(item),
          periodo: factura?.periodo ?? '',
          alumno: factura?.alumno ?? null,
          grupo: grupoDelItem(inscripciones, factura?.alumno_id, item.concepto_id, factura?.periodo),
          ...cursoDelAlumno(factura?.alumno),
        }
      }),
    }
  },
}
