/**
 * @file HeroSection.jsx
 * @description Hero principal estilo UNCAUS con 3 cards flotantes por nivel.
 * Iconografía Lucide React, sin emojis.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sprout, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'

const NIVELES = [
  {
    id:          'inicial',
    titulo:      'NIVEL INICIAL',
    descripcion: 'Sala de 3, 4 y 5 años. Jornada extendida con estimulación temprana, juego, arte y música. Inglés desde sala de 3.',
    color:       '#4CAF50',
    gradient:    'from-green-500 to-green-700',
    Icon:        Sprout,
    href:        '/niveles-educativos',
  },
  {
    id:          'primario',
    titulo:      'NIVEL PRIMARIO',
    descripcion: '1° a 6° grado. Jornada extendida con tres idiomas, robótica, deportes y talleres de teatro y danza.',
    color:       '#E8612C',
    gradient:    'from-orange-500 to-orange-700',
    Icon:        BookOpen,
    href:        '/niveles-educativos',
  },
  {
    id:          'secundario',
    titulo:      'NIVEL SECUNDARIO',
    descripcion: '1° a 5° año. Orientaciones en Ciencias y Humanidades. Preparación universitaria incluida.',
    color:       '#1B3A6B',
    gradient:    'from-blue-600 to-blue-900',
    Icon:        GraduationCap,
    href:        '/niveles-educativos',
  },
]

export function HeroSection() {
  return (
    <div className="relative">
      {/* ── Imagen de fondo ── */}
      <div
        className="relative flex items-center"
        style={{
          minHeight: '500px',
          height: '70vh',
          backgroundImage: `url('/assets/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1B3A6B',
          backgroundBlendMode: 'multiply',
        }}
      >
        {/* Gradiente de fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-azul via-brand-azul-mid to-brand-celeste opacity-90 pointer-events-none" />

        {/* Badge pulsante */}
        <div className="absolute top-8 left-6 md:left-12 z-10">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="flex items-center gap-2 bg-brand-naranja/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Inscripciones 2027 abiertas
          </motion.div>
        </div>

        {/* Texto central */}
        <div className="relative z-10 w-full text-center px-4 pb-28 md:pb-32">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display font-bold text-white text-3xl md:text-5xl lg:text-6xl leading-tight drop-shadow-lg max-w-3xl mx-auto"
          >
            Inspiramos, desafiamos<br className="hidden md:block" /> y empoderamos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/80 text-base md:text-lg mt-4 max-w-xl mx-auto drop-shadow"
          >
            Centro Educativo · Resistencia, Chaco · Inicio de actividades Marzo 2027
          </motion.p>
        </div>
      </div>

      {/* ── Cards flotantes ── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:-mt-28 relative z-10">
          {NIVELES.map(({ id, titulo, descripcion, color, gradient, Icon, href }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
              className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col"
            >
              {/* Cabecera con gradiente e ícono */}
              <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-center justify-center`}>
                <Icon size={72} className="text-white/20" strokeWidth={1} />
              </div>

              {/* Franja de color */}
              <div className="h-1" style={{ backgroundColor: color }} />

              {/* Contenido */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="font-display font-bold text-gray-800 text-sm tracking-widest uppercase mb-2">
                  {titulo}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 text-justify">
                  {descripcion}
                </p>
                <Link
                  to={href}
                  className="mt-5 flex items-center justify-center gap-2 w-full text-white text-sm font-semibold py-2.5 px-4 transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(45deg, #29ABE2 0%, #1B3A6B 84%)', borderRadius: '4px' }}
                >
                  VER MÁS INFORMACIÓN
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
