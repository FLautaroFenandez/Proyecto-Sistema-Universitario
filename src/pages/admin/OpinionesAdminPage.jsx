/**
 * @file OpinionesAdminPage.jsx
 * @description Moderación completa de opiniones. Filtro por estado en tabs.
 * Acciones: Aprobar / Rechazar / Eliminar con modal de confirmación.
 */

import { useState, useEffect, useContext } from 'react'
import { CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDateShort } from '@/utils/formatDate'

const TABS = [
  { key: null,        label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada',  label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
]

const ESTADO_COLOR = { pendiente:'orange', aprobada:'green', rechazada:'red' }

export default function OpinionesAdminPage() {
  const { profile } = useContext(AuthContext)
  const [tabActivo, setTabActivo]       = useState(null)
  const [opiniones, setOpiniones]       = useState([])
  const [cargando, setCargando]         = useState(true)
  const [accionando, setAccionando]     = useState(null)
  const [eliminar, setEliminar]         = useState(null) // opinión a eliminar

  const fetchOpiniones = async () => {
    setCargando(true)
    let q = supabase.from('opiniones').select('*').order('created_at', { ascending: false })
    if (tabActivo) q = q.eq('estado', tabActivo)
    const { data } = await q
    setOpiniones(data ?? [])
    setCargando(false)
  }

  useEffect(() => { fetchOpiniones() }, [tabActivo])

  const moderar = async (id, nuevoEstado) => {
    setAccionando(id)
    await supabase.from('opiniones').update({
      estado: nuevoEstado,
      moderado_por: profile?.id,
      moderado_at: new Date().toISOString(),
    }).eq('id', id)
    setAccionando(null)
    fetchOpiniones()
  }

  const confirmarEliminar = async () => {
    if (!eliminar) return
    await supabase.from('opiniones').delete().eq('id', eliminar.id)
    setEliminar(null)
    fetchOpiniones()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <MessageSquare size={22} className="text-brand-azul" /> Moderación de Opiniones
        </h1>
        <p className="text-gray-400 text-sm mt-1">Aprobá, rechazá o eliminá las opiniones de la comunidad.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={String(t.key)} onClick={() => setTabActivo(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tabActivo === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
      ) : opiniones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay opiniones {tabActivo ? `con estado "${tabActivo}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {opiniones.map(op => (
            <div key={op.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{op.autor_nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(op.created_at)}</p>
                </div>
                <Badge color={ESTADO_COLOR[op.estado] ?? 'gray'}>{op.estado}</Badge>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed italic mb-4">
                &ldquo;{op.texto}&rdquo;
              </p>

              <div className="flex flex-wrap gap-2">
                {op.estado !== 'aprobada' && (
                  <Button size="sm" variant="outline" loading={accionando===op.id}
                    onClick={() => moderar(op.id,'aprobada')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle size={13}/> Aprobar
                  </Button>
                )}
                {op.estado !== 'rechazada' && (
                  <Button size="sm" variant="outline" loading={accionando===op.id}
                    onClick={() => moderar(op.id,'rechazada')}
                    className="text-orange-500 border-orange-300 hover:bg-orange-50"
                  >
                    <XCircle size={13}/> Rechazar
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => setEliminar(op)}>
                  <Trash2 size={13}/> Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmación eliminar */}
      <Modal open={!!eliminar} onClose={() => setEliminar(null)} title="¿Eliminar opinión?" size="sm">
        <p className="text-gray-600 text-sm mb-1">
          Vas a eliminar la opinión de <strong>{eliminar?.autor_nombre}</strong>. Esta acción es irreversible.
        </p>
        <p className="text-gray-400 text-sm italic mb-6">&ldquo;{eliminar?.texto}&rdquo;</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setEliminar(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={confirmarEliminar}>
            <Trash2 size={14}/> Eliminar definitivamente
          </Button>
        </div>
      </Modal>
    </div>
  )
}
