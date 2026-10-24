/**
 * @file IndicadoresPage.jsx
 * @description Indicadores institucionales para la Autoridad (HU3 · REQ-21).
 *
 * Caso de uso: la Autoridad elige el período y ve matrícula, asistencia y
 * rendimiento. Si no hay datos, el sistema lo dice. El reporte se exporta a PDF
 * con la impresión del navegador ("Guardar como PDF"), sin librerías nuevas.
 */

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Printer, Users, CalendarCheck, GraduationCap, School, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { academico, indicadores, PERIODOS_REPORTE, mensajeDeError } from '@/services'
import { formatDate, hoyISO } from '@/utils/formatDate'

const formato = (valor, sufijo = '') => (valor === null || valor === undefined ? 'Sin datos' : `${valor}${sufijo}`)

/** Barra horizontal simple: el ancho es el porcentaje sobre el máximo. */
function Barra({ valor, maximo, color = 'bg-brand-azul' }) {
  const ancho = valor === null || !maximo ? 0 : Math.max(2, Math.round((valor / maximo) * 100))
  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden" aria-hidden="true">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${ancho}%` }} />
    </div>
  )
}

function Tarjeta({ icono: Icono, titulo, valor, detalle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-sm text-gray-500"><Icono size={16} className="text-brand-azul" /> {titulo}</div>
      <p className="font-display font-bold text-gray-800 text-2xl mt-2">{valor}</p>
      {detalle && <p className="text-xs text-gray-400 mt-1">{detalle}</p>}
    </div>
  )
}

export default function IndicadoresPage() {
  const [ciclo,    setCiclo]    = useState(null)
  const [periodo,  setPeriodo]  = useState('ciclo')
  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const activo = ciclo ?? await academico.cicloActivo()
      setCiclo(activo)
      setDatos(activo ? await indicadores.calcular({ cicloId: activo.id, periodo }) : null)
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos calcular los indicadores.'))
    } finally {
      setCargando(false)
    }
  }, [ciclo, periodo])

  useEffect(() => { cargar() }, [cargar])

  const sinNotas = datos && datos.totales.promedio === null
  const sinAsistencia = datos && datos.totales.registros === 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 documento-imprimible">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <BarChart3 size={22} className="text-brand-azul" /> Indicadores institucionales
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Ciclo {ciclo?.anio ?? '—'} · {PERIODOS_REPORTE.find(p => p.clave === periodo)?.etiqueta} ·
            generado el {formatDate(hoyISO())}
          </p>
        </div>
        <div className="flex items-end gap-3 no-imprimir">
          <div>
            <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select id="periodo" value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20">
              {PERIODOS_REPORTE.map(p => <option key={p.clave} value={p.clave}>{p.etiqueta}</option>)}
            </select>
          </div>
          <Button variant="outline" onClick={() => window.print()} disabled={!datos || datos.sinDatos}>
            <Printer size={15} /> Exportar PDF
          </Button>
        </div>
      </div>

      {cargando ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      ) : !datos || datos.sinDatos ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <BarChart3 size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Sin datos disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Todavía no hay alumnos matriculados en el ciclo activo.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tarjeta icono={Users} titulo="Alumnos matriculados" valor={datos.totales.alumnos} detalle={`${datos.totales.cursos} cursos con alumnos`} />
            <Tarjeta icono={CalendarCheck} titulo="Asistencia" valor={formato(datos.totales.asistencia, ' %')}
              detalle={sinAsistencia ? 'No hay asistencia cargada en el período' : `${datos.totales.registros} registros`} />
            <Tarjeta icono={GraduationCap} titulo="Rendimiento promedio" valor={formato(datos.totales.promedio)}
              detalle={sinNotas ? 'No hay notas cargadas en el período' : 'Sobre 10, promedio de los promedios'} />
            <Tarjeta icono={School} titulo="Niveles con matrícula" valor={datos.porNivel.length} />
          </div>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-display font-bold text-gray-700">Matrícula por nivel</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase">
                <th className="py-2">Nivel</th><th>Alumnos</th><th>Cupo</th><th className="w-1/3">Ocupación</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {datos.porNivel.map(n => (
                  <tr key={n.nivel}>
                    <td className="py-2 capitalize font-medium text-gray-700">{n.nivel}</td>
                    <td>{n.alumnos}</td><td>{n.cupo}</td>
                    <td><div className="flex items-center gap-3"><Barra valor={n.ocupacion} maximo={100} /><span className="text-xs text-gray-500 w-12">{formato(n.ocupacion, ' %')}</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-display font-bold text-gray-700">Por curso</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase">
                <th className="py-2">Curso</th><th>Alumnos</th><th>Asistencia</th><th>Promedio</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {datos.porCurso.map(c => (
                  <tr key={c.id}>
                    <td className="py-2 capitalize font-medium text-gray-700">{c.nombre}</td>
                    <td>{c.alumnos}/{c.cupo}</td>
                    <td>{formato(c.asistencia, ' %')}</td>
                    <td>{formato(c.promedio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-display font-bold text-gray-700">Rendimiento por materia</h2>
            {datos.porMateria.length === 0 ? (
              <p className="text-sm text-gray-400">Sin datos disponibles: no hay notas cargadas en el período.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="py-2">Materia</th><th>Alumnos con nota</th><th className="w-1/3">Promedio</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {datos.porMateria.map(m => (
                    <tr key={m.materia}>
                      <td className="py-2 font-medium text-gray-700">{m.materia}</td>
                      <td>{m.alumnos}</td>
                      <td><div className="flex items-center gap-3"><Barra valor={m.promedio} maximo={10} color="bg-brand-naranja" /><span className="text-xs text-gray-500 w-12">{formato(m.promedio)}</span></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <p className="text-xs text-gray-400">
            Trimestres: 1.º de marzo a mayo, 2.º de junio a agosto y 3.º de septiembre a diciembre.
            La asistencia cuenta las llegadas tarde como presentes; las inasistencias justificadas, como ausentes.
          </p>
        </>
      )}
    </div>
  )
}
