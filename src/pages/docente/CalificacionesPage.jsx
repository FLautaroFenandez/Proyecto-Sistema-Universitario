/**
 * @file CalificacionesPage.jsx
 * @description HU2 — Cargar calificaciones de alumnos (REQ-15).
 *
 * Planilla por materia y trimestre: una fila por alumno, hasta tres notas y el
 * promedio del período. Cubre los cuatro criterios de aceptación:
 *   1. El docente titular carga y edita las notas de su materia.
 *   2. Una nota fuera de rango se marca y no deja guardar (y la base la rechaza).
 *   3. Al guardar, el promedio lo recalcula la base (vista promedios_periodo).
 *   4. Un docente que no es titular no puede editar: la pantalla no se lo
 *      permite y la política RLS calificaciones_docente tampoco.
 */

import { useState, useEffect, useCallback, useContext, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle, CheckCircle2, Lock, ClipboardList } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  calificaciones, PERIODOS, INSTANCIAS, validarNota, notaDesdeTexto, claveCelda,
  nombreCompletoDeCurso, mensajeDeError,
} from '@/services'
import { ROUTES } from '@/types/routes'

/** 7.5 → "7,5"  ·  null → "" */
function textoDeNota(nota) {
  return nota === null || nota === undefined ? '' : String(Number(nota)).replace('.', ',')
}

/** 7.333 → "7,33" */
function textoDePromedio(promedio) {
  return Number(promedio).toFixed(2).replace('.', ',')
}

/** Compara por valor: "7.5" y "7,5" son la misma nota. */
function esDistinta(actual, original) {
  const a = notaDesdeTexto(actual)
  const b = notaDesdeTexto(original)
  if (Number.isNaN(a) || Number.isNaN(b)) return (actual ?? '').trim() !== (original ?? '').trim()
  return a !== b
}

