/**
 * @file ConstanciaPage.jsx
 * @description Constancia de alumno regular (REQ-17).
 *
 * Solo se emite si la matrícula está activa: un alumno dado de baja no es
 * "regular". Se descarga en PDF con la impresión del navegador.
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { documentos, nombreCompletoDeCurso, mensajeDeError } from '@/services'
import { formatDate, hoyISO } from '@/utils/formatDate'
import { EncabezadoInstitucional, DocumentoNoDisponible } from './partes'

export default function ConstanciaPage() {
  const { matriculaId } = useParams()
  const [matricula, setMatricula] = useState(null)
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let cancelado = false
    documentos.matricula(matriculaId)
      .then(resultado => { if (!cancelado) setMatricula(resultado) })
      .catch(err => { if (!cancelado) setError(mensajeDeError(err, 'No pudimos armar la constancia.')) })
      .finally(() => { if (!cancelado) setCargando(false) })
    return () => { cancelado = true }
  }, [matriculaId])

  if (cargando) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>
  if (!matricula) return <DocumentoNoDisponible mensaje={error} />
  if (matricula.estado !== 'activa') {
    return <DocumentoNoDisponible mensaje="La matrícula no está activa: no corresponde emitir una constancia de alumno regular." />
  }

  const { alumno, curso, ciclo } = matricula

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto mb-4 flex justify-end px-4 no-imprimir">
        <Button variant="primary" onClick={() => window.print()}><Printer size={15} /> Descargar PDF</Button>
      </div>

      <article className="documento-imprimible max-w-3xl mx-auto bg-white shadow-sm print:shadow-none p-12 space-y-8 text-gray-800">
        <EncabezadoInstitucional titulo="Constancia de alumno regular" />

        <p className="leading-relaxed text-justify">
          Se deja constancia de que <strong>{alumno.apellido}, {alumno.nombre}</strong>, DNI {alumno.dni},
          legajo <span className="font-mono">{alumno.legajo}</span>, es alumno regular del Centro Educativo
          «Educar para Transformar» y cursa <span className="capitalize">{nombreCompletoDeCurso(curso)}</span> en
          el ciclo lectivo {ciclo?.anio}, con matrícula vigente desde el {formatDate(matricula.fecha_matriculacion)}.
        </p>
        <p className="leading-relaxed">
          A pedido del interesado y para ser presentada ante quien corresponda, se extiende la presente en
          Resistencia, Chaco, el {formatDate(hoyISO())}.
        </p>

        <div className="pt-16 grid grid-cols-2 gap-12 text-center text-sm text-gray-500">
          <div className="border-t border-gray-400 pt-2">Firma</div>
          <div className="border-t border-gray-400 pt-2">Sello de la institución</div>
        </div>
      </article>
    </div>
  )
}
