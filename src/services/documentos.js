/**
 * @file documentos.js
 * @description Boletín de calificaciones y constancia de alumno regular (REQ-17).
 *
 * Los dos documentos se arman con datos que ya existen: la matrícula (HU1), los
 * promedios por período (HU2) y la asistencia (HU4). Quién puede pedirlos lo
 * decide la base: Administración, el docente, la familia del alumno y el propio
 * alumno (políticas de matriculas, calificaciones y asistencias).
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'
import { resumirAsistencia } from './asistencias'

const MATRICULA_COMPLETA =
  'id, estado, fecha_matriculacion, ' +
  'alumno:alumnos(id, legajo, dni, apellido, nombre, fecha_nacimiento), ' +
  'curso:cursos(id, anio, division, turno, nivel:niveles(nombre)), ' +
  'ciclo:ciclos_lectivos(anio)'

function promedioDe(valores) {
  const numeros = valores.filter(v => v !== null && v !== undefined).map(Number)
  if (numeros.length === 0) return null
  return Math.round((numeros.reduce((a, b) => a + b, 0) / numeros.length) * 100) / 100
}

export const documentos = {

  /** Matrícula con alumno, curso y ciclo; null si no existe o no hay permiso. */
  async matricula(matriculaId) {
    const [matricula] = await ejecutar(
      supabase.from('matriculas').select(MATRICULA_COMPLETA).eq('id', matriculaId).limit(1),
      'cargar la matrícula',
    )
    return matricula?.alumno ? matricula : null
  },

  /**
   * Datos del boletín: una fila por materia del curso, con el promedio de cada
   * trimestre y el anual, más el resumen de asistencia.
   */
  async boletin(matriculaId) {
    const matricula = await this.matricula(matriculaId)
    if (!matricula) return null

    const [dictados, promedios, registros] = await Promise.all([
      ejecutar(
        supabase.from('curso_materia')
          .select('id, materia:materias(nombre), docente:profiles(nombre)')
          .eq('curso_id', matricula.curso.id),
        'cargar las materias del curso',
      ),
      ejecutar(
        supabase.from('promedios_periodo')
          .select('curso_materia_id, periodo, promedio')
          .eq('matricula_id', matriculaId),
        'cargar los promedios',
      ),
      ejecutar(
        supabase.from('asistencias').select('estado').eq('matricula_id', matriculaId),
        'cargar la asistencia',
      ),
    ])

    const materias = dictados
      .map(d => {
        const delDictado = promedios.filter(p => p.curso_materia_id === d.id)
        const trimestres = [1, 2, 3].map(n => delDictado.find(p => p.periodo === n)?.promedio ?? null)
        return {
          id:         d.id,
          materia:    d.materia?.nombre ?? '—',
          docente:    d.docente?.nombre ?? null,
          trimestres: trimestres.map(t => (t === null ? null : Number(t))),
          anual:      promedioDe(trimestres),
        }
      })
      .sort((a, b) => a.materia.localeCompare(b.materia))

    return { matricula, materias, asistencia: resumirAsistencia(registros) }
  },
}
