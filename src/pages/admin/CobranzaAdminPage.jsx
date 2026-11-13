/**
 * @file CobranzaAdminPage.jsx
 * @description Precios y facturación (Parte 3 · Etapa 4).
 *
 * Regla del enunciado: "los administradores solamente pueden especificar el valor
 * de la cuota, deportes y servicios de transporte y comedor". Por eso se edita
 * solo el importe: no se crean ni se borran conceptos.
 *
 * Permisos en dos capas: la base solo deja escribir al rol admin (RLS y
 * generar_facturas); esta pantalla, además, muestra a la Autoridad todo en modo
 * consulta, sin campos editables ni el botón de generar.
 */

import { useState, useEffect, useCallback, useContext, useRef } from 'react'
import {
  Wallet, AlertTriangle, CheckCircle2, Eye, FilePlus2, Pencil, Check,
  GraduationCap, UtensilsCrossed, Trophy, Bus,
} from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import {
  academico, cobranza, TIPOS_CONCEPTO, validarImporte, mesesDelCiclo, mensajeDeError,
} from '@/services'
import { ROLES } from '@/types/roles'
import { formatMes, formatMesTitulo } from '@/utils/formatDate'
import { formatPesos } from '@/utils/formatPesos'

function Aviso({ tipo = 'error', children }) {
  const estilos = tipo === 'ok'
    ? 'bg-green-50 border-green-200 text-green-800'
    : 'bg-red-50 border-red-200 text-red-700'
  const Icono = tipo === 'ok' ? CheckCircle2 : AlertTriangle
  return (
    <div className={`flex gap-2 border rounded-xl p-3 text-sm ${estilos}`}>
      <Icono size={16} className="flex-shrink-0 mt-0.5" /> <span>{children}</span>
    </div>
  )
}

/**
 * Cómo se distingue cada categoría: ícono y color propios. Las clases van
 * escritas completas para que Tailwind las incluya en la compilación.
 */
const ESTILO_DE_TIPO = {
  cuota:      { icono: GraduationCap,   borde: 'border-l-brand-azul', fondo: 'bg-blue-50',   texto: 'text-brand-azul' },
  comedor:    { icono: UtensilsCrossed, borde: 'border-l-orange-500', fondo: 'bg-orange-50', texto: 'text-orange-600' },
  deporte:    { icono: Trophy,          borde: 'border-l-green-600',  fondo: 'bg-green-50',  texto: 'text-green-700' },
  transporte: { icono: Bus,             borde: 'border-l-purple-600', fondo: 'bg-purple-50', texto: 'text-purple-700' },
}

/**
 * Un concepto con su importe. Se muestra como texto; para cambiarlo hay que
 * tocar "Editar", y recién ahí aparecen el campo, "Guardar" y "Cancelar".
 */
function FilaConcepto({ concepto, editable, onGuardado }) {
  const original = String(Number(concepto.importe))
  const [editando,  setEditando]  = useState(false)
  const [texto,     setTexto]     = useState(original)
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState(null)
  const [guardado,  setGuardado]  = useState(false)

  const cambio = texto.trim() !== original
  const errorDeFormato = cambio ? validarImporte(texto) : null

  // Al tocar "Editar", el cursor pasa al campo (solo en respuesta a ese clic).
  const campo = useRef(null)
  useEffect(() => { if (editando) campo.current?.focus() }, [editando])

  const editar = () => {
    setTexto(original)
    setEditando(true)
    setGuardado(false)
    setError(null)
  }

  const cancelar = () => {
    setTexto(original)
    setEditando(false)
    setError(null)
  }

  const guardar = async e => {
    e.preventDefault()
    if (!cambio || errorDeFormato) return
    setGuardando(true)
    setError(null)
    try {
      const actualizado = await cobranza.actualizarImporte(concepto.id, texto)
      setEditando(false)
      setGuardado(true)
      onGuardado(actualizado)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el precio.'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <li className="py-3">
      <form onSubmit={guardar} className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label htmlFor={`importe-${concepto.id}`} className="flex-1 min-w-[10rem] text-sm font-medium text-gray-700">
          {concepto.nombre}
        </label>
        {editando ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">$</span>
            <input id={`importe-${concepto.id}`} ref={campo} type="text" inputMode="decimal" value={texto}
              onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === 'Escape' && cancelar()}
              aria-invalid={!!errorDeFormato}
              className="w-32 border border-gray-300 rounded-xl px-3 py-1.5 text-sm text-right outline-none focus:ring-2 focus:ring-brand-azul/20" />
            <Button type="submit" size="sm" variant="secondary" loading={guardando} disabled={!cambio || !!errorDeFormato}>
              <Check size={14} /> Guardar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelar} disabled={guardando}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">{formatPesos(concepto.importe)}</span>
            {editable && (
              <Button type="button" size="sm" variant="outline" onClick={editar} aria-label={`Editar el precio de ${concepto.nombre}`}>
                <Pencil size={13} /> Editar
              </Button>
            )}
          </div>
        )}
        {editando && (errorDeFormato || error) && <p className="basis-full text-xs text-red-600">{errorDeFormato ?? error}</p>}
        {guardado && <p className="basis-full text-xs text-green-700">Precio guardado. Se aplica a las facturas que se generen desde ahora.</p>}
      </form>
    </li>
  )
}

