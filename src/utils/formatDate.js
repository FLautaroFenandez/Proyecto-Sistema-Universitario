/**
 * @file formatDate.js
 * @description Formatea fechas ISO a español argentino.
 */

const formatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric', month: 'long', year: 'numeric',
})

const formatterShort = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric', month: 'short', year: 'numeric',
})

/**
 * Las columnas DATE llegan sin hora ("2015-03-10"). new Date() las toma como
 * medianoche UTC y en Argentina (UTC-3) mostraría el día anterior, así que se
 * arman como fecha local. Las fechas con hora (created_at) quedan igual.
 */
function aFecha(isoDate) {
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!soloFecha) return new Date(isoDate)
  const [, anio, mes, dia] = soloFecha
  return new Date(Number(anio), Number(mes) - 1, Number(dia))
}

/** Fecha de hoy en hora local, con el formato de las columnas DATE ("2026-10-24"). */
export function hoyISO() {
  const hoy = new Date()
  const dos = n => String(n).padStart(2, '0')
  return `${hoy.getFullYear()}-${dos(hoy.getMonth() + 1)}-${dos(hoy.getDate())}`
}

/** @param {string} isoDate - Fecha en formato ISO */
export function formatDate(isoDate) {
  if (!isoDate) return ''
  return formatter.format(aFecha(isoDate))
}

/** Versión corta: "15 may. 2026" */
export function formatDateShort(isoDate) {
  if (!isoDate) return ''
  return formatterShort.format(aFecha(isoDate))
}
