/**
 * @file HeroSection.jsx
 * @description Hero con partículas flotantes, blobs animados, texto con
 * efecto de aparición y cards flotantes estilo UNCAUS con más onda.
 */

import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sprout, BookOpen, GraduationCap, ArrowRight, ChevronDown } from 'lucide-react'
import { useRef } from 'react'

const NIVELES = [
  {
    id: 'inicial', titulo: 'NIVEL INICIAL',
    descripcion: 'Sala de 3, 4 y 5 años. Jornada extendida con estimulación temprana, juego, arte y música. Inglés desde sala de 3.',
    color: '#4CAF50', gradient: 'from-green-500 to-green-700', Icon: Sprout, href: '/niveles-educativos',
  },
  {
    id: 'primario', titulo: 'NIVEL PRIMARIO',
    descripcion: '1° a 6° grado. Jornada extendida con tres idiomas, robótica, deportes y talleres de teatro y danza.',
    color: '#E8612C', gradient: 'from-orange-500 to-orange-700', Icon: BookOpen, href: '/niveles-educativos',
  },
  {
    id: 'secundario', titulo: 'NIVEL SECUNDARIO',
    descripcion: '1° a 5° año. Orientaciones en Ciencias y Humanidades. Preparación universitaria incluida.',
    color: '#1B3A6B', gradient: 'from-blue-600 to-blue-900', Icon: GraduationCap, href: '/niveles-educativos',
  },
]

/* Partícula flotante decorativa */
function Particle({ x, y, size, delay, duration }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/10 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

const PARTICLES = [
  { x:10, y:20, size:8,  delay:0,   duration:3.5 },
  { x:25, y:70, size:12, delay:0.8, duration:4.2 },
  { x:50, y:15, size:6,  delay:1.5, duration:3.0 },
  { x:75, y:60, size:10, delay:0.3, duration:4.8 },
  { x:88, y:30, size:7,  delay:1.2, duration:3.8 },
  { x:60, y:80, size:5,  delay:2.0, duration:5.0 },
  { x:35, y:40, size:9,  delay:0.6, duration:4.0 },
]

const WORDS = ['Inspiramos,', 'desafiamos', 'y empoderamos']

export function HeroSection() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  /* Parallax suave: el texto sube al hacer scroll */
  const textY   = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div ref={heroRef} className="relative">

      {/* ── Hero de fondo ── */}
      <div
        className="relative flex items-center overflow-hidden"
        style={{
          minHeight: '520px',
          height: '72vh',
          background: 'linear-gradient(135deg, #0F2040 0%, #1B3A6B 45%, #2B5298 80%, #29ABE2 130%)',
        }}
      >
        {/* Patrón de puntos decorativo */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-azul/40 via-transparent to-brand-celeste/20 pointer-events-none" />

        {/* Blob decorativo 1 */}
        <motion.div
          className="absolute top-10 right-10 w-80 h-80 rounded-full bg-brand-celeste/15 animate-blob pointer-events-none"
          style={{ filter: 'blur(50px)' }}
        />
        {/* Blob decorativo 2 */}
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-brand-naranja/10 animate-blob animation-delay-3000 pointer-events-none"
          style={{ filter: 'blur(70px)' }}
        />

        {/* Partículas */}
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

        {/* Badge pulsante */}
        <div className="absolute top-8 left-6 md:left-12 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, type: 'spring' }}
            className="relative flex items-center gap-2 bg-brand-naranja text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xl"
          >
            {/* Anillo pulsante */}
            <span className="absolute inset-0 rounded-full bg-brand-naranja animate-ping opacity-30" />
            <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
            Inscripciones 2027 abiertas
          </motion.div>
        </div>

        {/* Contenido central con parallax */}
        <motion.div
          style={{ y: textY, opacity }}
          className="relative z-10 w-full text-center px-4 pb-32 md:pb-40"
        >
          {/* Palabras del título con stagger */}
          <div className="mb-4 overflow-hidden">
            {WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="font-display font-black text-white text-4xl md:text-6xl lg:text-7xl leading-tight drop-shadow-2xl inline-block mr-4"
                initial={{ opacity: 0, y: 60, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="text-white/75 text-base md:text-xl mt-4 max-w-2xl mx-auto leading-relaxed"
          >
            Centro Educativo · Resistencia, Chaco · Inicio de actividades Marzo 2027
          </motion.p>

          {/* Botones CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <Link to="/inscripcion"
              className="flex items-center gap-2 bg-brand-naranja text-white font-bold px-7 py-3.5 rounded-xl hover:bg-orange-600 transition-all hover:scale-105 hover:shadow-xl shadow-brand-naranja/30 shadow-lg"
            >
              Solicitar inscripción <ArrowRight size={17} />
            </Link>
            <Link to="/quienes-somos"
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/25 transition-all"
            >
              Conocer más
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <span className="text-white/40 text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown size={16} className="text-white/40" />
        </motion.div>
      </div>

      {/* ── Cards flotantes ── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:-mt-32 relative z-10">
          {NIVELES.map(({ id, titulo, descripcion, color, gradient, Icon, href }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, scale: 1.02, zIndex: 10 }}
              className="bg-white flex flex-col relative"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)', transition: 'box-shadow 0.3s ease' }}
            >
              {/* Cabecera gradiente con ícono */}
              <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden flex items-center justify-center`}>
                {/* Efecto de luz */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                >
                  <Icon size={80} className="text-white/20" strokeWidth={0.8} />
                </motion.div>
                {/* Número decorativo */}
                <div className="absolute bottom-3 right-4 text-white/15 font-display font-black text-7xl select-none">
                  {i + 1}
                </div>
              </div>

              {/* Franja de color */}
              <div className="h-1" style={{ backgroundColor: color }} />

              {/* Contenido */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="font-display font-bold text-gray-800 text-sm tracking-widest uppercase mb-3">
                  {titulo}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1 text-justify">
                  {descripcion}
                </p>
                <Link
                  to={href}
                  className="mt-5 flex items-center justify-center gap-2 w-full text-white text-sm font-bold py-3 px-4 transition-all hover:opacity-90 hover:gap-3"
                  style={{ background: 'linear-gradient(45deg, #29ABE2 0%, #1B3A6B 84%)', borderRadius: '6px' }}
                >
                  VER MÁS INFORMACIÓN <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
