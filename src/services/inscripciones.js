/**
 * @file inscripciones.js
 * @description Servicio de solicitudes de inscripción que llegan desde la web.
 *
 * Antes la pantalla de Inscripciones consultaba Supabase directamente y guardaba
 * cualquier cambio de estado. Ahora pasa por la capa de servicios (Facade) y
 * cada cambio lo valida el estado actual de la solicitud (State).
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'
import { estadoDe } from '@/domain/estadoSolicitud'

export const inscripciones = {

  /**
   * Solicitudes, de la más reciente a la más antigua.
   * @param {string|null} estado - Filtra por estado; null trae todas
   */
  async listar(estado = null) {
    let consulta = supabase.from('inscripciones').select('*').order('created_at', { ascending: false })
    if (estado) consulta = consulta.eq('estado', estado)
    return ejecutar(consulta, 'cargar las solicitudes de inscripción')
  },

  /**
   * Cambia el estado de una solicitud y guarda las observaciones.
   *
   * El estado actual decide si la transición es válida: si no lo es, se lanza
   * el error antes de tocar la base. Si alguien llegara a saltear esta capa,
   * la base la rechaza igual con el disparador trg_transicion_solicitud.
   *
   * @param {object} solicitud - Fila actual de la solicitud
   * @param {string} destino - Estado al que se quiere pasar
   * @param {{observaciones?:string, revisadoPor?:string}} datos
   */
  async cambiarEstado(solicitud, destino, { observaciones, revisadoPor } = {}) {
    estadoDe(solicitud.estado).pasarA(destino)

    const [actualizada] = await ejecutar(
      supabase.from('inscripciones').update({
        estado:        destino,
        observaciones: observaciones ?? solicitud.observaciones ?? null,
        revisado_por:  revisadoPor ?? null,
        updated_at:    new Date().toISOString(),
      }).eq('id', solicitud.id).select(),
      'actualizar la solicitud',
    )
    return actualizada
  },
}
