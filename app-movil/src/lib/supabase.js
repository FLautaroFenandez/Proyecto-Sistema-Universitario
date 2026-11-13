/**
 * @file supabase.js
 * @description Cliente único de Supabase para la app móvil: patrón **Singleton**, con el
 * mismo criterio que `src/lib/supabase.js` de la web. Toda la app usa esta instancia,
 * que guarda la sesión del usuario.
 *
 * Por qué no se reutiliza el archivo de la web (ver docs/06-parte-3-app-movil/
 * 02-ingreso-y-cuotas/README.md, sección 7.2):
 *  - La configuración llega por `process.env.EXPO_PUBLIC_…` y no por `import.meta.env`,
 *    que solo existe en Vite.
 *  - La sesión se guarda en AsyncStorage, el almacenamiento del teléfono, y no en el
 *    localStorage del navegador.
 *  - `detectSessionInUrl: false`: en la app no hay una dirección web de la que leer la sesión.
 */

// Completa la clase URL de JavaScript en React Native: supabase-js la usa para armar
// las direcciones de la API. Lo recomienda la guía de Supabase para React Native.
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'

/** Dirección del proyecto de Supabase (la misma que usa la web). */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
/** Clave pública (anon): es pública por diseño; la seguridad está en el RLS de la base. */
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Falta configurar app-movil/.env.local (ver app-movil/.env.example)')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
})

// El token de la sesión vence cada hora y supabase-js lo renueva solo. Cuando la app
// pasa a segundo plano se pausa esa renovación, y se retoma al volver: así la app no
// hace pedidos mientras el teléfono la tiene en pausa.
AppState.addEventListener('change', (estado) => {
  if (estado === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})
