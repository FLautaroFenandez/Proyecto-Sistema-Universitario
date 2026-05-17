/**
 * @file BienestarPage.jsx
 * @description Bienestar estudiantil: deportes, instalaciones y servicios del centro.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'

const DEPORTES = [
  { emoji:'🏃', nombre:'Atletismo',      info:'Pista reglamentaria de 400m · Todos los niveles' },
  { emoji:'🏊', nombre:'Natación',       info:'Pileta olímpica cubierta 25m × 8 carriles' },
  { emoji:'⚽', nombre:'Fútbol',         info:'2 canchas de césped sintético con iluminación LED' },
  { emoji:'🥋', nombre:'Artes Marciales',info:'Dojo cubierto · Karate y Judo para todos los niveles' },
  { emoji:'🏐', nombre:'Vóleibol',       info:'Canchas internas y externas · Equipos por nivel' },
  { emoji:'💃', nombre:'Danza',          info:'Salón equipado · Clásica y contemporánea' },
  { emoji:'🏀', nombre:'Básquet',        info:'2 canchas: cubierta y al aire libre' },
  { emoji:'♟️', nombre:'Ajedrez',        info:'Club de ajedrez · Torneos internos y externos' },
]

const INSTALACIONES = [
  { emoji:'🏊', nombre:'Pileta de Natación', desc:'25 metros × 8 carriles, cubierta, climatizada. Apta para competencia.' },
  { emoji:'⚽', nombre:'Canchas de Fútbol',  desc:'Césped sintético de última generación, iluminación LED para práctica nocturna.' },
  { emoji:'🏃', nombre:'Pista de Atletismo', desc:'400 metros reglamentaria con 8 carriles y área de saltos.' },
  { emoji:'🏋️', nombre:'Gimnasio Cubierto',  desc:'1200 m², equipamiento completo, vestuarios y sanitarios.' },
  { emoji:'🔬', nombre:'Laboratorio Física', desc:'40 bancos de trabajo, equipamiento moderno para experimentos.' },
  { emoji:'⚗️', nombre:'Laboratorio Química',desc:'40 bancos, campanas de extracción, materiales de seguridad.' },
  { emoji:'💻', nombre:'Lab. Computación',   desc:'60 puestos con equipos de última generación y conexión de alta velocidad.' },
  { emoji:'🍽️', nombre:'Comedor',            desc:'300 cubiertos, menú elaborado por nutricionistas, servicio completo.' },
]

const SERVICIOS = [
  { emoji:'🧠', nombre:'Servicio de Apoyo Estudiantil', desc:'Equipo de psicólogos y psicopedagogos para orientación, tutorías y acompañamiento.' },
  { emoji:'🏥', nombre:'Enfermería',                    desc:'2 consultorios con guardia permanente durante el horario escolar.' },
  { emoji:'🚌', nombre:'Servicio de Transporte',        desc:'Micros con GPS en tiempo real, recorridos por toda Resistencia. Acompañantes capacitados.' },
  { emoji:'📚', nombre:'Biblioteca',                    desc:'5.000 volúmenes, sala de lectura, recursos digitales y préstamo domiciliario.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function BienestarPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <PageHero
        titulo="Bienestar Estudiantil"
        subtitulo="Deportes, instalaciones de primer nivel y servicios para el desarrollo integral de cada alumno."
        breadcrumb={[{ label: 'Bienestar Estudiantil' }]}
      />

      {/* Deportes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Programa Deportivo</h2>
            <p className="text-gray-500">8 disciplinas disponibles para todos los niveles educativos.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {DEPORTES.map((d, i) => (
              <motion.div key={d.nombre} {...fadeUp(i * 0.07)}
                className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <span className="text-4xl block mb-3">{d.emoji}</span>
                <h3 className="font-display font-bold text-gray-800 text-sm mb-1">{d.nombre}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{d.info}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instalaciones */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Instalaciones</h2>
            <p className="text-gray-500">Espacios diseñados para potenciar el aprendizaje y la actividad física.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {INSTALACIONES.map((inst, i) => (
              <motion.div key={inst.nombre} {...fadeUp(i * 0.07)}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl flex-shrink-0">{inst.emoji}</span>
                <div>
                  <h3 className="font-display font-bold text-gray-800 mb-1">{inst.nombre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{inst.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-2">Servicios de Apoyo</h2>
            <p className="text-gray-500">Acompañamos a cada alumno y familia en cada paso del camino.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {SERVICIOS.map((s, i) => (
              <motion.div key={s.nombre} {...fadeUp(i * 0.1)}
                className="flex gap-5 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <span className="text-4xl flex-shrink-0">{s.emoji}</span>
                <div>
                  <h3 className="font-display font-bold text-gray-800 mb-1">{s.nombre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
