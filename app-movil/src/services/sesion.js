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
 *
 * Etapa 4b: suma el cambio de contraseña que pide el Módulo 1 del enunciado.
 */

import { supabase } from '../lib/supabase'
import { ErrorDeServicio } from './base'

/** Único rol que usa la app. El administrador gestiona la cobranza desde la web. */
export const ROL_FAMILIA = 'padre'

/** La misma regla que el registro de la web (src/pages/auth/RegistroPage.jsx). */
export const LARGO_MINIMO_CLAVE = 8

/**
 * Revisa los tres campos del cambio de contraseña antes de ir a Supabase.
 * @returns {string | null} El mensaje para mostrar, o null si está todo bien.
 */
export function validarClaveNueva(actual, nueva, repetida) {
  if (!actual) return 'Ingresá tu contraseña actual.'
  if (nueva.length < LARGO_MINIMO_CLAVE) {
    return `La contraseña nueva tiene que tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`
  }
  if (nueva === actual) return 'La contraseña nueva tiene que ser distinta de la actual.'
  if (nueva !== repetida) return 'Las dos contraseñas nuevas no coinciden.'
  return null
}

/** Mensajes para los rechazos de Supabase al cambiar la contraseña, por código de error. */
const RECHAZOS_AL_CAMBIAR = {
  same_password: 'La contraseña nueva tiene que ser distinta de la actual.',
  weak_password: 'La contraseña nueva es muy débil. Probá con una más larga.',
}

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
   * Cambia la contraseña de quien tiene la sesión abierta (Etapa 4b · Módulo 1).
   *
   * Son dos pasos:
   *  1. Se comprueba la contraseña actual volviendo a ingresar con ella. Sin este paso,
   *     alcanzaría con tener el teléfono desbloqueado para cambiar la clave. Si no
   *     coincide, Supabase lo rechaza y la sesión abierta queda como estaba.
   *  2. Recién entonces se guarda la nueva.
   *
   * `current_password` se envía también: Supabase lo verifica solo si el proyecto tiene
   * activada esa opción. No se depende de eso; la comprobación real es el paso 1.
   *
   * @param {string} email - El de la sesión abierta
   */
  async cambiarClave(email, actual, nueva) {
    const { error: errorActual } = await supabase.auth.signInWithPassword({ email, password: actual })
    if (errorActual) {
      throw new ErrorDeServicio(
        errorActual.status === 400
          ? 'La contraseña actual no es correcta.'
          : 'No se pudo conectar. Revisá tu conexión e intentá de nuevo.',
        errorActual,
      )
    }

    const { error } = await supabase.auth.updateUser({ password: nueva, current_password: actual })
    if (error) {
      console.error('[sesion] No se pudo cambiar la contraseña:', error)
      throw new ErrorDeServicio(
        RECHAZOS_AL_CAMBIAR[error.code] ?? 'No se pudo cambiar la contraseña. Intentá de nuevo.',
        error,
      )
    }
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
