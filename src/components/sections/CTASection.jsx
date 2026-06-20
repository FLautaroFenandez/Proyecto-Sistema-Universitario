/**
 * @file CTASection.jsx
 * @description Banner CTA con blobs animados, texto en shimmer, partículas flotantes
 * y botones con efecto de elevación.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, MessageSquare, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F2040 0%, #1B3A6B 50%, #0F2040 100%)' }}
    >
      {/* Blobs animados */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full animate-blob pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(41,171,226,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full animate-blob animation-delay-2000 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,97,44,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(76,175,80,0.06) 0%, transparent 70%)' }}
      />

      {/* Grid decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">

        {/* Ícono animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex items-center justify-center mb-6"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-brand-naranja/20 border border-brand-naranja/30 flex items-center justify-center">
              <Sparkles size={28} className="text-brand-naranja" />
            </div>
            {/* Anillos pulsantes */}
            <span className="absolute inset-0 rounded-2xl bg-brand-naranja/20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.1 }}
          className="inline-block bg-brand-naranja/20 text-brand-naranja border border-brand-naranja/30 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest"
        >
          Inscripciones 2027 abiertas
        </motion.span>

        {/* Título con aparición por palabras */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display font-bold text-white text-3xl md:text-5xl leading-tight mb-5"
        >
          ¿Querés ser parte de<br className="hidden md:block" /> nuestra comunidad?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-white/65 text-base md:text-lg mb-10 leading-relaxed"
        >
          Inscripciones abiertas para el ciclo lectivo 2027. Sumate a una propuesta
          educativa única en Resistencia, Chaco.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/inscripcion"
              className="flex items-center gap-2.5 bg-white text-brand-azul font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-2xl"
            >
              <ClipboardList size={18} />
              Solicitar inscripción
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/contacto"
              className="flex items-center gap-2.5 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              <MessageSquare size={18} />
              Contactanos
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
