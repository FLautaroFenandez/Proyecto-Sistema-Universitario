/**
 * @file cobranza.js
 * @description Cobranza en la web del administrador (Parte 3 · Etapa 4) — patrón Facade.
 *
 *   Precios ............... conceptos, actualizarImporte, validarImporte
 *   Facturas del mes ...... mesesDelCiclo, generarFacturas
 *   Reporte (REQ-32) ...... reporte, resumirCobranza
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

    const ids = [...new Set(facturas.map(f => f.alumno_id))]
    const alumnos = ids.length === 0 ? [] : await ejecutar(
      supabase.from('alumnos').select('id, legajo, apellido, nombre').in('id', ids),
      'cargar los alumnos del reporte',
    )
    const porId = new Map(alumnos.map(a => [a.id, a]))

    const filas = facturas.map(f => ({ ...f, alumno: porId.get(f.alumno_id) ?? null }))
    return { facturas: filas, totales: resumirCobranza(filas) }
  },
}
