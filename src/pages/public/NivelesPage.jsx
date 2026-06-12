/**
 * @file NivelesPage.jsx
 * @description Página de niveles educativos con tabs interactivos.
 * Soporta navegación directa por hash (#inicial, #primario, #secundario).
 * Banner gradiente por nivel, stats, materias, actividades y tabla comparativa.
 */

import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Clock, Globe, Trophy, Sprout, BookOpen, GraduationCap,
  Library, Sparkles, Target, ArrowRight, CalendarCheck, Users,
} from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'

const NIVELES = [
  {
    id: 'inicial', label: 'Inicial', Icon: Sprout,
    color: '#4CAF50', gradient: 'linear-gradient(135deg, #43A047 0%, #2E7D32 100%)',
    bgLight: 'bg-green-50/60', text: 'text-green-700',
    tabActive: 'bg-green-600 text-white shadow-md shadow-green-600/25',
    tabInactive: 'text-green-700 hover:bg-green-50',
    chipBg: 'bg-green-100 text-green-800',
    rango: 'Sala de 3, 4 y 5 años',
    horario: '8:00 a 16:30 hs',
    edades: '3 a 5 años',
    descripcion: 'Una propuesta pedagógica centrada en el juego, la exploración y la creatividad. El nivel inicial es la base de una educación de calidad, donde cada niño desarrolla su potencial en un ambiente estimulante y seguro.',
    materias: ['Lengua y Literatura', 'Matemática inicial', 'Ciencias Naturales exploratoria', 'Educación Física', 'Música', 'Plástica', 'Inglés'],
    actividades: ['Teatro y expresión corporal', 'Iniciación a la robótica', 'Huerta escolar', 'Natación', 'Ajedrez'],
    idiomas: ['Inglés desde sala de 3'],
    destacados: ['Estimulación temprana con especialistas', 'Grupos reducidos por sala', 'Adaptación acompañada por psicopedagogos'],
  },
  {
    id: 'primario', label: 'Primario', Icon: BookOpen,
    color: '#E8612C', gradient: 'linear-gradient(135deg, #F4511E 0%, #D84315 100%)',
    bgLight: 'bg-orange-50/60', text: 'text-orange-700',
    tabActive: 'bg-brand-naranja text-white shadow-md shadow-orange-600/25',
    tabInactive: 'text-brand-naranja hover:bg-orange-50',
    chipBg: 'bg-orange-100 text-orange-800',
    rango: '1° a 6° grado',
    horario: '7:30 a 16:30 hs',
    edades: '6 a 12 años',
    descripcion: 'Una formación sólida en todas las áreas del conocimiento, potenciada por tres idiomas, talleres creativos y deportes. Preparamos a nuestros alumnos para enfrentar los desafíos del mundo con confianza.',
    materias: ['Matemática', 'Lengua y Literatura', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Portugués (desde 3°)', 'Francés (desde 5°)', 'Tecnología', 'Arte', 'Música', 'Educación Física'],
    actividades: ['Robótica', 'Teatro', 'Danza', 'Ajedrez', 'Club de lectura'],
    idiomas: ['Inglés', 'Portugués desde 3°', 'Francés desde 5°'],
    destacados: ['Tres idiomas en la currícula', 'Laboratorio de computación', 'Deportes en instalaciones propias'],
  },
  {
    id: 'secundario', label: 'Secundario', Icon: GraduationCap,
    color: '#1B3A6B', gradient: 'linear-gradient(135deg, #2B5298 0%, #0F2040 100%)',
    bgLight: 'bg-blue-50/60', text: 'text-blue-800',
    tabActive: 'bg-brand-azul text-white shadow-md shadow-blue-900/25',
    tabInactive: 'text-brand-azul hover:bg-blue-50',
    chipBg: 'bg-blue-100 text-blue-800',
    rango: '1° a 5° año',
    horario: '7:00 a 17:00 hs',
    edades: '13 a 18 años',
    descripcion: 'Una propuesta académica rigurosa con dos orientaciones, preparación universitaria y una amplia oferta extracurricular. Egresamos ciudadanos globales, críticos, creativos y comprometidos.',
    materias: ['Matemática', 'Lengua y Literatura', 'Física', 'Química', 'Biología', 'Historia', 'Geografía', 'Filosofía', 'Economía', 'Programación', 'Inglés', 'Portugués', 'Francés', 'Educación Física'],
    actividades: ['Pre-universitario', 'Debate académico', 'Emprendimiento', 'Deporte competitivo', 'Arte y música'],
    idiomas: ['Inglés', 'Portugués', 'Francés'],
    orientaciones: ['Ciencias Naturales', 'Humanidades y Ciencias Sociales'],
    destacados: ['Preparación universitaria incluida', 'Laboratorios de Física y Química', 'Orientación vocacional personalizada'],
  },
]

const COMPARATIVA = [
  { aspecto: 'Duración',           inicial: 'Sala 3, 4 y 5', primario: '1° a 6° grado', secundario: '1° a 5° año' },
  { aspecto: 'Jornada',            inicial: '8:00–16:30',    primario: '7:30–16:30',    secundario: '7:00–17:00' },
  { aspecto: 'Idiomas',            inicial: 'Inglés',         primario: 'Inglés + 2',    secundario: 'Inglés + 2' },
  { aspecto: 'Deportes',           inicial: 'Natación',       primario: 'Completo',       secundario: 'Competitivo' },
  { aspecto: 'Laboratorios',       inicial: '—',              primario: 'Computación',    secundario: 'Fís / Quím / Comp' },
  { aspecto: 'Prep. universitaria',inicial: '—',              primario: '—',              secundario: '✓' },
]

const VALID_TABS = ['inicial', 'primario', 'secundario']

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function NivelesPage() {
  const [tab, setTab] = useState('inicial')
  const nivel = NIVELES.find(n => n.id === tab)
  const location = useLocation()

  useEffect(() => {
    const tabId = location.hash?.slice(1)
    if (VALID_TABS.includes(tabId)) {
      setTab(tabId)
      window.scrollTo(0, 0)
    } else if (!location.hash) {
      window.scrollTo(0, 0)
    }
  }, [location])

  const { Icon } = nivel

  const STATS = [
    { Icon: Library,       valor: nivel.materias.length,    label: 'Materias' },
    { Icon: Sparkles,      valor: nivel.actividades.length, label: 'Actividades extra' },
    { Icon: Globe,         valor: nivel.idiomas.length,     label: nivel.idiomas.length === 1 ? 'Idioma' : 'Idiomas' },
    { Icon: CalendarCheck, valor: '✓',                      label: 'Jornada extendida' },
  ]

  return (
    <>
      <PageHero
        titulo="Niveles Educativos"
        subtitulo="Inicial, Primario y Secundario — jornada extendida con enfoque integral."
        breadcrumb={[{ label: 'Niveles Educativos' }]}
      />

      {/* ── Tabs sticky ── */}
      <section className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-[68px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-3">
            {NIVELES.map(n => {
              const TabIcon = n.Icon
              return (
                <button key={n.id} onClick={() => setTab(n.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    tab === n.id ? n.tabActive : n.tabInactive + ' bg-transparent'
                  }`}
                >
                  <TabIcon size={16} strokeWidth={2} />
                  <span className="hidden sm:inline">Nivel </span>{n.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Contenido del nivel ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={nivel.bgLight}
        >
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">

            {/* Banner principal del nivel */}
            <div className="rounded-3xl overflow-hidden relative shadow-xl" style={{ background: nivel.gradient }}>
              {/* Decorativos */}
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-20 -left-12 w-60 h-60 rounded-full bg-black/10 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              {/* Ícono gigante de fondo */}
              <Icon size={280} strokeWidth={0.5}
                className="absolute -right-10 -bottom-14 text-white/10 pointer-events-none hidden md:block" />

              <div className="relative z-10 p-8 md:p-12 grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-3">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center flex-shrink-0">
                      <Icon size={30} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-white text-3xl md:text-4xl leading-none">
                        Nivel {nivel.label}
                      </h2>
                      <p className="text-white/70 text-sm mt-1.5 font-medium">{nivel.rango} · {nivel.edades}</p>
                    </div>
                  </div>
                  <p className="text-white/85 leading-relaxed md:text-lg">{nivel.descripcion}</p>

                  {/* Chips info */}
                  <div className="flex flex-wrap gap-2.5 mt-6">
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full">
                      <Clock size={12} /> {nivel.horario}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full">
                      <Globe size={12} /> {nivel.idiomas.join(' · ')}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full">
                      <Users size={12} /> Jornada extendida
                    </span>
                  </div>
                </div>

                {/* Card lateral: destacados + CTA */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-2xl p-6 shadow-2xl">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      Por qué elegir este nivel
                    </p>
                    <ul className="space-y-3 mb-6">
                      {nivel.destacados.map(d => (
                        <li key={d} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${nivel.color}18` }}>
                            <Check size={11} strokeWidth={3} style={{ color: nivel.color }} />
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                    <Link to="/inscripcion"
                      className="flex items-center justify-center gap-2 w-full text-white text-sm font-bold py-3 rounded-xl transition-all hover:opacity-90 hover:gap-3"
                      style={{ background: nivel.gradient }}>
                      Inscribir a este nivel <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats del nivel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(({ Icon: SIcon, valor, label }, i) => (
                <motion.div key={label} {...fadeUp(i * 0.07)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${nivel.color}15` }}>
                    <SIcon size={20} style={{ color: nivel.color }} strokeWidth={1.8} />
                  </div>
                  <p className="font-display font-black text-gray-800 text-3xl leading-none">{valor}</p>
                  <p className="text-gray-400 text-xs mt-1.5 font-medium">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Materias + Actividades + Orientaciones */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Materias */}
              <motion.div {...fadeUp()} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${nivel.color}15` }}>
                    <Library size={18} style={{ color: nivel.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-gray-800 text-lg leading-none">Materias</h3>
                    <p className="text-gray-400 text-xs mt-1">{nivel.materias.length} asignaturas en la currícula</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {nivel.materias.map((m, i) => (
                    <motion.div key={m}
                      initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={13} strokeWidth={3} style={{ color: nivel.color, flexShrink: 0 }} />
                      {m}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="space-y-6">
                {/* Actividades */}
                <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${nivel.color}15` }}>
                      <Trophy size={18} style={{ color: nivel.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-gray-800 text-lg leading-none">Actividades extracurriculares</h3>
                      <p className="text-gray-400 text-xs mt-1">Incluidas en la jornada extendida</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nivel.actividades.map(a => (
                      <span key={a} className={`text-xs font-semibold px-3.5 py-2 rounded-xl ${nivel.chipBg}`}>
                        {a}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Orientaciones (solo secundario) */}
                {nivel.orientaciones && (
                  <motion.div {...fadeUp(0.15)} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${nivel.color}15` }}>
                        <Target size={18} style={{ color: nivel.color }} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-gray-800 text-lg leading-none">Orientaciones</h3>
                        <p className="text-gray-400 text-xs mt-1">A elegir a partir de 3° año</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {nivel.orientaciones.map(o => (
                        <div key={o} className="border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 text-center">
                          <p className="text-sm font-bold text-brand-azul">{o}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Idiomas */}
                <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${nivel.color}15` }}>
                      <Globe size={18} style={{ color: nivel.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-gray-800 text-lg leading-none">Idiomas</h3>
                      <p className="text-gray-400 text-xs mt-1">Formación plurilingüe desde el inicio</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nivel.idiomas.map(idi => (
                      <span key={idi} className={`text-xs font-semibold px-3.5 py-2 rounded-xl ${nivel.chipBg}`}>
                        {idi}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Tabla comparativa ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <span className="inline-block bg-brand-azul/10 text-brand-azul text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Vista general
            </span>
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Comparativa de niveles</h2>
            <p className="text-gray-500 text-sm">Un vistazo rápido a las diferencias entre cada nivel.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="overflow-x-auto rounded-2xl border border-gray-200 shadow-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-azul text-white">
                  <th className="text-left px-5 py-4 font-semibold">Aspecto</th>
                  {NIVELES.map(n => {
                    const HIcon = n.Icon
                    return (
                      <th key={n.id} className="text-center px-5 py-4 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <HIcon size={14} /> {n.label}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((row, i) => (
                  <tr key={row.aspecto}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40 transition-colors`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-700">{row.aspecto}</td>
                    <td className="px-5 py-3.5 text-center text-gray-600">{row.inicial}</td>
                    <td className="px-5 py-3.5 text-center text-gray-600">{row.primario}</td>
                    <td className="px-5 py-3.5 text-center text-gray-600">{row.secundario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="text-center mt-10">
            <p className="text-gray-500 text-sm mb-4">¿Ya elegiste el nivel para tu hijo/a?</p>
            <Link to="/inscripcion"
              className="inline-flex items-center gap-2 bg-brand-naranja text-white font-bold px-8 py-3.5 rounded-xl hover:bg-orange-700 transition-all hover:scale-105 hover:shadow-xl shadow-lg shadow-brand-naranja/25">
              Solicitar inscripción <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
