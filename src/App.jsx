/**
 * @file App.jsx
 * @description Componente raíz. Configura el Router, AuthProvider y todas las rutas.
 * Usa React.lazy para code splitting automático por página.
 */

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/components/auth/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { ROLES } from '@/types/roles'

// Páginas públicas — lazy loading para mejor performance
const HomePage           = lazy(() => import('@/pages/public/HomePage'))
const QuienesSomosPage   = lazy(() => import('@/pages/public/QuienesSomosPage'))
const NivelesPage        = lazy(() => import('@/pages/public/NivelesPage'))
const BienestarPage      = lazy(() => import('@/pages/public/BienestarPage'))
const NoticiasPage       = lazy(() => import('@/pages/public/NoticiasPage'))
const NoticiaDetallePage = lazy(() => import('@/pages/public/NoticiaDetallePage'))
const GaleriaPage        = lazy(() => import('@/pages/public/GaleriaPage'))
const InscripcionPage    = lazy(() => import('@/pages/public/InscripcionPage'))
const EmpleoPage         = lazy(() => import('@/pages/public/EmpleoPage'))
const ContactoPage       = lazy(() => import('@/pages/public/ContactoPage'))

// Auth
const LoginPage    = lazy(() => import('@/pages/auth/LoginPage'))
const RegistroPage = lazy(() => import('@/pages/auth/RegistroPage'))

// Privadas
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))

// Admin
const AdminPage              = lazy(() => import('@/pages/admin/AdminPage'))
const OpinionesAdminPage     = lazy(() => import('@/pages/admin/OpinionesAdminPage'))
const NoticiasAdminPage      = lazy(() => import('@/pages/admin/NoticiasAdminPage'))
const GaleriaAdminPage       = lazy(() => import('@/pages/admin/GaleriaAdminPage'))
const InscripcionesAdminPage = lazy(() => import('@/pages/admin/InscripcionesAdminPage'))
const EmpleosAdminPage       = lazy(() => import('@/pages/admin/EmpleosAdminPage'))
const MensajesAdminPage      = lazy(() => import('@/pages/admin/MensajesAdminPage'))
const UsuariosAdminPage      = lazy(() => import('@/pages/admin/UsuariosAdminPage'))

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-azul" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* ── Rutas públicas con Layout completo ── */}
            <Route element={<Layout />}>
              <Route path="/"                   element={<HomePage />} />
              <Route path="/quienes-somos"      element={<QuienesSomosPage />} />
              <Route path="/niveles-educativos" element={<NivelesPage />} />
              <Route path="/bienestar"          element={<BienestarPage />} />
              <Route path="/noticias"           element={<NoticiasPage />} />
              <Route path="/noticias/:id"       element={<NoticiaDetallePage />} />
              <Route path="/galeria"            element={<GaleriaPage />} />
              <Route path="/inscripcion"        element={<InscripcionPage />} />
              <Route path="/empleo"             element={<EmpleoPage />} />
              <Route path="/contacto"           element={<ContactoPage />} />
            </Route>

            {/* ── Auth (sin layout completo) ── */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />

            {/* ── Privadas: cualquier usuario autenticado ── */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* ── Admin: rutas anidadas bajo AdminLayout (sidebar + header propio) ── */}
            <Route element={
              <ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/admin"               element={<AdminPage />} />
              <Route path="/admin/opiniones"     element={<OpinionesAdminPage />} />
              <Route path="/admin/noticias"      element={<NoticiasAdminPage />} />
              <Route path="/admin/galeria"       element={<GaleriaAdminPage />} />
              <Route path="/admin/inscripciones" element={<InscripcionesAdminPage />} />
              <Route path="/admin/empleos"       element={<EmpleosAdminPage />} />
              <Route path="/admin/mensajes"      element={<MensajesAdminPage />} />
              {/* Usuarios: solo admin, verificado adicionalmente en la página */}
              <Route path="/admin/usuarios"      element={<UsuariosAdminPage />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
