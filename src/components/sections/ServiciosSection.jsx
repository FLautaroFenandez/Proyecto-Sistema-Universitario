/**
 * @file ServiciosSection.jsx
 * @description Grilla 4x2 de servicios e instalaciones del centro educativo.
 * Fondo blanco. Hover con scale + shadow sutil en cada card.
 */

import { motion } from 'framer-motion'

const SERVICIOS = [
  { emoji: '🏊', nombre: 'Pileta de Natación', descripcion: 'Pileta olímpica cubierta y climatizada, 25m × 8 carriles' },
  { emoji: '⚽', nombre: 'Deportes',           descripcion: 'Atletismo, fútbol, básquet, vóleibol, artes marciales y más' },
  { emoji: '🍽️', nombre: 'Comedor',            descripcion: 'Menú balanceado para 300 cubiertos, supervisado por nutricionistas' },
  { emoji: '🚌', nombre: 'Transporte',         descripcion: 'Micros con GPS en tiempo real y recorridos por toda Resistencia' },
  { emoji: '🔬', nombre: 'Laboratorios',       descripcion: 'Física, Química y Computación completamente equipados' },
  { emoji: '🏥', nombre: 'Enfermería',         descripcion: 'Profesionales de salud presentes a diario, 2 consultorios' },
  { emoji: '🤝', nombre: 'Apoyo Estudiantil', descripcion: 'Psicólogos y psicopedagogos para tutorías y contención' },
  { emoji: '🌍', nombre: 'Idiomas',            descripcion: 'Inglés, Portugués y Francés desde el Nivel Inicial' },
]

export function ServiciosSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-3">
            Todo lo que necesita la comunidad educativa
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Bienestar estudiantil integral — instalaciones de primer nivel para el desarrollo pleno de cada alumno.
          </p>
        </motion.div>

        {/* Grid 4 columnas desktop / 2 tablet / 1 mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICIOS.map((servicio, i) => (
            <motion.div
              key={servicio.nombre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-all duration-250 cursor-default"
            >
              <span className="text-4xl mb-3 select-none">{servicio.emoji}</span>
              <h3 className="font-display font-bold text-gray-800 text-sm mb-1.5 leading-tight">
                {servicio.nombre}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                {servicio.descripcion}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
