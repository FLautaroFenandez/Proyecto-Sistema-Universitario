/**
 * @file Navbar.jsx
 * @description Navbar profesional con logo institucional, dropdowns de preview
 * por sección y menú hamburguesa responsive. Sticky con sombra al hacer scroll.
 */

import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, LogIn, LogOut, LayoutDashboard, ChevronDown,
  Users, Newspaper, Image, ClipboardList, Phone, Mail,
  BookOpen, Heart, Trophy, Globe, ArrowRight,
} from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'

/* ── Contenido de cada dropdown ── */
const NAV_ITEMS = [
  {
    label: 'Quiénes somos',
    href:  '/quienes-somos',
    dropdown: [
      { icon: '🎯', label: 'Misión y Visión',    desc: 'Nuestros propósitos y la institución que queremos ser',   href: '/quienes-somos' },
      { icon: '⭐', label: 'Valores',            desc: 'Los principios que guían cada decisión de nuestra comunidad', href: '/quienes-somos' },
      { icon: '👥', label: 'Equipo directivo',  desc: 'Conocé a los profesionales que lideran el centro',         href: '/quienes-somos' },
      { icon: '📅', label: 'Historia',           desc: 'Del proyecto educativo al inicio de actividades en 2027',  href: '/quienes-somos' },
    ],
  },
  {
    label: 'Niveles',
    href:  '/niveles-educativos',
    dropdown: [
      { icon: '🌱', label: 'Nivel Inicial',    desc: 'Sala de 3, 4 y 5 años · Jornada extendida · Inglés desde sala 3', href: '/niveles-educativos' },
      { icon: '📚', label: 'Nivel Primario',   desc: '1° a 6° grado · 3 idiomas · Robótica · Deportes completos',       href: '/niveles-educativos' },
      { icon: '🎓', label: 'Nivel Secundario', desc: '1° a 5° año · Orientaciones · Pre-universitario incluido',         href: '/niveles-educativos' },
    ],
  },
  {
    label: 'Bienestar',
    href:  '/bienestar',
    dropdown: [
      { icon: '🏆', label: '8 disciplinas deportivas', desc: 'Natación, fútbol, básquet, atletismo, vóleibol y más', href: '/bienestar' },
      { icon: '🏊', label: 'Instalaciones',            desc: 'Pileta olímpica, canchas, pista de atletismo, gimnasio', href: '/bienestar' },
      { icon: '🧠', label: 'Apoyo estudiantil',        desc: 'Psicólogos, psicopedagogos y tutorías disponibles',      href: '/bienestar' },
      { icon: '🚌', label: 'Servicios',                desc: 'Comedor, enfermería y micros con GPS en tiempo real',     href: '/bienestar' },
    ],
  },
  {
    label: 'Noticias',
    href:  '/noticias',
    dropdown: [
      { icon: '📰', label: 'Todas las noticias',       desc: 'Novedades y comunicados institucionales públicos',       href: '/noticias' },
      { icon: '🔒', label: 'Noticias internas',        desc: 'Exclusivas para familias y personal con cuenta activa',  href: '/noticias' },
    ],
  },
  {
    label: 'Galería',
    href:  '/galeria',
    dropdown: [
      { icon: '🏛️', label: 'Instalaciones', desc: 'Edificio, aulas y espacios generales',   href: '/galeria' },
      { icon: '⚽', label: 'Deportes',      desc: 'Canchas, gimnasio y actividades físicas', href: '/galeria' },
      { icon: '🎉', label: 'Eventos',       desc: 'Actos y festejos institucionales',        href: '/galeria' },
      { icon: '🌍', label: 'Idiomas',       desc: 'Clases y talleres de idiomas',            href: '/galeria' },
    ],
  },
  {
    label: 'Inscripción',
    href:  '/inscripcion',
    dropdown: [
      { icon: '📋', label: 'Solicitar inscripción',  desc: 'Completá el formulario sin necesidad de crear cuenta', href: '/inscripcion' },
      { icon: '📞', label: 'Consultas previas',      desc: 'Hablá con nosotros antes de inscribirte',              href: '/contacto' },
    ],
    highlight: true,
  },
  {
    label: 'Empleo',
    href:  '/empleo',
    dropdown: [
      { icon: '💼', label: 'Búsquedas activas', desc: 'Puestos disponibles en el centro educativo', href: '/empleo' },
      { icon: '📤', label: 'Enviá tu CV',       desc: 'Dejá tus datos para futuras oportunidades',  href: '/empleo' },
    ],
  },
  {
    label: 'Contacto',
    href:  '/contacto',
    dropdown: [
      { icon: '✉️', label: 'Formulario',  desc: 'Escribinos y te respondemos en 48 hs hábiles',    href: '/contacto' },
      { icon: '📍', label: 'Ubicación',   desc: 'Av. Lavalle 3500, Resistencia, Chaco',             href: '/contacto' },
      { icon: '📞', label: 'Teléfono',    desc: '(0362) 555-0100 · Lun–Vie 8:00 a 17:00 hs',       href: '/contacto' },
    ],
  },
]

