/**
 * @file Navbar.jsx
 * @description Navbar principal blanco con logo, links de navegación y botón login.
 * Sticky al hacer scroll. En mobile: menú hamburguesa con slide-in desde la izquierda.
 * Si el usuario está autenticado muestra avatar con dropdown de sesión.
 */

import { useState, useEffect, useRef, useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '@/components/auth/AuthContext'

const NAV_LINKS = [
  { to: '/quienes-somos',      label: 'Quiénes somos' },
  { to: '/niveles-educativos', label: 'Niveles' },
  { to: '/bienestar',          label: 'Bienestar' },
  { to: '/noticias',           label: 'Noticias' },
  { to: '/galeria',            label: 'Galería' },
  { to: '/inscripcion',        label: 'Inscripción' },
  { to: '/empleo',             label: 'Empleo' },
  { to: '/contacto',           label: 'Contacto' },
]

/** Genera las iniciales del nombre para el avatar */
function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

export function Navbar() {
  const [menuAbierto,   setMenuAbierto]   = useState(false)
  const [scrolled,      setScrolled]      = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const { user, profile, signOut }        = useContext(AuthContext)
  const navigate                          = useNavigate()
  const dropdownRef                       = useRef(null)

  /* Detectar scroll para agregar sombra */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Cerrar dropdown al clickear afuera */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* Bloquear scroll del body cuando menú mobile está abierto */
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAbierto])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    setMenuAbierto(false)
    await signOut()
    navigate('/')
  }

  const panelLink = profile?.rol === 'admin' || profile?.rol === 'autoridad'
    ? '/admin'
    : '/dashboard'

  return (
    <>
      <nav className={`bg-white sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            {/* Círculo placeholder del logo */}
            <div className="w-10 h-10 rounded-full bg-brand-azul flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-bold text-xs">EPT</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="font-display font-bold text-brand-azul text-sm leading-none">Educar para Transformar</p>
              <p className="text-gray-400 text-xs mt-0.5">Centro Educativo</p>
            </div>
          </Link>

          {/* ── Links desktop ── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-[13px] px-2.5 py-1.5 rounded transition-colors font-body ${
                    isActive
                      ? 'text-brand-azul font-semibold border-b-2 border-brand-naranja rounded-none'
                      : 'text-gray-600 hover:text-brand-azul'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Botón Ingresar / Avatar ── */}
          <div className="flex items-center gap-2">
            {user && profile ? (
              /* Usuario autenticado: avatar con dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Menú de usuario"
                >
                  {/* Avatar con iniciales */}
                  <div className="w-8 h-8 rounded-full bg-brand-naranja flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{getInitials(profile.nombre)}</span>
                  </div>
                  <span className="hidden md:inline text-sm text-gray-700 font-medium max-w-[120px] truncate">
                    {profile.nombre?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-800 truncate">{profile.nombre}</p>
                        <p className="text-xs text-gray-400 capitalize">{profile.rol}</p>
                      </div>
                      <Link
                        to={panelLink}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-brand-azul" />
                        Mi panel
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Usuario no autenticado: botón Ingresar */
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 bg-brand-naranja text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 font-medium"
              >
                <LogIn size={15} />
                Ingresar
              </Link>
            )}

            {/* Botón hamburguesa mobile */}
            <button
              onClick={() => setMenuAbierto(prev => !prev)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Menú mobile ── */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMenuAbierto(false)}
            />

            {/* Panel lateral */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              {/* Header del menú */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Link to="/" onClick={() => setMenuAbierto(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-azul flex items-center justify-center">
                    <span className="text-white font-bold text-xs">EPT</span>
                  </div>
                  <span className="font-display font-bold text-brand-azul text-sm">Educar para Transformar</span>
                </Link>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <ul className="space-y-1">
                  {NAV_LINKS.map(({ to, label }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        onClick={() => setMenuAbierto(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-xl text-[15px] font-body transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-brand-azul font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer del menú: auth */}
              <div className="px-4 py-4 border-t border-gray-100">
                {user && profile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="w-9 h-9 rounded-full bg-brand-naranja flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{getInitials(profile.nombre)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{profile.nombre}</p>
                        <p className="text-xs text-gray-400 capitalize">{profile.rol}</p>
                      </div>
                    </div>
                    <Link
                      to={panelLink}
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brand-azul bg-blue-50 rounded-xl font-medium"
                    >
                      <LayoutDashboard size={15} />
                      Mi panel
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuAbierto(false)}
                    className="flex items-center justify-center gap-2 w-full bg-brand-naranja text-white py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors"
                  >
                    <LogIn size={16} />
                    Ingresar
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
