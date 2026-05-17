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
  const { user, profile, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-azul" />
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(profile?.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
