/**
 * @file AdminPage.jsx
 * @description Pantalla principal del panel admin. Métricas globales del sistema,
 * tabla de últimas inscripciones y opiniones pendientes con acciones rápidas.
 */

import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ClipboardList, Newspaper, Briefcase, CheckCircle, XCircle, ArrowRight, Inbox } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { StatsCard } from '@/components/admin/StatsCard'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateShort } from '@/utils/formatDate'
import { truncateText } from '@/utils/truncateText'

const ESTADO_COLOR = { pendiente:'orange', en_revision:'blue', aceptada:'green', rechazada:'red' }

export default function AdminPage() {
  const { profile } = useContext(AuthContext)
  const [stats, setStats]   = useState({ opiniones:0, inscripciones:0, noticias:0, empleos:0, mensajes:0 })
  const [inscripciones, setInscripciones] = useState([])
  const [opiniones, setOpiniones]         = useState([])
  const [cargando, setCargando]           = useState(true)
  const [accionando, setAccionando]       = useState(null)

  const fetchData = async () => {
    setCargando(true)
    const hoy = new Date().toISOString().split('T')[0]
    const [op, insc, not, emp, msg, ultInsc, ultOp] = await Promise.all([
      supabase.from('opiniones').select('id', { count:'exact', head:true }).eq('estado','pendiente'),
      supabase.from('inscripciones').select('id', { count:'exact', head:true }).eq('estado','pendiente'),
      supabase.from('noticias').select('id', { count:'exact', head:true }).eq('publicada',true),
      supabase.from('empleos').select('id', { count:'exact', head:true }).eq('activo',true).gte('fecha_limite',hoy),
      supabase.from('contacto_mensajes').select('id', { count:'exact', head:true }).eq('leido',false),
      supabase.from('inscripciones').select('id,estudiante_nombre,nivel,tutor_email,estado,created_at').order('created_at',{ascending:false}).limit(5),
      supabase.from('opiniones').select('id,autor_nombre,texto,estado,created_at').eq('estado','pendiente').order('created_at',{ascending:false}).limit(3),
    ])
    setStats({ opiniones: op.count??0, inscripciones: insc.count??0, noticias: not.count??0, empleos: emp.count??0, mensajes: msg.count??0 })
    setInscripciones(ultInsc.data??[])
    setOpiniones(ultOp.data??[])
    setCargando(false)
  }

  useEffect(() => { fetchData() }, [])

  const moderarOpinion = async (id, nuevoEstado) => {
    setAccionando(id)
    await supabase.from('opiniones').update({ estado: nuevoEstado, moderado_por: profile?.id, moderado_at: new Date().toISOString() }).eq('id', id)
    setAccionando(null)
    fetchData()
  }

  const METRICAS = [
    { titulo:'Mensajes sin leer',        valor:stats.mensajes,      icono:Inbox,         color:'red',    linkTo:'/admin/mensajes' },
    { titulo:'Opiniones pendientes',     valor:stats.opiniones,     icono:MessageSquare, color:'purple', linkTo:'/admin/opiniones' },
    { titulo:'Inscripciones pendientes', valor:stats.inscripciones, icono:ClipboardList, color:'orange', linkTo:'/admin/inscripciones' },
    { titulo:'Noticias publicadas',      valor:stats.noticias,      icono:Newspaper,     color:'blue',   linkTo:'/admin/noticias' },
    { titulo:'Empleos activos',          valor:stats.empleos,       icono:Briefcase,     color:'green',  linkTo:'/admin/empleos' },
  ]

  const COLS_INSC = [
    { key:'estudiante_nombre', label:'Estudiante', render: r => <span className="font-medium text-gray-800">{r.estudiante_nombre}</span> },
    { key:'nivel',   label:'Nivel',   render: r => <span className="capitalize text-gray-600">{r.nivel}</span> },
    { key:'tutor_email', label:'Email tutor', render: r => <span className="text-gray-500 text-xs">{r.tutor_email}</span> },
    { key:'created_at', label:'Fecha', render: r => <span className="text-gray-400 text-xs">{formatDateShort(r.created_at)}</span> },
    { key:'estado', label:'Estado', render: r => <Badge color={ESTADO_COLOR[r.estado]??'gray'}>{r.estado.replace('_',' ')}</Badge> },
  ]

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl">Panel de administración</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {METRICAS.map(m => <StatsCard key={m.titulo} {...m} cargando={cargando} />)}
      </div>

      {/* Últimas inscripciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-700 text-lg">Últimas inscripciones</h2>
          <Link to="/admin/inscripciones" className="text-xs text-brand-naranja hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={11} />
          </Link>
        </div>
        <DataTable columns={COLS_INSC} data={inscripciones} loading={cargando} emptyMessage="No hay inscripciones aún." />
      </div>

      {/* Opiniones pendientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-700 text-lg">Opiniones pendientes</h2>
          <Link to="/admin/opiniones" className="text-xs text-brand-naranja hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={11} />
          </Link>
        </div>
        {cargando ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
        ) : opiniones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
            ¡No hay opiniones pendientes de moderación!
          </div>
        ) : (
          <div className="space-y-3">
            {opiniones.map(op => (
              <div key={op.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{op.autor_nombre}</p>
                  <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">&ldquo;{truncateText(op.texto, 100)}&rdquo;</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDateShort(op.created_at)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" loading={accionando===op.id}
                    onClick={() => moderarOpinion(op.id,'aprobada')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle size={13}/> Aprobar
                  </Button>
                  <Button size="sm" variant="outline" loading={accionando===op.id}
                    onClick={() => moderarOpinion(op.id,'rechazada')}
                    className="text-red-500 border-red-300 hover:bg-red-50"
                  >
                    <XCircle size={13}/> Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
