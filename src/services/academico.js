/**
 * @file academico.js
 * @description Servicio de la estructura académica: ciclos lectivos, niveles,
 * cursos, materias y la asignación de docentes (REQ-14).
 *
 * Es la única puerta de entrada a esas tablas: las pantallas piden datos acá y
 * no conocen el nombre de las tablas ni la forma de las consultas. Si mañana
 * cambia el modelo, se cambia este archivo y no las pantallas.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

/** Columnas del curso más el nivel y el ciclo al que pertenece. */
const CURSO_CON_RELACIONES = '*, nivel:niveles(id, nombre, orden), ciclo:ciclos_lectivos(id, anio)'

/** Nombre legible de un curso: "1.º A · mañana". */
export function nombreDeCurso(curso) {
  if (!curso) return '—'
  const turno = curso.turno === 'manana' ? 'mañana' : 'tarde'
  return `${curso.anio}.º ${curso.division} · ${turno}`
}

/** Nombre completo, con el nivel incluido: "1.º A · mañana · primario". */
export function nombreCompletoDeCurso(curso) {
  if (!curso) return '—'
  return `${nombreDeCurso(curso)} · ${curso.nivel?.nombre ?? ''}`.trim()
}

export const academico = {

  // ── Ciclo lectivo ─────────────────────────────────────────────────────────

  /** Ciclo marcado como activo, o null si todavía no se abrió ninguno. */
  async cicloActivo() {
    const ciclos = await ejecutar(
      supabase.from('ciclos_lectivos').select('*').eq('activo', true).limit(1),
      'cargar el ciclo lectivo activo',
    )
    return ciclos?.[0] ?? null
  },

  async listarCiclos() {
    return ejecutar(
      supabase.from('ciclos_lectivos').select('*').order('anio', { ascending: false }),
      'cargar los ciclos lectivos',
    )
  },

  // ── Niveles ───────────────────────────────────────────────────────────────

  async listarNiveles() {
    return ejecutar(
      supabase.from('niveles').select('*').order('orden'),
      'cargar los niveles educativos',
    )
  },

  // ── Cursos ────────────────────────────────────────────────────────────────

  async listarCursos(cicloId) {
    if (!cicloId) return []
    return ejecutar(
      supabase.from('cursos').select(CURSO_CON_RELACIONES)
        .eq('ciclo_id', cicloId)
        .order('anio').order('division'),
      'cargar los cursos',
    )
  },

  /**
   * Cursos del ciclo con la cantidad de matrículas activas y los lugares libres.
   * El cupo lo controla un disparador en la base; acá se calcula solo para
   * mostrarlo y para poder deshabilitar en pantalla los cursos completos.
   *
   * @returns {Promise<Array<object & {ocupadas:number, libres:number, completo:boolean}>>}
   */
  async listarCursosConOcupacion(cicloId) {
    if (!cicloId) return []

    const [cursos, matriculas, dictados] = await Promise.all([
      this.listarCursos(cicloId),
      ejecutar(
        supabase.from('matriculas').select('id, curso_id').eq('ciclo_id', cicloId).eq('estado', 'activa'),
        'contar las matrículas por curso',
      ),
      ejecutar(
        supabase.from('curso_materia').select('id, curso_id'),
        'contar las materias por curso',
      ),
    ])

    const contar = (lista, cursoId) => lista.filter(f => f.curso_id === cursoId).length

    return cursos.map(curso => {
      const ocupadas = contar(matriculas, curso.id)
      return {
        ...curso,
        ocupadas,
        libres: Math.max(curso.cupo - ocupadas, 0),
        completo: ocupadas >= curso.cupo,
        materias: contar(dictados, curso.id),
      }
    })
  },

  async crearCurso(datos) {
    const [curso] = await ejecutar(
      supabase.from('cursos').insert(datos).select(CURSO_CON_RELACIONES),
      'crear el curso',
    )
    return curso
  },

  async actualizarCurso(id, datos) {
    const [curso] = await ejecutar(
      supabase.from('cursos').update(datos).eq('id', id).select(CURSO_CON_RELACIONES),
      'actualizar el curso',
    )
    return curso
  },

  async eliminarCurso(id) {
    // La base rechaza el borrado si el curso tiene matrículas (ON DELETE RESTRICT),
    // y ese error se traduce en base.js.
    await ejecutar(supabase.from('cursos').delete().eq('id', id), 'eliminar el curso')
  },

  // ── Materias ──────────────────────────────────────────────────────────────

  async listarMaterias() {
    return ejecutar(
      supabase.from('materias').select('*').order('nombre'),
      'cargar las materias',
    )
  },

  async crearMateria(datos) {
    const [materia] = await ejecutar(
      supabase.from('materias').insert(datos).select(),
      'crear la materia',
    )
    return materia
  },

  async actualizarMateria(id, datos) {
    const [materia] = await ejecutar(
      supabase.from('materias').update(datos).eq('id', id).select(),
      'actualizar la materia',
    )
    return materia
  },

  // ── Materias dictadas en un curso, con su docente (REQ-14) ────────────────

  /**
   * Regla del enunciado: una materia puede dictarse en distintos cursos y tener
   * distinto profesor según el curso. Por eso el docente se asigna acá.
   */
  async listarDictados(cursoId) {
    if (!cursoId) return []
    return ejecutar(
      supabase.from('curso_materia')
        .select('*, materia:materias(id, nombre, codigo), docente:profiles(id, nombre, dni)')
        .eq('curso_id', cursoId),
      'cargar las materias del curso',
    )
  },

  async asignarMateria({ cursoId, materiaId, docenteId }) {
    const [dictado] = await ejecutar(
      supabase.from('curso_materia')
        .insert({ curso_id: cursoId, materia_id: materiaId, docente_id: docenteId || null })
        .select('*, materia:materias(id, nombre, codigo), docente:profiles(id, nombre, dni)'),
      'asignar la materia al curso',
    )
    return dictado
  },

  async cambiarDocente(dictadoId, docenteId) {
    // Si el usuario elegido no tiene rol docente, lo rechaza un disparador de la base.
    const [dictado] = await ejecutar(
      supabase.from('curso_materia')
        .update({ docente_id: docenteId || null })
        .eq('id', dictadoId)
        .select('*, materia:materias(id, nombre, codigo), docente:profiles(id, nombre, dni)'),
      'cambiar el docente de la materia',
    )
    return dictado
  },

  async quitarMateria(dictadoId) {
    await ejecutar(
      supabase.from('curso_materia').delete().eq('id', dictadoId),
      'quitar la materia del curso',
    )
  },

  /** Usuarios con rol docente activos, para el selector de asignación. */
  async listarDocentes() {
    return ejecutar(
      supabase.from('profiles').select('id, nombre, dni')
        .eq('rol', 'docente').eq('activo', true)
        .order('nombre'),
      'cargar los docentes',
    )
  },
}
