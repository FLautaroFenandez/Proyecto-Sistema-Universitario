/**
 * @file situacionInscripcion.js
 * @description En qué situación está la inscripción de un alumno a un servicio
 * (deporte, transporte o comedor), según sus fechas (Etapa 4b), y cómo se muestra el
 * horario de un grupo de deporte (versión 1.1).
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

/** Una inscripción admite baja mientras no tenga fecha de fin. */
export function admiteBaja(inscripcion) {
  return !inscripcion.hasta
}

const DIAS = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/** '17:00:00' → '17:00' */
const hora = texto => String(texto ?? '').slice(0, 5)

/**
 * Días y horario de un grupo de deporte: "Lun y Mié · 17:00 a 18:30".
 * @param {{dias: number[], hora_inicio: string, hora_fin: string} | null} grupo
 */
export function horarioDeGrupo(grupo) {
  if (!grupo) return ''
  const dias = [...grupo.dias].sort((a, b) => a - b).map(d => DIAS[d] ?? '?')
  const listaDeDias = dias.length > 1 ? `${dias.slice(0, -1).join(', ')} y ${dias.at(-1)}` : dias[0]
  return `${listaDeDias} · ${hora(grupo.hora_inicio)} a ${hora(grupo.hora_fin)}`
}

/**
 * Si dos grupos se superponen: comparten algún día y sus horarios se cruzan. Es la misma
 * regla que aplica la base; acá sirve para avisar antes de elegir. Los horarios que solo
 * se tocan (uno termina 18:30 y el otro empieza 18:30) no chocan.
 */
export function gruposSeSuperponen(a, b) {
  if (!a || !b) return false
  const diaEnComun = a.dias.some(d => b.dias.includes(d))
  return diaEnComun && hora(a.hora_inicio) < hora(b.hora_fin) && hora(b.hora_inicio) < hora(a.hora_fin)
}
