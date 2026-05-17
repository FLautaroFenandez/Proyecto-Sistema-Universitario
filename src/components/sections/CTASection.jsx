/**
 * @file CTASection.jsx
 * @description Banner call-to-action de inscripción.
 * Fondo con gradiente azul oscuro institucional. 2 botones: inscripción y contacto.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, MessageSquare } from 'lucide-react'

export function CTASection() {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2040 100%)' }}
    >
      {/* Círculos decorativos de fondo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge superior */}
          <span className="inline-block bg-brand-naranja/20 text-brand-naranja border border-brand-naranja/30 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            Inscripciones 2027 abiertas
          </span>

          {/* Título */}
          <h2 className="font-display font-bold text-white text-3xl md:text-4xl leading-tight mb-4">
            ¿Querés ser parte de nuestra comunidad?
          </h2>

          {/* Subtítulo */}
          <p className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Inscripciones abiertas para el ciclo lectivo 2027. Sumate a una propuesta educativa única en Resistencia, Chaco.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/inscripcion"
              className="flex items-center gap-2.5 bg-white text-brand-azul font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-lg"
            >
              <ClipboardList size={18} />
              Solicitar inscripción
            </Link>
            <Link
              to="/contacto"
              className="flex items-center gap-2.5 border-2 border-white/50 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              <MessageSquare size={18} />
              Contactanos
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
