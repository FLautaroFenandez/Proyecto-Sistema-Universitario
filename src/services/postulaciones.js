/**
 * @file postulaciones.js
 * @description Postulaciones laborales (REQ-20).
 *
 * La web pública registra la postulación (EmpleoPage) y Administración la sigue
 * hasta la decisión final. Antes de guardar un cambio de estado se consulta al
 * patrón State; la base repite la validación con trg_transicion_postulacion.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'
import { estadoPostulacionDe } from '@/domain/estadoPostulacion'

export const postulaciones = {

  /** Lo usa la página pública de Empleo, sin sesión iniciada. */
  async registrar({ nombre, email, area, cvLink, empleoId }) {
    await ejecutar(
      supabase.from('postulaciones').insert({
        nombre:    nombre.trim(),
        email:     email.trim(),
        area:      area || null,
        cv_link:   cvLink?.trim() || null,
        empleo_id: empleoId ?? null,
      }),
      'enviar la postulación',
    )
  },

  /** @param {string|null} estado - filtra por estado, o todas si es null */
  async listar(estado = null) {
    let consulta = supabase.from('postulaciones')
      .select('*, empleo:empleos(titulo)')
      .order('created_at', { ascending: false })
    if (estado) consulta = consulta.eq('estado', estado)
    return ejecutar(consulta, 'cargar las postulaciones')
  },

  async cambiarEstado(postulacion, destino, { observaciones, revisadoPor } = {}) {
    estadoPostulacionDe(postulacion.estado).pasarA(destino)
    const [actualizada] = await ejecutar(
      supabase.from('postulaciones')
        .update({
          estado:        destino,
          observaciones: observaciones?.trim() || null,
          revisado_por:  revisadoPor ?? null,
        })
        .eq('id', postulacion.id)
        .select('*, empleo:empleos(titulo)'),
      'guardar el cambio de estado',
    )
    return actualizada
  },
}
