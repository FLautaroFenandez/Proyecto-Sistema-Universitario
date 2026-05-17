/**
 * @file uploadImage.js
 * @description Utilidad para subir imágenes a Supabase Storage.
 * Genera un nombre de archivo único con timestamp para evitar colisiones.
 */

import { supabase } from '@/lib/supabase'

/**
 * Sube una imagen a un bucket de Supabase Storage
 * @param {File} file - Archivo de imagen a subir
 * @param {string} bucket - Nombre del bucket ('galeria' | 'noticias')
 * @param {string} [folder] - Subcarpeta dentro del bucket (opcional)
 * @returns {Promise<string>} URL pública de la imagen subida
 */
export async function uploadImage(file, bucket, folder = '') {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = folder ? `${folder}/${timestamp}_${safeName}` : `${timestamp}_${safeName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false })

  if (error) throw new Error(`Error al subir imagen: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
