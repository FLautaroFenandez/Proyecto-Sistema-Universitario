/**
 * @file DashboardEstudiante.jsx
 * @description Dashboard para Estudiantes. Muestra noticias estudiantiles,
 * próximas actividades deportivas y acceso al servicio de apoyo.
 */

import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, Trophy, BookOpen, Heart, ArrowRight, Phone } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { useNoticias } from '@/hooks/useNoticias'
import { formatDateShort } from '@/utils/formatDate'
import { SkeletonCard } from '@/components/ui/Skeleton'

function hora() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const ACTIVIDADES = [
  { emoji: '🏊', deporte: 'Natación',  info: 'Práctica libre — Pileta cubierta' },
  { emoji: '⚽', deporte: 'Fútbol',    info: 'Entrenamiento — Cancha 2' },
  { emoji: '🏀', deporte: 'Básquet',   info: 'Torneo interno — Gimnasio' },
  { emoji: '♟️', deporte: 'Ajedrez',   info: 'Club semanal — Sala de juegos' },
]

export function DashboardEstudiante() {
  const { profile } = useContext(AuthContext)
  const { noticias, cargando } = useNoticias({ limite: 3, soloPublicas: false })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Saludo */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gray-400 text-sm">{hora()},</p>
        <h1 className="font-display font-bold text-gray-800 text-2xl">
          {profile?.nombre?.split(' ')[0] ?? 'Estudiante'} 🎓
        </h1>
        <div className="mt-1">
          <span className="bg-brand-celeste/15 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Portal Estudiantil</span>
        </div>
      </motion.div>

      {/* Banner de bienvenida */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #29ABE2 100%)' }}
      >
        <div className="px-7 py-6 relative">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none">🎓</div>
          <h2 className="font-display font-bold text-white text-xl mb-1">Bienvenido al portal estudiantil</h2>
          <p className="text-white/75 text-sm">Accedé a noticias, actividades y recursos del Centro Educativo.</p>
        </div>
      </motion.div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Newspaper, label: 'Noticias',      href: '/noticias',   color: 'text-blue-600 bg-blue-50' },
          { icon: Trophy,    label: 'Deportes',       href: '/bienestar',  color: 'text-orange-600 bg-orange-50' },
          { icon: BookOpen,  label: 'Info académica', href: '/niveles-educativos', color: 'text-green-600 bg-green-50' },
          { icon: Heart,     label: 'Apoyo escolar',  href: '/bienestar',  color: 'text-red-600 bg-red-50' },
        ].map(({ icon: Icon, label, href, color }) => (
          <Link key={label} to={href}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={18} />
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-azul transition-colors">{label}</span>
          </Link>
        ))}
      </div>

      {/* Noticias estudiantiles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-700 text-lg">Novedades</h2>
          <Link to="/noticias" className="text-xs text-brand-naranja hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cargando
            ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
            : noticias.map(n => (
                <Link key={n.id} to={`/noticias/${n.id}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center">
                    {n.imagen_url
                      ? <img src={n.imagen_url} alt={n.titulo} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <span className="text-4xl">📰</span>
                    }
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-xs text-gray-400 mb-1">{formatDateShort(n.created_at)}</p>
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-brand-azul transition-colors line-clamp-2">{n.titulo}</h3>
                  </div>
                </Link>
              ))
          }
          {!cargando && noticias.length === 0 && (
            <p className="col-span-3 text-gray-400 text-sm py-4">No hay novedades publicadas aún.</p>
          )}
        </div>
      </div>

      {/* Próximas actividades deportivas */}
      <div>
        <h2 className="font-display font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-brand-naranja" /> Actividades disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIVIDADES.map(a => (
            <div key={a.deporte} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
              <span className="text-3xl block mb-2">{a.emoji}</span>
              <p className="font-semibold text-gray-800 text-sm">{a.deporte}</p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">{a.info}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Servicio de apoyo */}
      <div className="bg-brand-verde/10 border border-brand-verde/25 rounded-2xl p-5 flex items-center gap-4">
        <span className="text-3xl flex-shrink-0">🧠</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">¿Necesitás ayuda o contención?</p>
          <p className="text-xs text-gray-500 mt-0.5">El servicio de apoyo estudiantil está disponible de lunes a viernes.</p>
        </div>
        <a href="tel:+5493625550100"
          className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-white border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex-shrink-0">
          <Phone size={12} /> Contactar
        </a>
      </div>
    </div>
  )
}
