/**
 * @file asistencias.js
 * @description Servicio de asistencia diaria (HU4 · REQ-16).
 *
 * La asistencia es por alumno y día, no por materia: la toma cualquier docente
 * que dicte alguna materia en el curso (política asistencias_docente). Si ya se
 * cargó ese día, se edita en lugar de duplicarse (restricción
 * asistencia_unica_por_dia), que es el flujo alternativo del caso de uso.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

export const ESTADOS_ASISTENCIA = [
  { clave: 'presente',    etiqueta: 'Presente',    color: 'green'  },
  { clave: 'ausente',     etiqueta: 'Ausente',     color: 'red'    },
  { clave: 'tarde',       etiqueta: 'Tarde',       color: 'orange' },
  { clave: 'justificada', etiqueta: 'Justificada', color: 'blue'   },
]

const CURSO_COMPLETO =
  'id, anio, division, turno, nivel:niveles(id, nombre), ciclo:ciclos_lectivos(id, anio, activo)'

/**
 * Resumen de una lista de registros: cuántos de cada estado y el porcentaje de
 * asistencia. Llegar tarde cuenta como presente; la inasistencia justificada,
 * como ausente.
 */
export function resumirAsistencia(registros) {
  const cuenta = Object.fromEntries(ESTADOS_ASISTENCIA.map(e => [e.clave, 0]))
  for (const r of registros) cuenta[r.estado] = (cuenta[r.estado] ?? 0) + 1
  const total = registros.length
  const asistio = cuenta.presente + cuenta.tarde
  return {
    ...cuenta,
    total,
    porcentaje: total === 0 ? null : Math.round((asistio / total) * 100),
  }
}

export const asistencias = {

  /**
   * Cursos del ciclo activo donde el docente dicta alguna materia, sin repetir,
   * con la cantidad de alumnos de cada uno.
   */
  async misCursos(docenteId) {
    if (!docenteId) return []
    const dictados = await ejecutar(
      supabase.from('curso_materia').select(`curso:cursos(${CURSO_COMPLETO})`).eq('docente_id', docenteId),
      'cargar tus cursos',
    )
    const cursos = new Map()
    for (const { curso } of dictados) {
      if (curso?.ciclo?.activo) cursos.set(curso.id, curso)
    }
    if (cursos.size === 0) return []

    const matriculas = await ejecutar(
      supabase.from('matriculas').select('curso_id').in('curso_id', [...cursos.keys()]).eq('estado', 'activa'),
      'contar los alumnos de tus cursos',
    )
    return [...cursos.values()]
      .map(c => ({ ...c, alumnos: matriculas.filter(m => m.curso_id === c.id).length }))
      .sort((a, b) => a.nivel.nombre.localeCompare(b.nivel.nombre) || a.anio - b.anio)
  },

  async obtenerCurso(cursoId) {
    const [curso] = await ejecutar(
      supabase.from('cursos').select(CURSO_COMPLETO).eq('id', cursoId).limit(1),
      'cargar el curso',
    )
    return curso ?? null
  },

  /** Alumnos con matrícula activa en el curso, ordenados por apellido. */
  async alumnosDelCurso(cursoId) {
    const matriculas = await ejecutar(
      supabase.from('matriculas')
        .select('id, alumno:alumnos(id, legajo, apellido, nombre)')
        .eq('curso_id', cursoId)
        .eq('estado', 'activa'),
      'cargar los alumnos del curso',
    )
    return matriculas
      .filter(m => m.alumno)
      .sort((a, b) => a.alumno.apellido.localeCompare(b.alumno.apellido) || a.alumno.nombre.localeCompare(b.alumno.nombre))
  },

  /** Asistencia ya cargada en una fecha, indexada por matrícula. */
  async delDia(matriculaIds, fecha) {
    if (matriculaIds.length === 0) return {}
    const registros = await ejecutar(
      supabase.from('asistencias')
        .select('matricula_id, estado, observacion')
        .in('matricula_id', matriculaIds)
        .eq('fecha', fecha),
      'cargar la asistencia del día',
    )
    return Object.fromEntries(registros.map(r => [r.matricula_id, r]))
  },

  /**
   * Guarda la asistencia del día. Si ya existía, la actualiza.
   * @param {{fecha:string, docenteId:string, registros:Array<{matriculaId:string, estado:string, observacion?:string}>}} params
   */
  async guardar({ fecha, docenteId, registros }) {
    if (registros.length === 0) return
    await ejecutar(
      supabase.from('asistencias').upsert(
        registros.map(r => ({
          matricula_id:   r.matriculaId,
          fecha,
          estado:         r.estado,
          observacion:    r.observacion?.trim() || null,
          registrada_por: docenteId ?? null,
        })),
        { onConflict: 'matricula_id,fecha' },
      ),
      'guardar la asistencia',
    )
  },

  /** Registros de una matrícula, del más reciente al más viejo. */
  async deMatricula(matriculaId) {
    return ejecutar(
      supabase.from('asistencias')
        .select('fecha, estado, observacion')
        .eq('matricula_id', matriculaId)
        .order('fecha', { ascending: false }),
      'cargar la asistencia del alumno',
    )
  },
}
