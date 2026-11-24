/**
 * @file AvisosCorreoPage.jsx
 * @description Avisos por correo (Parte 3 · versión 1.1 · Funcionalidades 1 y 2).
 *
 *  1. "Enviar por mail el último día hábil del mes un recordatorio del total que cada
 *     padre debe abonar, detallando la composición de ese valor. Adjuntar la factura."
 *  2. "Enviar el día 20 de cada mes a cada padre, la deuda en caso de no haber
 *     realizado el pago completo."
 *
 * Los correos salen solos: una tarea diaria de la base (pg_cron, 9:00) llama a la Edge
 * Function `enviar-avisos`, que manda los avisos cuya fecha es hoy. Esta pantalla muestra
 * las fechas de envío, el historial de correos y, para la Administración, el botón
 * "Enviar ahora", que simula una fecha: los avisos del ciclo 2027 todavía no llegaron.
 *
 * Lo ven Administración y Autoridad; enviar, solo la Administración (la función lo
 * vuelve a comprobar del lado del servidor).
 */

import { useState, useEffect, useCallback, useContext } from 'react'
import { Mail, Send, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { cobranza, TIPOS_AVISO, mensajeDeError } from '@/services'
import { ROLES } from '@/types/roles'
import { formatDate, formatMes, hoyISO } from '@/utils/formatDate'
import { formatPesos } from '@/utils/formatPesos'

const ORIGENES = {
  programado: 'Tarea diaria',
  manual:     'Envío manual',
}

/** Fecha y hora de un envío: '24/11/2026 15:42'. */
function fechaYHora(timestamp) {
  return new Date(timestamp).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AvisosCorreoPage() {
  const { profile } = useContext(AuthContext)
  const esAdmin = profile?.rol === ROLES.ADMIN

  const [fechas,     setFechas]     = useState([])
  const [envios,     setEnvios]     = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [error,      setError]      = useState(null)
  const [aEnviar,    setAEnviar]    = useState(null)   // fecha elegida para "Enviar ahora"
  const [enviando,   setEnviando]   = useState(false)
  const [resultado,  setResultado]  = useState(null)

  const cargar = useCallback(async () => {
    setError(null)
    try {
      const [porFecha, historial] = await Promise.all([cobranza.avisosPorFecha(), cobranza.enviosDeAvisos()])
      setFechas(porFecha)
      setEnvios(historial)
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar los avisos.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  async function enviar() {
    setEnviando(true)
    setResultado(null)
    try {
      const respuesta = await cobranza.enviarAvisos(aEnviar.fecha)
      setResultado({ ok: true, ...respuesta })
      await cargar()
    } catch (err) {
      setResultado({ ok: false, mensaje: mensajeDeError(err, 'No se pudieron enviar los avisos.') })
    } finally {
      setEnviando(false)
      setAEnviar(null)
    }
  }

  const hoy = hoyISO()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Mail size={22} className="text-brand-azul" /> Avisos por correo
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-3xl">
          El <strong>último día hábil</strong> de cada mes sale el recordatorio del total a pagar, con su
          composición y la factura en PDF; el <strong>día 20</strong>, el aviso de deuda si la factura no se
          pagó completa. Se envían solos todos los días a las 9:00, a los tutores de cada alumno.
        </p>
      </div>

      {resultado && <ResultadoDelEnvio resultado={resultado} />}

      {cargando && <div className="flex justify-center py-10"><Spinner /></div>}
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-3">
          <AlertTriangle size={16} /> {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-display font-bold text-gray-700">Fechas de envío</h2>
            {fechas.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no hay facturas: los avisos aparecen al generarlas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-400 uppercase">
                    <th className="py-2 pr-3">Fecha</th><th className="pr-3">Avisos</th>
                    <th className="pr-3 text-right">Importe</th><th className="pr-3">Estado</th>
                    {esAdmin && <th className="text-right">Simular</th>}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {fechas.map(f => (
                      <tr key={f.fecha}>
                        <td className="py-2 pr-3 font-medium text-gray-700">{formatDate(f.fecha)}</td>
                        <td className="pr-3 space-x-1">
                          {f.recordatorio > 0 && <Badge color={TIPOS_AVISO.recordatorio.color}>{f.recordatorio} recordatorio{f.recordatorio > 1 ? 's' : ''}</Badge>}
                          {f.deuda > 0 && <Badge color={TIPOS_AVISO.deuda.color}>{f.deuda} de deuda</Badge>}
                        </td>
                        <td className="pr-3 text-right tabular-nums">{formatPesos(f.importe)}</td>
                        <td className="pr-3">
                          {f.fecha < hoy
                            ? <span className="text-gray-400">Fecha pasada</span>
                            : <span className="inline-flex items-center gap-1 text-gray-500"><Clock size={13} /> Programado</span>}
                        </td>
                        {esAdmin && (
                          <td className="text-right">
                            <Button size="sm" variant="outline" onClick={() => setAEnviar(f)}>
                              <Send size={14} /> Enviar ahora
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-display font-bold text-gray-700">
              Historial de envíos <span className="font-normal text-sm text-gray-400">· los últimos 50</span>
            </h2>
            {envios.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no se envió ningún correo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-400 uppercase">
                    <th className="py-2 pr-3">Enviado</th><th className="pr-3">Aviso</th><th className="pr-3">Tutor</th>
                    <th className="pr-3">Origen</th><th>Resultado</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {envios.map(e => (
                      <tr key={e.id} className="align-top">
                        <td className="py-2 pr-3 text-gray-500 whitespace-nowrap">{fechaYHora(e.created_at)}</td>
                        <td className="pr-3">
                          <span className="font-medium text-gray-700">{TIPOS_AVISO[e.tipo]?.etiqueta ?? e.tipo}</span>
                          <span className="block text-xs text-gray-400">
                            Factura N.º {e.factura?.numero} · {e.factura?.periodo ? formatMes(e.factura.periodo) : ''} · del {formatDate(e.fecha_aviso)}
                          </span>
                        </td>
                        <td className="pr-3 text-gray-600">
                          {e.destinatario}
                          {e.enviado_a !== e.destinatario && <span className="block text-xs text-gray-400">prueba: llegó a {e.enviado_a}</span>}
                        </td>
                        <td className="pr-3 text-gray-500">{ORIGENES[e.origen] ?? e.origen}</td>
                        <td>
                          {e.resultado === 'enviado'
                            ? <Badge color="green">Enviado</Badge>
                            : <><Badge color="red">Error</Badge><span className="block text-xs text-red-600 mt-1">{e.detalle}</span></>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <Modal open={Boolean(aEnviar)} onClose={() => !enviando && setAEnviar(null)} title="Enviar los avisos ahora" size="sm">
        {aEnviar && (
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Se van a enviar ahora los avisos programados para el <strong>{formatDate(aEnviar.fecha)}</strong>:
              {aEnviar.recordatorio > 0 && <> {aEnviar.recordatorio} recordatorio{aEnviar.recordatorio > 1 ? 's' : ''}</>}
              {aEnviar.recordatorio > 0 && aEnviar.deuda > 0 && ' y'}
              {aEnviar.deuda > 0 && <> {aEnviar.deuda} de deuda</>}, a cada tutor del alumno.
            </p>
            <p>Queda registrado en el historial como envío manual.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAEnviar(null)} disabled={enviando}>Cancelar</Button>
              <Button onClick={enviar} loading={enviando}>Enviar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/** Lo que respondió la función: cuántos salieron y, si algo falló, por qué. */
function ResultadoDelEnvio({ resultado }) {
  if (!resultado.ok) {
    return (
      <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-3">
        <AlertTriangle size={16} /> {resultado.mensaje}
      </p>
    )
  }
  const sinAvisos = resultado.enviados === 0 && resultado.errores === 0
  return (
    <div className={`text-sm rounded-lg p-3 ${resultado.errores ? 'bg-orange-50 text-orange-800' : 'bg-green-50 text-green-800'}`}>
      <p className="flex items-center gap-2 font-medium">
        <CheckCircle2 size={16} />
        {sinAvisos
          ? `No había avisos para el ${formatDate(resultado.fecha)}.`
          : `Avisos del ${formatDate(resultado.fecha)}: ${resultado.enviados} enviado${resultado.enviados === 1 ? '' : 's'}` +
            (resultado.errores ? `, ${resultado.errores} con error` : '') + '.'}
      </p>
      {resultado.detalle?.filter(d => d.resultado === 'error').map(d => (
        <p key={`${d.factura}-${d.tipo}-${d.para}`} className="mt-1 text-xs">Factura N.º {d.factura}: {d.detalle}</p>
      ))}
    </div>
  )
}
