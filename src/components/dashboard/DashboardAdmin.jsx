/**
 * @file DashboardAdmin.jsx
 * @description Dashboard para Admin y Autoridad. Muestra métricas del sistema,
 * accesos rápidos al panel y tabla de últimas inscripciones pendientes.
 */

import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageSquare, ClipboardList, Newspaper, Briefcase,
  Image, Users, ArrowRight, TrendingUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { formatDateShort } from '@/utils/formatDate'
import { ROLES } from '@/types/roles'

const ESTADO_COLOR = {
  pendiente:   'orange',
  en_revision: 'blue',
  aceptada:    'green',
  rechazada:   'red',
}

const ACCESOS = [
  { icon: MessageSquare, label: 'Moderar opiniones',  href: '/admin/opiniones',     color: 'text-purple-600 bg-purple-50' },
  { icon: Newspaper,     label: 'Gestionar noticias', href: '/admin/noticias',      color: 'text-blue-600 bg-blue-50' },
  { icon: Image,         label: 'Gestionar galería',  href: '/admin/galeria',       color: 'text-teal-600 bg-teal-50' },
  { icon: ClipboardList, label: 'Ver inscripciones',  href: '/admin/inscripciones', color: 'text-orange-600 bg-orange-50' },
  { icon: Briefcase,     label: 'Gestionar empleos',  href: '/admin/empleos',       color: 'text-green-600 bg-green-50' },
  { icon: Users,         label: 'Gestionar usuarios', href: '/admin/usuarios',      color: 'text-red-600 bg-red-50', soloAdmin: true },
]

function hora() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardAdmin() {
  const { profile } = useContext(AuthContext)
  const esAdmin = profile?.rol === ROLES.ADMIN

  const [stats, setStats] = useState({ opiniones: 0, inscripciones: 0, noticias: 0, empleos: 0 })
  const [ultimasInscripciones, setUltimasInscripciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const hoy = new Date().toISOString().split('T')[0]

      const [op, insc, not, emp, ultInsc] = await Promise.all([
        supabase.from('opiniones').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('inscripciones').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('noticias').select('id', { count: 'exact', head: true }).eq('publicada', true),
        supabase.from('empleos').select('id', { count: 'exact', head: true }).eq('activo', true).gte('fecha_limite', hoy),
        supabase.from('inscripciones').select('id, estudiante_nombre, nivel, tutor_email, estado, created_at')
          .order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        opiniones:     op.count ?? 0,
        inscripciones: insc.count ?? 0,
        noticias:      not.count ?? 0,
        empleos:       emp.count ?? 0,
      })
      setUltimasInscripciones(ultInsc.data ?? [])
      setCargando(false)
    }
    fetchData()
  }, [])

  const METRICAS = [
    { label: 'Opiniones pendientes',      valor: stats.opiniones,     icon: MessageSquare, color: 'text-purple-600 bg-purple-50', href: '/admin/opiniones' },
    { label: 'Inscripciones pendientes',  valor: stats.inscripciones, icon: ClipboardList, color: 'text-orange-600 bg-orange-50', href: '/admin/inscripciones' },
    { label: 'Noticias publicadas',       valor: stats.noticias,      icon: Newspaper,     color: 'text-blue-600 bg-blue-50',     href: '/admin/noticias' },
    { label: 'Empleos activos',           valor: stats.empleos,       icon: Briefcase,     color: 'text-green-600 bg-green-50',   href: '/admin/empleos' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

      {/* Saludo */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gray-400 text-sm">{hora()},</p>
        <h1 className="font-display font-bold text-gray-800 text-2xl md:text-3xl">
          {profile?.nombre?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Panel de administración — {new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </motion.div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICAS.map(({ label, valor, icon: Icon, color, href }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          >
            <Link to={href} className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon size={18} />
              </div>
              <p className="font-display font-bold text-gray-800 text-2xl">
                {cargando ? <span className="block w-8 h-7 bg-gray-200 rounded animate-pulse" /> : valor}
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-tight">{label}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-brand-naranja opacity-0 group-hover:opacity-100 transition-opacity">
                Ver todos <ArrowRight size={11} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="font-display font-bold text-gray-700 text-lg mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ACCESOS.filter(a => !a.soloAdmin || esAdmin).map(({ icon: Icon, label, href, color }) => (
            <Link key={href} to={href}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={17} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-brand-azul transition-colors">{label}</span>
              <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-brand-azul transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Tabla últimas inscripciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-700 text-lg">Últimas inscripciones</h2>
          <Link to="/admin/inscripciones" className="text-xs text-brand-naranja hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={11} />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Estudiante', 'Nivel', 'Email tutor', 'Fecha', 'Estado'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cargando
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-5 py-3.5"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                        ))}
                      </tr>
                    ))
                  : ultimasInscripciones.map(ins => (
                      <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-800">{ins.estudiante_nombre}</td>
                        <td className="px-5 py-3.5 text-gray-500 capitalize">{ins.nivel}</td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">{ins.tutor_email}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDateShort(ins.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <Badge color={ESTADO_COLOR[ins.estado] ?? 'gray'}>
                            {ins.estado.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))
                }
                {!cargando && ultimasInscripciones.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No hay inscripciones aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enlace al panel */}
      <div className="text-center">
        <Link to="/admin"
          className="inline-flex items-center gap-2 bg-brand-azul text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-azul-dark transition-colors">
          <TrendingUp size={17} /> Ir al panel de administración
        </Link>
      </div>
    </div>
  )
}
