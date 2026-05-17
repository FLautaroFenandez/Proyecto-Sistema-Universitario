/**
 * @file AdminLayout.jsx
 * @description Layout exclusivo del panel de administración.
 * Sidebar fijo azul (240px) + header blanco + área de contenido.
 * NO usa Topbar/Navbar/Footer del sitio público. Usa <Outlet /> de React Router.
 */

import { useState, useContext } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Newspaper, Image, ClipboardList,
  Briefcase, Users, LogOut, ExternalLink, Menu, X,
  LayoutDashboard, ChevronRight,
} from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { ROLES } from '@/types/roles'

const NAV_SECTIONS = [
  {
    titulo: 'Gestión de Contenido',
    items: [
      { icon: MessageSquare, label: 'Opiniones',   href: '/admin/opiniones' },
      { icon: Newspaper,     label: 'Noticias',    href: '/admin/noticias' },
      { icon: Image,         label: 'Galería',     href: '/admin/galeria' },
    ],
  },
  {
    titulo: 'Gestión Institucional',
    items: [
      { icon: ClipboardList, label: 'Inscripciones', href: '/admin/inscripciones' },
      { icon: Briefcase,     label: 'Empleos',        href: '/admin/empleos' },
    ],
  },
]

const NAV_ADMIN_ONLY = [
  { titulo: 'Administración', items: [
    { icon: Users, label: 'Usuarios', href: '/admin/usuarios' },
  ]},
]

function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

function SidebarContent({ onClose }) {
  const { profile, signOut } = useContext(AuthContext)
  const navigate = useNavigate()
  const esAdmin = profile?.rol === ROLES.ADMIN

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-white/15 text-white font-semibold'
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`

  const allSections = esAdmin ? [...NAV_SECTIONS, ...NAV_ADMIN_ONLY] : NAV_SECTIONS

  return (
    <div className="flex flex-col h-full" style={{ background: '#1B3A6B' }}>
      {/* Logo del panel */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm leading-none">Panel Admin</p>
          <p className="text-white/50 text-[10px] mt-0.5">Educar para Transformar</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/50 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {allSections.map(section => (
          <div key={section.titulo}>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest px-4 mb-2">
              {section.titulo}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <NavLink to={href} onClick={onClose} end={href === '/admin'}
                    className={linkClass}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link to="/" target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <ExternalLink size={15} /> Ir al sitio
        </Link>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { profile } = useContext(AuthContext)
  const navigate = useNavigate()
  const { signOut } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile: overlay + panel ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-60 z-50 lg:hidden flex flex-col overflow-y-auto"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between px-5 h-14">
            <div className="flex items-center gap-3">
              {/* Hamburger mobile */}
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Link to="/" className="hover:text-brand-azul transition-colors">Sitio</Link>
                <ChevronRight size={13} />
                <span className="font-semibold text-gray-700">Panel de Administración</span>
              </div>
            </div>

            {/* Usuario */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800 leading-none">{profile?.nombre?.split(' ')[0]}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{profile?.rol}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-naranja flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {getInitials(profile?.nombre)}
              </div>
              <button onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
              >
                <LogOut size={13} /> Salir
              </button>
            </div>
          </div>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
