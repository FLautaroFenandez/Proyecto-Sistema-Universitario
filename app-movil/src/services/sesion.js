/**
 * @file sesion.js
 * @description Servicio de sesión de la app (patrón **Facade**) — HU-M6.
 * Las pantallas piden "ingresar" o "salir" sin saber cómo se habla con Supabase.
 *
 * Criterios de aceptación de HU-M6 que cubre:
 *  - Credenciales válidas → ingresa (con el mismo usuario de la web).
 *  - Credenciales inválidas → mensaje claro, sin detalles técnicos.
 *  - Ver únicamente las funciones que su rol habilita: la app es para las familias,
 *    así que solo entra el rol `padre`. Es la primera capa de seguridad; la segunda es
 *    el RLS de la base, que le niega los datos ajenos aunque alguien modifique la app.
 */

import { supabase } from '../lib/supabase'
import { ErrorDeServicio } from './base'

/** Único rol que usa la app. El administrador gestiona la cobranza desde la web. */
export const ROL_FAMILIA = 'padre'

/**
 * Comprueba que la cuenta pueda usar la app y devuelve sus datos.
 * Si no puede, cierra la sesión recién abierta y explica por qué.
 *
 * @param {{id: string, email: string}} cuenta - Usuario devuelto por Supabase Auth
 * @returns {Promise<{id: string, nombre: string, email: string}>}
 */
async function usuarioHabilitado(cuenta) {
  const { data: perfil, error } = await supabase
    .from('profiles')
    .select('id, nombre, rol, activo')
    .eq('id', cuenta.id)
    .maybeSingle()

  if (error) {
    console.error('[sesion] No se pudo leer el perfil:', error)
    throw new ErrorDeServicio('No se pudo conectar. Revisá tu conexión e intentá de nuevo.', error)
  }

  if (!perfil?.activo) {
    await supabase.auth.signOut()
    throw new ErrorDeServicio('Tu cuenta no está habilitada. Consultá en la Administración.')
  }

  if (perfil.rol !== ROL_FAMILIA) {
    await supabase.auth.signOut()
    throw new ErrorDeServicio(
      'Esta app es para las familias. Si sos personal de la institución, ingresá desde la web.',
    )
  }

  return { id: perfil.id, nombre: perfil.nombre, email: cuenta.email }
}

export const sesion = {

  /**
   * Inicia sesión con el email y la contraseña de la web.
   * @returns {Promise<{id: string, nombre: string, email: string}>} El usuario que ingresó.
   */
  async ingresar(email, clave) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: clave,
    })

    if (error) {
      // Supabase responde 400 cuando el email o la contraseña no coinciden.
      // Cualquier otro error es de red o del servicio.
      const credencialesInvalidas = error.status === 400
      throw new ErrorDeServicio(
        credencialesInvalidas
          ? 'Email o contraseña incorrectos. Verificá tus datos.'
          : 'No se pudo conectar. Revisá tu conexión e intentá de nuevo.',
        error,
      )
    }

    return usuarioHabilitado(data.user)
  },

  /**
   * Recupera la sesión guardada en el teléfono, si la hay y sigue siendo válida.
   * @returns {Promise<{id: string, nombre: string, email: string} | null>}
   */
  async actual() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    try {
      return await usuarioHabilitado(data.session.user)
    } catch {
      return null
    }
  },

  /** Cierra la sesión y borra la guardada en el teléfono. */
  async salir() {
    await supabase.auth.signOut()
  },

  /**
   * Avisa cuando la sesión se cierra por fuera de la app (por ejemplo, si venció).
   * @param {() => void} alCerrarse
   * @returns {() => void} Función para dejar de escuchar.
   */
  alCerrarse(alCerrarse) {
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') alCerrarse()
    })
    return () => data.subscription.unsubscribe()
  },
}
