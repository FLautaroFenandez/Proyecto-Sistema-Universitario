/**
 * @file NivelesPage.jsx
 * @description Descripción detallada de cada nivel educativo con tabs interactivos.
 * Incluye tabla comparativa al final.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Globe, Trophy } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Link } from 'react-router-dom'

const NIVELES = [
  {
    id: 'inicial', label: 'Inicial', emoji: '🌱', color: '#4CAF50',
    bgLight: 'bg-green-50', border: 'border-green-500', text: 'text-green-700',
    tabActive: 'bg-green-500 text-white', tabInactive: 'text-green-700 hover:bg-green-50',
    rango: 'Sala de 3, 4 y 5 años',
    horario: '8:00 a 16:30 hs',
    descripcion: 'Una propuesta pedagógica centrada en el juego, la exploración y la creatividad. El nivel inicial es la base de una educación de calidad, donde cada niño desarrolla su potencial en un ambiente estimulante y seguro.',
    materias: ['Lengua y Literatura', 'Matemática inicial', 'Ciencias Naturales exploratoria', 'Educación Física', 'Música', 'Plástica', 'Inglés'],
    actividades: ['Teatro y expresión corporal', 'Iniciación a la robótica', 'Huerta escolar', 'Natación', 'Ajedrez'],
    idiomas: ['Inglés desde sala de 3'],
  },
  {
    id: 'primario', label: 'Primario', emoji: '📚', color: '#E8612C',
    bgLight: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700',
    tabActive: 'bg-brand-naranja text-white', tabInactive: 'text-brand-naranja hover:bg-orange-50',
    rango: '1° a 6° grado',
    horario: '7:30 a 16:30 hs',
    descripcion: 'Una formación sólida en todas las áreas del conocimiento, potenciada por tres idiomas, talleres creativos y deportes. Preparamos a nuestros alumnos para enfrentar los desafíos del mundo con confianza.',
    materias: ['Matemática', 'Lengua y Literatura', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Portugués (desde 3°)', 'Francés (desde 5°)', 'Tecnología', 'Arte', 'Música', 'Educación Física'],
    actividades: ['Robótica', 'Teatro', 'Danza', 'Ajedrez', 'Club de lectura'],
    idiomas: ['Inglés', 'Portugués desde 3°', 'Francés desde 5°'],
  },
  {
    id: 'secundario', label: 'Secundario', emoji: '🎓', color: '#1B3A6B',
    bgLight: 'bg-blue-50', border: 'border-blue-700', text: 'text-blue-800',
    tabActive: 'bg-brand-azul text-white', tabInactive: 'text-brand-azul hover:bg-blue-50',
    rango: '1° a 5° año',
    horario: '7:00 a 17:00 hs',
    descripcion: 'Una propuesta académica rigurosa con dos orientaciones, preparación universitaria y una amplia oferta extracurricular. Egresamos ciudadanos globales, críticos, creativos y comprometidos.',
    materias: ['Matemática', 'Lengua y Literatura', 'Física', 'Química', 'Biología', 'Historia', 'Geografía', 'Filosofía', 'Economía', 'Programación', 'Inglés', 'Portugués', 'Francés', 'Educación Física'],
    actividades: ['Pre-universitario', 'Debate académico', 'Emprendimiento', 'Deporte competitivo', 'Arte y música'],
    idiomas: ['Inglés', 'Portugués', 'Francés'],
    orientaciones: ['Ciencias Naturales', 'Humanidades y Ciencias Sociales'],
  },
]

const COMPARATIVA = [
  { aspecto: 'Duración',          inicial: 'Sala 3, 4 y 5',  primario: '1° a 6° grado', secundario: '1° a 5° año' },
  { aspecto: 'Jornada',           inicial: '8:00–16:30',     primario: '7:30–16:30',    secundario: '7:00–17:00' },
  { aspecto: 'Idiomas',           inicial: 'Inglés',          primario: 'Inglés + 2',    secundario: 'Inglés + 2' },
  { aspecto: 'Deportes',          inicial: 'Natación',        primario: 'Completo',       secundario: 'Competitivo' },
  { aspecto: 'Laboratorios',      inicial: '—',               primario: 'Computación',    secundario: 'Fís/Quím/Comp' },
  { aspecto: 'Prep. universitaria',inicial:'—',               primario: '—',              secundario: '✓' },
]

export default function NivelesPage() {
  const [tab, setTab] = useState('inicial')
  const nivel = NIVELES.find(n => n.id === tab)
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <PageHero
        titulo="Niveles Educativos"
        subtitulo="Inicial, Primario y Secundario — jornada extendida con enfoque integral."
        breadcrumb={[{ label: 'Niveles Educativos' }]}
      />

      {/* Tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-3">
            {NIVELES.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === n.id ? n.tabActive : n.tabInactive + ' bg-transparent'}`}
              >
                <span>{n.emoji}</span>{n.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contenido del tab */}
      <AnimatePresence mode="wait">
        <motion.section key={tab}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`py-14 ${nivel.bgLight}`}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* Info principal */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">{nivel.emoji}</span>
                  <div>
                    <h2 className="font-display font-bold text-gray-800 text-2xl">Nivel {nivel.label}</h2>
                    <p className={`text-sm font-medium ${nivel.text}`}>{nivel.rango}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{nivel.descripcion}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                    <Clock size={15} style={{ color: nivel.color }} />
                    <span className="font-medium text-gray-700">{nivel.horario}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                    <Globe size={15} style={{ color: nivel.color }} />
                    <span className="font-medium text-gray-700">{nivel.idiomas.join(' · ')}</span>
                  </div>
                </div>

                {nivel.orientaciones && (
                  <div className="mt-5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Orientaciones</p>
                    <div className="flex gap-2 flex-wrap">
                      {nivel.orientaciones.map(o => (
                        <span key={o} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{o}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Materias y actividades */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📖</span>Materias</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nivel.materias.map(m => (
                      <div key={m} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={13} style={{ color: nivel.color, flexShrink: 0 }} />{m}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2"><Trophy size={16} style={{ color: nivel.color }} />Actividades extracurriculares</h3>
                  <div className="flex flex-wrap gap-2">
                    {nivel.actividades.map(a => (
                      <span key={a} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Tabla comparativa */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-10">
            <h2 className="font-display font-bold text-gray-800 text-2xl mb-2">Comparativa de niveles</h2>
            <p className="text-gray-500 text-sm">Un vistazo rápido a las diferencias entre cada nivel.</p>
          </motion.div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-azul text-white">
                  <th className="text-left px-5 py-3 font-semibold">Aspecto</th>
                  {NIVELES.map(n => <th key={n.id} className="text-center px-5 py-3 font-semibold">{n.emoji} {n.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((row, i) => (
                  <tr key={row.aspecto} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-5 py-3 font-medium text-gray-700">{row.aspecto}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{row.inicial}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{row.primario}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{row.secundario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-8">
            <Link to="/inscripcion"
              className="inline-flex items-center gap-2 bg-brand-naranja text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-700 transition-colors">
              Solicitar inscripción
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
