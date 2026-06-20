/**
 * @file EstadisticasSection.jsx
 * @description Sección de estadísticas con contadores animados que se activan
 * al entrar en el viewport. Fondo gradiente institucional azul.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { GraduationCap, Trophy, Globe, Calendar } from 'lucide-react'

const STATS = [
  { Icon: GraduationCap, valor: 3,    sufijo: '',    label: 'Niveles educativos',       desc: 'Inicial · Primario · Secundario' },
  { Icon: Trophy,        valor: 8,    sufijo: '',    label: 'Disciplinas deportivas',    desc: 'Natación, fútbol, atletismo y más' },
  { Icon: Globe,         valor: 3,    sufijo: '',    label: 'Idiomas',                   desc: 'Inglés · Portugués · Francés' },
  { Icon: Calendar,      valor: 2027, sufijo: '',    label: 'Inicio de actividades',     desc: 'Marzo 2027 · Resistencia, Chaco' },
]

function AnimatedCounter({ target, duration = 1800 }) {
  const [current, setCurrent] = useState(0)
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-80px' })

  useEffect(() => {
    if (!isInView) return
    const startTime  = performance.now()
    const startValue = target > 100 ? target - 50 : 0

    const tick = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      /* easeOutExpo para un acabado suave */
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.round(startValue + (target - startValue) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target, duration])

  return <span ref={ref}>{current.toLocaleString('es-AR')}</span>
}

export function EstadisticasSection() {
  const ref      = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2040 60%, #1B3A6B 100%)' }}
    >
      {/* Blobs decorativos animados */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-brand-celeste/10 animate-blob" style={{ filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-naranja/10 animate-blob animation-delay-2000" style={{ filter: 'blur(80px)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-white text-2xl md:text-3xl mb-2">
            Educar para Transformar en números
          </h2>
          <p className="text-white/55 text-sm">Una propuesta educativa de excelencia en el NEA</p>
        </motion.div>

        {/* Grid de stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map(({ Icon, valor, sufijo, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="relative bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-6 text-center overflow-hidden group cursor-default"
            >
              {/* Glow en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                  <Icon size={22} className="text-white" strokeWidth={1.5} />
                </div>

                <p className="font-display font-black text-white text-4xl md:text-5xl leading-none mb-1">
                  <AnimatedCounter target={valor} duration={1600 + i * 200} />
                  {sufijo}
                </p>

                <p className="text-white font-semibold text-sm mt-2">{label}</p>
                <p className="text-white/45 text-xs mt-1">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
