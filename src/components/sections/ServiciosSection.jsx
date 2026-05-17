/**
 * @file ServiciosSection.jsx
 * @description Grilla de servicios con entrada en zigzag (pares desde izquierda,
 * impares desde derecha) y hover con glow de color.
 */

import { motion } from 'framer-motion'
import { Waves, Activity, Utensils, Bus, FlaskConical, Stethoscope, HandHeart, Globe } from 'lucide-react'

const SERVICIOS = [
  { Icon: Waves,        color: '#29ABE2', nombre: 'Pileta de Natación', descripcion: 'Pileta olímpica cubierta y climatizada, 25m × 8 carriles' },
  { Icon: Activity,     color: '#4CAF50', nombre: 'Deportes',           descripcion: 'Atletismo, fútbol, básquet, vóleibol, artes marciales y más' },
  { Icon: Utensils,     color: '#E8612C', nombre: 'Comedor',            descripcion: 'Menú balanceado supervisado por nutricionistas, 300 cubiertos' },
  { Icon: Bus,          color: '#1B3A6B', nombre: 'Transporte',         descripcion: 'Micros con GPS en tiempo real, recorridos por toda Resistencia' },
  { Icon: FlaskConical, color: '#8B5CF6', nombre: 'Laboratorios',       descripcion: 'Física, Química y Computación completamente equipados' },
  { Icon: Stethoscope,  color: '#EF4444', nombre: 'Enfermería',         descripcion: 'Profesionales de salud presentes a diario, 2 consultorios' },
  { Icon: HandHeart,    color: '#D63384', nombre: 'Apoyo Estudiantil',  descripcion: 'Psicólogos y psicopedagogos para tutorías y contención' },
  { Icon: Globe,        color: '#0EA5E9', nombre: 'Idiomas',            descripcion: 'Inglés, Portugués y Francés desde el Nivel Inicial' },
]

export function ServiciosSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block bg-brand-naranja/10 text-brand-naranja text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
          >
            Bienestar estudiantil
          </motion.span>
          <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-3">
            Todo lo que necesita la comunidad educativa
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Instalaciones de primer nivel para el desarrollo pleno de cada alumno.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICIOS.map(({ Icon, color, nombre, descripcion }, i) => (
            <motion.div
              key={nombre}
              initial={{ opacity: 0, y: 40, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                y: -10,
                scale: 1.04,
                boxShadow: `0 20px 40px ${color}22`,
                borderColor: `${color}55`,
              }}
              className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center text-center border border-gray-100 cursor-default transition-colors duration-300"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
                whileHover={{ rotate: 10, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Icon size={26} style={{ color }} strokeWidth={1.5} />
              </motion.div>
              <h3 className="font-display font-bold text-gray-800 text-sm mb-1.5 leading-tight">{nombre}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{descripcion}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
