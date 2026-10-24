/**
 * @file auditoria.js
 * @description Consulta del registro de auditoría (REQ-22).
 *
 * El registro lo escribe la base con disparadores (docs/supabase-sprint3.sql):
 * la aplicación no puede insertar, modificar ni borrar entradas, solo leerlas,
 * y solo si el rol es Administración o Autoridad.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

/** Tablas auditadas, con un nombre legible para el filtro. */
export const TABLAS_AUDITADAS = [
  { clave: 'profiles',       etiqueta: 'Usuarios' },
  { clave: 'matriculas',     etiqueta: 'Matrículas' },
  { clave: 'calificaciones', etiqueta: 'Calificaciones' },
  { clave: 'inscripciones',  etiqueta: 'Solicitudes de inscripción' },
  { clave: 'personal',       etiqueta: 'Legajos de personal' },
  { clave: 'postulaciones',  etiqueta: 'Postulaciones' },
]

export const ACCIONES = { INSERT: 'Alta', UPDATE: 'Cambio', DELETE: 'Baja' }

export function etiquetaDeTabla(clave) {
  return TABLAS_AUDITADAS.find(t => t.clave === clave)?.etiqueta ?? clave
}

/**
 * Resume el detalle de un cambio en una línea legible:
 * "rol: padre → docente · activo: true → false".
 */
export function resumirDetalle(entrada) {
  const detalle = entrada.detalle ?? {}
  const mostrar = valor => (valor === null || valor === undefined ? '—' : String(valor))
  if (entrada.accion === 'UPDATE') {
    return Object.entries(detalle)
      .map(([campo, { antes, despues }]) => `${campo}: ${mostrar(antes)} → ${mostrar(despues)}`)
      .join(' · ')
  }
  const claves = ['estado', 'rol', 'nota', 'legajo', 'nombre', 'apellido', 'curso_id']
  return claves.filter(c => c in detalle).map(c => `${c}: ${mostrar(detalle[c])}`).join(' · ')
}

export const auditoria = {

  /** @param {{tabla?:string, desde?:string, hasta?:string, limite?:number}} filtros */
  async listar({ tabla, desde, hasta, limite = 200 } = {}) {
    let consulta = supabase.from('auditoria').select('*').order('created_at', { ascending: false }).limit(limite)
    if (tabla) consulta = consulta.eq('tabla', tabla)
    if (desde) consulta = consulta.gte('created_at', `${desde}T00:00:00-03:00`)
    if (hasta) consulta = consulta.lte('created_at', `${hasta}T23:59:59-03:00`)
    return ejecutar(consulta, 'cargar la auditoría')
  },
}
