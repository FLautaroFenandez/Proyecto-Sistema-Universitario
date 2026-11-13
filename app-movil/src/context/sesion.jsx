/**
 * @file sesion.jsx
 * @description Sesión compartida por toda la app. Cualquier pantalla puede preguntar
 * quién ingresó con `useSesion()`, igual que `AuthContext` en la web.
 *
 * Al abrir la app recupera la sesión guardada en el teléfono: por eso el padre no tiene
 * que ingresar cada vez. Mientras la busca, `cargando` vale true.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { sesion } from '../services/sesion'

const ContextoSesion = createContext(null)

export function ProveedorSesion({ children }) {
  /** @type {[{id: string, nombre: string, email: string} | null, Function]} */
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al abrir la app: ¿hay una sesión guardada y sigue siendo válida?
  useEffect(() => {
    sesion.actual().then(setUsuario).finally(() => setCargando(false))
    // Si la sesión se cierra por fuera (venció, por ejemplo), se vuelve al ingreso.
    return sesion.alCerrarse(() => setUsuario(null))
  }, [])

  const valor = useMemo(() => ({
    usuario,
    cargando,
    /** Ingresa y deja al usuario disponible para toda la app. Lanza ErrorDeServicio si falla. */
    async ingresar(email, clave) {
      setUsuario(await sesion.ingresar(email, clave))
    },
    async salir() {
      await sesion.salir()
      setUsuario(null)
    },
  }), [usuario, cargando])

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}

/** Sesión actual: `{ usuario, cargando, ingresar, salir }`. */
export function useSesion() {
  const contexto = useContext(ContextoSesion)
  if (!contexto) throw new Error('useSesion() se usa dentro de <ProveedorSesion>')
  return contexto
}
