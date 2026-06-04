/**
 * @file useNoticias.js
 * @description Hook para obtener noticias desde Supabase.
 * Maneja estados de carga, error y paginación.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const NOTICIAS_DEMO = [
  {
    id: 'demo-1',
    titulo: 'Inscripciones 2027 abiertas para todos los niveles',
    resumen: 'El Centro Educativo Educar para Transformar abre sus puertas para el ciclo lectivo 2027. Cupos limitados para Nivel Inicial, Primario y Secundario.',
    imagen_url: null,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    publica: true,
    publicada: true,
  },
  {
    id: 'demo-2',
    titulo: 'Presentación del proyecto educativo ante autoridades del NEA',
    resumen: 'Directivos del centro presentaron la propuesta pedagógica innovadora ante representantes de instituciones educativas del noreste argentino.',
    imagen_url: null,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    publica: true,
    publicada: true,
  },
  {
    id: 'demo-3',
    titulo: 'Nuestra propuesta de jornada extendida y tres idiomas',
    resumen: 'Conocé en detalle cómo organizamos el tiempo escolar para maximizar el aprendizaje con inglés, portugués y francés desde el Nivel Inicial.',
    imagen_url: null,
    created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    publica: true,
    publicada: true,
  },
]

export function useNoticias({ soloPublicas = true, limite = 9, pagina = 1 } = {}) {
  const [noticias, setNoticias] = useState([])
  const [total,    setTotal]    = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    let cancelado = false

    async function fetchNoticias() {
      setCargando(true)
      setError(null)

      try {
        const offset = (pagina - 1) * limite

        let query = supabase
          .from('noticias')
          .select('id, titulo, resumen, imagen_url, created_at, publica', { count: 'exact' })
          .eq('publicada', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + limite - 1)

        if (soloPublicas) {
          query = query.eq('publica', true)
        }

        const { data, error: supabaseError, count } = await query

        if (supabaseError) throw supabaseError
        if (!cancelado) {
          setNoticias(data ?? [])
          setTotal(count ?? 0)
        }
      } catch (err) {
        if (!cancelado) {
          console.warn('Usando datos de ejemplo (Supabase no configurado):', err.message)
          const demo = NOTICIAS_DEMO.slice(0, limite)
          setNoticias(demo)
          setTotal(demo.length)
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    fetchNoticias()
    return () => { cancelado = true }
  }, [soloPublicas, limite, pagina])

  return { noticias, total, cargando, error }
}

/**
 * Hook para obtener una noticia por ID
 * @param {string} id - UUID de la noticia
 */
export function useNoticiaById(id) {
  const [noticia,  setNoticia]  = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelado = false

    async function fetchNoticia() {
      setCargando(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('noticias')
          .select('*')
          .eq('id', id)
          .eq('publicada', true)
          .single()

        if (supabaseError) throw supabaseError
        if (!cancelado) setNoticia(data)
      } catch (err) {
        if (!cancelado) {
          console.error('Error al cargar noticia:', err)
          setError('No pudimos cargar la noticia. Intentá de nuevo.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    fetchNoticia()
    return () => { cancelado = true }
  }, [id])

  return { noticia, cargando, error }
}
