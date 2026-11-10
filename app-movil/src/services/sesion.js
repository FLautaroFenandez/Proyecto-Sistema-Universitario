/**
 * @file sesion.js
 * @description Servicio de sesión de la app móvil (patrón **Facade**): las pantallas
 * piden "¿hay conexión?" o "iniciar sesión" sin saber cómo se habla con Supabase.
 *
 * En este paso solo comprueba la conexión. En el paso 3 suma el ingreso, el cierre de
 * sesión y la verificación del rol (HU-M6).
 */

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../lib/supabase'

/**
 * Comprueba que el teléfono llega a Supabase con la configuración de `.env.local`.
 * Consulta el punto de control del servicio de autenticación, que responde sin
 * necesidad de iniciar sesión.
 *
 * @returns {Promise<boolean>} true si Supabase respondió correctamente.
 */
export async function comprobarConexion() {
  try {
    const respuesta = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    })
    return respuesta.ok
  } catch {
    return false
  }
}
