/**
 * @file PageHero.jsx
 * @description Hero interior compartido por todas las páginas interiores.
 * 200px de alto, gradiente azul institucional, breadcrumb + título + subtítulo en blanco.
 *
 * @param {string} titulo - Título principal de la página
 * @param {string} [subtitulo] - Subtítulo opcional
 * @param {Array<{label:string, href?:string}>} [breadcrumb] - Ruta de migas
 */

import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

export function PageHero({ titulo, subtitulo, breadcrumb = [] }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center text-white overflow-hidden"
      style={{
        minHeight: '200px',
        background: 'linear-gradient(135deg, #1B3A6B 0%, #2B5298 100%)',
      }}
    >
      {/* Círculos decorativos */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 text-white/60 text-xs mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home size={11} /> Inicio
            </Link>
            {breadcrumb.map(({ label, href }) => (
              <span key={label} className="flex items-center gap-1">
                <ChevronRight size={11} />
                {href
                  ? <Link to={href} className="hover:text-white transition-colors">{label}</Link>
                  : <span className="text-white/90">{label}</span>
                }
              </span>
            ))}
          </nav>
        )}

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold text-white text-3xl md:text-4xl leading-tight"
        >
          {titulo}
        </motion.h1>

        {/* Subtítulo */}
        {subtitulo && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-white/70 mt-2 text-sm md:text-base max-w-xl"
          >
            {subtitulo}
          </motion.p>
        )}
      </div>
    </div>
  )
}
