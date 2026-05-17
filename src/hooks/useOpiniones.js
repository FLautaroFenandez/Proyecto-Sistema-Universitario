/**
 * @file useOpiniones.js
 * @description Trae solo las opiniones aprobadas para mostrar en el sitio público.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useOpiniones() {
  const [opiniones, setOpiniones] = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let cancelado = false

    async function fetchOpiniones() {
      setCargando(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('opiniones')
          .select('id, autor_nombre, texto, created_at')
          .eq('estado', 'aprobada')
          .order('created_at', { ascending: false })
          .limit(6)

        if (supabaseError) throw supabaseError
        if (!cancelado) setOpiniones(data ?? [])
      } catch (err) {
        if (!cancelado) {
          console.error('Error al cargar opiniones:', err)
          setError('No pudimos cargar las opiniones.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    fetchOpiniones()
    return () => { cancelado = true }
  }, [])

  return { opiniones, cargando, error }
}
