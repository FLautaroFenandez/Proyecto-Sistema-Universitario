/**
 * @file SeguimientoAlumno.jsx
 * @description Tarjeta de seguimiento de un alumno para el padre o el propio
 * alumno: curso, asistencia (HU4) y acceso al boletín y la constancia (REQ-17).
 *
 * Los datos los filtra la base: el padre solo recibe a sus hijos y el alumno,
 * su propio legajo.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ScrollText, CalendarCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { asistencias, resumirAsistencia, nombreCompletoDeCurso, ESTADOS_ASISTENCIA } from '@/services'
import { formatDateShort } from '@/utils/formatDate'
import { ROUTES } from '@/types/routes'

const COLOR_DE = Object.fromEntries(ESTADOS_ASISTENCIA.map(e => [e.clave, e.color]))
const ETIQUETA_DE = Object.fromEntries(ESTADOS_ASISTENCIA.map(e => [e.clave, e.etiqueta]))

export function SeguimientoAlumno({ alumno, matricula, relacion }) {
  const [registros, setRegistros] = useState([])

  useEffect(() => {
    if (!matricula?.id) return
    asistencias.deMatricula(matricula.id).then(setRegistros).catch(() => setRegistros([]))
  }, [matricula?.id])

  const resumen = resumirAsistencia(registros)
  const inasistencias = registros.filter(r => r.estado !== 'presente').slice(0, 3)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-800">{alumno.apellido}, {alumno.nombre}</p>
          <p className="text-xs text-gray-400">
            Legajo <span className="font-mono">{alumno.legajo}</span>
            {matricula ? <> · <span className="capitalize">{nombreCompletoDeCurso(matricula.curso)}</span></> : ' · sin matrícula vigente'}
          </p>
        </div>
        {relacion && <Badge color="blue">{relacion}</Badge>}
      </div>

      {matricula && (
        <>
          <div className="flex items-center gap-3 text-sm">
            <CalendarCheck size={16} className="text-brand-azul flex-shrink-0" />
            {resumen.total === 0 ? (
              <span className="text-gray-400">Todavía no hay asistencia registrada.</span>
            ) : (
              <span className="text-gray-600">
                <strong>{resumen.porcentaje} %</strong> de asistencia · {resumen.ausente} ausente{resumen.ausente === 1 ? '' : 's'} ·
                {' '}{resumen.tarde} tarde{resumen.tarde === 1 ? '' : 's'} · {resumen.justificada} justificada{resumen.justificada === 1 ? '' : 's'}
              </span>
            )}
          </div>
          {inasistencias.length > 0 && (
            <ul className="text-xs text-gray-500 space-y-1 pl-7">
              {inasistencias.map(r => (
                <li key={r.fecha} className="flex items-center gap-2">
                  {formatDateShort(r.fecha)} <Badge color={COLOR_DE[r.estado]}>{ETIQUETA_DE[r.estado]}</Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.BOLETIN(matricula.id)} target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-azul border border-brand-azul/30 px-3 py-1.5 rounded-lg hover:bg-blue-50">
              <FileText size={14} /> Boletín
            </Link>
            <Link to={ROUTES.CONSTANCIA(matricula.id)} target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-azul border border-brand-azul/30 px-3 py-1.5 rounded-lg hover:bg-blue-50">
              <ScrollText size={14} /> Constancia de alumno regular
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

/** Lista de comunicados recibidos (HU5), para el padre o el alumno. */
export function ComunicadosRecibidos({ comunicados }) {
  if (comunicados.length === 0) {
    return <p className="text-sm text-gray-400">No hay comunicados de los docentes por ahora.</p>
  }
  return (
    <ul className="space-y-3">
      {comunicados.map(c => (
        <li key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-gray-800">{c.titulo}</p>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateShort(c.created_at)}</span>
          </div>
          <p className="text-xs text-gray-400 capitalize mt-0.5">
            {nombreCompletoDeCurso(c.curso)} · {c.autor_nombre ?? 'Docente'}
          </p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{c.mensaje}</p>
        </li>
      ))}
    </ul>
  )
}
