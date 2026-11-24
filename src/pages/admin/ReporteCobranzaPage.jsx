/**
 * @file ReporteCobranzaPage.jsx
 * @description Reporte de cobranza (Parte 3 · Etapa 4 · REQ-32).
 *
 * Ingresos de un período y facturas con pago completo o incompleto. El período
 * es el mes de la factura, igual que en el historial de la app. Los números
 * salen de la vista facturas_estado, la misma que lee la familia en el teléfono.
 *
 * El mismo período se ve de cuatro formas: por factura, por alumno (agrupado por año,
 * con su curso), por deporte y por recorrido de transporte (agrupados por nivel).
 *
 * Lo ven Administración y Autoridad (RLS de docs/supabase-cobranza.sql). Se
 * exporta a PDF con la impresión del navegador, como los Indicadores (HU3).
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Receipt, Printer, AlertTriangle, Wallet, CheckCircle2, Clock, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  academico, cobranza, ESTADOS_FACTURA, ESTADOS_ITEM, mesesDelCiclo, mensajeDeError,
  resumirPorAlumno, agruparPorServicio, horarioDeGrupo,
} from '@/services'
import { formatDate, formatMes, formatMesTitulo, hoyISO } from '@/utils/formatDate'
import { formatPesos } from '@/utils/formatPesos'

const FILTROS = [
  { clave: 'todas',       etiqueta: 'Todas' },
  { clave: 'completas',   etiqueta: 'Pago completo' },
  { clave: 'incompletas', etiqueta: 'Pago incompleto' },
]

function Tarjeta({ icono: Icono, titulo, valor, detalle }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-sm text-gray-500"><Icono size={16} className="text-brand-azul" /> {titulo}</div>
      <p className="font-display font-bold text-gray-800 text-2xl mt-2">{valor}</p>
      {detalle && <p className="text-xs text-gray-400 mt-1">{detalle}</p>}
    </div>
  )
}

function SelectorMes({ id, etiqueta, valor, meses, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{etiqueta}</label>
      <select id={id} value={valor} onChange={e => onChange(e.target.value)}
        className="border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20">
        {meses.map(m => <option key={m} value={m}>{formatMesTitulo(m)}</option>)}
      </select>
    </div>
  )
}

const nombreDeAlumno = a => (a ? `${a.apellido}, ${a.nombre}` : 'Alumno no disponible')

/** Las cuatro formas de ver el mismo período (filas de la plantilla del 3.er parcial). */
const VISTAS = [
  { clave: 'facturas',   etiqueta: 'Facturas' },
  { clave: 'alumnos',    etiqueta: 'Por alumno' },
  { clave: 'deportes',   etiqueta: 'Por deporte' },
  { clave: 'recorridos', etiqueta: 'Por recorrido' },
]

const TH = 'py-2 pr-3'

