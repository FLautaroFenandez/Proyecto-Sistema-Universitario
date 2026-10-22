/**
 * @file InscripcionesAdminPage.jsx
 * @description Gestión de solicitudes de inscripción. Tabla con filtros por estado,
 * modal de detalle completo con cambio de estado y observaciones, exportación CSV.
 *
 * Sprint 2: los datos pasan por la capa de servicios (Facade) y el cambio de
 * estado lo decide el estado actual de la solicitud (State). El selector solo
 * ofrece las transiciones válidas, y una solicitud matriculada ya no se puede
 * modificar.
 */

import { useState, useEffect, useCallback, useContext } from 'react'
import { ClipboardList, Download, AlertTriangle, Lock } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { DataTable } from '@/components/admin/DataTable'
import { Seleccion } from '@/components/admin/CampoFormulario'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { inscripciones as servicio, mensajeDeError } from '@/services'
import { estadoDe, LISTA_DE_ESTADOS } from '@/domain/estadoSolicitud'
import { formatDateShort } from '@/utils/formatDate'

const FILTROS = [
  { key: null, label: 'Todas' },
  ...LISTA_DE_ESTADOS.map(estado => ({ key: estado.clave, label: estado.etiqueta })),
]

function exportarCSV(data) {
  const headers = ['Estudiante','DNI','Nivel','Turno','Tutor','Email','Teléfono','Estado','Fecha']
  const rows = data.map(r => [
    r.estudiante_nombre, r.estudiante_dni, r.nivel, r.turno,
    r.tutor_nombre, r.tutor_email, r.tutor_telefono,
    estadoDe(r.estado).etiqueta, formatDateShort(r.created_at),
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v??''}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'inscripciones.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function InscripcionesAdminPage() {
  const { profile } = useContext(AuthContext)
  const [lista,        setLista]        = useState([])
  const [todosData,    setTodosData]    = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [errorCarga,   setErrorCarga]   = useState(null)
  const [filtro,       setFiltro]       = useState(null)
  const [seleccionada, setSeleccionada] = useState(null)
  const [nuevoEstado,  setNuevoEstado]  = useState('')
  const [obs,          setObs]          = useState('')
  const [guardando,    setGuardando]    = useState(false)
  const [errorModal,   setErrorModal]   = useState(null)

  const fetchData = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      // Para exportar CSV siempre sin filtro
      const [filtradas, todas] = await Promise.all([servicio.listar(filtro), servicio.listar(null)])
      setLista(filtradas)
      setTodosData(todas)
    } catch (err) {
      setErrorCarga(mensajeDeError(err, 'No pudimos cargar las solicitudes.'))
    } finally {
      setCargando(false)
    }
  }, [filtro])

  useEffect(() => { fetchData() }, [fetchData])

  const abrirDetalle = (ins) => {
    setSeleccionada(ins)
    setNuevoEstado(ins.estado)
    setObs(ins.observaciones ?? '')
    setErrorModal(null)
  }

  const guardarCambios = async () => {
    if (!seleccionada) return
    setGuardando(true)
    setErrorModal(null)
    try {
      await servicio.cambiarEstado(seleccionada, nuevoEstado, {
        observaciones: obs,
        revisadoPor:   profile?.id,
      })
      setSeleccionada(null)
      fetchData()
    } catch (err) {
      setErrorModal(mensajeDeError(err, 'No se pudo guardar el cambio.'))
    } finally {
      setGuardando(false)
    }
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
    { key:'estado', label:'Estado', render: r => {
      const estado = estadoDe(r.estado)
      return <Badge color={estado.color}>{estado.etiqueta}</Badge>
    }},
  ]

  // El estado actual decide qué opciones se ofrecen (patrón State).
  const estadoActual = seleccionada ? estadoDe(seleccionada.estado) : null
  const opciones = estadoActual
    ? [estadoActual, ...estadoActual.transicionesManuales.map(estadoDe)]
    : []

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

      {errorCarga
        ? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-red-600">{errorCarga}</div>
        : <DataTable columns={COLS} data={lista} loading={cargando}
            emptyMessage="No hay inscripciones con este filtro." onRowClick={abrirDetalle} />
      }

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
              <label htmlFor="estado-solicitud" className="block text-sm font-medium text-gray-700">
                Estado de la solicitud
              </label>
              <Seleccion id="estado-solicitud" value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value)}
                disabled={estadoActual.esFinal}>
                {opciones.map(estado => (
                  <option key={estado.clave} value={estado.clave}>
                    {estado.clave === estadoActual.clave ? `${estado.etiqueta} (actual)` : estado.etiqueta}
                  </option>
                ))}
              </Seleccion>

              {estadoActual.esFinal ? (
                <p className="flex items-start gap-2 text-xs text-gray-500">
                  <Lock size={13} className="flex-shrink-0 mt-0.5" />
                  La solicitud ya generó un alumno matriculado y no puede cambiar de estado.
                  Si hubo un error, se da de baja la matrícula desde Alumnos.
                </p>
              ) : estadoActual.clave === 'aceptada' && (
                <p className="text-xs text-gray-500">
                  Para matricular al alumno, usá la pantalla de Matriculación.
                </p>
              )}

              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
              <textarea id="observaciones" rows={3} value={obs} onChange={e => setObs(e.target.value)}
                placeholder="Notas internas sobre esta solicitud..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 resize-none"/>
            </div>

            {errorModal && (
              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorModal}</span>
              </div>
            )}

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
