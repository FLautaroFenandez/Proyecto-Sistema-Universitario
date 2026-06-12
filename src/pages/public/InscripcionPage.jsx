/**
 * @file InscripcionPage.jsx
 * @description Formulario completo de solicitud de inscripción (sin login requerido).
 * Validación con React Hook Form + Zod. Al enviar: INSERT en tabla inscripciones.
 * Pantalla de confirmación con número de solicitud al finalizar.
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CheckCircle, Phone, Mail, MessageCircle, Clock } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

/* ── Rangos de edad permitidos por nivel educativo ── */
const RANGOS_NIVEL = {
  inicial:    { min: 2,  max: 5,  label: 'Inicial',    rango: '3 a 5 años' },
  primario:   { min: 6,  max: 12, label: 'Primario',   rango: '6 a 12 años' },
  secundario: { min: 13, max: 18, label: 'Secundario', rango: '13 a 18 años' },
}

/* Edad cumplida a la fecha de hoy */
function calcularEdad(fechaNacimiento) {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

/* ── Esquema Zod ── */
const inscripcionSchema = z.object({
  estudiante_nombre:     z.string().min(1, 'El nombre es requerido').min(2, 'Nombre muy corto').max(100),
  estudiante_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida').refine(v => new Date(v) < new Date(), 'La fecha no puede ser futura'),
  estudiante_dni:        z.string().min(1, 'El DNI es requerido').regex(/^\d{7,8}$/, 'El DNI debe ser numérico, de 7 u 8 dígitos'),
  nivel:                 z.enum(['inicial','primario','secundario'], { required_error: 'Seleccioná un nivel' }),
  turno:                 z.enum(['manana','tarde'], { required_error: 'Seleccioná un turno' }),
  tutor_nombre:          z.string().min(1, 'El nombre del tutor es requerido').min(2, 'Nombre muy corto').max(100),
  tutor_dni:             z.string().min(1, 'El DNI del tutor es requerido').regex(/^\d{7,8}$/, 'El DNI debe ser numérico, de 7 u 8 dígitos'),
  tutor_relacion:        z.enum(['padre','madre','tutor'], { required_error: 'Requerido' }),
  tutor_telefono:        z.string().min(1, 'El teléfono es requerido').min(6, 'Teléfono inválido'),
  tutor_email:           z.string().min(1, 'El email es requerido').email('Email inválido'),
  como_conocio:          z.string().optional(),
  observaciones:         z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  /* Validación cruzada: la edad del estudiante debe ser compatible con el nivel */
  if (!data.estudiante_nacimiento || !data.nivel) return
  const edad  = calcularEdad(data.estudiante_nacimiento)
  const rango = RANGOS_NIVEL[data.nivel]
  if (rango && (edad < rango.min || edad > rango.max)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nivel'],
      message: `La edad del estudiante (${edad} años) no es compatible con el nivel ${rango.label} (${rango.rango}).`,
    })
  }
})