/** Pagos completos e incompletos por año y por alumno, con su curso. */
function VistaPorAlumno({ facturas }) {
  const grupos = resumirPorAlumno(facturas)
  return grupos.map(grupo => (
    <section key={grupo.anio} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-display font-bold text-gray-700">Año {grupo.anio} <span className="font-normal text-sm text-gray-400">· {grupo.alumnos.length} alumnos</span></h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 uppercase">
            <th className={TH}>Alumno</th><th className="pr-3">Curso</th>
            <th className="pr-3 text-right">Facturado</th><th className="pr-3 text-right">Pagado</th><th className="pr-3 text-right">Saldo</th>
            <th className="pr-3 text-center">Pago completo</th><th className="text-center">Pago incompleto</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {grupo.alumnos.map(a => (
              <tr key={a.alumno?.id ?? a.curso}>
                <td className="py-2 pr-3 font-medium text-gray-700">
                  {nombreDeAlumno(a.alumno)}
                  {a.alumno?.legajo && <span className="block text-xs font-normal text-gray-400">Legajo {a.alumno.legajo}</span>}
                </td>
                <td className="pr-3">{a.curso} <span className="text-xs text-gray-400">{a.nivel}</span></td>
                <td className="pr-3 text-right">{formatPesos(a.facturado)}</td>
                <td className="pr-3 text-right">{formatPesos(a.cobrado)}</td>
                <td className="pr-3 text-right font-medium">{formatPesos(a.saldo)}</td>
                <td className="pr-3 text-center">{a.completas}</td>
                <td className="text-center">{a.incompletas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  ))
}

/**
 * Pagos de cada deporte o de cada recorrido, por nivel. En los deportes, el horario y el
 * profesor a cargo salen del grupo de cada inscripción (versión 1.1).
 */
function VistaPorServicio({ items, tipo }) {
  const grupos = agruparPorServicio(items, tipo)
  const esDeporte = tipo === 'deporte'
  if (grupos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-400">
        No hay {esDeporte ? 'deportes' : 'recorridos de transporte'} facturados en el período.
      </div>
    )
  }
  return (
    <>
      {grupos.map(grupo => (
        <section key={grupo.nombre} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="font-display font-bold text-gray-700">{grupo.nombre}</h2>
            <p className="text-sm text-gray-500">
              Facturado {formatPesos(grupo.totales.facturado)} · Cobrado {formatPesos(grupo.totales.cobrado)} · Pendiente {formatPesos(grupo.totales.pendiente)}
            </p>
          </div>
          {grupo.niveles.map(n => (
            <div key={n.nivel} className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nivel {n.nivel}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-400 uppercase">
                    <th className={TH}>Alumno</th><th className="pr-3">Curso</th><th className="pr-3">Mes</th>
                    <th className="pr-3 text-right">Importe</th><th className="pr-3">Estado</th>
                    {esDeporte && <><th className="pr-3">Horario</th><th>Profesor a cargo</th></>}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {n.filas.map(i => {
                      const estado = ESTADOS_ITEM[i.estado]
                      return (
                        <tr key={i.id}>
                          <td className="py-2 pr-3 font-medium text-gray-700">{nombreDeAlumno(i.alumno)}</td>
                          <td className="pr-3">{i.curso}</td>
                          <td className="pr-3">{formatMesTitulo(i.periodo)}</td>
                          <td className="pr-3 text-right">{formatPesos(i.importe)}</td>
                          <td className="pr-3"><Badge color={estado.color}>{estado.etiqueta}</Badge></td>
                          {esDeporte && (
                            <>
                              <td className="pr-3">{horarioDeGrupo(i.grupo) || <span className="text-gray-400">Sin grupo</span>}</td>
                              <td>{i.grupo?.profesor ?? <span className="text-gray-400">Sin grupo</span>}</td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ))}
      {esDeporte && (
        <p className="text-xs text-gray-400">
          Horario y profesor a cargo: los del grupo en el que estaba inscripto el alumno ese mes. El pago se discrimina
          por deporte, nivel, horario y profesor.
        </p>
      )}
    </>
  )
}

export default function ReporteCobranzaPage() {
  const [meses,    setMeses]    = useState([])
  const [desde,    setDesde]    = useState('')
  const [hasta,    setHasta]    = useState('')
  const [filtro,   setFiltro]   = useState('todas')
  const [vista,    setVista]    = useState('facturas')
  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  // 1) Meses del ciclo vigente; el reporte arranca mostrando el ciclo completo.
  useEffect(() => {
    const iniciar = async () => {
      try {
        const delCiclo = mesesDelCiclo(await academico.cicloActivo())
        setMeses(delCiclo)
        setDesde(delCiclo[0] ?? '')
        setHasta(delCiclo.at(-1) ?? '')
        if (delCiclo.length === 0) setCargando(false)
      } catch (err) {
        setError(mensajeDeError(err, 'No pudimos cargar el ciclo lectivo.'))
        setCargando(false)
      }
    }
    void iniciar()
  }, [])

  const rangoInvalido = desde && hasta && desde > hasta

  // 2) El reporte del rango elegido.
  const cargar = useCallback(async () => {
    if (!desde || !hasta || rangoInvalido) return
    setCargando(true)
    setError(null)
    try {
      setDatos(await cobranza.reporte({ desde, hasta }))
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos armar el reporte de cobranza.'))
    } finally {
      setCargando(false)
    }
  }, [desde, hasta, rangoInvalido])

  useEffect(() => { void cargar() }, [cargar])

  const visibles = useMemo(() => {
    const facturas = datos?.facturas ?? []
    if (filtro === 'todas') return facturas
    const completa = filtro === 'completas'
    return facturas.filter(f => Boolean(ESTADOS_FACTURA[f.estado]?.completa) === completa)
  }, [datos, filtro])

  const t = datos?.totales
  const sinFacturas = !cargando && !error && !rangoInvalido && (meses.length === 0 || t?.cantidad === 0)
  const conDatos = !cargando && !error && !rangoInvalido && t?.cantidad > 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 documento-imprimible">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <Receipt size={22} className="text-brand-azul" /> Reporte de cobranza
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {desde && hasta ? `${formatMesTitulo(desde)} a ${formatMes(hasta)}` : '—'}
            {' '}· generado el {formatDate(hoyISO())}
          </p>
        </div>
        <div className="flex items-end gap-3 flex-wrap no-imprimir">
          <SelectorMes id="desde" etiqueta="Desde" valor={desde} meses={meses} onChange={setDesde} />
          <SelectorMes id="hasta" etiqueta="Hasta" valor={hasta} meses={meses} onChange={setHasta} />
          <Button variant="outline" onClick={() => window.print()} disabled={!conDatos}>
            <Printer size={15} /> Exportar PDF
          </Button>
        </div>
      </div>

      {rangoInvalido && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> El mes “desde” tiene que ser anterior o igual al mes “hasta”.
        </div>
      )}

      {cargando && !rangoInvalido && <div className="py-20 flex justify-center"><Spinner size="lg" /></div>}

      {!cargando && error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {sinFacturas && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Receipt size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Sin datos disponibles</p>
          <p className="text-sm text-gray-400 mt-1">No hay facturas generadas en el período elegido.</p>
        </div>
      )}

      {conDatos && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tarjeta icono={Wallet} titulo="Facturado" valor={formatPesos(t.facturado)} detalle={`${t.cantidad} facturas`} />
            <Tarjeta icono={CheckCircle2} titulo="Cobrado" valor={formatPesos(t.cobrado)} detalle="Transferencias informadas" />
            <Tarjeta icono={Clock} titulo="En proceso" valor={formatPesos(t.enProceso)} detalle="Comprobantes emitidos sin transferencia" />
            <Tarjeta icono={Scale} titulo="Saldo pendiente" valor={formatPesos(t.saldo)} detalle={`${t.vencidas} facturas vencidas`} />
          </div>

          <fieldset className="flex flex-wrap gap-1 no-imprimir">
            <legend className="sr-only">Cómo ver el período</legend>
            {VISTAS.map(v => (
              <button key={v.clave} type="button" onClick={() => setVista(v.clave)} aria-pressed={vista === v.clave}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${vista === v.clave ? 'bg-brand-azul text-white border-brand-azul' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {v.etiqueta}
              </button>
            ))}
          </fieldset>

          {vista === 'alumnos' && <VistaPorAlumno facturas={datos.facturas} />}
          {vista === 'deportes' && <VistaPorServicio items={datos.items} tipo="deporte" />}
          {vista === 'recorridos' && <VistaPorServicio items={datos.items} tipo="transporte" />}

          {vista === 'facturas' && <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display font-bold text-gray-700">
                Facturas <span className="font-normal text-sm text-gray-400">· {t.completas} con pago completo · {t.incompletas} con pago incompleto</span>
              </h2>
              <fieldset className="flex gap-1 no-imprimir">
                <legend className="sr-only">Filtrar facturas</legend>
                {FILTROS.map(f => (
                  <button key={f.clave} type="button" onClick={() => setFiltro(f.clave)} aria-pressed={filtro === f.clave}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filtro === f.clave ? 'bg-brand-azul text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {f.etiqueta}
                  </button>
                ))}
              </fieldset>
            </div>

            {visibles.length === 0 ? (
              <p className="text-sm text-gray-400">No hay facturas con ese estado en el período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-400 uppercase">
                    <th className="py-2 pr-3">N.º</th><th className="pr-3">Alumno</th><th className="pr-3">Mes</th>
                    <th className="pr-3 text-right">Total</th><th className="pr-3 text-right">Pagado</th>
                    <th className="pr-3 text-right">Saldo</th><th>Estado</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {visibles.map(f => {
                      const estado = ESTADOS_FACTURA[f.estado] ?? { etiqueta: f.estado, color: 'gray' }
                      return (
                        <tr key={f.id}>
                          <td className="py-2 pr-3 text-gray-500">{f.numero}</td>
                          <td className="pr-3 font-medium text-gray-700">
                            {nombreDeAlumno(f.alumno)}
                            {f.alumno?.legajo && <span className="block text-xs font-normal text-gray-400">Legajo {f.alumno.legajo}</span>}
                          </td>
                          <td className="pr-3">{formatMesTitulo(f.periodo)}</td>
                          <td className="pr-3 text-right">{formatPesos(f.total)}</td>
                          <td className="pr-3 text-right">{formatPesos(f.pagado)}</td>
                          <td className="pr-3 text-right font-medium">{formatPesos(f.saldo)}</td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              <Badge color={estado.color}>{estado.etiqueta}</Badge>
                              {f.vencida && <Badge color="red">Vencida</Badge>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>}

          <p className="text-xs text-gray-400">
            El período es el mes de la factura. Pago completo: la factura no tiene saldo. Pago incompleto: queda al
            menos un ítem sin pagar. Un ítem cuenta como pagado cuando la familia informa la transferencia.
          </p>
        </>
      )}
    </div>
  )
}