export default function CalificacionesPage() {
  const { dictadoId } = useParams()
  const { profile } = useContext(AuthContext)

  const [dictado,    setDictado]    = useState(null)
  const [alumnos,    setAlumnos]    = useState([])
  const [periodo,    setPeriodo]    = useState(1)
  const [valores,    setValores]    = useState({})
  const [originales, setOriginales] = useState({})
  const [promedios,  setPromedios]  = useState({})
  const [cargando,   setCargando]   = useState(true)
  const [cargandoPeriodo, setCargandoPeriodo] = useState(false)
  const [guardando,  setGuardando]  = useState(false)
  const [error,      setError]      = useState(null)
  const [aviso,      setAviso]      = useState(null)

  // ── Carga inicial: la materia y sus alumnos ─────────────────────────────
  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const encontrado = await calificaciones.obtenerDictado(dictadoId)
        if (cancelado) return
        setDictado(encontrado)
        if (encontrado) setAlumnos(await calificaciones.alumnosDelDictado(encontrado))
      } catch (err) {
        if (!cancelado) setError(mensajeDeError(err, 'No pudimos cargar la materia.'))
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [dictadoId])

  // ── Notas y promedios del período elegido ───────────────────────────────
  const cargarPeriodo = useCallback(async () => {
    setCargandoPeriodo(true)
    setError(null)
    try {
      const [notas, listaPromedios] = await Promise.all([
        calificaciones.notasDelPeriodo(dictadoId, periodo),
        calificaciones.promediosDelPeriodo(dictadoId, periodo),
      ])
      const leidos = {}
      for (const n of notas) leidos[claveCelda(n.matricula_id, n.instancia)] = textoDeNota(n.nota)
      setValores(leidos)
      setOriginales(leidos)
      setPromedios(Object.fromEntries(listaPromedios.map(p => [p.matricula_id, p])))
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar las notas del período.'))
    } finally {
      setCargandoPeriodo(false)
    }
  }, [dictadoId, periodo])

  useEffect(() => { if (dictado) cargarPeriodo() }, [dictado, cargarPeriodo])

  // ── Estado derivado de la planilla ──────────────────────────────────────
  const claves = useMemo(
    () => new Set([...Object.keys(valores), ...Object.keys(originales)]),
    [valores, originales],
  )
  const modificadas = [...claves].filter(k => esDistinta(valores[k], originales[k]))
  const errores = Object.fromEntries(
    Object.entries(valores).map(([k, v]) => [k, validarNota(v)]).filter(([, msg]) => msg),
  )
  const cantidadErrores = Object.keys(errores).length
  const esTitular = dictado && profile?.id && dictado.docente_id === profile.id

  const escribir = (clave, texto) => {
    setAviso(null)
    setValores(anteriores => ({ ...anteriores, [clave]: texto }))
  }

  const cambiarPeriodo = (numero) => {
    if (numero === periodo) return
    if (modificadas.length > 0 &&
        !window.confirm('Hay notas sin guardar en este trimestre. ¿Querés descartarlas?')) return
    setAviso(null)
    setPeriodo(numero)
  }

  const guardar = async () => {
    if (cantidadErrores > 0 || modificadas.length === 0) return
    setGuardando(true)
    setError(null)
    try {
      await calificaciones.guardar({
        dictadoId,
        periodo,
        docenteId: profile?.id,
        cambios: modificadas.map(clave => {
          const [matriculaId, instancia] = clave.split(':')
          return { matriculaId, instancia: Number(instancia), nota: notaDesdeTexto(valores[clave]) }
        }),
      })
      await cargarPeriodo()
      setAviso(`${modificadas.length === 1 ? 'Se guardó 1 nota' : `Se guardaron ${modificadas.length} notas`}. Los promedios ya están actualizados.`)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron guardar las notas.'))
    } finally {
      setGuardando(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  if (cargando) {
    return <div className="py-24 flex justify-center"><Spinner size="lg" /></div>
  }

  if (!dictado) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="font-semibold text-gray-700">{error ?? 'No encontramos esa materia.'}</p>
        <Link to={ROUTES.DOCENTE} className="text-sm text-brand-azul hover:underline">Volver a mis cursos</Link>
      </div>
    )
  }

  if (!esTitular) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3">
          <Lock size={30} className="text-gray-300 mx-auto" />
          <p className="font-semibold text-gray-700">Solo el docente titular puede cargar estas notas</p>
          <p className="text-sm text-gray-400">
            {dictado.materia.nombre} en {nombreCompletoDeCurso(dictado.curso)} está asignada a otro docente.
          </p>
          <Link to={ROUTES.DOCENTE} className="inline-block text-sm text-brand-azul hover:underline">
            Volver a mis cursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

      <div className="space-y-3">
        <Link to={ROUTES.DOCENTE} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-azul">
          <ArrowLeft size={14} /> Mis cursos
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
              <ClipboardList size={22} className="text-brand-azul" /> {dictado.materia.nombre}
            </h1>
            <p className="text-gray-500 text-sm capitalize">
              {nombreCompletoDeCurso(dictado.curso)} · ciclo {dictado.curso.ciclo?.anio}
            </p>
          </div>
          <Button variant="primary" onClick={guardar} loading={guardando}
            disabled={modificadas.length === 0 || cantidadErrores > 0}>
            <Save size={15} /> Guardar notas{modificadas.length > 0 ? ` (${modificadas.length})` : ''}
          </Button>
        </div>
      </div>

      {/* Trimestres */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit" role="tablist" aria-label="Trimestre">
        {PERIODOS.map(p => (
          <button key={p.numero} role="tab" aria-selected={periodo === p.numero}
            onClick={() => cambiarPeriodo(p.numero)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              periodo === p.numero ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {p.nombre}
          </button>
        ))}
      </div>

      {cantidadErrores > 0 && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            {cantidadErrores === 1 ? 'Hay una nota inválida' : `Hay ${cantidadErrores} notas inválidas`}.
            Las notas van de 1 a 10, con hasta dos decimales. Corregí las celdas marcadas para poder guardar.
          </span>
        </div>
      )}
      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}
      {aviso && (
        <div className="flex gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" /> <span>{aviso}</span>
        </div>
      )}

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-400">
          Todavía no hay alumnos matriculados en este curso.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Legajo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alumno</th>
                  {INSTANCIAS.map(i => (
                    <th key={i} className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                      Nota {i}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Promedio</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-50 ${cargandoPeriodo ? 'opacity-50' : ''}`}>
                {alumnos.map(({ id: matriculaId, alumno }) => {
                  const promedio = promedios[matriculaId]
                  const filaModificada = INSTANCIAS.some(i => modificadas.includes(claveCelda(matriculaId, i)))
                  return (
                    <tr key={matriculaId} className="hover:bg-gray-50/60">
                      <td className="px-5 py-2.5 font-mono text-xs text-gray-500">{alumno.legajo}</td>
                      <td className="px-5 py-2.5 text-gray-800 whitespace-nowrap">{alumno.apellido}, {alumno.nombre}</td>
                      {INSTANCIAS.map(instancia => {
                        const clave = claveCelda(matriculaId, instancia)
                        const mensaje = errores[clave]
                        const cambiada = modificadas.includes(clave)
                        return (
                          <td key={instancia} className="px-3 py-2 text-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={valores[clave] ?? ''}
                              onChange={e => escribir(clave, e.target.value)}
                              disabled={cargandoPeriodo || guardando}
                              aria-label={`Nota ${instancia} de ${alumno.apellido}, ${alumno.nombre}`}
                              aria-invalid={!!mensaje}
                              title={mensaje ?? ''}
                              className={`w-16 text-center rounded-lg border px-2 py-1.5 outline-none tabular-nums
                                focus:ring-2 focus:ring-brand-azul/20 ${
                                mensaje ? 'border-red-400 bg-red-50 text-red-700'
                                  : cambiada ? 'border-brand-naranja/60 bg-orange-50'
                                  : 'border-gray-200'}`}
                            />
                          </td>
                        )
                      })}
                      <td className="px-5 py-2.5 text-center tabular-nums">
                        {promedio ? (
                          <span className={`font-semibold ${filaModificada ? 'text-gray-300' : 'text-gray-800'}`}
                            title={filaModificada ? 'Se recalcula al guardar' : `${promedio.notas_cargadas} nota(s)`}>
                            {textoDePromedio(promedio.promedio)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Las celdas en naranja tienen cambios sin guardar. El promedio lo calcula la base de datos
        cada vez que se guarda, a partir de las notas cargadas del trimestre.
      </p>
    </div>
  )
}
