/**
 * @file BienestarPage.jsx
 * @description Bienestar estudiantil: deportes, instalaciones y servicios.
 * Iconografía Lucide React, sin emojis.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Timer, Waves, CircleDot, Shield, Activity, Music2,
  Dumbbell, Brain, Building2, FlaskConical, Utensils,
  Stethoscope, Bus, BookMarked, HeartHandshake,
} from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'

const DEPORTES = [
  { Icon: Timer,      color: '#E8612C', nombre: 'Atletismo',      info: 'Pista reglamentaria de 400m · Todos los niveles' },
  { Icon: Waves,      color: '#29ABE2', nombre: 'Natación',       info: 'Pileta olímpica cubierta 25m × 8 carriles' },
  { Icon: CircleDot,  color: '#4CAF50', nombre: 'Fútbol',         info: '2 canchas de césped sintético con iluminación LED' },
  { Icon: Shield,     color: '#8B5CF6', nombre: 'Artes Marciales',info: 'Dojo cubierto · Karate y Judo para todos los niveles' },
  { Icon: Activity,   color: '#F59E0B', nombre: 'Vóleibol',       info: 'Canchas internas y externas · Equipos por nivel' },
  { Icon: Music2,     color: '#D63384', nombre: 'Danza',          info: 'Salón equipado · Clásica y contemporánea' },
  { Icon: Dumbbell,   color: '#1B3A6B', nombre: 'Básquet',        info: '2 canchas: cubierta y al aire libre' },
  { Icon: Brain,      color: '#6B7280', nombre: 'Ajedrez',        info: 'Club semanal · Torneos internos y externos' },
]

const INSTALACIONES = [
  { Icon: Waves,        color: '#29ABE2', nombre: 'Pileta de Natación',  desc: '25 metros × 8 carriles, cubierta, climatizada. Apta para competencia.' },
  { Icon: CircleDot,    color: '#4CAF50', nombre: 'Canchas de Fútbol',   desc: 'Césped sintético de última generación, iluminación LED para práctica nocturna.' },
  { Icon: Timer,        color: '#E8612C', nombre: 'Pista de Atletismo',  desc: '400 metros reglamentaria con 8 carriles y área de saltos.' },
  { Icon: Dumbbell,     color: '#1B3A6B', nombre: 'Gimnasio Cubierto',   desc: '1200 m², equipamiento completo, vestuarios y sanitarios.' },
  { Icon: FlaskConical, color: '#8B5CF6', nombre: 'Laboratorio Física',  desc: '40 bancos de trabajo, equipamiento moderno para experimentos.' },
  { Icon: FlaskConical, color: '#F59E0B', nombre: 'Laboratorio Química', desc: '40 bancos, campanas de extracción, materiales de seguridad.' },
  { Icon: Building2,    color: '#0EA5E9', nombre: 'Lab. Computación',    desc: '60 puestos con equipos de última generación y conexión de alta velocidad.' },
  { Icon: Utensils,     color: '#D63384', nombre: 'Comedor',             desc: '300 cubiertos, menú elaborado por nutricionistas, servicio completo.' },
]

const SERVICIOS = [
  { Icon: HeartHandshake, color: '#D63384', nombre: 'Servicio de Apoyo Estudiantil', desc: 'Equipo de psicólogos y psicopedagogos para orientación, tutorías y acompañamiento.' },
  { Icon: Stethoscope,    color: '#EF4444', nombre: 'Enfermería',                    desc: '2 consultorios con guardia permanente durante el horario escolar.' },
  { Icon: Bus,            color: '#1B3A6B', nombre: 'Servicio de Transporte',        desc: 'Micros con GPS en tiempo real, recorridos por toda Resistencia. Acompañantes capacitados.' },
  { Icon: BookMarked,     color: '#8B5CF6', nombre: 'Biblioteca',                    desc: '5.000 volúmenes, sala de lectura, recursos digitales y préstamo domiciliario.' },
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
            {DEPORTES.map(({ Icon, color, nombre, info }, i) => (
              <motion.div key={nombre} {...fadeUp(i * 0.07)}
                className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}>
                  <Icon size={22} style={{ color }} strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-gray-800 text-sm mb-1">{nombre}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{info}</p>
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
            {INSTALACIONES.map(({ Icon, color, nombre, desc }, i) => (
              <motion.div key={nombre} {...fadeUp(i * 0.07)}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}>
                  <Icon size={20} style={{ color }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-800 mb-1">{nombre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
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
            {SERVICIOS.map(({ Icon, color, nombre, desc }, i) => (
              <motion.div key={nombre} {...fadeUp(i * 0.1)}
                className="flex gap-5 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}>
                  <Icon size={22} style={{ color }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-800 mb-1">{nombre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
