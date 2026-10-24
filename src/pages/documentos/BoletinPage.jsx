/**
 * @file BoletinPage.jsx
 * @description Boletín de calificaciones de un alumno (REQ-17).
 *
 * Página imprimible: se descarga en PDF con "Imprimir → Guardar como PDF" del
 * navegador. Quién puede verla lo decide la base: si la persona no tiene
 * permiso sobre esa matrícula, la consulta vuelve vacía y se avisa.
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { documentos, nombreCompletoDeCurso, mensajeDeError } from '@/services'
import { formatDate, hoyISO } from '@/utils/formatDate'
import { EncabezadoInstitucional, DocumentoNoDisponible } from './partes'

const nota = valor => (valor === null || valor === undefined ? '—' : Number(valor).toFixed(2).replace('.', ','))

export default function BoletinPage() {
  const { matriculaId } = useParams()
  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    let cancelado = false
    documentos.boletin(matriculaId)
      .then(resultado => { if (!cancelado) setDatos(resultado) })
      .catch(err => { if (!cancelado) setError(mensajeDeError(err, 'No pudimos armar el boletín.')) })
      .finally(() => { if (!cancelado) setCargando(false) })
    return () => { cancelado = true }
  }, [matriculaId])

  if (cargando) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>
  if (!datos) return <DocumentoNoDisponible mensaje={error} />

  const { matricula, materias, asistencia } = datos
  const conDocente = materias.some(m => m.docente)

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto mb-4 flex justify-end px-4 no-imprimir">
        <Button variant="primary" onClick={() => window.print()}><Printer size={15} /> Descargar PDF</Button>
      </div>

      <article className="documento-imprimible max-w-3xl mx-auto bg-white shadow-sm print:shadow-none p-10 space-y-6 text-gray-800">
        <EncabezadoInstitucional titulo="Boletín de calificaciones" subtitulo={`Ciclo lectivo ${matricula.ciclo?.anio ?? ''}`} />

        <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <dt className="text-gray-500">Alumno</dt><dd className="font-semibold">{matricula.alumno.apellido}, {matricula.alumno.nombre}</dd>
          <dt className="text-gray-500">Legajo</dt><dd className="font-mono">{matricula.alumno.legajo}</dd>
          <dt className="text-gray-500">DNI</dt><dd>{matricula.alumno.dni}</dd>
          <dt className="text-gray-500">Curso</dt><dd className="capitalize">{nombreCompletoDeCurso(matricula.curso)}</dd>
        </dl>

        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="border border-gray-300 px-3 py-2">Materia</th>
              {conDocente && <th className="border border-gray-300 px-3 py-2">Docente</th>}
              <th className="border border-gray-300 px-3 py-2 text-center">1.er trim.</th>
              <th className="border border-gray-300 px-3 py-2 text-center">2.º trim.</th>
              <th className="border border-gray-300 px-3 py-2 text-center">3.er trim.</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Anual</th>
            </tr>
          </thead>
          <tbody>
            {materias.length === 0 ? (
              <tr><td colSpan={conDocente ? 6 : 5} className="px-3 py-4 text-center text-gray-400">El curso no tiene materias asignadas.</td></tr>
            ) : materias.map(m => (
              <tr key={m.id}>
                <td className="border border-gray-300 px-3 py-2">{m.materia}</td>
                {conDocente && <td className="border border-gray-300 px-3 py-2 text-gray-500">{m.docente ?? '—'}</td>}
                {m.trimestres.map((t, i) => <td key={i} className="border border-gray-300 px-3 py-2 text-center">{nota(t)}</td>)}
                <td className="border border-gray-300 px-3 py-2 text-center font-semibold">{nota(m.anual)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-sm">
          <p className="font-semibold mb-1">Asistencia</p>
          {asistencia.total === 0 ? (
            <p className="text-gray-500">Sin registros de asistencia.</p>
          ) : (
            <p className="text-gray-600">
              {asistencia.porcentaje} % de asistencia sobre {asistencia.total} días registrados · presentes {asistencia.presente} ·
              tardes {asistencia.tarde} · ausentes {asistencia.ausente} · justificadas {asistencia.justificada}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 pt-6 border-t border-gray-200">
          Los promedios son los de cada trimestre sobre 10; el anual es el promedio de los trimestres con nota.
          Emitido el {formatDate(hoyISO())} desde el Sistema de Gestión.
        </p>
      </article>
    </div>
  )
}
