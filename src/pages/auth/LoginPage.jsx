/**
 * @file LoginPage.jsx
 * @description Página de login sin Topbar/Navbar/Footer (layout propio).
 * Diseño split: izquierda con branding azul, derecha con formulario blanco.
 * En mobile solo muestra el formulario.
 */

import { useState, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'

const loginSchema = z.object({
  email:    z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export default function LoginPage() {
  const [mostrarPass, setMostrarPass] = useState(false)
  const [errorAuth,   setErrorAuth]   = useState(null)
  const { signIn }   = useContext(AuthContext)
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = location.state?.from?.pathname || null

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }) => {
    setErrorAuth(null)
    try {
      const { user } = await signIn(email, password)
      /* Esperar un tick para que el perfil se cargue en el contexto */
      await new Promise(r => setTimeout(r, 300))

      if (from) return navigate(from, { replace: true })

      /* Redirigir según rol (lo leemos del contexto después del signIn) */
      const { data } = await import('@/lib/supabase').then(m =>
        m.supabase.from('profiles').select('rol').eq('id', user.id).single()
      )
      const esAdmin = data?.rol === 'admin' || data?.rol === 'autoridad'
      navigate(esAdmin ? '/admin' : '/dashboard', { replace: true })
    } catch {
      setErrorAuth('Email o contraseña incorrectos. Verificá tus datos.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Columna izquierda: branding ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0F2040 100%)' }}
      >
        {/* Decorativos */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center max-w-sm"
        >
          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center mx-auto mb-6">
            <span className="font-display font-bold text-white text-2xl">EPT</span>
          </div>

          <h1 className="font-display font-bold text-white text-3xl leading-tight mb-3">
            Educar para Transformar
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Centro Educativo · Resistencia, Chaco
          </p>

          {/* Slogan */}
          <blockquote className="border-l-2 border-brand-naranja pl-4 text-left">
            <p className="text-white/75 text-sm italic leading-relaxed">
              "Inspiramos, desafiamos y empoderamos a todos nuestros alumnos a ser miembros comprometidos y éticos de una comunidad global."
            </p>
          </blockquote>

          {/* Pills decorativas */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['Nivel Inicial', 'Nivel Primario', 'Nivel Secundario'].map(l => (
              <span key={l} className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">{l}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Columna derecha: formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-brand-azul flex items-center justify-center">
              <span className="text-white font-bold text-xs">EPT</span>
            </div>
            <span className="font-display font-bold text-brand-azul">Educar para Transformar</span>
          </div>

          <h2 className="font-display font-bold text-gray-800 text-2xl mb-1">Bienvenido de vuelta</h2>
          <p className="text-gray-400 text-sm mb-8">Ingresá con tu cuenta institucional.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setMostrarPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Error de auth */}
            {errorAuth && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                <AlertCircle size={15} className="flex-shrink-0" />
                {errorAuth}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
              <LogIn size={17} />
              Ingresar
            </Button>

            <p className="text-center text-xs text-gray-400">
              <Link to="/" className="hover:text-brand-azul hover:underline">¿Olvidaste tu contraseña?</Link>
            </p>
          </form>

          {/* Separador */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">¿No tenés cuenta?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link to="/registro"
            className="flex items-center justify-center w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Registrarse como Padre o Estudiante
          </Link>

          <p className="text-center text-xs text-gray-400 mt-4">
            El acceso para docentes y personal es creado por la administración.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
