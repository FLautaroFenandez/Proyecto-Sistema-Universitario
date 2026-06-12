/**
 * @file OpinionesSection.jsx
 * @description Opiniones aprobadas de la comunidad en grid + formulario para dejar opinión.
 * Cualquier visitante puede opinar sin login. La opinión queda pendiente de moderación.
 * Validación con React Hook Form + Zod. Contador de caracteres en tiempo real.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Star, Send, CheckCircle } from 'lucide-react'
import { useOpiniones } from '@/hooks/useOpiniones'
import { supabase } from '@/lib/supabase'
import { formatDateShort } from '@/utils/formatDate'
import { Button } from '@/components/ui/Button'
import { SkeletonAvatar, SkeletonLine } from '@/components/ui/Skeleton'

/* Esquema de validación */
const opinionSchema = z.object({
  autor_nombre: z.string().min(2, 'Ingresá tu nombre').max(100, 'Máximo 100 caracteres'),
  texto:        z.string().min(5, 'La opinión es muy corta').max(300, 'Máximo 300 caracteres'),
})

/* Colores del avatar según posición, usando la paleta del logo */
const AVATAR_COLORS = [
  'bg-brand-verde',
  'bg-brand-naranja',
  'bg-brand-celeste',
  'bg-brand-rosa',
  'bg-brand-azul-mid',
  'bg-purple-500',
]

function getInitials(nombre) {
  return nombre?.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('') ?? '?'
}

export function OpinionesSection() {
  const { opiniones, cargando } = useOpiniones()
  const [enviado, setEnviado]   = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(opinionSchema) })

  const textoActual = watch('texto') ?? ''

  const onSubmit = async (data) => {
    setEnviando(true)
    setErrorEnvio(null)
    try {
      const { error } = await supabase
        .from('opiniones')
        .insert({ autor_nombre: data.autor_nombre, texto: data.texto, estado: 'pendiente' })
      if (error) throw error
      setEnviado(true)
      reset()
    } catch (err) {
      console.error('Error al enviar opinión:', err)
      setErrorEnvio('No pudimos enviar tu opinión. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="py-16 md:py-20 bg-gray-50">
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
            Lo que dice nuestra comunidad
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Opiniones de familias y miembros de nuestra comunidad educativa.
          </p>
        </motion.div>

        {/* Grid de opiniones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {cargando
            ? [1, 2, 3].map(i => <SkeletonOpinion key={i} />)
            : opiniones.slice(0, 3).map((op, i) => (
                <OpinionCard key={op.id} opinion={op} colorIndex={i} delay={i * 0.1} />
              ))
          }
          {!cargando && opiniones.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-8">
              Sé el primero en compartir tu opinión sobre nuestra institución.
            </div>
          )}
        </div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-7 shadow-sm"
        >
          <h3 className="font-display font-bold text-gray-800 text-lg mb-1">
            Dejá tu opinión
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Tu opinión será revisada antes de publicarse.
          </p>

          {/* Confirmación tras envío */}
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle size={48} className="text-green-500" />
              <p className="font-semibold text-gray-800">¡Gracias por tu opinión!</p>
              <p className="text-sm text-gray-500">Fue enviada y está pendiente de aprobación.</p>
              <button
                onClick={() => setEnviado(false)}
                className="mt-2 text-sm text-brand-naranja hover:underline"
              >
                Enviar otra opinión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* Nombre */}
              <div>
                <label htmlFor="autor_nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="autor_nombre"
                  type="text"
                  placeholder="Ej: María González"
                  {...register('autor_nombre')}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${
                    errors.autor_nombre ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.autor_nombre && (
                  <p className="mt-1 text-xs text-red-500">{errors.autor_nombre.message}</p>
                )}
              </div>

              {/* Opinión */}
              <div>
                <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu opinión <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="texto"
                  rows={4}
                  placeholder="Compartí tu experiencia con nuestra institución..."
                  {...register('texto')}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul resize-none ${
                    errors.texto ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {/* Contador de caracteres */}
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-red-500">{errors.texto?.message}</p>
                  <p className={`text-xs ml-auto ${textoActual.length > 300 ? 'text-red-500 font-semibold' : textoActual.length >= 280 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {textoActual.length}/300
                  </p>
                </div>
              </div>

              {/* Error de envío */}
              {errorEnvio && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2.5">{errorEnvio}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={enviando}
              >
                <Send size={15} />
                Enviar opinión
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function OpinionCard({ opinion, colorIndex, delay }) {
  const avatarColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Estrellas decorativas */}
      <div className="flex gap-0.5 mb-4">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Texto */}
      <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">
        &ldquo;{opinion.texto}&rdquo;
      </p>

      {/* Autor */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
        <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-xs">{getInitials(opinion.autor_nombre)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{opinion.autor_nombre}</p>
          <p className="text-xs text-gray-400">{formatDateShort(opinion.created_at)}</p>
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonOpinion() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 animate-pulse">
      <div className="flex gap-1">{[1,2,3,4,5].map(s => <div key={s} className="w-3 h-3 rounded bg-gray-200"/>)}</div>
      <SkeletonLine width="full" />
      <SkeletonLine width="3/4" />
      <SkeletonLine width="full" />
      <div className="flex items-center gap-3 pt-3">
        <SkeletonAvatar size={9} />
        <div className="space-y-1.5 flex-1">
          <SkeletonLine width="1/2" />
          <SkeletonLine width="1/3" />
        </div>
      </div>
    </div>
  )
}
