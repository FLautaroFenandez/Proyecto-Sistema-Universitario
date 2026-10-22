/**
 * @file base.js
 * @description Cimiento de la capa de servicios (patrón Facade).
 *
 * Hasta ahora cada página armaba sus consultas a Supabase por su cuenta y, en
 * varias, el `error` que devuelve la librería se descartaba en silencio: si algo
 * fallaba, la pantalla quedaba vacía sin explicar por qué. Acá pasa lo contrario:
 * toda consulta se ejecuta a través de `ejecutar()`, que registra el error técnico
 * en la consola para poder diagnosticarlo y devuelve un mensaje en castellano
 * para mostrarle al usuario.
 *
 * Las reglas de negocio viven en la base de datos (restricciones únicas y
 * disparadores). Este archivo traduce el error que devuelve PostgreSQL al
 * castellano, así la misma regla no se escribe dos veces.
 */

/**
 * Mensajes por restricción de la base. La clave es el nombre de la restricción
 * tal como se declaró en `docs/supabase-gestion.sql`.
 */
const MENSAJES_POR_RESTRICCION = {
  alumno_un_curso_por_ciclo:  'El alumno ya tiene una matrícula en este ciclo lectivo.',
  alumnos_dni_key:            'Ya hay un alumno registrado con ese DNI.',
  alumnos_inscripcion_id_key: 'Esa solicitud ya generó un alumno matriculado.',
  alumnos_legajo_key:         'Ese número de legajo ya está en uso.',
  materia_una_vez_por_curso:  'Esa materia ya está asignada al curso.',
  curso_unico:                'Ya existe un curso con ese nivel, año, división y turno.',
  asistencia_unica_por_dia:   'Ya hay asistencia cargada para ese alumno en esa fecha.',
  materias_codigo_key:        'Ya existe una materia con ese código.',
  ciclos_lectivos_anio_key:   'Ya existe un ciclo lectivo para ese año.',
}

/** Error con un mensaje apto para mostrar en pantalla. Conserva la causa técnica. */
export class ErrorDeServicio extends Error {
  constructor(mensaje, causa) {
    super(mensaje)
    this.name = 'ErrorDeServicio'
    this.causa = causa
  }
}

/**
 * Convierte un error de Supabase/PostgreSQL en uno que se le puede mostrar al usuario.
 *
 * @param {object} error - Error devuelto por supabase-js
 * @param {string} accion - Qué se estaba intentando hacer, para el mensaje por defecto
 * @returns {ErrorDeServicio}
 */
export function traducirError(error, accion = 'completar la operación') {
  const detalle = `${error?.message ?? ''} ${error?.details ?? ''}`

  const restriccion = Object.keys(MENSAJES_POR_RESTRICCION).find(nombre => detalle.includes(nombre))
  if (restriccion) return new ErrorDeServicio(MENSAJES_POR_RESTRICCION[restriccion], error)

  switch (error?.code) {
    // Disparadores de la base: cupo del curso y validación del docente.
    // El mensaje ya viene redactado en castellano desde el RAISE EXCEPTION.
    case 'P0001': return new ErrorDeServicio(error.message, error)
    case '23505': return new ErrorDeServicio('Ese registro ya existe.', error)
    case '23503': return new ErrorDeServicio('Falta un dato relacionado: verificá el curso y el ciclo lectivo.', error)
    case '23514': return new ErrorDeServicio('Alguno de los datos no cumple el formato esperado.', error)
    case '42501': return new ErrorDeServicio('Tu rol no tiene permiso para esta acción.', error)
    default:      return new ErrorDeServicio(`No se pudo ${accion}.`, error)
  }
}

/**
 * Ejecuta una consulta de Supabase y devuelve solo los datos.
 * Si falla, deja el error técnico en la consola y lanza uno legible.
 *
 * @param {PromiseLike<{data:any, error:object}>} consulta
 * @param {string} accion - Descripción en infinitivo: 'crear el curso', 'cargar los alumnos'
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
