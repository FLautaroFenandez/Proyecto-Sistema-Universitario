/**
 * @file QuienesSomosPage.jsx
 * @description Información institucional: misión, visión, valores, equipo e historia.
 * Iconografía Lucide React, sin emojis.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Telescope, Award, Users, Globe, Lightbulb, Scale, Rocket } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'

const VALORES = [
  { Icon: Award,      titulo: 'Excelencia',  desc: 'Compromiso con la calidad en todo lo que hacemos, apuntando siempre a la mejora continua.' },
  { Icon: Users,      titulo: 'Comunidad',   desc: 'Construimos vínculos sólidos entre alumnos, familias y docentes.' },
  { Icon: Globe,      titulo: 'Globalidad',  desc: 'Preparamos ciudadanos para un mundo interconectado, con perspectiva internacional.' },
  { Icon: Lightbulb,  titulo: 'Innovación',  desc: 'Fomentamos el pensamiento crítico y la creatividad en cada espacio educativo.' },
  { Icon: Scale,      titulo: 'Ética',       desc: 'Formamos personas íntegras, con valores sólidos y responsabilidad social.' },
  { Icon: Rocket,     titulo: 'Autonomía',   desc: 'Desarrollamos alumnos seguros, capaces de tomar decisiones con criterio propio.' },
]

const DIRECTIVOS = [
  { nombre: 'Dra. Ana Martínez',    cargo: 'Rectora',               inicial: 'AM' },
  { nombre: 'Lic. Roberto Sánchez', cargo: 'Vicerrector',           inicial: 'RS' },
  { nombre: 'Mg. Claudia Torres',   cargo: 'Dir. Nivel Primario',   inicial: 'CT' },
  { nombre: 'Prof. Diego López',    cargo: 'Dir. Nivel Secundario', inicial: 'DL' },
]

const HISTORIA = [
  { año: '2024', hito: 'Fundación y diseño del proyecto educativo',         desc: 'Un equipo de profesionales visionarios diseña el modelo pedagógico del centro.' },
  { año: '2025', hito: 'Construcción e implementación de instalaciones',     desc: 'Se levantan las modernas instalaciones con pileta, laboratorios y canchas deportivas.' },
  { año: '2026', hito: 'Proceso de inscripciones y selección de personal',  desc: 'Apertura del registro de familias y conformación del cuerpo docente.' },
  { año: '2027', hito: 'Inicio de actividades académicas — Marzo',          desc: 'Comienza la primera experiencia educativa. ¡Bienvenida, comunidad!' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function QuienesSomosPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <PageHero
        titulo="Quiénes Somos"
        subtitulo="Conocé nuestra misión, visión y el equipo que hace posible este proyecto educativo único."
        breadcrumb={[{ label: 'Quiénes Somos' }]}
      />

      {/* Misión y Visión */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                Icon: Target, titulo: 'Nuestra Misión', color: 'border-brand-naranja bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-brand-naranja',
                texto: 'Brindar una educación integral de calidad que inspire, desafíe y empodere a cada alumno para convertirse en un agente de cambio comprometido, ético e innovador, capaz de impactar positivamente en su comunidad y en el mundo.',
              },
              {
                Icon: Telescope, titulo: 'Nuestra Visión', color: 'border-brand-azul bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-brand-azul',
                texto: 'Ser la institución educativa de referencia en Resistencia y el NEA por la excelencia académica, la formación en valores, la innovación pedagógica y la preparación de ciudadanos globales, seguros, creativos y colaborativos.',
              },
            ].map(({ Icon, titulo, color, iconBg, iconColor, texto }, i) => (
              <motion.div key={titulo} {...fadeUp(i * 0.15)}
                className={`rounded-2xl border-l-4 p-8 ${color}`}>
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h2 className="font-display font-bold text-gray-800 text-xl mb-3">{titulo}</h2>
                <p className="text-gray-600 leading-relaxed">{texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Nuestros Valores</h2>
            <p className="text-gray-500">Los principios que guían cada decisión y acción de nuestra comunidad.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {VALORES.map(({ Icon, titulo, desc }, i) => (
              <motion.div key={titulo} {...fadeUp(i * 0.08)}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-azul/8 flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-brand-azul" />
                </div>
                <h3 className="font-display font-bold text-gray-800 mb-2">{titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo directivo */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Equipo Directivo</h2>
            <p className="text-gray-500">Profesionales comprometidos con la excelencia educativa.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {DIRECTIVOS.map((d, i) => (
              <motion.div key={d.nombre} {...fadeUp(i * 0.1)} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-azul to-brand-celeste flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="text-white font-display font-bold text-xl">{d.inicial}</span>
                </div>
                <h3 className="font-display font-semibold text-gray-800 text-sm">{d.nombre}</h3>
                <p className="text-gray-400 text-xs mt-1">{d.cargo}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Nuestra Historia</h2>
            <p className="text-gray-500">Un proyecto educativo que nació con visión de futuro.</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {HISTORIA.map((h, i) => (
                <motion.div key={h.año} {...fadeUp(i * 0.12)} className="relative flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-azul flex items-center justify-center flex-shrink-0 z-10 shadow-md">
                    <span className="text-white font-display font-bold text-sm">{h.año}</span>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="font-display font-bold text-gray-800 mb-1">{h.hito}</h3>
                    <p className="text-gray-500 text-sm">{h.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
