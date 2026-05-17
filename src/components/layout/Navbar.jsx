/**
 * @file Navbar.jsx
 * @description Navbar profesional estilo UNCAUS con logo institucional, dropdowns
 * limpios con iconografía Lucide React y menú hamburguesa responsive.
 */

import { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, LogIn, LogOut, LayoutDashboard, ChevronDown,
  Target, Star, Users, Clock, BookOpen, GraduationCap, Sprout,
  Trophy, Building2, Brain, LifeBuoy, Newspaper, Lock,
  ClipboardList, MessageCircle, Briefcase, FileText,
  Mail, MapPin, Phone, ArrowRight, Globe,
} from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'

/* ── Definición de secciones con íconos Lucide ── */
const NAV_ITEMS = [
  {
    label: 'Quiénes somos',
    href:  '/quienes-somos',
    items: [
      { icon: Target,       label: 'Misión y Visión',   desc: 'Nuestros propósitos institucionales',           href: '/quienes-somos' },
      { icon: Star,         label: 'Valores',            desc: 'Los principios que guían nuestra comunidad',    href: '/quienes-somos' },
      { icon: Users,        label: 'Equipo directivo',   desc: 'Los profesionales que lideran el centro',       href: '/quienes-somos' },
      { icon: Clock,        label: 'Historia',           desc: 'Del proyecto al inicio de actividades 2027',    href: '/quienes-somos' },
    ],
  },
  {
    label: 'Niveles',
    href:  '/niveles-educativos',
    items: [
      { icon: Sprout,          label: 'Nivel Inicial',    desc: 'Sala 3, 4 y 5 · Jornada extendida · Inglés desde sala 3', href: '/niveles-educativos' },
      { icon: BookOpen,        label: 'Nivel Primario',   desc: '1° a 6° grado · 3 idiomas · Robótica · Deportes',        href: '/niveles-educativos' },
      { icon: GraduationCap,   label: 'Nivel Secundario', desc: '1° a 5° año · Orientaciones · Pre-universitario',        href: '/niveles-educativos' },
    ],
  },
  {
    label: 'Bienestar',
    href:  '/bienestar',
    items: [
      { icon: Trophy,     label: '8 disciplinas deportivas', desc: 'Natación, fútbol, básquet, atletismo y más', href: '/bienestar' },
      { icon: Building2,  label: 'Instalaciones',            desc: 'Pileta olímpica, canchas y gimnasio cubierto', href: '/bienestar' },
      { icon: Brain,      label: 'Apoyo estudiantil',        desc: 'Psicólogos y psicopedagogos disponibles',    href: '/bienestar' },
      { icon: LifeBuoy,   label: 'Servicios',                desc: 'Comedor, enfermería y micros con GPS',       href: '/bienestar' },
    ],
  },
  {
    label: 'Noticias',
    href:  '/noticias',
    items: [
      { icon: Newspaper,  label: 'Noticias públicas',  desc: 'Novedades y comunicados institucionales',       href: '/noticias' },
      { icon: Lock,       label: 'Noticias internas',  desc: 'Exclusivas para familias y personal registrado', href: '/noticias' },
    ],
  },
  {
    label: 'Galería',
    href:  '/galeria',
    items: [
      { icon: Building2,     label: 'Instalaciones', desc: 'Edificio, aulas y espacios generales',  href: '/galeria' },
      { icon: Trophy,        label: 'Deportes',      desc: 'Canchas, gimnasio y actividades',       href: '/galeria' },
      { icon: Globe,         label: 'Idiomas',       desc: 'Clases y talleres de idiomas',          href: '/galeria' },
    ],
  },
  {
    label: 'Inscripción',
    href:  '/inscripcion',
    highlight: true,
    items: [
      { icon: ClipboardList,  label: 'Solicitar inscripción', desc: 'Formulario sin necesidad de crear cuenta', href: '/inscripcion' },
      { icon: MessageCircle,  label: 'Consultas previas',     desc: 'Hablá con nosotros antes de inscribirte',  href: '/contacto' },
    ],
  },
  {
    label: 'Empleo',
    href:  '/empleo',
    items: [
      { icon: Briefcase,  label: 'Búsquedas activas', desc: 'Puestos disponibles en el centro',       href: '/empleo' },
      { icon: FileText,   label: 'Enviá tu CV',       desc: 'Dejá tus datos para futuras oportunidades', href: '/empleo' },
    ],
  },
  {
    label: 'Contacto',
    href:  '/contacto',
    items: [
      { icon: Mail,       label: 'Formulario web',  desc: 'Te respondemos en 48 hs hábiles',            href: '/contacto' },
      { icon: MapPin,     label: 'Ubicación',       desc: 'Av. Lavalle 3500, Resistencia, Chaco',       href: '/contacto' },
      { icon: Phone,      label: 'Teléfono',        desc: '(0362) 555-0100 · Lun–Vie 8:00 a 17:00',    href: '/contacto' },
    ],
  },
]

function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

/* ── Dropdown limpio estilo UNCAUS con íconos Lucide ── */
function NavDropdown({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute top-full left-0 mt-0 bg-white border border-gray-200 shadow-xl z-50"
      style={{
        minWidth: '260px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        borderTop: '2px solid #E8612C',
      }}
    >
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <Link key={item.label} to={item.href}
            className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-brand-azul/10 flex items-center justify-center flex-shrink-0 transition-colors">
              <Icon size={15} className="text-gray-500 group-hover:text-brand-azul transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 group-hover:text-brand-azul transition-colors leading-none">
                {item.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug truncate">{item.desc}</p>
            </div>
            <ArrowRight size={12} className="text-gray-300 group-hover:text-brand-naranja transition-all group-hover:translate-x-0.5 flex-shrink-0" />
          </Link>
        )
      })}
    </motion.div>
  )
}

