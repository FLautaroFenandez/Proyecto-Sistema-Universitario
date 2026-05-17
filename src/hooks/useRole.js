/**
 * @file useRole.js
 * @description Hook para verificar permisos del usuario actual.
 * Usa el perfil del contexto de autenticación.
 */

import { useContext } from 'react'
import { AuthContext } from '@/components/auth/AuthContext'
import { tienePermiso } from '@/types/roles'

export function useRole() {
  const { profile } = useContext(AuthContext)
  const rol = profile?.rol ?? null

  return {
    rol,
    /** Verifica si el usuario tiene permiso para una acción */
    puede: (permiso) => rol ? tienePermiso(rol, permiso) : false,
    /** true si el usuario está autenticado */
    autenticado: !!profile,
  }
}
