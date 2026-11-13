/**
 * @file formatPesos.js
 * @description Importes en pesos argentinos (Parte 3 · cobranza).
 */

const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2,
})

/** 133000 → "$ 133.000". Los importes de la base llegan como número. */
export function formatPesos(importe) {
  if (importe === null || importe === undefined) return ''
  return formatter.format(Number(importe))
}
