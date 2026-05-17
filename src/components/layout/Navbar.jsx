/**
 * @file Navbar.jsx
 * @description Navbar principal con logo, links de navegación y botón de login.
 * Placeholder — se implementa completamente en Fase 2.
 */

import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-brand-azul text-lg">
          Educar para Transformar
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/quienes-somos" className="hover:text-brand-azul transition-colors">Quiénes somos</Link>
          <Link to="/niveles-educativos" className="hover:text-brand-azul transition-colors">Niveles</Link>
          <Link to="/bienestar" className="hover:text-brand-azul transition-colors">Bienestar</Link>
          <Link to="/noticias" className="hover:text-brand-azul transition-colors">Noticias</Link>
          <Link to="/galeria" className="hover:text-brand-azul transition-colors">Galería</Link>
          <Link to="/contacto" className="hover:text-brand-azul transition-colors">Contacto</Link>
        </div>
        <Link to="/login" className="bg-brand-naranja text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Ingresar
        </Link>
      </div>
    </nav>
  )
}
