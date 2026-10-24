/**
 * @file familia.js
 * @description Lo que ven el padre y el alumno sobre su propia trayectoria:
 * los hijos vinculados, su curso, la asistencia (HU4), los comunicados (HU5) y
 * el acceso al boletín y la constancia (REQ-17).
 *
 * Regla del enunciado: "un padre solamente puede consultar la información de
 * sus hijos". La aplica la base (alumnos_a_cargo y las políticas de familia);
 * estas consultas no filtran nada que la base no filtre ya.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

const ALUMNO_CON_MATRICULAS =
  'id, legajo, apellido, nombre, ' +
  'matriculas(id, estado, curso:cursos(id, anio, division, turno, nivel:niveles(nombre), ciclo:ciclos_lectivos(anio, activo)))'

/** La matrícula activa del ciclo vigente, si la hay. */
function matriculaVigente(alumno) {
  return (alumno.matriculas ?? []).find(m => m.estado === 'activa' && m.curso?.ciclo?.activo) ?? null
}

export const familia = {

  /** Hijos vinculados al tutor, con su matrícula vigente. */
  async misHijos(tutorId) {
    if (!tutorId) return []
    const vinculos = await ejecutar(
      supabase.from('alumno_tutor').select(`relacion, alumno:alumnos(${ALUMNO_CON_MATRICULAS})`).eq('tutor_id', tutorId),
      'cargar tus hijos',
    )
    return vinculos
      .filter(v => v.alumno)
      .map(v => ({ alumno: v.alumno, relacion: v.relacion, matricula: matriculaVigente(v.alumno) }))
      .sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre))
  },

  /** Legajo del alumno vinculado a la cuenta, si existe. */
  async miLegajo(profileId) {
    if (!profileId) return null
    const [alumno] = await ejecutar(
      supabase.from('alumnos').select(ALUMNO_CON_MATRICULAS).eq('profile_id', profileId).limit(1),
      'cargar tu legajo',
    )
    return alumno ? { alumno, matricula: matriculaVigente(alumno) } : null
  },
}
