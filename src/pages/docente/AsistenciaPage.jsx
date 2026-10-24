/**
 * @file AsistenciaPage.jsx
 * @description Registro de asistencia diaria de un curso (HU4 · REQ-16).
 *
 * Caso de uso: el docente elige el curso (desde Mis cursos) y la fecha, marca a
 * cada alumno y guarda. Si ese día ya estaba cargado, la planilla aparece con
 * lo guardado y se edita en lugar de duplicarse.
 */

import { useState, useEffect, useCallback, useContext, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle, CheckCircle2, CalendarCheck, Lock } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { asistencias, ESTADOS_ASISTENCIA, nombreCompletoDeCurso, mensajeDeError } from '@/services'
import { hoyISO, formatDate } from '@/utils/formatDate'
import { ROUTES } from '@/types/routes'

const ESTILO_ESTADO = {
  presente:    'bg-green-600 text-white border-green-600',
  ausente:     'bg-red-600 text-white border-red-600',
  tarde:       'bg-orange-500 text-white border-orange-500',
  justificada: 'bg-blue-600 text-white border-blue-600',
}

export default function AsistenciaPage() {
  const { cursoId } = useParams()
  const { profile } = useContext(AuthContext)

  const [curso,      setCurso]      = useState(null)
  const [esDelCurso, setEsDelCurso] = useState(false)
  const [alumnos,    setAlumnos]    = useState([])
  const [fecha,      setFecha]      = useState(hoyISO())
  const [marcas,     setMarcas]     = useState({})
  const [guardadas,  setGuardadas]  = useState({})
  const [cargando,   setCargando]   = useState(true)
  const [cargandoDia, setCargandoDia] = useState(false)
  const [guardando,  setGuardando]  = useState(false)
  const [error,      setError]      = useState(null)
  const [aviso,      setAviso]      = useState(null)

  // ── Curso, alumnos y si el docente dicta en él ──
  useEffect(() => {
    if (!profile?.id) return
    let cancelado = false
    async function cargar() {
      try {
        const [encontrado, misCursos] = await Promise.all([
          asistencias.obtenerCurso(cursoId),
          asistencias.misCursos(profile.id),
        ])
        if (cancelado) return
        setCurso(encontrado)
        setEsDelCurso(misCursos.some(c => c.id === cursoId))
        if (encontrado) setAlumnos(await asistencias.alumnosDelCurso(cursoId))
      } catch (err) {
        if (!cancelado) setError(mensajeDeError(err, 'No pudimos cargar el curso.'))
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [cursoId, profile?.id])

  // ── Lo cargado en la fecha elegida ──
  const cargarDia = useCallback(async () => {
    if (alumnos.length === 0) return
    setCargandoDia(true)
    setError(null)
    try {
      const delDia = await asistencias.delDia(alumnos.map(a => a.id), fecha)
      const estados = Object.fromEntries(Object.entries(delDia).map(([id, r]) => [id, r.estado]))
      setMarcas(estados)
      setGuardadas(estados)
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar la asistencia del día.'))
    } finally {
      setCargandoDia(false)
    }
  }, [alumnos, fecha])

  useEffect(() => { cargarDia() }, [cargarDia])

  const pendientes = alumnos.filter(a => !marcas[a.id]).length
  const modificadas = alumnos.filter(a => marcas[a.id] && marcas[a.id] !== guardadas[a.id])
  const yaCargada = Object.keys(guardadas).length > 0
  const conteo = useMemo(
    () => Object.fromEntries(ESTADOS_ASISTENCIA.map(e => [e.clave, alumnos.filter(a => marcas[a.id] === e.clave).length])),
    [alumnos, marcas],
  )

  const marcar = (matriculaId, estado) => {
    setAviso(null)
    setMarcas(prev => ({ ...prev, [matriculaId]: estado }))
  }

  const todosPresentes = () => {
    setAviso(null)
    setMarcas(prev => Object.fromEntries(alumnos.map(a => [a.id, prev[a.id] ?? 'presente'])))
  }

  const guardar = async () => {
    if (modificadas.length === 0) return
    setGuardando(true)
    setError(null)
    try {
      await asistencias.guardar({
        fecha,
        docenteId: profile?.id,
        registros: modificadas.map(a => ({ matriculaId: a.id, estado: marcas[a.id] })),
      })
      setGuardadas({ ...marcas })
      setAviso(`Asistencia del ${formatDate(fecha)} guardada.`)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar la asistencia.'))
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>

  if (!curso || !esDelCurso) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3">
          <Lock size={30} className="text-gray-300 mx-auto" />
          <p className="font-semibold text-gray-700">
            {curso ? 'Solo los docentes del curso pueden tomar asistencia' : (error ?? 'No encontramos ese curso.')}
          </p>
          <Link to={ROUTES.DOCENTE} className="inline-block text-sm text-brand-azul hover:underline">Volver a mis cursos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-3">
        <Link to={ROUTES.DOCENTE} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-azul">
          <ArrowLeft size={14} /> Mis cursos
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
              <CalendarCheck size={22} className="text-brand-azul" /> Asistencia diaria
            </h1>
            <p className="text-gray-500 text-sm capitalize">{nombreCompletoDeCurso(curso)} · ciclo {curso.ciclo?.anio}</p>
          </div>
          <Button variant="primary" onClick={guardar} loading={guardando} disabled={modificadas.length === 0}>
            <Save size={15} /> Guardar asistencia{modificadas.length > 0 ? ` (${modificadas.length})` : ''}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input id="fecha" type="date" value={fecha} max={hoyISO()}
            onChange={e => e.target.value && setFecha(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20" />
        </div>
        <Button variant="outline" size="sm" onClick={todosPresentes} disabled={alumnos.length === 0}>
          Marcar a los demás como presentes
        </Button>
        <p className="text-sm text-gray-400">
          {yaCargada ? 'Este día ya estaba cargado: los cambios lo actualizan.' : 'Todavía no se cargó este día.'}
        </p>
      </div>

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

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          El curso todavía no tiene alumnos matriculados.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {cargandoDia ? (
            <div className="py-12 flex justify-center"><Spinner /></div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {alumnos.map(a => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-[12rem] flex-1">
                    <p className="text-sm font-medium text-gray-800">{a.alumno.apellido}, {a.alumno.nombre}</p>
                    <p className="text-xs text-gray-400 font-mono">{a.alumno.legajo}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Asistencia de ${a.alumno.nombre}`}>
                    {ESTADOS_ASISTENCIA.map(e => {
                      const elegido = marcas[a.id] === e.clave
                      return (
                        <button key={e.clave} type="button" role="radio" aria-checked={elegido}
                          onClick={() => marcar(a.id, e.clave)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            elegido ? ESTILO_ESTADO[e.clave] : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {e.etiqueta}
                        </button>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {ESTADOS_ASISTENCIA.map(e => `${e.etiqueta}: ${conteo[e.clave]}`).join(' · ')}
        {pendientes > 0 ? ` · Sin marcar: ${pendientes}` : ''}
      </p>
    </div>
  )
}
