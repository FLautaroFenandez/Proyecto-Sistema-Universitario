import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl === 'https://tu-proyecto.supabase.co'

if (isPlaceholder) {
  console.warn(
    '⚠️  Supabase no está configurado con credenciales reales.\n' +
    '   Editá .env.local con tu URL y clave de Supabase.\n' +
    '   El sitio funcionará con datos de ejemplo hasta entonces.'
  )
}

export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      // true: la sesión se guarda en localStorage y el refresh NO desloguea
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
      // supabase-js usa navigator.locks para refrescar el token; al volver
      // de otra pestaña ese lock puede quedar trabado y TODAS las queries
      // se cuelgan para siempre ("se caen las conexiones"). Este lock no-op
      // evita el deadlock ejecutando la operación directamente.
      lock: async (_name, _acquireTimeout, fn) => await fn(),
    },
  }
)

export const supabaseConfigurado = !isPlaceholder