function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

/* ── Dropdown de una sección ── */
function NavDropdown({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 min-w-[260px] z-50"
      style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Pico superior */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
        <div className="w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 translate-y-1 mx-auto" />
      </div>

      {items.map(item => (
        <Link key={item.label} to={item.href}
          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group rounded-xl mx-1"
        >
          <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-azul transition-colors leading-tight">
              {item.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
          <ArrowRight size={13} className="mt-1 text-gray-200 group-hover:text-brand-naranja transition-colors flex-shrink-0" />
        </Link>
      ))}
    </motion.div>
  )
}

/* ── Navbar principal ── */
export function Navbar() {
  const [menuAbierto,  setMenuAbierto]  = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)  // label del item activo
  const [dropdownUser, setDropdownUser] = useState(false)
  const timeoutRef   = useRef(null)
  const userRef      = useRef(null)
  const { user, profile, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  /* Sombra al hacer scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Bloquear scroll body cuando menú mobile está abierto */
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAbierto])

  /* Cerrar dropdown de usuario al clickear afuera */
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setDropdownUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Hover con delay para evitar parpadeos */
  const openDropdown  = useCallback((label) => {
    clearTimeout(timeoutRef.current)
    setDropdownOpen(label)
  }, [])

  const closeDropdown = useCallback(() => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(null), 120)
  }, [])

  const handleSignOut = async () => {
    setDropdownUser(false); setMenuAbierto(false)
    await signOut(); navigate('/')
  }

  const panelLink = (profile?.rol === 'admin' || profile?.rol === 'autoridad') ? '/admin' : '/dashboard'

  return (
    <>
      <nav className={`bg-white sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.09)]' : 'shadow-sm border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            {/* Logo real — mix-blend-mode:multiply hace el negro transparente sobre blanco */}
            <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
              <img
                src="/assets/logo-ept.png"
                alt="Logo Educar para Transformar"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'multiply' }}
                onError={(e) => {
                  /* Fallback si no existe el archivo */
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextSibling.style.display = 'flex'
                }}
              />
              {/* Fallback círculo EPT */}
              <div className="w-12 h-12 rounded-full bg-brand-azul items-center justify-center hidden">
                <span className="text-white font-display font-bold text-xs">EPT</span>
              </div>
            </div>

            {/* Textos */}
            <div className="hidden sm:block leading-tight">
              <p className="font-display font-bold text-brand-azul text-[15px] leading-none group-hover:text-brand-azul-mid transition-colors">
                Educar para Transformar
              </p>
              <p className="text-gray-400 text-[11px] mt-0.5 font-body">Centro Educativo · Resistencia, Chaco</p>
            </div>
          </Link>

          {/* ── Links desktop con dropdown ── */}
          <div className="hidden lg:flex items-center">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => openDropdown(item.label)}
                onMouseLeave={closeDropdown}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-0.5 text-[13px] px-2.5 py-2 rounded-lg transition-colors font-body ${
                      isActive
                        ? 'text-brand-azul font-bold'
                        : 'text-gray-600 hover:text-brand-azul'
                    } ${item.highlight ? 'text-brand-naranja hover:text-orange-700 font-semibold' : ''}`
                  }
                >
                  {item.label}
                  <ChevronDown size={12} className={`ml-0.5 mt-0.5 transition-transform duration-200 ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                </NavLink>

                {/* Línea activa debajo */}
                <AnimatePresence>
                  {dropdownOpen === item.label && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-naranja rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen === item.label && (
                    <NavDropdown items={item.dropdown} />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ── Auth + Hamburguesa ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {user && profile ? (
              /* Usuario autenticado */
              <div className="relative hidden sm:block" ref={userRef}>
                <button
                  onClick={() => setDropdownUser(p => !p)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-naranja flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{getInitials(profile.nombre)}</span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium max-w-[100px] truncate">
                    {profile.nombre?.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropdownUser ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-bold text-gray-800 truncate">{profile.nombre}</p>
                        <p className="text-[11px] text-gray-400 capitalize mt-0.5">{profile.rol}</p>
                      </div>
                      <Link to={panelLink} onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={15} className="text-brand-azul" /> Mi panel
                      </Link>
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100">
                        <LogOut size={15} /> Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Botón Ingresar */
              <Link to="/login"
                className="hidden sm:flex items-center gap-1.5 bg-brand-naranja text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-sm"
              >
                <LogIn size={14} /> Ingresar
              </Link>
            )}

            {/* Hamburguesa */}
            <button
              onClick={() => setMenuAbierto(p => !p)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={menuAbierto ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
                >
                  {menuAbierto ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Menú mobile ── */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMenuAbierto(false)}
            />

            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white z-50 lg:hidden flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header mobile */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Link to="/" onClick={() => setMenuAbierto(false)} className="flex items-center gap-2.5">
                  <img src="/assets/logo-ept.png" alt="Logo EPT" width={36} height={36}
                    className="w-9 h-9 object-contain" style={{ mixBlendMode: 'multiply' }}
                    onError={e => { e.currentTarget.style.display='none' }}
                  />
                  <div>
                    <p className="font-display font-bold text-brand-azul text-sm leading-none">Educar para Transformar</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Centro Educativo</p>
                  </div>
                </Link>
                <button onClick={() => setMenuAbierto(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Links mobile con acordeón simple */}
              <nav className="flex-1 px-3 py-4">
                {NAV_ITEMS.map(item => (
                  <MobileNavItem key={item.label} item={item} onClose={() => setMenuAbierto(false)} />
                ))}
              </nav>

              {/* Footer mobile */}
              <div className="px-4 pb-6 pt-3 border-t border-gray-100">
                {user && profile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-naranja flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">{getInitials(profile.nombre)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{profile.nombre}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{profile.rol}</p>
                      </div>
                    </div>
                    <Link to={panelLink} onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brand-azul bg-blue-50 rounded-xl font-medium">
                      <LayoutDashboard size={15} /> Mi panel
                    </Link>
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMenuAbierto(false)}
                    className="flex items-center justify-center gap-2 w-full bg-brand-naranja text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors">
                    <LogIn size={16} /> Ingresar
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Item de nav mobile con acordeón ── */
function MobileNavItem({ item, onClose }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setAbierto(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className={item.highlight ? 'text-brand-naranja font-semibold' : ''}>{item.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-1 space-y-0.5">
              {item.dropdown.map(sub => (
                <Link key={sub.label} to={sub.href} onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-lg flex-shrink-0">{sub.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-brand-azul transition-colors">{sub.label}</p>
                    <p className="text-xs text-gray-400 truncate">{sub.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
