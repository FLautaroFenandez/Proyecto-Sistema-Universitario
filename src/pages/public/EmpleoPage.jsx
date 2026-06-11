/**
 * @file EmpleoPage.jsx
 * @description Listado de búsquedas laborales activas (fecha_limite >= hoy Y activo = true).
 * Si no hay avisos, muestra formulario para dejar CV.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

const cvSchema = z.object({
  nombre: z.string().min(2, 'Requerido'),
  email:  z.string().email('Email inválido'),
  area:   z.string().min(1, 'Seleccioná un área'),
  cv_link:z.string().url('Ingresá un enlace válido (Google Drive, LinkedIn, etc.)').optional().or(z.literal('')),
})

function diasRestantes(fecha) {
  const diff = new Date(fecha) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function EmpleoPage() {
  const [empleos, setEmpleos]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [cvEnviado, setCvEnviado] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(cvSchema) })

  useEffect(() => {
    window.scrollTo(0, 0)
    async function fetchEmpleos() {
      const hoy = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('empleos')
        .select('id, titulo, descripcion, requisitos, contacto_email, fecha_limite, created_at')
        .eq('activo', true)
        .gte('fecha_limite', hoy)
        .order('created_at', { ascending: false })
      setEmpleos(data ?? [])
      setCargando(false)
    }
    fetchEmpleos()
  }, [])

  const onCvSubmit = async (data) => {
    // Se guarda como mensaje de contacto: el admin lo ve junto a las demás consultas
    const { error } = await supabase.from('contacto_mensajes').insert({
      nombre: data.nombre,
      email:  data.email,
      asunto: `Empleo — CV (área: ${data.area})`,
      mensaje: data.cv_link
        ? `Postulación espontánea.\nÁrea de interés: ${data.area}\nCV: ${data.cv_link}`
        : `Postulación espontánea.\nÁrea de interés: ${data.area}\n(Sin enlace a CV — contactar por email)`,
    })
    if (error) {
      console.error('Error al enviar CV:', error)
      return
    }
    setCvEnviado(true)
  }

  const VENTAJAS = [
    { emoji:'🎓', texto:'Capacitación continua y desarrollo profesional' },
    { emoji:'🏋️', texto:'Acceso a las instalaciones deportivas del centro' },
    { emoji:'👨‍👩‍👧', texto:'Descuentos en aranceles para hijos del personal' },
    { emoji:'🌟', texto:'Ambiente de trabajo colaborativo e innovador' },
  ]

  return (
    <>
      <PageHero
        titulo="Oportunidades de Empleo"
        subtitulo="Formá parte del equipo del Centro Educativo Educar para Transformar."
        breadcrumb={[{ label: 'Empleo' }]}
      />

      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-6">

          {cargando && (
            <div className="space-y-4 animate-pulse">
              {[1,2].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl" />)}
            </div>
          )}

          {/* Avisos activos */}
          {!cargando && empleos.length > 0 && (
            <div className="space-y-5">
              {empleos.map((emp, i) => {
                const dias = diasRestantes(emp.fecha_limite)
                return (
                  <motion.div key={emp.id}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-brand-naranja bg-orange-50 px-2.5 py-1 rounded-full">Docente</span>
                        <h2 className="font-display font-bold text-gray-800 text-xl mt-2">{emp.titulo}</h2>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${dias <= 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        <Clock size={12} />
                        {dias === 0 ? 'Vence hoy' : `Quedan ${dias} día${dias !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{emp.descripcion}</p>
                    {emp.requisitos && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Requisitos</p>
                        <ul className="space-y-1.5">
                          {emp.requisitos.split('\n').filter(Boolean).map(r => (
                            <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-brand-verde mt-0.5">✓</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5"><Calendar size={12} />Cierre: {new Date(emp.fecha_limite).toLocaleDateString('es-AR')}</span>
                      <a href={`mailto:${emp.contacto_email}?subject=Postulación - ${emp.titulo}`}
                        className="flex items-center gap-1.5 bg-brand-naranja text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors ml-auto">
                        <Mail size={13} /> Postularme
                      </a>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Sin avisos activos */}
          {!cargando && empleos.length === 0 && (
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="text-center md:text-left mb-8">
                  <span className="text-5xl block mb-4">💼</span>
                  <h2 className="font-display font-bold text-gray-800 text-xl mb-2">Sin búsquedas activas</h2>
                  <p className="text-gray-500">Actualmente no tenemos búsquedas abiertas, pero podés dejarnos tu CV para futuras oportunidades.</p>
                </div>
                <div className="space-y-3">
                  {VENTAJAS.map(v => (
                    <div key={v.texto} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="text-2xl">{v.emoji}</span>{v.texto}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                {cvEnviado ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-gray-800">¡Gracias por tu interés!</p>
                    <p className="text-sm text-gray-500 mt-1">Te contactaremos cuando haya una oportunidad.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-display font-bold text-gray-800 mb-5">Dejá tu CV</h3>
                    <form onSubmit={handleSubmit(onCvSubmit)} noValidate className="space-y-4">
                      {[
                        { name:'nombre', label:'Nombre completo', type:'text', placeholder:'Tu nombre' },
                        { name:'email',  label:'Email',           type:'email',placeholder:'tu@email.com' },
                        { name:'cv_link',label:'Enlace al CV (opcional)', type:'url', placeholder:'https://...' },
                      ].map(({ name, label, type, placeholder }) => (
                        <div key={name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                          <input type={type} placeholder={placeholder} {...register(name)}
                            className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul transition-colors ${errors[name] ? 'border-red-400':'border-gray-300'}`} />
                          {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área de interés</label>
                        <select {...register('area')} className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none ${errors.area?'border-red-400':'border-gray-300'}`}>
                          <option value="">Seleccioná</option>
                          <option value="docente">Docente</option>
                          <option value="administrativo">Administrativo</option>
                          <option value="servicio">Servicio y mantenimiento</option>
                        </select>
                        {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>}
                      </div>
                      <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
                        <Send size={14} /> Enviar
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Por qué trabajar con nosotros */}
          {empleos.length > 0 && (
            <div className="mt-14 bg-brand-azul/5 rounded-2xl p-8">
              <h3 className="font-display font-bold text-brand-azul text-lg mb-5">¿Por qué trabajar con nosotros?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {VENTAJAS.map(v => (
                  <div key={v.texto} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-2xl">{v.emoji}</span>{v.texto}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
