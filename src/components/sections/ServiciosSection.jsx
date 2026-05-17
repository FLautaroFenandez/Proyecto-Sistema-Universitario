/**
 * @file ServiciosSection.jsx
 * @description Grilla de servicios e instalaciones. Iconografía Lucide React, sin emojis.
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
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.5 }} className="text-center mb-12">
          <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-3">
            Todo lo que necesita la comunidad educativa
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Bienestar estudiantil integral — instalaciones de primer nivel
            para el desarrollo pleno de cada alumno.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICIOS.map(({ Icon, color, nombre, descripcion }, i) => (
            <motion.div key={nombre}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-50px' }} transition={{ duration:0.4, delay:i*0.07 }}
              whileHover={{ scale:1.03, y:-2 }}
              className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-all duration-200 cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}>
                <Icon size={24} style={{ color }} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-gray-800 text-sm mb-1.5 leading-tight">{nombre}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{descripcion}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
