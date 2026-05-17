/**
 * @file NotFoundPage.jsx
 * @description Página de error 404 — ruta no encontrada.
 * Número grande, mensaje descriptivo y botón para volver al inicio.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Número 404 */}
        <div className="relative inline-block mb-6">
          <span
            className="font-display font-black text-[120px] md:text-[160px] leading-none select-none"
            style={{ color: '#F1F5F9' }}
          >
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center font-display font-black text-[120px] md:text-[160px] leading-none select-none text-transparent"
            style={{ WebkitTextStroke: '2px #CBD5E1' }}>
            404
          </span>
          {/* Ícono flotante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>😕</span>
          </div>
        </div>

        <h1 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          La página que buscás no existe, fue movida o escribiste mal la dirección.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 bg-brand-naranja text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Home size={17} />
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={17} />
            Volver atrás
          </button>
        </div>

        {/* Sugerencias */}
        <div className="mt-10 text-sm text-gray-400">
          <p className="mb-2 font-medium text-gray-500">Puede que estés buscando:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Noticias', href: '/noticias' },
              { label: 'Galería',  href: '/galeria' },
              { label: 'Inscripción', href: '/inscripcion' },
              { label: 'Contacto',    href: '/contacto' },
            ].map(({ label, href }) => (
              <Link key={href} to={href}
                className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-brand-azul hover:text-brand-azul transition-colors text-xs font-medium"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
