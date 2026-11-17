/**
 * @file situacionInscripcion.js
 * @description En qué situación está la inscripción de un alumno a un servicio
 * (deporte, transporte o comedor), según sus fechas (Etapa 4b).
 *
 * La base guarda desde cuándo rige y, si terminó, hasta cuándo (`hasta` vacío = sigue).
 * Acá se decide cómo mostrarla: la pantalla no compara fechas, le pregunta a esta función.
 *
 *   proxima    → todavía no empezó
 *   vigente    → rige hoy
 *   finalizada → ya terminó
 *
 * Las fechas son texto 'AAAA-MM-DD': con ese formato, comparar los textos es comparar
 * las fechas, sin convertirlas (y sin el corrimiento de un día que explica formato.js).
 */

/** Regla del enunciado: "cada alumno puede inscribirse a dos deportes simultáneamente". */
export const MAXIMO_DEPORTES = 2

const SITUACIONES = {
  proxima:    { clave: 'proxima',    etiqueta: 'Todavía no empezó', color: 'azul',  ocupaLugar: true },
  vigente:    { clave: 'vigente',    etiqueta: 'Vigente',           color: 'verde', ocupaLugar: true },
  finalizada: { clave: 'finalizada', etiqueta: 'Finalizada',        color: 'gris',  ocupaLugar: false },
}

/**
 * @param {{desde: string, hasta: string | null}} inscripcion
 * @param {string} hoy - 'AAAA-MM-DD'
 * @returns {{clave: string, etiqueta: string, color: 'azul'|'verde'|'gris', ocupaLugar: boolean}}
 *   `ocupaLugar`: si cuenta para el máximo de deportes (una finalizada ya no cuenta).
 */
export function situacionDeInscripcion(inscripcion, hoy) {
  if (inscripcion.hasta && inscripcion.hasta < hoy) return SITUACIONES.finalizada
  if (inscripcion.desde > hoy) return SITUACIONES.proxima
  return SITUACIONES.vigente
}