export function Navbar() {
  const [menuAbierto,  setMenuAbierto]  = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [dropdownUser, setDropdownUser] = useState(false)
  const timeoutRef = useRef(null)
  const userRef    = useRef(null)
  const { user, profile, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAbierto])

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setDropdownUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openDropdown  = useCallback((label) => { clearTimeout(timeoutRef.current); setDropdownOpen(label) }, [])
  const closeDropdown = useCallback(() => { timeoutRef.current = setTimeout(() => setDropdownOpen(null), 100) }, [])

  const handleSignOut = async () => {
    setDropdownUser(false); setMenuAbierto(false)
    await signOut(); navigate('/')
  }

  const panelLink = (profile?.rol === 'admin' || profile?.rol === 'autoridad') ? '/admin' : '/dashboard'

  return (
    <>
      <nav className={`bg-white sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.10)]' : 'border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-[52px] h-[52px] flex-shrink-0">
              <img
                src="/assets/logo-ept.png"
                alt="Logo Educar para Transformar"
                width={52} height={52}
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'multiply' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-[52px] h-[52px] rounded-full bg-brand-azul items-center justify-center hidden">
                <span className="text-white font-display font-bold text-sm">EPT</span>
              </div>
            </div>
            <div className="hidden md:block leading-tight">
              <p className="font-display font-bold text-brand-azul text-[15px] leading-none">
                Educar para Transformar
              </p>
              <p className="text-gray-400 text-[11px] mt-0.5">Centro Educativo · Resistencia, Chaco</p>
            </div>
          </Link>

          {/* ── Links desktop ── */}
          <div className="hidden lg:flex items-center h-full">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => openDropdown(item.label)}
                onMouseLeave={closeDropdown}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-0.5 text-[13px] px-3 h-full transition-colors font-body relative ${
                      isActive ? 'text-brand-azul font-bold' : 'text-gray-600 hover:text-brand-azul'
                    } ${item.highlight ? 'text-brand-naranja hover:text-orange-700 font-semibold' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <ChevronDown size={11} className={`ml-0.5 opacity-60 transition-transform duration-200 ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                      {/* Línea inferior activa */}
                      {(isActive || dropdownOpen === item.label) && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-naranja" />
                      )}
                    </>
                  )}
                </NavLink>

                <AnimatePresence>
                  {dropdownOpen === item.label && (
                    <NavDropdown items={item.items} />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ── Auth + Hamburguesa ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user && profile ? (
              <div className="relative hidden sm:block" ref={userRef}>
                <button
                  onClick={() => setDropdownUser(p => !p)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-naranja flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {getInitials(profile.nombre)}
                  </div>
                  <span className="text-[13px] text-gray-700 font-medium max-w-[90px] truncate">
                    {profile.nombre?.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${dropdownUser ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownUser && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-bold text-gray-800 truncate">{profile.nombre}</p>
                        <p className="text-[11px] text-gray-400 capitalize mt-0.5">{profile.rol}</p>
                      </div>
                      <Link to={panelLink} onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={14} className="text-brand-azul" /> Mi panel
                      </Link>
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100">
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className="hidden sm:flex items-center gap-1.5 bg-brand-naranja text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200"
              >
                <LogIn size={14} /> Ingresar
              </Link>
            )}

            <button
              onClick={() => setMenuAbierto(p => !p)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Menú"
            >
              {menuAbierto ? <X size={20} /> : <Menu size={20} />}
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
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMenuAbierto(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white z-50 lg:hidden flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Link to="/" onClick={() => setMenuAbierto(false)} className="flex items-center gap-2.5">
                  <img src="/assets/logo-ept.png" alt="Logo EPT" width={38} height={38}
                    className="w-9 h-9 object-contain" style={{ mixBlendMode: 'multiply' }}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  <div>
                    <p className="font-display font-bold text-brand-azul text-sm leading-none">Educar para Transformar</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Centro Educativo</p>
                  </div>
                </Link>
                <button onClick={() => setMenuAbierto(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200">
                  <X size={18} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-3 py-4">
                {NAV_ITEMS.map(item => (
                  <MobileNavItem key={item.label} item={item} onClose={() => setMenuAbierto(false)} />
                ))}
              </nav>

              {/* Footer auth */}
              <div className="px-4 pb-6 pt-3 border-t border-gray-100">
                {user && profile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-naranja flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {getInitials(profile.nombre)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{profile.nombre}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{profile.rol}</p>
                      </div>
                    </div>
                    <Link to={panelLink} onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brand-azul bg-blue-50 rounded-xl font-medium">
                      <LayoutDashboard size={14} /> Mi panel
                    </Link>
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut size={14} /> Cerrar sesión
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

function MobileNavItem({ item, onClose }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="mb-0.5">
      <button
        onClick={() => setAbierto(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className={item.highlight ? 'text-brand-naranja font-semibold' : ''}>{item.label}</span>
        <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pl-3 pb-1 space-y-0.5">
              {item.items.map(sub => {
                const Icon = sub.icon
                return (
                  <Link key={sub.label} to={sub.href} onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-gray-500 group-hover:text-brand-azul transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-700">{sub.label}</p>
                      <p className="text-[11px] text-gray-400 truncate">{sub.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
