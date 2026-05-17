/**
 * @file InscripcionesAdminPage.jsx
 * @description Gestión de solicitudes de inscripción. Tabla con filtros por estado,
 * modal de detalle completo con cambio de estado y observaciones, exportación CSV.
 */

import { useState, useEffect, useContext } from 'react'
import { ClipboardList, Download, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDateShort } from '@/utils/formatDate'

const ESTADOS = ['pendiente','en_revision','aceptada','rechazada']
const ESTADO_COLOR = { pendiente:'orange', en_revision:'blue', aceptada:'green', rechazada:'red' }

const FILTROS = [
  { key:null,         label:'Todas' },
  { key:'pendiente',  label:'Pendientes' },
  { key:'en_revision',label:'En revisión' },
  { key:'aceptada',   label:'Aceptadas' },
  { key:'rechazada',  label:'Rechazadas' },
]

function exportarCSV(data) {
  const headers = ['Estudiante','DNI','Nivel','Turno','Tutor','Email','Teléfono','Estado','Fecha']
  const rows = data.map(r => [
    r.estudiante_nombre, r.estudiante_dni, r.nivel, r.turno,
    r.tutor_nombre, r.tutor_email, r.tutor_telefono,
    r.estado, formatDateShort(r.created_at),
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v??''}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'inscripciones.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function InscripcionesAdminPage() {
  const { profile } = useContext(AuthContext)
  const [inscripciones, setInscripciones] = useState([])
  const [todosData,     setTodosData]     = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [filtro,        setFiltro]        = useState(null)
  const [seleccionada,  setSeleccionada]  = useState(null)
  const [nuevoEstado,   setNuevoEstado]   = useState('')
  const [obs,           setObs]           = useState('')
  const [guardando,     setGuardando]     = useState(false)

  const fetchData = async () => {
    setCargando(true)
    let q = supabase.from('inscripciones').select('*').order('created_at', { ascending: false })
    if (filtro) q = q.eq('estado', filtro)
    const { data } = await q
    setInscripciones(data ?? [])
    // Para exportar CSV siempre sin filtro
    const { data: todos } = await supabase.from('inscripciones').select('*').order('created_at', { ascending: false })
    setTodosData(todos ?? [])
    setCargando(false)
  }

  useEffect(() => { fetchData() }, [filtro])

  const abrirDetalle = (ins) => {
    setSeleccionada(ins)
    setNuevoEstado(ins.estado)
    setObs(ins.observaciones ?? '')
  }

  const guardarCambios = async () => {
    if (!seleccionada) return
    setGuardando(true)
    await supabase.from('inscripciones').update({
      estado: nuevoEstado,
      observaciones: obs,
      revisado_por: profile?.id,
      updated_at: new Date().toISOString(),
    }).eq('id', seleccionada.id)
    setGuardando(false)
    setSeleccionada(null)
    fetchData()
  }

  const COLS = [
    { key:'estudiante_nombre', label:'Estudiante', render: r => (
      <div><p className="font-medium text-gray-800 text-sm">{r.estudiante_nombre}</p><p className="text-xs text-gray-400">{r.estudiante_dni}</p></div>
    )},
    { key:'nivel',   label:'Nivel',  render: r => <span className="capitalize text-sm text-gray-600">{r.nivel}</span> },
    { key:'turno',   label:'Turno',  render: r => <span className="capitalize text-sm text-gray-500">{r.turno === 'manana' ? 'Mañana' : 'Tarde'}</span> },
    { key:'tutor_nombre', label:'Tutor', render: r => (
      <div><p className="text-sm text-gray-700">{r.tutor_nombre}</p><p className="text-xs text-gray-400">{r.tutor_email}</p></div>
    )},
    { key:'created_at', label:'Fecha', render: r => <span className="text-xs text-gray-400">{formatDateShort(r.created_at)}</span> },
    { key:'estado', label:'Estado', render: r => <Badge color={ESTADO_COLOR[r.estado]??'gray'}>{r.estado.replace('_',' ')}</Badge> },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <ClipboardList size={22} className="text-brand-azul"/> Inscripciones
          </h1>
          <p className="text-gray-400 text-sm mt-1">Revisá y gestioná las solicitudes de inscripción.</p>
        </div>
        <Button variant="outline" onClick={() => exportarCSV(todosData)}>
          <Download size={15}/> Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {FILTROS.map(f => (
          <button key={String(f.key)} onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro===f.key?'bg-white shadow-sm text-gray-800':'text-gray-500 hover:text-gray-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable columns={COLS} data={inscripciones} loading={cargando}
        emptyMessage="No hay inscripciones con este filtro." onRowClick={abrirDetalle} />

      {/* Modal detalle */}
      <Modal open={!!seleccionada} onClose={() => setSeleccionada(null)} title="Detalle de inscripción" size="lg">
        {seleccionada && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Estudiante */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Datos del estudiante</h3>
                {[
                  ['Nombre', seleccionada.estudiante_nombre],
                  ['DNI', seleccionada.estudiante_dni],
                  ['Nacimiento', formatDateShort(seleccionada.estudiante_nacimiento)],
                  ['Nivel', seleccionada.nivel],
                  ['Turno', seleccionada.turno === 'manana' ? 'Mañana' : 'Tarde'],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-700 capitalize">{v}</span>
                  </div>
                ))}
              </div>
              {/* Tutor */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Datos del tutor</h3>
                {[
                  ['Nombre', seleccionada.tutor_nombre],
                  ['DNI', seleccionada.tutor_dni],
                  ['Relación', seleccionada.tutor_relacion],
                  ['Teléfono', seleccionada.tutor_telefono],
                  ['Email', seleccionada.tutor_email],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-700 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Estado de la solicitud</label>
              <div className="relative">
                <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 appearance-none">
                  {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_',' ')}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
              <label className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)}
                placeholder="Notas internas sobre esta solicitud..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 resize-none"/>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setSeleccionada(null)}>Cerrar</Button>
              <Button variant="primary" fullWidth loading={guardando} onClick={guardarCambios}>Guardar cambios</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
