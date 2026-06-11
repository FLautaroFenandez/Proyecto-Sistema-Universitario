/**
 * @file DashboardPage.jsx
 * @description Enrutador de dashboard — renderiza el sub-dashboard correcto según el rol
 * del usuario autenticado. Siempre usa el Layout público (Topbar + Navbar + Footer).
 */

import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserX, LogOut, RefreshCw } from 'lucide-react'
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
  const { profile, loading, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" color="blue" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <UserX size={28} className="text-gray-400" />
        </div>
        <h2 className="font-display font-bold text-gray-800 text-xl mb-2">
          No pudimos cargar tu perfil
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Tu cuenta existe pero el perfil no está disponible. Probá recargar la página;
          si el problema persiste, cerrá sesión y volvé a ingresar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-brand-azul text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-azul-dark transition-colors">
            <RefreshCw size={15} /> Recargar
          </button>
          <button onClick={async () => { await signOut(); navigate('/login') }}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </div>
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
