/**
 * @file DashboardPersonal.jsx
 * @description Dashboard para Docentes y Personal administrativo.
 * Muestra noticias internas recientes y accesos útiles.
 */

import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, Calendar, ArrowRight, Phone } from 'lucide-react'
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

export function DashboardPersonal() {
  const { profile } = useContext(AuthContext)
  const { noticias, cargando } = useNoticias({ limite: 3, soloPublicas: false })

  const rol = profile?.rol === 'docente' ? 'Docente' : 'Personal administrativo'

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Saludo */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gray-400 text-sm">{hora()},</p>
        <h1 className="font-display font-bold text-gray-800 text-2xl">
          {profile?.nombre?.split(' ')[0] ?? 'Bienvenido'} 👋
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-brand-azul/10 text-brand-azul text-xs font-semibold px-2.5 py-0.5 rounded-full">{rol}</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Bienvenido al portal institucional de Educar para Transformar.
        </p>
      </motion.div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            icon: Newspaper,
            label: 'Noticias internas',
            desc: 'Comunicados y novedades institucionales',
            href: '/noticias',
            color: 'text-blue-600 bg-blue-50',
          },
          {
            icon: Calendar,
            label: 'Calendario académico',
            desc: 'Próximas fechas y eventos del ciclo',
            href: '/noticias',
            color: 'text-green-600 bg-green-50',
          },
        ].map(({ icon: Icon, label, desc, href, color }) => (
          <Link key={href + label} to={href}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 group-hover:text-brand-azul transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-gray-300 group-hover:text-brand-azul transition-colors" />
          </Link>
        ))}
      </div>

      {/* Noticias internas recientes */}
      <div>
        <h2 className="font-display font-bold text-gray-700 text-lg mb-4">Novedades institucionales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cargando
            ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
            : noticias.map(n => (
                <Link key={n.id} to={`/noticias/${n.id}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    {n.imagen_url
                      ? <img src={n.imagen_url} alt={n.titulo} loading="lazy" className="w-full h-full object-cover" />
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

      {/* Nota informativa */}
      <div className="bg-brand-azul/5 border border-brand-azul/15 rounded-2xl p-5 flex items-start gap-3">
        <Phone size={18} className="text-brand-azul flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Para consultas sobre acceso adicional o permisos, contactá a la administración al{' '}
          <a href="tel:+5493625550100" className="font-semibold text-brand-azul hover:underline">(0362) 555-0100</a>.
        </p>
      </div>
    </div>
  )
}
