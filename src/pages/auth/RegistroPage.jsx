/**
 * @file RegistroPage.jsx
 * @description Registro exclusivo para Padres y Estudiantes (el personal lo crea el admin).
 * Mismo layout split que LoginPage. Indicador de fortaleza de contraseña en tiempo real.
 */

import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Phone, CreditCard, AlertCircle } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'

const registroSchema = z.object({
  nombre:    z.string().min(2, 'Nombre requerido').max(100),
  dni:       z.string().regex(/^\d{7,8}$/, 'DNI: solo números, 7 u 8 dígitos'),
  telefono:  z.string().min(6, 'Teléfono requerido'),
  email:     z.string().email('Email inválido'),
  password:  z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar: z.string(),
  rol:       z.enum(['padre', 'estudiante'], { required_error: 'Seleccioná un rol' }),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

/* Calcula la fortaleza de la contraseña de 0 a 4 */
function calcFortaleza(pass) {
  if (!pass) return 0
  let score = 0
  if (pass.length >= 8)              score++
  if (/[A-Z]/.test(pass))            score++
  if (/[0-9]/.test(pass))            score++
  if (/[^A-Za-z0-9]/.test(pass))     score++
  return score
}

const FORTALEZA_INFO = [
  { label: 'Muy débil', color: 'bg-red-500' },
  { label: 'Débil',     color: 'bg-orange-500' },
  { label: 'Regular',   color: 'bg-yellow-500' },
  { label: 'Fuerte',    color: 'bg-green-400' },
  { label: 'Muy fuerte',color: 'bg-green-600' },
]

export default function RegistroPage() {
  const [mostrarPass,    setMostrarPass]    = useState(false)
  const [mostrarConfirm, setMostrarConfirm] = useState(false)
  const [errorAuth,      setErrorAuth]      = useState(null)
  const { signUp, user, profile, loading } = useContext(AuthContext)
  const navigate    = useNavigate()

  /* Si ya hay sesión activa, no tiene sentido estar en /registro */
  useEffect(() => {
    if (loading || !user) return
    const esAdmin = profile?.rol === 'admin' || profile?.rol === 'autoridad'
    navigate(esAdmin ? '/admin' : '/dashboard', { replace: true })
  }, [user, profile, loading, navigate])

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: { rol: 'padre' },
  })

  const passActual  = watch('password') ?? ''
  const rolActual   = watch('rol')
  const fortaleza   = calcFortaleza(passActual)
  const fInfo       = FORTALEZA_INFO[fortaleza] ?? FORTALEZA_INFO[0]

  const onSubmit = async (data) => {
    setErrorAuth(null)
    try {
      await signUp(data.email, data.password, {
        nombre:   data.nombre,
        dni:      data.dni,
        telefono: data.telefono,
        rol:      data.rol,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg  = err?.message ?? ''
      const code = err?.code ?? ''
      if (msg.includes('already registered') || msg.includes('already exists') || code === 'user_already_exists') {
        setErrorAuth('Este email ya tiene una cuenta registrada. Probá iniciar sesión.')
      } else if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
        setErrorAuth('Se alcanzó el límite de registros por hora. Esperá unos minutos e intentá de nuevo.')
      } else if (msg.includes('profiles_dni_key') || msg.includes('duplicate key')) {
        setErrorAuth('Ese DNI ya está registrado con otra cuenta.')
      } else if (code === 'weak_password' || msg.includes('Password')) {
        setErrorAuth('La contraseña es muy débil. Usá al menos 8 caracteres con letras y números.')
      } else if (msg.includes('fetch') || msg.includes('network')) {
        setErrorAuth('No se pudo conectar con el servidor. Verificá tu conexión.')
      } else {
        setErrorAuth(`No pudimos crear tu cuenta: ${msg || 'error desconocido'}`)
      }
    }
  }

  const inputClass = (hasError) =>
    `w-full border rounded-xl py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${hasError ? 'border-red-400' : 'border-gray-200'}`

  return (
    <div className="min-h-screen flex">
      {/* ── Columna izquierda: branding ── */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2040 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 text-center max-w-xs"
        >
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg p-2">
            <img src="/assets/logo-ept.png" alt="Logo EPT" width={80} height={80}
              className="w-full h-full object-contain"
              onError={e => { e.currentTarget.style.display='none' }}
            />
          </div>
          <h1 className="font-display font-bold text-white text-2xl leading-tight mb-3">
            Creá tu cuenta
          </h1>
          <p className="text-white/60 text-sm mb-8">Accedé al portal de familias de Educar para Transformar.</p>

          <div className="space-y-3 text-left">
            {['Noticias internas exclusivas', 'Estado de solicitudes de inscripción', 'Comunicaciones institucionales', 'Acceso al portal de familias'].map(item => (
              <div key={item} className="flex items-center gap-2 text-white/75 text-sm">
                <span className="w-4 h-4 rounded-full bg-brand-naranja flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">✓</span>
                </span>
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Columna derecha: formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-brand-azul flex items-center justify-center">
              <span className="text-white font-bold text-xs">EPT</span>
            </div>
            <span className="font-display font-bold text-brand-azul">Educar para Transformar</span>
          </div>

          <h2 className="font-display font-bold text-gray-800 text-2xl mb-1">Crear cuenta</h2>
          <p className="text-gray-400 text-sm mb-6">Solo para padres y estudiantes.</p>

          {/* Selector de rol */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'padre',      label: 'Padre / Madre / Tutor', emoji: '👨‍👩‍👧' },
              { value: 'estudiante', label: 'Estudiante',             emoji: '🎓' },
            ].map(({ value, label, emoji }) => (
              <label key={value}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  rolActual === value ? 'border-brand-azul bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input type="radio" value={value} {...register('rol')} className="sr-only" />
                <span className="text-3xl">{emoji}</span>
                <span className={`text-xs font-semibold text-center leading-tight ${rolActual === value ? 'text-brand-azul' : 'text-gray-600'}`}>{label}</span>
              </label>
            ))}
          </div>
          {errors.rol && <p className="text-xs text-red-500 -mt-3 mb-4">{errors.rol.message}</p>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tu nombre y apellido" {...register('nombre')}
                  className={`${inputClass(!!errors.nombre)} pl-10`} />
              </div>
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
            </div>

            {/* DNI y Teléfono en fila */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI <span className="text-red-500">*</span></label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Sin puntos" {...register('dni')}
                    className={`${inputClass(!!errors.dni)} pl-10`} />
                </div>
                {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" placeholder="3624..." {...register('telefono')}
                    className={`${inputClass(!!errors.telefono)} pl-10`} />
                </div>
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="tu@email.com" {...register('email')}
                  className={`${inputClass(!!errors.email)} pl-10`} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Contraseña con indicador de fortaleza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={mostrarPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                  {...register('password')} className={`${inputClass(!!errors.password)} pl-10 pr-11`} />
                <button type="button" onClick={() => setMostrarPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle contraseña"
                >
                  {mostrarPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}

              {/* Indicador de fortaleza */}
              {passActual.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= fortaleza ? fInfo.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${fortaleza <= 1 ? 'text-red-500' : fortaleza <= 2 ? 'text-orange-500' : 'text-green-600'}`}>
                    {fInfo.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={mostrarConfirm ? 'text' : 'password'} placeholder="Repetí tu contraseña"
                  {...register('confirmar')} className={`${inputClass(!!errors.confirmar)} pl-10 pr-11`} />
                <button type="button" onClick={() => setMostrarConfirm(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle confirmar"
                >
                  {mostrarConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmar && <p className="text-xs text-red-500 mt-1">{errors.confirmar.message}</p>}
            </div>

            {/* Error de auth */}
            {errorAuth && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                <AlertCircle size={15} className="flex-shrink-0" />
                {errorAuth}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
              <UserPlus size={17} />
              Crear cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">¿Ya tenés cuenta? </span>
            <Link to="/login" className="text-sm font-semibold text-brand-naranja hover:underline">Iniciar sesión</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
