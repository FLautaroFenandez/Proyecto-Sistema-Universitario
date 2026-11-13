/**
 * @file base.js
 * @description Cimiento de la capa de servicios de la app (patrón **Facade**), con la
 * misma idea que `src/services/base.js` de la web: toda consulta pasa por `ejecutar()`,
 * que deja el error técnico en la consola y devuelve un mensaje en castellano para
 * mostrarle a la familia.
 *
 * Las reglas de negocio viven en la base de datos. Cuando una función de la base rechaza
 * algo (por ejemplo, "Algún ítem elegido ya tiene un pago"), el mensaje ya viene
 * redactado desde el `RAISE EXCEPTION` y se muestra tal cual.
 */

/** Error con un mensaje apto para mostrar en pantalla. Conserva la causa técnica. */
export class ErrorDeServicio extends Error {
  constructor(mensaje, causa) {
    super(mensaje)
    this.name = 'ErrorDeServicio'
    this.causa = causa
  }
}

/**
 * Convierte un error de Supabase en uno que se le puede mostrar al usuario.
 *
 * @param {object} error - Error devuelto por supabase-js
 * @param {string} accion - Qué se estaba intentando hacer: 'cargar las cuotas'
 * @returns {ErrorDeServicio}
 */
export function traducirError(error, accion = 'completar la operación') {
  switch (error?.code) {
    // Regla de negocio rechazada por una función o un disparador de la base.
    case 'P0001': return new ErrorDeServicio(error.message, error)
    case '42501': return new ErrorDeServicio('Tu cuenta no tiene permiso para esta acción.', error)
    default:      return new ErrorDeServicio(`No se pudo ${accion}. Revisá tu conexión e intentá de nuevo.`, error)
  }
}

/**
 * Ejecuta una consulta de Supabase y devuelve solo los datos.
 * Si falla, deja el error técnico en la consola y lanza uno legible.
 *
 * @param {PromiseLike<{data:any, error:object}>} consulta
 * @param {string} accion - Descripción en infinitivo: 'cargar tus hijos'
 */
export async function ejecutar(consulta, accion) {
  const { data, error } = await consulta
  if (error) {
    console.error(`[servicios] Falló al ${accion}:`, error)
    throw traducirError(error, accion)
  }
  return data
}

/** Devuelve el mensaje que se le muestra al usuario ante cualquier error. */
export function mensajeDeError(err, respaldo = 'Ocurrió un error inesperado.') {
  return err instanceof ErrorDeServicio ? err.message : respaldo
}
