/**
 * @file AuditoriaAdminPage.jsx
 * @description Registro de acciones críticas (REQ-22).
 *
 * Solo lectura: las entradas las escribe la base con disparadores cada vez que
 * se cambia un rol, una matrícula, una nota, una solicitud, un legajo o una
 * postulación. La aplicación no tiene forma de alterarlas.
 */

import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import {
  auditoria, TABLAS_AUDITADAS, ACCIONES, etiquetaDeTabla, resumirDetalle, mensajeDeError,
} from '@/services'

const COLOR_ACCION = { INSERT: 'green', UPDATE: 'blue', DELETE: 'red' }

const fechaHora = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export default function AuditoriaAdminPage() {
  const [entradas, setEntradas] = useState([])
  const [tabla,    setTabla]    = useState('')
  const [desde,    setDesde]    = useState('')
  const [hasta,    setHasta]    = useState('')
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setEntradas(await auditoria.listar({ tabla: tabla || null, desde, hasta }))
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar la auditoría.'))
    } finally {
      setCargando(false)
    }
  }, [tabla, desde, hasta])

  useEffect(() => { cargar() }, [cargar])

  const COLUMNAS = [
    { key: 'fecha', label: 'Fecha', render: e => <span className="text-xs text-gray-500 whitespace-nowrap">{fechaHora.format(new Date(e.created_at))}</span> },
    { key: 'usuario', label: 'Usuario', render: e => (
      <div>
        <p className="text-sm text-gray-800">{e.usuario_nombre ?? 'Sistema'}</p>
        {e.usuario_rol && <p className="text-xs text-gray-400">{e.usuario_rol}</p>}
      </div>
    )},
    { key: 'accion', label: 'Acción', render: e => <Badge color={COLOR_ACCION[e.accion] ?? 'gray'}>{ACCIONES[e.accion] ?? e.accion}</Badge> },
    { key: 'tabla', label: 'Sobre', render: e => <span className="text-sm text-gray-600">{etiquetaDeTabla(e.tabla)}</span> },
    { key: 'detalle', label: 'Detalle', render: e => <span className="text-xs text-gray-500 break-all">{resumirDetalle(e) || '—'}</span> },
  ]

  const estiloControl = 'border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20'

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <ShieldCheck size={22} className="text-brand-azul" /> Auditoría
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Historial de acciones críticas con usuario, fecha y cambio. Lo registra la base de datos y no se puede modificar.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="tabla" className="block text-sm font-medium text-gray-700 mb-1">Sobre</label>
          <select id="tabla" value={tabla} onChange={e => setTabla(e.target.value)} className={estiloControl}>
            <option value="">Todo</option>
            {TABLAS_AUDITADAS.map(t => <option key={t.clave} value={t.clave}>{t.etiqueta}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="desde" className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input id="desde" type="date" value={desde} onChange={e => setDesde(e.target.value)} className={estiloControl} />
        </div>
        <div>
          <label htmlFor="hasta" className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input id="hasta" type="date" value={hasta} onChange={e => setHasta(e.target.value)} className={estiloControl} />
        </div>
        <p className="text-xs text-gray-400 pb-2">Se muestran las últimas 200 acciones.</p>
      </div>

      {error
        ? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-red-600">{error}</div>
        : <DataTable columns={COLUMNAS} data={entradas} loading={cargando}
            emptyMessage="No hay acciones registradas con estos filtros." />}
    </div>
  )
}
