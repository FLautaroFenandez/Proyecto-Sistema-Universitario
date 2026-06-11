/**
 * @file MensajesAdminPage.jsx
 * @description Bandeja de entrada del admin: consultas del formulario de contacto
 * y CVs enviados desde la página de empleo. Filtros por leído/no leído,
 * marcar como leído y eliminar con confirmación.
 */

import { useState, useEffect } from 'react'
import { Mail, MailOpen, Trash2, Inbox, Briefcase, Reply } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDateShort } from '@/utils/formatDate'

const TABS = [
  { key: null,    label: 'Todos' },
  { key: false,   label: 'No leídos' },
  { key: true,    label: 'Leídos' },
]

export default function MensajesAdminPage() {
  const [mensajes,  setMensajes]  = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [filtro,    setFiltro]    = useState(null)
  const [eliminar,  setEliminar]  = useState(null)
  const [marcando,  setMarcando]  = useState(null)

  const fetchMensajes = async () => {
    setCargando(true)
    let q = supabase.from('contacto_mensajes').select('*').order('created_at', { ascending: false })
    if (filtro !== null) q = q.eq('leido', filtro)
    const { data } = await q
    setMensajes(data ?? [])
    setCargando(false)
  }

  useEffect(() => { fetchMensajes() }, [filtro])

  const toggleLeido = async (msg) => {
    setMarcando(msg.id)
    await supabase.from('contacto_mensajes').update({ leido: !msg.leido }).eq('id', msg.id)
    setMarcando(null)
    fetchMensajes()
  }

  const confirmarEliminar = async () => {
    if (!eliminar) return
    await supabase.from('contacto_mensajes').delete().eq('id', eliminar.id)
    setEliminar(null)
    fetchMensajes()
  }

  const esCV = (msg) => msg.asunto?.toLowerCase().startsWith('empleo')
  const noLeidos = mensajes.filter(m => !m.leido).length

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Inbox size={22} className="text-brand-azul" /> Consultas y CVs
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Mensajes del formulario de contacto y postulaciones laborales.
          {filtro === null && noLeidos > 0 && (
            <span className="ml-2 bg-brand-naranja/10 text-brand-naranja font-semibold px-2 py-0.5 rounded-full text-xs">
              {noLeidos} sin leer
            </span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={String(t.key)} onClick={() => setFiltro(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filtro === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
      ) : mensajes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Inbox size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay mensajes {filtro === false ? 'sin leer' : filtro === true ? 'leídos' : 'todavía'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mensajes.map(msg => (
            <div key={msg.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 transition-colors ${
                msg.leido ? 'border-gray-100' : 'border-brand-naranja/40 bg-orange-50/30'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    esCV(msg) ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-brand-azul'
                  }`}>
                    {esCV(msg) ? <Briefcase size={17} /> : <Mail size={17} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">{msg.nombre}</p>
                      {!msg.leido && <span className="w-2 h-2 rounded-full bg-brand-naranja flex-shrink-0" />}
                      {esCV(msg) && <Badge color="green">CV</Badge>}
                    </div>
                    <a href={`mailto:${msg.email}`} className="text-xs text-brand-azul hover:underline">{msg.email}</a>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(msg.created_at)}</p>
                  </div>
                </div>
                <Badge color={msg.leido ? 'gray' : 'orange'}>{msg.leido ? 'Leído' : 'Nuevo'}</Badge>
              </div>

              <p className="text-sm font-semibold text-gray-700 mb-1">{msg.asunto}</p>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-4">{msg.mensaje}</p>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" loading={marcando === msg.id} onClick={() => toggleLeido(msg)}>
                  {msg.leido ? <><Mail size={13}/> Marcar no leído</> : <><MailOpen size={13}/> Marcar leído</>}
                </Button>
                <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.asunto ?? 'Tu consulta')}`}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-brand-azul text-brand-azul hover:bg-blue-50 font-medium transition-colors">
                  <Reply size={13}/> Responder
                </a>
                <Button size="sm" variant="danger" onClick={() => setEliminar(msg)}>
                  <Trash2 size={13}/> Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal eliminar */}
      <Modal open={!!eliminar} onClose={() => setEliminar(null)} title="¿Eliminar mensaje?" size="sm">
        <p className="text-gray-600 text-sm mb-6">
          Vas a eliminar el mensaje de <strong>{eliminar?.nombre}</strong>. Esta acción es irreversible.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setEliminar(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={confirmarEliminar}><Trash2 size={14}/> Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
