/**
 * @file NivelesSection.jsx
 * @description Cards de niveles educativos. Iconografía Lucide React, sin emojis.
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

export function NivelesSection() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.5 }} className="text-center mb-12">
          <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl mb-3">Propuesta Educativa</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tres niveles con jornada extendida, idiomas y actividades extracurriculares
            para el desarrollo integral de cada alumno.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NIVELES.map(({ id, Icon, nombre, hex, badgeBg, badgeText, btnBorder, btnText, btnHover, items }, i) => (
            <motion.div key={id}
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-50px' }} transition={{ duration:0.5, delay:i*0.12 }}
              whileHover={{ y:-4 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="h-1.5" style={{ backgroundColor: hex }} />
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${hex}18` }}>
                    <Icon size={22} style={{ color: hex }} />
                  </div>
                  <h3 className="font-display font-bold text-gray-800 text-xl">{nombre}</h3>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: hex }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeBg} ${badgeText}`}>
                    Jornada Extendida
                  </span>
                </div>
                <Link to="/niveles-educativos"
                  className={`w-full text-center border py-2 rounded-lg text-sm font-semibold transition-colors ${btnBorder} ${btnText} ${btnHover}`}>
                  Más información
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
