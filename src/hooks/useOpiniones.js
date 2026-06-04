/**
 * @file useOpiniones.js
 * @description Trae solo las opiniones aprobadas para mostrar en el sitio público.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const OPINIONES_DEMO = [
  {
    id: 'demo-1',
    autor_nombre: 'María González',
    texto: 'Excelente propuesta educativa. La jornada extendida y los tres idiomas son exactamente lo que buscábamos para nuestros hijos. ¡Muy entusiasmados con el inicio de actividades!',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    autor_nombre: 'Carlos Rodríguez',
    texto: 'El proyecto educativo es muy completo. Me impresionaron las instalaciones deportivas y la propuesta de apoyo estudiantil. Se nota que pensaron en el desarrollo integral de los alumnos.',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    autor_nombre: 'Ana Martínez',
    texto: 'Fui a la jornada de puertas abiertas y quedé encantada. El equipo directivo transmite mucha pasión y compromiso. Sin dudas inscribiremos a nuestra hija para el ciclo 2027.',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
]

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
          console.warn('Usando opiniones de ejemplo (Supabase no configurado):', err.message)
          setOpiniones(OPINIONES_DEMO)
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
