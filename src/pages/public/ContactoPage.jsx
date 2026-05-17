/**
 * @file ContactoPage.jsx
 * @description Formulario de contacto + info institucional + mapa de Google Maps.
 * El mensaje se guarda en la tabla contacto_mensajes de Supabase.
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, MessageCircle, Clock, CheckCircle, Send } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const contactoSchema = z.object({
  nombre:  z.string().min(2, 'Ingresá tu nombre'),
  email:   z.string().email('Email inválido'),
  asunto:  z.string().min(1, 'Seleccioná un asunto'),
  mensaje: z.string().min(10, 'El mensaje es muy corto').max(1000, 'Máximo 1000 caracteres'),
})

const INFO = [
  { icon: MapPin,        label: 'Dirección',   valor: 'Av. Lavalle 3500, Resistencia, Chaco', href: null },
  { icon: Phone,         label: 'Teléfono',    valor: '(0362) 555-0100', href: 'tel:+5493625550100' },
  { icon: Mail,          label: 'Email',        valor: 'info@educarparatransformar.edu.ar', href: 'mailto:info@educarparatransformar.edu.ar' },
  { icon: MessageCircle, label: 'WhatsApp',     valor: '+54 9 362 555-0101', href: 'https://wa.me/5493625550101' },
  { icon: Clock,         label: 'Atención',     valor: 'Lun–Vie 8:00 a 17:00 hs', href: null },
]

const REDES = [
  { label:'Instagram', href:'https://instagram.com/educarparatransformar', emoji:'📸' },
  { label:'Facebook',  href:'https://facebook.com/CentroEducarParaTransformar', emoji:'👍' },
]

export default function ContactoPage() {
  const [enviado, setEnviado]   = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(contactoSchema) })

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const onSubmit = async (data) => {
    setErrorEnvio(null)
    try {
      const { error } = await supabase
        .from('contacto_mensajes')
        .insert({ nombre: data.nombre, email: data.email, asunto: data.asunto, mensaje: data.mensaje })
      if (error) throw error
      setEnviado(true)
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      setErrorEnvio('No pudimos enviar tu mensaje. Intentá de nuevo o contactanos por WhatsApp.')
    }
  }

  const inputClass = (hasError) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${hasError ? 'border-red-400' : 'border-gray-300'}`

  return (
    <>
      <PageHero
        titulo="Contacto"
        subtitulo="Estamos para ayudarte. Escribinos y te respondemos en menos de 48 horas hábiles."
        breadcrumb={[{ label: 'Contacto' }]}
      />

      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* ── Formulario ── */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
            >
              <h2 className="font-display font-bold text-gray-800 text-xl mb-6">Envianos un mensaje</h2>

              {enviado ? (
                <div className="text-center py-10">
                  <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">¡Mensaje recibido!</h3>
                  <p className="text-gray-500 text-sm">Te respondemos en menos de 48 horas hábiles.</p>
                  <button onClick={() => setEnviado(false)} className="mt-5 text-sm text-brand-naranja hover:underline">
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Tu nombre completo"
                        {...register('nombre')} className={inputClass(!!errors.nombre)} />
                      {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input type="email" placeholder="tu@email.com"
                        {...register('email')} className={inputClass(!!errors.email)} />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto <span className="text-red-500">*</span></label>
                    <select {...register('asunto')} className={inputClass(!!errors.asunto)}>
                      <option value="">Seleccioná un asunto</option>
                      <option value="Consulta general">Consulta general</option>
                      <option value="Inscripción">Inscripción</option>
                      <option value="Empleo">Empleo</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {errors.asunto && <p className="text-xs text-red-500 mt-1">{errors.asunto.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje <span className="text-red-500">*</span></label>
                    <textarea rows={5} placeholder="Escribí tu consulta aquí..."
                      {...register('mensaje')} className={inputClass(!!errors.mensaje)} />
                    {errors.mensaje && <p className="text-xs text-red-500 mt-1">{errors.mensaje.message}</p>}
                  </div>
                  {errorEnvio && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{errorEnvio}</div>
                  )}
                  <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
                    <Send size={15} /> Enviar mensaje
                  </Button>
                </form>
              )}
            </motion.div>

            {/* ── Info + Mapa ── */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}
              className="space-y-6"
            >
              {/* Info de contacto */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-display font-bold text-gray-800 text-lg mb-5">Información de contacto</h2>
                <ul className="space-y-4">
                  {INFO.map(({ icon: Icon, label, valor, href }) => (
                    <li key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-brand-naranja" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        {href
                          ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="text-sm text-gray-700 hover:text-brand-azul transition-colors">{valor}</a>
                          : <p className="text-sm text-gray-700">{valor}</p>
                        }
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Redes */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-3">Redes sociales</p>
                  <div className="flex gap-3">
                    {REDES.map(r => (
                      <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 transition-colors">
                        <span>{r.emoji}</span>{r.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mapa embed — Resistencia, Chaco */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-64">
                <iframe
                  title="Ubicación del Centro Educativo"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57623.82093887705!2d-59.00716!3d-27.45129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450cff0ceddfd7%3A0x507ef83f7821b0f3!2sResistencia%2C%20Chaco!5e0!3m2!1ses!2sar!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
