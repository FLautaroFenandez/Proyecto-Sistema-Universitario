/**
 * @file AuthContext.jsx
 * @description Context que provee el estado de autenticación globalmente.
 * Envolver App.jsx con <AuthProvider> para que todos los componentes
 * puedan acceder a user, profile y las funciones de auth.
 */

import { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/useAuth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  return context
}
