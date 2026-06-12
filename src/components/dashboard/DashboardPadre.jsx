/**
 * @file DashboardPadre.jsx
 * @description Dashboard para Padres/Tutores. Muestra estado de inscripciones
 * de sus hijos, noticias para padres y acceso rápido al contacto institucional.
 */

import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, MessageCircle, Newspaper, PlusCircle, ArrowRight, CheckCircle, Clock, XCircle, Search } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { useNoticias } from '@/hooks/useNoticias'
import { formatDateShort } from '@/utils/formatDate'
import { Badge } from '@/components/ui/Badge'

const ESTADO_CONFIG = {
  pendiente:   { icon: Clock,        color: 'orange', label: 'Pendiente de revisión',  bg: 'bg-orange-50', iconClass: 'text-orange-500' },
  en_revision: { icon: Search,       color: 'blue',   label: 'En revisión',             bg: 'bg-blue-50',   iconClass: 'text-blue-500' },
  aceptada:    { icon: CheckCircle,  color: 'green',  label: '¡Aceptada! 🎉',           bg: 'bg-green-50',  iconClass: 'text-green-500' },
  rechazada:   { icon: XCircle,      color: 'red',    label: 'No aceptada',             bg: 'bg-red-50',    iconClass: 'text-red-500' },
}

function hora() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardPadre() {
  const { profile, user } = useContext(AuthContext)
  const [inscripciones, setInscripciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const { noticias } = useNoticias({ limite: 2, soloPublicas: false })

  useEffect(() => {
    /* Las solicitudes se vinculan por email: el padre ve las inscripciones
       cuyo tutor_email coincide con el email de su cuenta (también lo
       garantiza la política RLS "padre_ve_sus_inscripciones"). */
    async function fetchInscripciones() {
      if (!user?.email) { setCargando(false); return }
      const { data } = await supabase
        .from('inscripciones')
        .select('id, estudiante_nombre, nivel, estado, created_at')
        .eq('tutor_email', user.email)
        .order('created_at', { ascending: false })
        .limit(5)
      setInscripciones(data ?? [])
      setCargando(false)
    }
    fetchInscripciones()
  }, [user?.email])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* Saludo */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gray-400 text-sm">{hora()},</p>
        <h1 className="font-display font-bold text-gray-800 text-2xl">
          {profile?.nombre?.split(' ')[0] ?? 'Bienvenido'} 👨‍👩‍👧
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-brand-verde/15 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Portal de Padres</span>
        </div>
      </motion.div>

      {/* Estado de inscripciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-700 text-lg flex items-center gap-2">
            <ClipboardList size={19} className="text-brand-naranja" /> Solicitudes de inscripción
          </h2>
          <Link to="/inscripcion"
            className="flex items-center gap-1.5 text-sm text-brand-naranja font-semibold hover:underline">
            <PlusCircle size={14} /> Nueva solicitud
          </Link>
        </div>

        {cargando ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
          </div>
        ) : inscripciones.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <ClipboardList size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-1">Todavía no tenés solicitudes de inscripción.</p>
            <p className="text-gray-400 text-xs mb-4">Completá el formulario con tu email ({profile?.nombre ? user?.email : 'el de tu cuenta'}) para ver el estado acá.</p>
            <Link to="/inscripcion"
              className="inline-flex items-center gap-2 bg-brand-naranja text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-700 transition-colors">
              <PlusCircle size={15} /> Solicitar inscripción
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {inscripciones.map(ins => {
              const cfg = ESTADO_CONFIG[ins.estado] ?? ESTADO_CONFIG.pendiente
              const Icon = cfg.icon
              return (
                <motion.div key={ins.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 ${cfg.bg} rounded-2xl border border-gray-100 p-4`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <Icon size={18} className={cfg.iconClass} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{ins.estudiante_nombre}</p>
                    <p className="text-xs text-gray-500 capitalize">{ins.nivel} · {formatDateShort(ins.created_at)}</p>
                  </div>
                  <Badge color={cfg.color}>{cfg.label}</Badge>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Grid de accesos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Newspaper,      label: 'Noticias para padres', desc: 'Comunicados y novedades', href: '/noticias',    color: 'text-blue-600 bg-blue-50' },
          { icon: MessageCircle,  label: 'Contacto WhatsApp',    desc: '+54 9 362 555-0101',       href: 'https://wa.me/5493625550101', color: 'text-green-600 bg-green-50', externo: true },
          { icon: PlusCircle,     label: 'Nueva inscripción',    desc: 'Solicitar para otro hijo', href: '/inscripcion', color: 'text-orange-600 bg-orange-50' },
        ].map(({ icon: Icon, label, desc, href, color, externo }) => (
          externo
            ? <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}><Icon size={20} /></div>
                <div><p className="font-semibold text-sm text-gray-800 group-hover:text-brand-azul transition-colors">{label}</p><p className="text-xs text-gray-400">{desc}</p></div>
                <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-brand-azul" />
              </a>
            : <Link key={label} to={href}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}><Icon size={20} /></div>
                <div><p className="font-semibold text-sm text-gray-800 group-hover:text-brand-azul transition-colors">{label}</p><p className="text-xs text-gray-400">{desc}</p></div>
                <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-brand-azul" />
              </Link>
        ))}
      </div>

      {/* Noticias recientes */}
      {noticias.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-gray-700 text-lg mb-4">Últimas novedades</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {noticias.map(n => (
              <Link key={n.id} to={`/noticias/${n.id}`}
                className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {n.imagen_url
                    ? <img src={n.imagen_url} alt={n.titulo} loading="lazy" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">{formatDateShort(n.created_at)}</p>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-azul transition-colors line-clamp-2 leading-tight">{n.titulo}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
