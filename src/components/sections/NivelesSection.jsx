/**
 * @file NivelesSection.jsx
 * @description Cards de niveles con entrada escalonada desde abajo, hover flotante
 * y efecto de brillo en el ícono.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sprout, BookOpen, GraduationCap } from 'lucide-react'

const NIVELES = [
  {
    id: 'inicial', Icon: Sprout, nombre: 'Nivel Inicial',
    hex: '#4CAF50', badgeBg: 'bg-green-100', badgeText: 'text-green-800',
    btnBorder: 'border-green-500', btnText: 'text-green-700', btnHover: 'hover:bg-green-50',
    items: ['Sala de 3, 4 y 5 años','Jornada extendida (8:00 a 16:30 hs)','Estimulación temprana y aprendizaje lúdico','Inglés desde sala de 3','Arte, música y expresión corporal'],
  },
  {
    id: 'primario', Icon: BookOpen, nombre: 'Nivel Primario',
    hex: '#E8612C', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800',
    btnBorder: 'border-brand-naranja', btnText: 'text-brand-naranja', btnHover: 'hover:bg-orange-50',
    items: ['1° a 6° grado','Jornada extendida (7:30 a 16:30 hs)','Inglés, Portugués y Francés','Robótica, Teatro, Danza y Ajedrez','Natación, Fútbol, Básquet y Atletismo'],
  },
  {
    id: 'secundario', Icon: GraduationCap, nombre: 'Nivel Secundario',
    hex: '#1B3A6B', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800',
    btnBorder: 'border-brand-azul', btnText: 'text-brand-azul', btnHover: 'hover:bg-blue-50',
    items: ['1° a 5° año','Jornada extendida (7:00 a 17:00 hs)','Orientación Ciencias / Humanidades','Filosofía, Economía y Programación','Preparación universitaria incluida'],
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
}
const cardVariants = {
  hidden:  { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

export function NivelesSection() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
            className="inline-block bg-brand-azul/10 text-brand-azul text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
          >
            Propuesta educativa
          </motion.span>
          <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-3">
            Tres niveles, una sola visión
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Jornada extendida, idiomas y actividades extracurriculares para el desarrollo integral.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-60px' }}
        >
          {NIVELES.map(({ id, Icon, nombre, hex, badgeBg, badgeText, btnBorder, btnText, btnHover, items }) => (
            <motion.div
              key={id}
              variants={cardVariants}
              whileHover={{ y: -12, boxShadow: `0 28px 56px rgba(0,0,0,0.12), 0 0 0 2px ${hex}33` }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col cursor-default"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              {/* Franja superior */}
              <div className="h-2" style={{ backgroundColor: hex }} />

              <div className="p-7 flex flex-col flex-1">
                {/* Ícono animado */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${hex}15` }}
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={26} style={{ color: hex }} strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display font-bold text-gray-800 text-xl">{nombre}</h3>
                </div>

                {/* Lista */}
                <ul className="space-y-2.5 flex-1">
                  {items.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5 text-sm text-gray-600"
                    >
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: hex }} />
                      {item}
                    </motion.li>
                  ))}
                </ul>

                {/* Badge */}
                <div className="mt-5 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeBg} ${badgeText}`}>
                    Jornada Extendida
                  </span>
                </div>

                {/* Botón */}
                <Link to={`/niveles-educativos#${id}`}
                  className={`w-full text-center border-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-sm ${btnBorder} ${btnText} ${btnHover}`}>
                  Más información
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
