/**
 * @file calificaciones.js
 * @description Servicio de calificaciones (HU2 · REQ-15).
 *
 * El docente ve las materias que dicta, abre una y carga las notas de sus
 * alumnos por período. El promedio no se calcula acá: lo devuelve la vista
 * promedios_periodo de la base, así es siempre el mismo para todos.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

export const NOTA_MINIMA = 1
export const NOTA_MAXIMA = 10

/** El ciclo lectivo se divide en tres trimestres. */
export const PERIODOS = [
  { numero: 1, nombre: '1.er trimestre' },
  { numero: 2, nombre: '2.º trimestre' },
  { numero: 3, nombre: '3.er trimestre' },
]

/** Hasta tres evaluaciones por trimestre. */
export const INSTANCIAS = [1, 2, 3]

const DICTADO_COMPLETO =
  '*, materia:materias(id, nombre, codigo), ' +
  'curso:cursos(id, anio, division, turno, nivel:niveles(id, nombre), ciclo:ciclos_lectivos(id, anio, activo))'

/** Clave de una celda de la planilla: un alumno en una evaluación. */
export function claveCelda(matriculaId, instancia) {
  return `${matriculaId}:${instancia}`
}

/**
 * Valida lo que el docente escribió en una celda.
 * La base tiene la misma regla (calificacion_nota_en_rango); acá se valida
 * antes para poder marcar la celda sin esperar al servidor.
 *
 * @param {string} texto
 * @returns {string|null} mensaje de error, o null si es válida o está vacía
 */
export function validarNota(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.')
  if (limpio === '') return null
  const nota = Number(limpio)
  if (Number.isNaN(nota)) return 'Tiene que ser un número.'
  if (nota < NOTA_MINIMA || nota > NOTA_MAXIMA) return `Entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}.`
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(limpio)) return 'Hasta dos decimales.'
  return null
}

/** Convierte el texto de la celda en número, o null si quedó vacía. */
export function notaDesdeTexto(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.')
  return limpio === '' ? null : Number(limpio)
}

export const calificaciones = {

  /**
   * Materias que dicta el docente en el ciclo activo, con la cantidad de
   * alumnos de cada curso.
   * @param {string} docenteId
   */
  async misDictados(docenteId) {
    if (!docenteId) return []

    const dictados = await ejecutar(
      supabase.from('curso_materia').select(DICTADO_COMPLETO).eq('docente_id', docenteId),
      'cargar tus materias',
    )
    const delCicloActivo = dictados.filter(d => d.curso?.ciclo?.activo)
    if (delCicloActivo.length === 0) return []

    const cursoIds = [...new Set(delCicloActivo.map(d => d.curso.id))]
    const matriculas = await ejecutar(
      supabase.from('matriculas').select('id, curso_id').in('curso_id', cursoIds).eq('estado', 'activa'),
      'contar los alumnos de tus cursos',
    )

    return delCicloActivo
      .map(d => ({ ...d, alumnos: matriculas.filter(m => m.curso_id === d.curso.id).length }))
      .sort((a, b) =>
        a.curso.nivel.nombre.localeCompare(b.curso.nivel.nombre) ||
        a.curso.anio - b.curso.anio ||
        a.materia.nombre.localeCompare(b.materia.nombre))
  },

  async obtenerDictado(dictadoId) {
    const [dictado] = await ejecutar(
      supabase.from('curso_materia').select(DICTADO_COMPLETO).eq('id', dictadoId).limit(1),
      'cargar la materia',
    )
    return dictado ?? null
  },

  /** Alumnos con matrícula activa en el curso del dictado, ordenados por apellido. */
  async alumnosDelDictado(dictado) {
    const matriculas = await ejecutar(
      supabase.from('matriculas')
        .select('id, alumno:alumnos(id, legajo, apellido, nombre)')
        .eq('curso_id', dictado.curso.id)
        .eq('estado', 'activa'),
      'cargar los alumnos del curso',
    )
    return matriculas
      .filter(m => m.alumno)
      .sort((a, b) =>
        a.alumno.apellido.localeCompare(b.alumno.apellido) ||
        a.alumno.nombre.localeCompare(b.alumno.nombre))
  },

  /** Notas cargadas de un dictado en un período. */
  async notasDelPeriodo(dictadoId, periodo) {
    return ejecutar(
      supabase.from('calificaciones')
        .select('id, matricula_id, instancia, nota')
        .eq('curso_materia_id', dictadoId)
        .eq('periodo', periodo),
      'cargar las notas del período',
    )
  },

  /** Promedio de cada alumno en el período, calculado por la base. */
  async promediosDelPeriodo(dictadoId, periodo) {
    return ejecutar(
      supabase.from('promedios_periodo')
        .select('matricula_id, promedio, notas_cargadas')
        .eq('curso_materia_id', dictadoId)
        .eq('periodo', periodo),
      'calcular los promedios del período',
    )
  },

  /**
   * Guarda los cambios de la planilla: inserta o actualiza las notas escritas
   * y borra las celdas que se vaciaron.
   *
   * @param {{dictadoId:string, periodo:number, docenteId:string,
   *          cambios:Array<{matriculaId:string, instancia:number, nota:number|null}>}} params
   */
  async guardar({ dictadoId, periodo, docenteId, cambios }) {
    const aGuardar = cambios.filter(c => c.nota !== null)
    const aBorrar  = cambios.filter(c => c.nota === null)

    if (aGuardar.length > 0) {
      await ejecutar(
        supabase.from('calificaciones').upsert(
          aGuardar.map(c => ({
            matricula_id:     c.matriculaId,
            curso_materia_id: dictadoId,
            periodo,
            instancia:        c.instancia,
            nota:             c.nota,
            cargada_por:      docenteId ?? null,
          })),
          { onConflict: 'matricula_id,curso_materia_id,periodo,instancia' },
        ),
        'guardar las notas',
      )
    }

    await Promise.all(aBorrar.map(c => ejecutar(
      supabase.from('calificaciones').delete()
        .eq('matricula_id', c.matriculaId)
        .eq('curso_materia_id', dictadoId)
        .eq('periodo', periodo)
        .eq('instancia', c.instancia),
      'borrar una nota',
    )))
  },
}
