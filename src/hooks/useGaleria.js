/**
 * @file useGaleria.js
 * @description Hook para obtener imágenes de la galería, opcionalmente filtradas por categoría.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * @param {number|null} categoriaId - ID de la categoría a filtrar (null = todas)
 */
export function useGaleria(categoriaId = null) {
  const [imagenes,    setImagenes]    = useState([])
  const [categorias,  setCategorias]  = useState([])
  const [cargando,    setCargando]    = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    let cancelado = false

    async function fetchCategorias() {
      const { data } = await supabase
        .from('galeria_categorias')
        .select('id, nombre, descripcion')
        .order('orden')
      if (!cancelado) setCategorias(data ?? [])
    }

    fetchCategorias()
    return () => { cancelado = true }
  }, [])

  useEffect(() => {
    let cancelado = false

    async function fetchImagenes() {
      setCargando(true)
      setError(null)

      try {
        let query = supabase
          .from('galeria')
          .select('id, titulo, descripcion, imagen_url, categoria_id, created_at')
          .eq('activa', true)
          .order('created_at', { ascending: false })

        if (categoriaId) {
          query = query.eq('categoria_id', categoriaId)
        }

        const { data, error: supabaseError } = await query
        if (supabaseError) throw supabaseError
        if (!cancelado) setImagenes(data ?? [])
      } catch (err) {
        if (!cancelado) {
          console.error('Error al cargar galería:', err)
          setError('No pudimos cargar las imágenes.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    fetchImagenes()
    return () => { cancelado = true }
  }, [categoriaId])

  return { imagenes, categorias, cargando, error }
}
