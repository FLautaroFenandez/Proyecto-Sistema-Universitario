/**
 * @file DashboardPage.jsx
 * @description Enrutador de dashboard — renderiza el sub-dashboard correcto según el rol
 * del usuario autenticado. Siempre usa el Layout público (Topbar + Navbar + Footer).
 */

import { useContext } from 'react'
import { AuthContext } from '@/components/auth/AuthContext'
import { DashboardAdmin }      from '@/components/dashboard/DashboardAdmin'
import { DashboardPersonal }   from '@/components/dashboard/DashboardPersonal'
import { DashboardPadre }      from '@/components/dashboard/DashboardPadre'
import { DashboardEstudiante } from '@/components/dashboard/DashboardEstudiante'
import { Spinner } from '@/components/ui/Spinner'

/* Mapa rol → componente */
const DASHBOARDS = {
  admin:      DashboardAdmin,
  autoridad:  DashboardAdmin,
  docente:    DashboardPersonal,
  personal:   DashboardPersonal,
  padre:      DashboardPadre,
  estudiante: DashboardEstudiante,
}

export default function DashboardPage() {
  const { profile, loading } = useContext(AuthContext)

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" color="blue" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
      <p>No se pudo cargar el perfil del usuario.</p>
    </div>
  )

  const Dashboard = DASHBOARDS[profile.rol] ?? DashboardEstudiante

  /* Usuario desactivado */
  if (profile.activo === false) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <span className="text-5xl block mb-4">🔒</span>
        <h2 className="font-display font-bold text-gray-800 text-xl mb-2">Cuenta desactivada</h2>
        <p className="text-gray-500 text-sm">Tu cuenta ha sido desactivada. Contactá a la administración para más información.</p>
      </div>
    </div>
  )

  return <Dashboard />
}
