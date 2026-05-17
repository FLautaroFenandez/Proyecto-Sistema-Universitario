/**
 * @file useInscripciones.js
 * @description Hook para gestionar solicitudes de inscripción (solo admin/autoridad).
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * @param {string|null} filtroEstado - 'pendiente'|'en_revision'|'aceptada'|'rechazada'|null
 */
export function useInscripciones(filtroEstado = null) {
  const [inscripciones, setInscripciones] = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    let cancelado = false

    async function fetchInscripciones() {
      setCargando(true)
      setError(null)

      try {
        let query = supabase
          .from('inscripciones')
          .select('*')
          .order('created_at', { ascending: false })

        if (filtroEstado) {
          query = query.eq('estado', filtroEstado)
        }

        const { data, error: supabaseError } = await query
        if (supabaseError) throw supabaseError
        if (!cancelado) setInscripciones(data ?? [])
      } catch (err) {
        if (!cancelado) {
          console.error('Error al cargar inscripciones:', err)
          setError('No pudimos cargar las inscripciones.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    fetchInscripciones()
    return () => { cancelado = true }
  }, [filtroEstado])

  return { inscripciones, cargando, error }
}
