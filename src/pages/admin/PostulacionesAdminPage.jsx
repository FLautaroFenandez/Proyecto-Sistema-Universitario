/**
 * @file PostulacionesAdminPage.jsx
 * @description Seguimiento de postulaciones laborales (REQ-20).
 *
 * Las postulaciones llegan desde la página pública de Empleo. El selector de
 * estado ofrece solo las transiciones válidas, que define el patrón State en
 * src/domain/estadoPostulacion.js (y repite la base con un disparador).
 */

import { useState, useEffect, useCallback, useContext } from 'react'
import { Briefcase, AlertTriangle, ExternalLink, Lock } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { DataTable } from '@/components/admin/DataTable'
import { Campo, Seleccion } from '@/components/admin/CampoFormulario'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { postulaciones, mensajeDeError } from '@/services'
import { estadoPostulacionDe, ESTADOS_DE_POSTULACION } from '@/domain/estadoPostulacion'
import { formatDateShort } from '@/utils/formatDate'

function DetallePostulacion({ postulacion, alGuardar, alCerrar }) {
  const { profile } = useContext(AuthContext)
  const estado = estadoPostulacionDe(postulacion.estado)
  const [destino, setDestino] = useState(postulacion.estado)
  const [observaciones, setObservaciones] = useState(postulacion.observaciones ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const hayCambios = destino !== postulacion.estado || observaciones !== (postulacion.observaciones ?? '')

  const guardar = async () => {
    setGuardando(true)
    setError(null)
    try {
      alGuardar(await postulaciones.cambiarEstado(postulacion, destino, { observaciones, revisadoPor: profile?.id }))
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el cambio.'))
      setGuardando(false)
    }
  }

  const datos = [
    ['Email', postulacion.email],
    ['Área de interés', postulacion.area || '—'],
    ['Búsqueda', postulacion.empleo?.titulo ?? 'Postulación espontánea'],
    ['Recibida', formatDateShort(postulacion.created_at)],
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {datos.map(([clave, valor]) => (
          <div key={clave} className="flex justify-between gap-4 text-sm">
            <span className="text-gray-400">{clave}</span>
            <span className="font-medium text-gray-700 text-right">{valor}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-gray-400">CV</span>
          {postulacion.cv_link
            ? <a href={postulacion.cv_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-azul hover:underline">Abrir enlace <ExternalLink size={12} /></a>
            : <span className="text-gray-400">Sin enlace: contactar por email</span>}
        </div>
      </div>

      <Campo etiqueta="Estado" htmlFor="estado">
        <Seleccion id="estado" value={destino} onChange={e => setDestino(e.target.value)} disabled={estado.esFinal}>
          <option value={estado.clave}>{estado.etiqueta} (actual)</option>
          {estado.siguientes.map(clave => (
            <option key={clave} value={clave}>{estadoPostulacionDe(clave).etiqueta}</option>
          ))}
        </Seleccion>
      </Campo>
      {estado.esFinal && (
        <p className="flex gap-2 text-xs text-gray-500">
          <Lock size={13} className="flex-shrink-0 mt-0.5" />
          La postulación ya terminó en una contratación. El alta de la persona se hace desde Personal.
        </p>
      )}

      <Campo etiqueta="Observaciones" htmlFor="observaciones">
        <textarea id="observaciones" rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul" />
      </Campo>

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={alCerrar}>Cerrar</Button>
        <Button variant="primary" fullWidth loading={guardando} disabled={!hayCambios} onClick={guardar}>Guardar</Button>
      </div>
    </div>
  )
}

export default function PostulacionesAdminPage() {
  const [lista,        setLista]        = useState([])
  const [filtro,       setFiltro]       = useState(null)
  const [cargando,     setCargando]     = useState(true)
  const [error,        setError]        = useState(null)
  const [seleccionada, setSeleccionada] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setLista(await postulaciones.listar(filtro))
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar las postulaciones.'))
    } finally {
      setCargando(false)
    }
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  const COLUMNAS = [
    { key: 'nombre', label: 'Postulante', render: f => (
      <div>
        <p className="font-medium text-gray-800 text-sm">{f.nombre}</p>
        <p className="text-xs text-gray-400">{f.email}</p>
      </div>
    )},
    { key: 'area', label: 'Área', render: f => <span className="text-sm text-gray-600">{f.area || '—'}</span> },
    { key: 'fecha', label: 'Recibida', render: f => <span className="text-xs text-gray-400">{formatDateShort(f.created_at)}</span> },
    { key: 'estado', label: 'Estado', render: f => {
      const e = estadoPostulacionDe(f.estado)
      return <Badge color={e.color}>{e.etiqueta}</Badge>
    }},
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Briefcase size={22} className="text-brand-azul" /> Postulaciones
        </h1>
        <p className="text-gray-400 text-sm mt-1">CV recibidos desde la página de Empleo y su estado en el proceso de selección.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {[{ clave: null, etiqueta: 'Todas' }, ...ESTADOS_DE_POSTULACION].map(e => (
          <button key={String(e.clave)} onClick={() => setFiltro(e.clave)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filtro === e.clave ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            {e.etiqueta}
          </button>
        ))}
      </div>

      {error
        ? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-red-600">{error}</div>
        : <DataTable columns={COLUMNAS} data={lista} loading={cargando}
            emptyMessage="No hay postulaciones con este filtro." onRowClick={setSeleccionada} />}

      <Modal open={!!seleccionada} onClose={() => setSeleccionada(null)} title={seleccionada?.nombre ?? ''} size="md">
        {seleccionada && (
          <DetallePostulacion
            key={seleccionada.id}
            postulacion={seleccionada}
            alGuardar={() => { setSeleccionada(null); cargar() }}
            alCerrar={() => setSeleccionada(null)} />
        )}
      </Modal>
    </div>
  )
}
