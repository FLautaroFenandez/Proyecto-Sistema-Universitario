/**
 * @file ComunicadosPage.jsx
 * @description Comunicados del docente a los padres de su curso (HU5 · REQ-18).
 *
 * Caso de uso: el docente elige uno de sus cursos, redacta y envía. El
 * comunicado queda registrado con fecha y remitente y lo ven las familias de
 * los alumnos del curso. Vacío no se puede enviar (interfaz y base).
 */

import { useState, useEffect, useContext, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Megaphone, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Campo, Entrada, Seleccion } from '@/components/admin/CampoFormulario'
import {
  asistencias, comunicados, LARGO_MAXIMO_TITULO, nombreCompletoDeCurso, mensajeDeError,
} from '@/services'
import { formatDateShort } from '@/utils/formatDate'
import { ROUTES } from '@/types/routes'

export default function ComunicadosPage() {
  const { profile } = useContext(AuthContext)
  const [cursos,    setCursos]    = useState([])
  const [enviados,  setEnviados]  = useState([])
  const [cursoId,   setCursoId]   = useState('')
  const [titulo,    setTitulo]    = useState('')
  const [mensaje,   setMensaje]   = useState('')
  const [cargando,  setCargando]  = useState(true)
  const [enviando,  setEnviando]  = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [error,     setError]     = useState(null)
  const [aviso,     setAviso]     = useState(null)

  const cargar = useCallback(async () => {
    if (!profile?.id) return
    try {
      const misCursos = await asistencias.misCursos(profile.id)
      setCursos(misCursos)
      setCursoId(actual => actual || misCursos[0]?.id || '')
      setEnviados(misCursos.length
        ? await comunicados.recientes({ cursoIds: misCursos.map(c => c.id) })
        : [])
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar tus cursos.'))
    } finally {
      setCargando(false)
    }
  }, [profile?.id])

  useEffect(() => { cargar() }, [cargar])

  const faltaTitulo  = !titulo.trim()
  const faltaMensaje = !mensaje.trim()

  const enviar = async (e) => {
    e.preventDefault()
    setIntentado(true)
    setAviso(null)
    if (faltaTitulo || faltaMensaje || !cursoId) return
    setEnviando(true)
    setError(null)
    try {
      const enviado = await comunicados.enviar({ cursoId, autorId: profile.id, titulo, mensaje })
      setEnviados(prev => [enviado, ...prev])
      setTitulo('')
      setMensaje('')
      setIntentado(false)
      setAviso(`Comunicado enviado a las familias de ${nombreCompletoDeCurso(enviado.curso)}.`)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar el comunicado.'))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-3">
        <Link to={ROUTES.DOCENTE} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-azul">
          <ArrowLeft size={14} /> Mis cursos
        </Link>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Megaphone size={22} className="text-brand-azul" /> Comunicados a las familias
        </h1>
        <p className="text-gray-500 text-sm">
          Lo que envíes queda registrado con fecha y remitente, y lo ven los padres de los alumnos del curso.
        </p>
      </div>

      {cursos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Todavía no tenés cursos asignados en el ciclo activo.
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <Campo etiqueta="Curso" htmlFor="curso" requerido>
            <Seleccion id="curso" value={cursoId} onChange={e => setCursoId(e.target.value)}>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>
                  {nombreCompletoDeCurso(c)} — {c.alumnos} alumno{c.alumnos === 1 ? '' : 's'}
                </option>
              ))}
            </Seleccion>
          </Campo>
          <Campo etiqueta="Título" htmlFor="titulo" requerido
            error={intentado && faltaTitulo ? 'Escribí un título.' : null}
            ayuda={`${titulo.length}/${LARGO_MAXIMO_TITULO}`}>
            <Entrada id="titulo" value={titulo} maxLength={LARGO_MAXIMO_TITULO}
              onChange={e => setTitulo(e.target.value)} placeholder="Ej.: Reunión de padres del viernes" />
          </Campo>
          <Campo etiqueta="Mensaje" htmlFor="mensaje" requerido
            error={intentado && faltaMensaje ? 'El mensaje no puede quedar vacío.' : null}>
            <textarea id="mensaje" rows={5} value={mensaje} onChange={e => setMensaje(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul" />
          </Campo>

          {error && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          {aviso && (
            <div className="flex gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" /> <span>{aviso}</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={enviando}>
              <Send size={15} /> Enviar comunicado
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <h2 className="font-display font-bold text-gray-700 text-lg">Enviados a tus cursos</h2>
        {enviados.length === 0 ? (
          <p className="text-sm text-gray-400">Todavía no hay comunicados.</p>
        ) : (
          <ul className="space-y-3">
            {enviados.map(c => (
              <li key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-gray-800">{c.titulo}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateShort(c.created_at)}</span>
                </div>
                <p className="text-xs text-gray-400 capitalize mt-0.5">
                  {nombreCompletoDeCurso(c.curso)} · {c.autor_nombre ?? 'Sin remitente'}
                </p>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{c.mensaje}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
