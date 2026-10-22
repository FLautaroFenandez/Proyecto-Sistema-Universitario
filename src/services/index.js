/**
 * @file index.js
 * @description Punto de entrada de la capa de servicios — patrón **Facade**,
 * el comprometido para el Sprint 1.
 *
 * Una pantalla importa desde acá y nunca desde `@/lib/supabase`:
 *
 *   import { academico, matricula, mensajeDeError } from '@/services'
 *
 * Qué resuelve:
 *   1. Las pantallas dejan de conocer el nombre de las tablas y la forma de las
 *      consultas. Un cambio en el modelo se absorbe en un solo lugar.
 *   2. El manejo de errores es uniforme: se registra el detalle técnico y se
 *      devuelve un mensaje en castellano.
 *   3. Las consultas dejan de estar duplicadas entre páginas que piden lo mismo.
 */

export { academico, nombreDeCurso, nombreCompletoDeCurso } from './academico'
export { matricula, separarNombre } from './matricula'
export { ErrorDeServicio, mensajeDeError, traducirError } from './base'
