/**
 * @file matricula.js
 * @description Servicio de matriculación y legajo digital (HU1 · REQ-13).
 *
 * Reúne el circuito completo: la solicitud que llegó por la web se convierte en
 * un alumno con legajo, se lo ubica en un curso y la solicitud queda marcada
 * como matriculada para que no pueda procesarse dos veces.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

/** Curso con su nivel, tal como se lo pide desde una matrícula. */
const CURSO_EMBEBIDO = 'curso:cursos(id, anio, division, turno, cupo, nivel:niveles(id, nombre))'

/** Matrícula con el curso y el nivel resueltos. */
const MATRICULA_CON_CURSO = `*, ${CURSO_EMBEBIDO}`

/** Caracteres que rompen la sintaxis del filtro `or` de PostgREST. */
function limpiarBusqueda(texto) {
  return texto.trim().replace(/[,()%*]/g, '')
}

/** Parte un nombre completo en nombre y apellido, para precargar el formulario. */
export function separarNombre(nombreCompleto = '') {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 1) return { nombre: partes[0] ?? '', apellido: '' }
  return { nombre: partes[0], apellido: partes.slice(1).join(' ') }
}

export const matricula = {

  // ── Solicitudes de inscripción (origen de la matrícula) ───────────────────

  /**
   * @param {'aceptada'|'matriculada'|null} estado
   */
  async listarSolicitudes(estado = 'aceptada') {
    let consulta = supabase.from('inscripciones').select('*').order('created_at', { ascending: true })
    if (estado) consulta = consulta.eq('estado', estado)
    return ejecutar(consulta, 'cargar las solicitudes')
  },

  // ── Alumnos y legajo ──────────────────────────────────────────────────────

  /**
   * Alumnos con su matrícula del ciclo indicado.
   *
   * @param {{cicloId?:number, busqueda?:string}} opciones
   */
  async listarAlumnos({ cicloId, busqueda } = {}) {
    let consulta = supabase.from('alumnos')
      .select(`*, matriculas(id, estado, ciclo_id, fecha_matriculacion, ${CURSO_EMBEBIDO})`)
      .order('apellido').order('nombre')

    const texto = limpiarBusqueda(busqueda ?? '')
    if (texto) {
      consulta = consulta.or(
        `apellido.ilike.%${texto}%,nombre.ilike.%${texto}%,dni.ilike.%${texto}%,legajo.ilike.%${texto}%`,
      )
    }

    const alumnos = await ejecutar(consulta, 'cargar los alumnos')

    // La matrícula vigente es la del ciclo activo; un alumno tiene como máximo
    // una por ciclo, garantizado por la restricción UNIQUE (alumno_id, ciclo_id).
    return alumnos.map(alumno => ({
      ...alumno,
      matriculaActual: (alumno.matriculas ?? []).find(m => !cicloId || m.ciclo_id === cicloId) ?? null,
    }))
  },

  /** Tutores asociados a un alumno (regla del enunciado: el padre ve solo a sus hijos). */
  async listarTutores(alumnoId) {
    if (!alumnoId) return []
    return ejecutar(
      supabase.from('alumno_tutor')
        .select('*, tutor:profiles(id, nombre, dni, telefono)')
        .eq('alumno_id', alumnoId),
      'cargar los tutores del alumno',
    )
  },

  // ── HU1: matricular desde una solicitud aprobada ──────────────────────────

  /**
   * Crea el alumno, lo matricula en el curso y cierra la solicitud.
   *
   * El legajo no se envía: lo genera un disparador de la base con formato
   * AAAA-NNNN, así el número es correlativo aunque dos administradores
   * matriculen al mismo tiempo.
   *
   * PostgREST no expone transacciones, de modo que los tres pasos no son
   * atómicos. Si la matrícula falla (por ejemplo, porque el curso llegó al
   * cupo), se borra el alumno recién creado para no dejar un legajo huérfano.
   * Mover el circuito a una función de PostgreSQL es la mejora prevista para
   * el Sprint 2.
   *
   * @param {{solicitud:object, cursoId:string, cicloId:number, datosAlumno:object, matriculadoPor:string}} params
   * @returns {Promise<{alumno:object, matricula:object, tutorVinculado:boolean}>}
   */
  async matricularDesdeSolicitud({ solicitud, cursoId, cicloId, datosAlumno, matriculadoPor }) {
    const [alumno] = await ejecutar(
      supabase.from('alumnos').insert({
        apellido:         datosAlumno.apellido.trim(),
        nombre:           datosAlumno.nombre.trim(),
        dni:              datosAlumno.dni.trim(),
        fecha_nacimiento: datosAlumno.fecha_nacimiento,
        domicilio:        datosAlumno.domicilio?.trim() || null,
        telefono:         datosAlumno.telefono?.trim() || null,
        email:            datosAlumno.email?.trim() || null,
        inscripcion_id:   solicitud.id,
      }).select(),
      'crear el legajo del alumno',
    )

    try {
      const [nueva] = await ejecutar(
        supabase.from('matriculas').insert({
          alumno_id:       alumno.id,
          curso_id:        cursoId,
          ciclo_id:        cicloId,
          matriculado_por: matriculadoPor ?? null,
        }).select(MATRICULA_CON_CURSO),
        'matricular al alumno en el curso',
      )

      await ejecutar(
        supabase.from('inscripciones').update({
          estado:       'matriculada',
          revisado_por: matriculadoPor ?? null,
          updated_at:   new Date().toISOString(),
        }).eq('id', solicitud.id).select(),
        'cerrar la solicitud de inscripción',
      )

      const tutorVinculado = await this.vincularTutorDeLaSolicitud(alumno.id, solicitud)
      return { alumno, matricula: nueva, tutorVinculado }
    } catch (err) {
      await supabase.from('alumnos').delete().eq('id', alumno.id)
      throw err
    }
  },

  /**
   * Asocia al alumno con la cuenta del tutor que hizo la solicitud, si esa
   * persona ya tiene usuario. No es obligatorio: si todavía no se registró, el
   * vínculo se crea después y la matrícula igual queda hecha.
   *
   * La búsqueda es por DNI y no por email porque `profiles` no guarda el email
   * (vive en auth.users, que no es consultable desde el cliente), y el DNI es
   * único en esa tabla.
   *
   * @returns {Promise<boolean>} si se pudo vincular
   */
  async vincularTutorDeLaSolicitud(alumnoId, solicitud) {
    if (!solicitud.tutor_dni) return false

    try {
      const perfiles = await ejecutar(
        supabase.from('profiles').select('id, rol').eq('dni', solicitud.tutor_dni).limit(1),
        'buscar la cuenta del tutor',
      )
      const tutor = perfiles?.[0]
      if (!tutor) return false

      const relacion = ['padre', 'madre', 'tutor'].includes(solicitud.tutor_relacion)
        ? solicitud.tutor_relacion
        : 'tutor'

      await ejecutar(
        supabase.from('alumno_tutor').insert({ alumno_id: alumnoId, tutor_id: tutor.id, relacion }),
        'vincular al tutor con el alumno',
      )
      return true
    } catch (err) {
      // El vínculo es secundario: la matrícula ya está hecha y se puede
      // asociar al tutor más tarde, así que no se corta la operación.
      console.error('[servicios] No se pudo vincular al tutor con el alumno:', err)
      return false
    }
  },

  /** Baja de una matrícula (el alumno deja el curso sin borrar su legajo ni su historia). */
  async darDeBaja(matriculaId, observaciones) {
    const [actualizada] = await ejecutar(
      supabase.from('matriculas')
        .update({ estado: 'baja', observaciones: observaciones?.trim() || null })
        .eq('id', matriculaId)
        .select(MATRICULA_CON_CURSO),
      'dar de baja la matrícula',
    )
    return actualizada
  },

  /** Cantidad de alumnos con matrícula activa en el ciclo, para el panel de inicio. */
  async contarMatriculasActivas(cicloId) {
    if (!cicloId) return 0
    const { count, error } = await supabase.from('matriculas')
      .select('id', { count: 'exact', head: true })
      .eq('ciclo_id', cicloId).eq('estado', 'activa')
    if (error) {
      console.error('[servicios] Falló al contar las matrículas activas:', error)
      return 0
    }
    return count ?? 0
  },
}
