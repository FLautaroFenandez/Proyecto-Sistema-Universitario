/**
 * @file supabase.js
 * @description Inicialización y exportación del cliente de Supabase.
 * Importar `supabase` desde cualquier hook o utilidad que necesite BD o Auth.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Faltan variables de entorno de Supabase.\n' +
    'Copiá .env.example a .env.local y completá los valores.\n' +
    'Ver docs/GUIA_SUPABASE.md para instrucciones.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:     true,
    detectSessionInUrl: true,
  },
})
