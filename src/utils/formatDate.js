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

/** @param {string} isoDate - Fecha en formato ISO */
export function formatDate(isoDate) {
  if (!isoDate) return ''
  return formatter.format(new Date(isoDate))
}

/** Versión corta: "15 may. 2026" */
export function formatDateShort(isoDate) {
  if (!isoDate) return ''
  return formatterShort.format(new Date(isoDate))
}
