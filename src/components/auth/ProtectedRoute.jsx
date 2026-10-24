/**
 * @file ProtectedRoute.jsx
 * @description Componente que protege rutas privadas.
 * Redirige a /login si no hay sesión.
 * Redirige a /dashboard si el rol no tiene permiso para la ruta.
 *
 * @param {string[]} rolesPermitidos - Si se pasa, solo esos roles pueden acceder
 */

import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from './AuthContext'

export function ProtectedRoute({ children, rolesPermitidos = [] }) {
  const { user, profile, loading, signOut } = useContext(AuthContext)
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-azul" />
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // HU6: una cuenta dada de baja no entra. La base ya le quitó los permisos
  // (rol_actual() exige activo); acá se le explica en lugar de mostrar errores.
  if (profile && profile.activo === false) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm space-y-2">
        <p className="font-semibold text-gray-700">Tu cuenta está inactiva</p>
        <p className="text-sm text-gray-400">Comunicate con la administración de la institución para reactivarla.</p>
        <button onClick={signOut} className="text-sm text-brand-azul hover:underline">Cerrar sesión</button>
      </div>
    </div>
  )

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(profile?.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
