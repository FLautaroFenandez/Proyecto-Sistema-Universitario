# 🤖 PROMPT FASE 1 — Setup, estructura y layout base
## Pegá esto completo en Claude Code como primer mensaje

---

```
Sos el desarrollador principal del proyecto "Educar para Transformar".
Leé todos los archivos en /docs/ antes de escribir cualquier código.

═══════════════════════════════════════════════════════════
TAREA FASE 1: SETUP COMPLETO DEL PROYECTO
═══════════════════════════════════════════════════════════

Ejecutá estos comandos en orden:

1. npm create vite@latest . -- --template react
2. npm install
3. npm install @supabase/supabase-js react-router-dom framer-motion react-hook-form @hookform/resolvers zod lucide-react
4. npm install -D tailwindcss postcss autoprefixer
5. npx tailwindcss init -p
6. npm install @fontsource/nunito @fontsource/source-sans-3

Luego creá EXACTAMENTE esta estructura de carpetas:
src/
  components/
    ui/          → Button.jsx, Input.jsx, Card.jsx, Badge.jsx, Spinner.jsx, Modal.jsx
    layout/      → Topbar.jsx, Navbar.jsx, Footer.jsx, Layout.jsx
    sections/    → HeroSection.jsx, NoticiasSection.jsx, NivelesSection.jsx, ServiciosSection.jsx, OpinionesSection.jsx, CTASection.jsx, GaleriaSection.jsx
    auth/        → LoginForm.jsx, RegisterForm.jsx, ProtectedRoute.jsx
    admin/       → AdminSidebar.jsx, StatsCard.jsx, DataTable.jsx
  pages/
    public/      → HomePage.jsx, QuienesSomosPage.jsx, NivelesPage.jsx, BienestarPage.jsx, NoticiasPage.jsx, NoticiaDetallePage.jsx, GaleriaPage.jsx, InscripcionPage.jsx, EmpleoPage.jsx, ContactoPage.jsx
    auth/        → LoginPage.jsx, RegistroPage.jsx
    dashboard/   → DashboardPage.jsx
    admin/       → AdminPage.jsx, OpinionesAdminPage.jsx, NoticiasAdminPage.jsx, GaleriaAdminPage.jsx, InscripcionesAdminPage.jsx, EmpleosAdminPage.jsx, UsuariosAdminPage.jsx
    NotFoundPage.jsx
  hooks/         → useAuth.js, useRole.js, useNoticias.js, useGaleria.js, useOpiniones.js, useInscripciones.js
  lib/           → supabase.js
  styles/        → globals.css
  types/         → roles.js, routes.js
  utils/         → formatDate.js, truncateText.js, uploadImage.js
  App.jsx
  main.jsx

═══════════════════════════════════════════════════════════
ARCHIVOS A GENERAR EN ESTA FASE
═══════════════════════════════════════════════════════════

── vite.config.js ──────────────────────────────────────
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})

── tailwind.config.js ──────────────────────────────────
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          azul:       '#1B3A6B',
          'azul-dark':'#0F2040',
          'azul-mid': '#2B5298',
          naranja:    '#E8612C',
          verde:      '#4CAF50',
          rosa:       '#D63384',
          celeste:    '#29ABE2',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body:    ['Source Sans 3', 'sans-serif'],
        sans:    ['Source Sans 3', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/hero-bg.jpg')",
      },
    },
  },
  plugins: [],
}

── src/styles/globals.css ──────────────────────────────
@import '@fontsource/nunito/400.css';
@import '@fontsource/nunito/500.css';
@import '@fontsource/nunito/700.css';
@import '@fontsource/source-sans-3/400.css';
@import '@fontsource/source-sans-3/600.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-azul:     #1B3A6B;
  --color-naranja:  #E8612C;
  --color-verde:    #4CAF50;
  --color-rosa:     #D63384;
  --color-celeste:  #29ABE2;
  --font-display:   'Nunito', sans-serif;
  --font-body:      'Source Sans 3', sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); }
h1, h2, h3, h4 { font-family: var(--font-display); }

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

── src/types/roles.js ──────────────────────────────────
/**
 * @file roles.js
 * @description Enum de roles del sistema y matriz de permisos.
 * Importar desde cualquier componente que necesite verificar permisos.
 */

export const ROLES = {
  ADMIN:      'admin',
  AUTORIDAD:  'autoridad',
  DOCENTE:    'docente',
  PERSONAL:   'personal',
  PADRE:      'padre',
  ESTUDIANTE: 'estudiante',
}

/** Roles que se auto-registran (público puede crear cuenta) */
export const ROLES_PUBLICOS = [ROLES.PADRE, ROLES.ESTUDIANTE]

/** Roles del personal (solo Admin puede crear estas cuentas) */
export const ROLES_PERSONAL = [ROLES.ADMIN, ROLES.AUTORIDAD, ROLES.DOCENTE, ROLES.PERSONAL]

/** Permisos por funcionalidad */
export const PERMISOS = {
  MODERAR_OPINIONES:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  PUBLICAR_NOTICIAS:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_GALERIA:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  VER_INSCRIPCIONES:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_EMPLEOS:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_USUARIOS:    [ROLES.ADMIN],
  VER_NOTICIAS_INTERNAS: [ROLES.ADMIN, ROLES.AUTORIDAD, ROLES.DOCENTE, ROLES.PERSONAL, ROLES.PADRE, ROLES.ESTUDIANTE],
  VER_PANEL_ADMIN:       [ROLES.ADMIN, ROLES.AUTORIDAD],
}

/**
 * Verifica si un rol tiene permiso para una acción
 * @param {string} rol - Rol del usuario actual
 * @param {string[]} permiso - Array de roles permitidos
 * @returns {boolean}
 */
export function tienePermiso(rol, permiso) {
  return permiso.includes(rol)
}

── src/lib/supabase.js ─────────────────────────────────
/**
 * @file supabase.js
 * @description Inicialización y exportación del cliente de Supabase.
 * Importar `supabase` desde cualquier hook o utilidad que necesite BD o Auth.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Faltan variables de entorno de Supabase.\n' +
    'Copiá .env.example a .env.local y completá los valores.\n' +
    'Ver docs/GUIA_SUPABASE.md para instrucciones.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:     true,
    detectSessionInUrl: true,
  },
})

── src/utils/formatDate.js ─────────────────────────────
/**
 * @file formatDate.js
 * @description Formatea fechas ISO a español argentino.
 */

const formatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric', month: 'long', year: 'numeric',
})

const formatterShort = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric', month: 'short', year: 'numeric',
})

/** @param {string} isoDate - Fecha en formato ISO */
export function formatDate(isoDate) {
  if (!isoDate) return ''
  return formatter.format(new Date(isoDate))
}

/** Versión corta: "15 may. 2026" */
export function formatDateShort(isoDate) {
  if (!isoDate) return ''
  return formatterShort.format(new Date(isoDate))
}

── src/utils/truncateText.js ───────────────────────────
/**
 * @file truncateText.js
 * @description Trunca texto a una longitud máxima con ellipsis.
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima (default: 150)
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

── src/hooks/useAuth.js ────────────────────────────────
/**
 * @file useAuth.js
 * @description Hook principal de autenticación.
 * Provee: user, profile (con rol), loading, signIn, signUp, signOut.
 * Escucha cambios de sesión en tiempo real con onAuthStateChange.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)  // { id, nombre, rol, activo }
  const [loading, setLoading] = useState(true)

  // Carga el perfil del usuario desde la tabla profiles
  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, nombre, rol, activo')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    // Obtener sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user?.id).finally(() => setLoading(false))
    })

    // Escuchar cambios de sesión (login / logout / refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        await loadProfile(session?.user?.id)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, profileData) => {
    // 1. Crear cuenta en Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // 2. Insertar perfil con los datos adicionales
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, ...profileData })
      if (profileError) throw profileError
    }
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return { user, profile, loading, signIn, signUp, signOut }
}

── src/hooks/useRole.js ────────────────────────────────
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

── src/components/auth/AuthContext.jsx ─────────────────
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

── src/components/auth/ProtectedRoute.jsx ──────────────
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

  // Mientras carga la sesión, no renderizar nada
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-azul" />
  </div>

  // Si no hay sesión, ir a login (guardando la ruta original para redirigir después)
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // Si hay roles requeridos y el usuario no tiene uno de ellos, ir al dashboard
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(profile?.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

── src/App.jsx ─────────────────────────────────────────
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
import { ROLES } from '@/types/roles'

// Páginas públicas — se cargan de forma lazy para mejor performance
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
const AdminPage             = lazy(() => import('@/pages/admin/AdminPage'))
const OpinionesAdminPage    = lazy(() => import('@/pages/admin/OpinionesAdminPage'))
const NoticiasAdminPage     = lazy(() => import('@/pages/admin/NoticiasAdminPage'))
const GaleriaAdminPage      = lazy(() => import('@/pages/admin/GaleriaAdminPage'))
const InscripcionesAdminPage= lazy(() => import('@/pages/admin/InscripcionesAdminPage'))
const EmpleosAdminPage      = lazy(() => import('@/pages/admin/EmpleosAdminPage'))
const UsuariosAdminPage     = lazy(() => import('@/pages/admin/UsuariosAdminPage'))

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Spinner de fallback mientras carga la página
const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-azul" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* ── Rutas públicas con Layout completo ── */}
            <Route element={<Layout />}>
              <Route path="/"                    element={<HomePage />} />
              <Route path="/quienes-somos"       element={<QuienesSomosPage />} />
              <Route path="/niveles-educativos"  element={<NivelesPage />} />
              <Route path="/bienestar"           element={<BienestarPage />} />
              <Route path="/noticias"            element={<NoticiasPage />} />
              <Route path="/noticias/:id"        element={<NoticiaDetallePage />} />
              <Route path="/galeria"             element={<GaleriaPage />} />
              <Route path="/inscripcion"         element={<InscripcionPage />} />
              <Route path="/empleo"              element={<EmpleoPage />} />
              <Route path="/contacto"            element={<ContactoPage />} />
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

            {/* ── Admin: solo admin y autoridad ── */}
            <Route path="/admin" element={
              <ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/opiniones"    element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}><OpinionesAdminPage /></ProtectedRoute>} />
            <Route path="/admin/noticias"     element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}><NoticiasAdminPage /></ProtectedRoute>} />
            <Route path="/admin/galeria"      element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}><GaleriaAdminPage /></ProtectedRoute>} />
            <Route path="/admin/inscripciones"element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}><InscripcionesAdminPage /></ProtectedRoute>} />
            <Route path="/admin/empleos"      element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN, ROLES.AUTORIDAD]}><EmpleosAdminPage /></ProtectedRoute>} />
            <Route path="/admin/usuarios"     element={<ProtectedRoute rolesPermitidos={[ROLES.ADMIN]}><UsuariosAdminPage /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

── src/main.jsx ────────────────────────────────────────
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```
