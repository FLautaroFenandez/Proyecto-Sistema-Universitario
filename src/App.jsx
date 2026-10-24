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
import { ROLES, PERMISOS } from '@/types/roles'

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

// Sistema de Gestión (Parte 2)
const MatriculacionAdminPage = lazy(() => import('@/pages/admin/MatriculacionAdminPage'))
const AlumnosAdminPage       = lazy(() => import('@/pages/admin/AlumnosAdminPage'))
const CursosAdminPage        = lazy(() => import('@/pages/admin/CursosAdminPage'))

// Sprint 3
const PersonalAdminPage      = lazy(() => import('@/pages/admin/PersonalAdminPage'))
const PostulacionesAdminPage = lazy(() => import('@/pages/admin/PostulacionesAdminPage'))
const IndicadoresPage        = lazy(() => import('@/pages/admin/IndicadoresPage'))
const AuditoriaAdminPage     = lazy(() => import('@/pages/admin/AuditoriaAdminPage'))
const BoletinPage            = lazy(() => import('@/pages/documentos/BoletinPage'))
const ConstanciaPage         = lazy(() => import('@/pages/documentos/ConstanciaPage'))

// Módulo Profesores (Sprint 2)
const MisCursosPage      = lazy(() => import('@/pages/docente/MisCursosPage'))
const CalificacionesPage = lazy(() => import('@/pages/docente/CalificacionesPage'))
const AsistenciaPage     = lazy(() => import('@/pages/docente/AsistenciaPage'))
const ComunicadosPage    = lazy(() => import('@/pages/docente/ComunicadosPage'))

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

              {/* Módulo Profesores: solo docentes. La titularidad de cada materia
                  se verifica en la página y en la base (RLS). */}
              <Route path="/docente" element={
                <ProtectedRoute rolesPermitidos={PERMISOS.CARGAR_CALIFICACIONES}>
                  <MisCursosPage />
                </ProtectedRoute>
              } />
              <Route path="/docente/calificaciones/:dictadoId" element={
                <ProtectedRoute rolesPermitidos={PERMISOS.CARGAR_CALIFICACIONES}>
                  <CalificacionesPage />
                </ProtectedRoute>
              } />
              <Route path="/docente/asistencia/:cursoId" element={
                <ProtectedRoute rolesPermitidos={PERMISOS.TOMAR_ASISTENCIA}>
                  <AsistenciaPage />
                </ProtectedRoute>
              } />
              <Route path="/docente/comunicados" element={
                <ProtectedRoute rolesPermitidos={PERMISOS.ENVIAR_COMUNICADOS}>
                  <ComunicadosPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* ── Documentos imprimibles (REQ-17): sin layout, para que el PDF
                  salga limpio. Cualquier usuario con sesión; la base decide
                  si puede ver esa matrícula. ── */}
            <Route path="/documentos/boletin/:matriculaId" element={
              <ProtectedRoute><BoletinPage /></ProtectedRoute>
            } />
            <Route path="/documentos/constancia/:matriculaId" element={
              <ProtectedRoute><ConstanciaPage /></ProtectedRoute>
            } />

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

              {/* Sistema de Gestión — Módulo Administrador (Sprint 1) */}
              <Route path="/admin/matriculacion" element={<MatriculacionAdminPage />} />
              <Route path="/admin/alumnos"       element={<AlumnosAdminPage />} />
              <Route path="/admin/cursos"        element={<CursosAdminPage />} />

              {/* Sprint 3 */}
              <Route path="/admin/personal"      element={<PersonalAdminPage />} />
              <Route path="/admin/postulaciones" element={<PostulacionesAdminPage />} />
              <Route path="/admin/indicadores"   element={<IndicadoresPage />} />
              <Route path="/admin/auditoria"     element={<AuditoriaAdminPage />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
