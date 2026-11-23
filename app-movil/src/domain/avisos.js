/**
 * @file avisos.js
 * @description Los dos avisos de cobranza del enunciado (versión 1.1).
 *
 *   recordatorio → el último día hábil del mes anterior a la factura: el total a abonar
 *                  y cada ítem que lo compone (la factura vence el día 10).
 *   deuda        → el día 20 del mes de la factura, si queda saldo: cada ítem impago.
 *
 * El contenido y la fecha los arma la base, en la vista `avisos_cobranza`. Acá se decide
 * cómo se muestran y si la fecha del aviso ya llegó.
 */

export const TIPOS_DE_AVISO = {
  recordatorio: {
    titulo: 'Recordatorio de pago',
    color: 'azul',
    explicacion: 'Total a abonar del mes y su composición. Se emite el último día hábil del mes anterior.',
  },
  deuda: {
    titulo: 'Aviso de deuda',
    color: 'naranja',
    explicacion: 'Lo que queda sin pagar. Se emite el día 20 si el pago no está completo.',
  },
}

/**
 * Si el aviso ya se emitió o está programado, según la fecha de hoy.
 * @param {string} fechaEnvio - 'AAAA-MM-DD'
 * @param {string} hoy - 'AAAA-MM-DD'
 */
export function momentoDelAviso(fechaEnvio, hoy) {
  return fechaEnvio <= hoy
    ? { clave: 'emitido', etiqueta: 'Emitido' }
    : { clave: 'programado', etiqueta: 'Programado' }
}

/**
 * Agrupa los avisos por alumno, en el orden de los hijos.
 * @param {Array<{id: string, nombre: string}>} hijos
 * @param {Array<{alumno_id: string}>} avisos - Ya ordenados por fecha
 */
export function avisosPorHijo(hijos, avisos) {
  return hijos.map(hijo => ({ hijo, avisos: avisos.filter(a => a.alumno_id === hijo.id) }))
}