/* Componente de campo de formulario */
function Campo({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputClass = (hasError) =>
  `w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${hasError ? 'border-red-400' : 'border-gray-300'}`

export default function InscripcionPage() {
  const [enviado, setEnviado]     = useState(false)
  const [idSolicitud, setIdSolicitud] = useState('')
  const [errorEnvio, setErrorEnvio]   = useState(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(inscripcionSchema),
  })

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const onSubmit = async (data) => {
    setErrorEnvio(null)
    // Generamos el ID acá para no necesitar SELECT después del INSERT
    // (RLS no permite SELECT a usuarios anónimos en inscripciones)
    const solicitudId = crypto.randomUUID()
    try {
      const { error } = await supabase
        .from('inscripciones')
        .insert({
          id:                    solicitudId,
          estudiante_nombre:     data.estudiante_nombre,
          estudiante_nacimiento: data.estudiante_nacimiento,
          estudiante_dni:        data.estudiante_dni,
          nivel:                 data.nivel,
          turno:                 data.turno,
          tutor_nombre:          data.tutor_nombre,
          tutor_dni:             data.tutor_dni,
          tutor_relacion:        data.tutor_relacion,
          tutor_telefono:        data.tutor_telefono,
          tutor_email:           data.tutor_email,
          observaciones:         data.observaciones || null,
          estado:                'pendiente',
        })
      if (error) throw error
      setIdSolicitud(solicitudId.slice(0, 8).toUpperCase())
      setEnviado(true)
    } catch (err) {
      console.error('Error al enviar inscripción:', err)
      setErrorEnvio('No pudimos enviar tu solicitud. Intentá de nuevo o contactanos directamente.')
    }
  }

  if (enviado) return (
    <>
      <PageHero titulo="Solicitud enviada" breadcrumb={[{ label: 'Inscripción' }]} />
      <div className="py-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4 bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
          <CheckCircle size={60} className="text-green-500 mx-auto mb-5" />
          <h2 className="font-display font-bold text-gray-800 text-2xl mb-2">¡Solicitud recibida!</h2>
          <p className="text-gray-500 mb-4">Te contactaremos pronto al email que ingresaste.</p>
          <div className="bg-gray-50 rounded-xl px-6 py-4 mb-6">
            <p className="text-xs text-gray-400 mb-1">Número de solicitud</p>
            <p className="font-display font-bold text-brand-azul text-xl">#{idSolicitud}</p>
          </div>
          <p className="text-xs text-gray-400">Guardá este número como referencia.</p>
        </motion.div>
      </div>
    </>
  )

  return (
    <>
      <PageHero
        titulo="Solicitud de Inscripción"
        subtitulo="Completá el formulario y nos comunicaremos con vos a la brevedad."
        breadcrumb={[{ label: 'Inscripción' }]}
      />

      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* ── Formulario ── */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

                {/* Sección A */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-display font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-azul text-white text-xs flex items-center justify-center font-bold">A</span>
                    Datos del estudiante
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Campo label="Nombre completo" error={errors.estudiante_nombre?.message} required>
                        <input type="text" placeholder="Nombre y apellido del estudiante"
                          {...register('estudiante_nombre')} className={inputClass(!!errors.estudiante_nombre)} />
                      </Campo>
                    </div>
                    <Campo label="Fecha de nacimiento" error={errors.estudiante_nacimiento?.message} required>
                      <input type="date" {...register('estudiante_nacimiento')} className={inputClass(!!errors.estudiante_nacimiento)} />
                    </Campo>
                    <Campo label="DNI" error={errors.estudiante_dni?.message} required>
                      <input type="text" placeholder="Sin puntos ni espacios"
                        {...register('estudiante_dni')} className={inputClass(!!errors.estudiante_dni)} />
                    </Campo>
                    <Campo label="Nivel educativo" error={errors.nivel?.message} required>
                      <select {...register('nivel')} className={inputClass(!!errors.nivel)}>
                        <option value="">Seleccioná un nivel</option>
                        <option value="inicial">Nivel Inicial</option>
                        <option value="primario">Nivel Primario</option>
                        <option value="secundario">Nivel Secundario</option>
                      </select>
                    </Campo>
                    <Campo label="Turno preferido" error={errors.turno?.message} required>
                      <div className="flex gap-3 mt-1">
                        {[['manana','🌅 Mañana'],['tarde','🌇 Tarde']].map(([val, lbl]) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value={val} {...register('turno')} className="accent-brand-azul" />
                            <span className="text-sm text-gray-700">{lbl}</span>
                          </label>
                        ))}
                      </div>
                      {errors.turno && <p className="mt-1 text-xs text-red-500">{errors.turno.message}</p>}
                    </Campo>
                  </div>
                </div>

                {/* Sección B */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-display font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-naranja text-white text-xs flex items-center justify-center font-bold">B</span>
                    Datos del padre / tutor
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Campo label="Nombre completo del tutor" error={errors.tutor_nombre?.message} required>
                        <input type="text" placeholder="Nombre y apellido"
                          {...register('tutor_nombre')} className={inputClass(!!errors.tutor_nombre)} />
                      </Campo>
                    </div>
                    <Campo label="DNI del tutor" error={errors.tutor_dni?.message} required>
                      <input type="text" placeholder="Sin puntos"
                        {...register('tutor_dni')} className={inputClass(!!errors.tutor_dni)} />
                    </Campo>
                    <Campo label="Relación con el estudiante" error={errors.tutor_relacion?.message} required>
                      <select {...register('tutor_relacion')} className={inputClass(!!errors.tutor_relacion)}>
                        <option value="">Seleccioná</option>
                        <option value="padre">Padre</option>
                        <option value="madre">Madre</option>
                        <option value="tutor">Tutor Legal</option>
                      </select>
                    </Campo>
                    <Campo label="Teléfono de contacto" error={errors.tutor_telefono?.message} required>
                      <input type="tel" placeholder="Ej: 3624123456"
                        {...register('tutor_telefono')} className={inputClass(!!errors.tutor_telefono)} />
                    </Campo>
                    <Campo label="Email de contacto" error={errors.tutor_email?.message} required>
                      <input type="email" placeholder="tumail@ejemplo.com"
                        {...register('tutor_email')} className={inputClass(!!errors.tutor_email)} />
                    </Campo>
                  </div>
                </div>

                {/* Sección C */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="font-display font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-brand-verde text-white text-xs flex items-center justify-center font-bold">C</span>
                    Información adicional
                  </h2>
                  <div className="space-y-5">
                    <Campo label="¿Cómo nos conoció?">
                      <select {...register('como_conocio')} className={inputClass(false)}>
                        <option value="">Seleccioná (opcional)</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="recomendacion">Recomendación</option>
                        <option value="otro">Otro</option>
                      </select>
                    </Campo>
                    <Campo label="Observaciones" error={errors.observaciones?.message}>
                      <textarea rows={3} placeholder="Información adicional relevante (opcional)"
                        {...register('observaciones')} className={inputClass(!!errors.observaciones)} />
                    </Campo>
                  </div>
                </div>

                {errorEnvio && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">{errorEnvio}</div>
                )}

                <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
                  Enviar solicitud de inscripción
                </Button>
              </form>
            </div>

            {/* ── Info lateral ── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-display font-bold text-gray-800 mb-4">¿Por qué elegirnos?</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {['Jornada extendida en los 3 niveles','3 idiomas: Inglés, Portugués y Francés','8 disciplinas deportivas disponibles','Instalaciones de primer nivel en Resistencia'].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-brand-verde mt-0.5 flex-shrink-0">✓</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-brand-azul/5 rounded-2xl border border-brand-azul/20 p-6">
                  <h3 className="font-display font-bold text-brand-azul mb-4">Consultas</h3>
                  <div className="space-y-3 text-sm">
                    <a href="tel:+5493625550100" className="flex items-center gap-2 text-gray-600 hover:text-brand-azul">
                      <Phone size={14} className="text-brand-naranja" />(0362) 555-0100
                    </a>
                    <a href="mailto:info@educarparatransformar.edu.ar" className="flex items-center gap-2 text-gray-600 hover:text-brand-azul">
                      <Mail size={14} className="text-brand-naranja" />info@educarparatransformar.edu.ar
                    </a>
                    <a href="https://wa.me/5493625550101" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-brand-azul">
                      <MessageCircle size={14} className="text-brand-naranja" />+54 9 362 555-0101
                    </a>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={14} className="text-brand-naranja" />Lun–Vie 8:00 a 17:00 hs
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
