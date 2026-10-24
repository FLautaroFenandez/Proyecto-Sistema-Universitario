/**
 * @file comunicados.js
 * @description Comunicados del docente a los padres de su curso (HU5 · REQ-18).
 *
 * Quién lee cada comunicado no lo decide la pantalla sino la política
 * comunicados_lectura: el autor, Administración, los docentes del curso y las
 * familias de los alumnos matriculados en él. Por eso la misma consulta sirve
 * para el docente y para el padre.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar, ErrorDeServicio } from './base'

// autor_nombre lo completa la base al enviar: las familias no pueden leer el
// perfil del docente, pero sí ver quién firmó el comunicado.
const CON_CURSO_Y_AUTOR =
  'id, titulo, mensaje, created_at, curso_id, autor_nombre, ' +
  'curso:cursos(id, anio, division, turno, nivel:niveles(nombre))'

export const LARGO_MAXIMO_TITULO = 120

export const comunicados = {

  /**
   * Envía un comunicado a un curso. La base exige que el autor dicte alguna
   * materia en ese curso y rechaza el título o el mensaje vacíos.
   */
  async enviar({ cursoId, autorId, titulo, mensaje }) {
    if (!titulo?.trim() || !mensaje?.trim()) {
      throw new ErrorDeServicio('El comunicado necesita un título y un mensaje.')
    }
    const [enviado] = await ejecutar(
      supabase.from('comunicados').insert({
        curso_id: cursoId,
        autor_id: autorId,
        titulo:   titulo.trim(),
        mensaje:  mensaje.trim(),
      }).select(CON_CURSO_Y_AUTOR),
      'enviar el comunicado',
    )
    return enviado
  },

  /** Comunicados que el usuario puede leer, del más nuevo al más viejo. */
  async recientes({ cursoIds, limite = 20 } = {}) {
    let consulta = supabase.from('comunicados').select(CON_CURSO_Y_AUTOR)
      .order('created_at', { ascending: false })
      .limit(limite)
    if (cursoIds?.length) consulta = consulta.in('curso_id', cursoIds)
    return ejecutar(consulta, 'cargar los comunicados')
  },
}