export default function CobranzaAdminPage() {
  const { profile } = useContext(AuthContext)
  const esAdmin = profile?.rol === ROLES.ADMIN

  const [conceptos, setConceptos] = useState([])
  const [meses,     setMeses]     = useState([])
  const [mes,       setMes]       = useState('')
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)

  const [confirmando, setConfirmando] = useState(false)
  const [generando,   setGenerando]   = useState(false)
  const [resultado,   setResultado]   = useState(null) // { tipo: 'ok'|'error', texto }

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [ciclo, lista] = await Promise.all([academico.cicloActivo(), cobranza.conceptos()])
      const delCiclo = mesesDelCiclo(ciclo)
      setConceptos(lista)
      setMeses(delCiclo)
      setMes(actual => actual || delCiclo[0] || '')
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar los precios.'))
    } finally {
      setCargando(false)
    }
  }, [])

  // cargar() atrapa sus errores: la promesa nunca queda rechazada sin manejar.
  useEffect(() => { void cargar() }, [cargar])

  const alGuardar = actualizado =>
    setConceptos(lista => lista.map(c => (c.id === actualizado.id ? actualizado : c)))

  const generar = async () => {
    setGenerando(true)
    setResultado(null)
    try {
      const creadas = await cobranza.generarFacturas(mes)
      setResultado(creadas > 0
        ? { tipo: 'ok', texto: `Se generaron ${creadas} facturas de ${formatMes(mes)}.` }
        : { tipo: 'ok', texto: `No se generó ninguna factura: ${formatMes(mes)} ya estaba facturado para todos los alumnos con matrícula activa.` })
    } catch (err) {
      setResultado({ tipo: 'error', texto: mensajeDeError(err, 'No se pudieron generar las facturas.') })
    } finally {
      setGenerando(false)
      setConfirmando(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Wallet size={22} className="text-brand-azul" /> Precios y facturación
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Valores de la cuota y de los servicios, y facturas mensuales que ven las familias en la app.
        </p>
      </div>

      {!esAdmin && (
        <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          <Eye size={16} className="flex-shrink-0 mt-0.5" />
          Modo consulta: solo la Administración puede cambiar los precios y generar las facturas.
        </div>
      )}

      {cargando && <div className="py-20 flex justify-center"><Spinner size="lg" /></div>}
      {!cargando && error && <Aviso>{error}</Aviso>}
      {!cargando && !error && (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-gray-700">Precios vigentes</h2>
              <p className="text-xs text-gray-400 mt-1">
                Un cambio de precio no modifica las facturas ya emitidas: cada factura conserva el importe con el que se generó.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {TIPOS_CONCEPTO.map(tipo => {
                const delTipo = conceptos.filter(c => c.tipo === tipo.clave)
                if (delTipo.length === 0) return null
                const estilo = ESTILO_DE_TIPO[tipo.clave]
                const Icono = estilo.icono
                return (
                  <div key={tipo.clave} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${estilo.borde} p-5`}>
                    <h3 className="flex items-center gap-2 font-display font-semibold text-gray-700">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${estilo.fondo} ${estilo.texto}`}>
                        <Icono size={16} />
                      </span>
                      {tipo.etiqueta}
                    </h3>
                    <ul className="divide-y divide-gray-100 mt-2">
                      {delTipo.map(c => (
                        <FilaConcepto key={c.id} concepto={c} editable={esAdmin} onGuardado={alGuardar} />
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>

          {esAdmin && (
            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-display font-bold text-gray-700">Generar las facturas del mes</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Crea una factura por cada alumno con matrícula activa: la cuota más los servicios vigentes en ese mes.
                  Vence el día 10. Si un alumno ya tiene la factura de ese mes, no se modifica.
                </p>
              </div>
              {meses.length === 0 ? (
                <Aviso>No hay un ciclo lectivo activo: no hay meses para facturar.</Aviso>
              ) : (
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                    <select id="mes" value={mes} onChange={e => { setMes(e.target.value); setResultado(null) }}
                      className="border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20">
                      {meses.map(m => <option key={m} value={m}>{formatMesTitulo(m)}</option>)}
                    </select>
                  </div>
                  <Button onClick={() => setConfirmando(true)} disabled={!mes}>
                    <FilePlus2 size={15} /> Generar facturas
                  </Button>
                </div>
              )}
              {resultado && <Aviso tipo={resultado.tipo}>{resultado.texto}</Aviso>}
            </section>
          )}
        </>
      )}

      <Modal open={confirmando} onClose={() => !generando && setConfirmando(false)} title="Generar facturas" size="sm">
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Se van a generar las facturas de <strong>{formatMes(mes)}</strong> para todos los
            alumnos con matrícula activa. Las familias las verán en la app.
          </p>
          <p>Las facturas que ya existan para ese mes no se modifican.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmando(false)} disabled={generando}>Cancelar</Button>
            <Button onClick={generar} loading={generando}>Generar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
