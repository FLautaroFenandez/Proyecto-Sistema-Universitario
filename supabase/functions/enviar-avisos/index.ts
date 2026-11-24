/**
 * Edge Function `enviar-avisos` — envía por correo los avisos de cobranza
 * (Parte 3 · versión 1.1 · Funcionalidades 1 y 2 del enunciado).
 *
 *  - El último día hábil del mes: el recordatorio del total a pagar, con su composición
 *    y la factura adjunta en PDF.
 *  - El día 20: la deuda, si la factura no se pagó completa.
 *
 * Qué avisos salen y cuándo no lo decide esta función: los arma la base, en la vista
 * `avisos_cobranza`, y la función `avisos_para_enviar(fecha)` suma el correo de cada
 * tutor. Acá solo se redacta el correo, se genera el PDF y se envía con Resend.
 *
 * Quién la puede llamar (la seguridad no depende de la pantalla):
 *  - La tarea diaria de pg_cron, con la clave guardada en Vault (`x-clave-cron`).
 *    Envía los avisos de hoy y no repite uno que ya salió. Con la misma clave y una
 *    fecha en el cuerpo, se simula un envío desde el SQL Editor (cuenta como manual).
 *  - Un administrador con sesión, desde la web (Avisos por correo). Puede elegir una
 *    fecha para simular el envío: los avisos del ciclo 2027 todavía no llegaron.
 *
 * Secretos (Edge Functions → Secrets): RESEND_API_KEY y, mientras no haya un dominio
 * propio verificado en Resend, CORREO_PRUEBA: todos los correos van a esa dirección y el
 * asunto dice a qué tutor iban.
 *
 * Se despliega desde el Dashboard (Edge Functions → Deploy a new function → Via Editor),
 * pegando este archivo, con "Verify JWT" desactivado: la tarea programada no tiene sesión.
 */

import { createClient } from 'npm:@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1'

const REMITENTE = 'Educar para Transformar <onboarding@resend.dev>'
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires'
const AZUL = '#1B3A6B'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function responder(cuerpo, estado = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ── Formatos (los mismos criterios que la app: sin depender de Intl) ─────────

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/** 59000 → '$ 59.000' */
function pesos(valor) {
  const entero = Math.round(Number(valor ?? 0))
  return '$ ' + String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** '2027-04-30' → '30/04/2027' */
function fecha(iso) {
  const [a, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

/** '2027-04-01' → 'Abril 2027' */
function mes(iso) {
  const [a, m] = String(iso).split('-')
  return `${MESES[Number(m) - 1]} ${a}`
}

/** Fecha de hoy en Argentina, 'AAAA-MM-DD'. */
function hoyEnArgentina() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date())
}

function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

// ── Factura en PDF ───────────────────────────────────────────────────────────

/** Las fuentes estándar del PDF solo tienen los caracteres de Europa occidental. */
function paraPdf(texto) {
  return String(texto ?? '').replace(/\s/g, ' ').replace(/[^\x20-\x7E -ÿ]/g, '')
}

async function facturaEnPdf(aviso) {
  const doc = await PDFDocument.create()
  const pagina = doc.addPage([595, 842]) // A4
  const normal = await doc.embedFont(StandardFonts.Helvetica)
  const negrita = await doc.embedFont(StandardFonts.HelveticaBold)
  const azul = rgb(0.106, 0.227, 0.42)
  const tinta = rgb(0.08, 0.13, 0.23)
  const suave = rgb(0.35, 0.42, 0.52)

  const escribir = (texto, x, y, { tam = 11, fuente = normal, color = tinta } = {}) =>
    pagina.drawText(paraPdf(texto), { x, y, size: tam, font: fuente, color })
  const aLaDerecha = (texto, xDerecho, y, opciones = {}) => {
    const fuente = opciones.fuente ?? normal
    const ancho = fuente.widthOfTextAtSize(paraPdf(texto), opciones.tam ?? 11)
    escribir(texto, xDerecho - ancho, y, opciones)
  }

  // Encabezado con el color de la institución.
  pagina.drawRectangle({ x: 0, y: 762, width: 595, height: 80, color: azul })
  escribir('Educar para Transformar', 50, 805, { tam: 20, fuente: negrita, color: rgb(1, 1, 1) })
  escribir('Centro educativo', 50, 785, { tam: 11, color: rgb(1, 1, 1) })
  aLaDerecha(`Factura N.º ${aviso.numero}`, 545, 805, { tam: 14, fuente: negrita, color: rgb(1, 1, 1) })

  let y = 725
  const dato = (etiqueta, valor) => {
    escribir(etiqueta, 50, y, { color: suave })
    escribir(valor, 160, y, { fuente: negrita })
    y -= 18
  }
  dato('Alumno', `${aviso.alumno} (legajo ${aviso.legajo})`)
  dato('Período', mes(aviso.periodo))
  dato('Vencimiento', fecha(aviso.vencimiento))

  // Detalle por ítem.
  y -= 14
  pagina.drawRectangle({ x: 50, y: y - 6, width: 495, height: 22, color: rgb(0.94, 0.95, 0.97) })
  escribir('Concepto', 58, y, { fuente: negrita })
  escribir('Estado', 330, y, { fuente: negrita })
  aLaDerecha('Importe', 537, y, { fuente: negrita })
  y -= 24
  for (const item of aviso.items ?? []) {
    escribir(item.descripcion, 58, y)
    escribir(item.estado, 330, y, { color: suave })
    aLaDerecha(pesos(item.importe), 537, y)
    y -= 20
  }

  // Totales.
  pagina.drawLine({ start: { x: 50, y: y + 8 }, end: { x: 545, y: y + 8 }, thickness: 0.5, color: suave })
  y -= 10
  for (const [etiqueta, valor, destacado] of [
    ['Total', aviso.total, false], ['Pagado', aviso.pagado, false], ['Saldo', aviso.saldo, true],
  ]) {
    escribir(etiqueta, 330, y, { fuente: destacado ? negrita : normal })
    aLaDerecha(pesos(valor), 537, y, { fuente: destacado ? negrita : normal })
    y -= 18
  }

  escribir('Pagos solo por transferencia, eligiendo los ítems desde la app de familias.', 50, 70, { tam: 9, color: suave })
  escribir('Documento generado automáticamente por el sistema de cobranza.', 50, 56, { tam: 9, color: suave })
  return await doc.save()
}

/** Uint8Array → Base64, por partes para no desbordar la pila con archivos grandes. */
function aBase64(bytes) {
  let binario = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binario)
}

// ── El correo ────────────────────────────────────────────────────────────────

function asunto(aviso, prueba) {
  const que = aviso.tipo === 'recordatorio' ? 'Recordatorio de pago' : 'Aviso de deuda'
  const base = `${que} · ${mes(aviso.periodo)} · ${aviso.alumno}`
  return prueba ? `[Prueba → ${aviso.email}] ${base}` : base
}

function cuerpoHtml(aviso, prueba) {
  const filas = (aviso.detalle ?? []).map(i => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #DCE2EC">${escapar(i.descripcion)}</td>
        <td style="padding:6px 0;border-bottom:1px solid #DCE2EC;text-align:right">${pesos(i.importe)}</td>
      </tr>`).join('')

  const esRecordatorio = aviso.tipo === 'recordatorio'
  const introduccion = esRecordatorio
    ? `Te recordamos el total a abonar de <b>${mes(aviso.periodo)}</b> por <b>${escapar(aviso.alumno)}</b>:
       <b>${pesos(aviso.importe)}</b>, con vencimiento el ${fecha(aviso.vencimiento)}.`
    : `La factura N.º ${aviso.numero} de <b>${mes(aviso.periodo)}</b> de <b>${escapar(aviso.alumno)}</b>
       venció el ${fecha(aviso.vencimiento)} y tiene un saldo pendiente de <b>${pesos(aviso.importe)}</b>.`
  const tituloTabla = esRecordatorio ? 'Composición del total' : 'Ítems sin pagar'
  const cierre = esRecordatorio
    ? 'Adjuntamos la factura en PDF. Podés pagarla por transferencia desde la app de familias, eligiendo los ítems.'
    : 'Adjuntamos la factura con el estado de cada ítem. Si ya hiciste la transferencia, cargá el comprobante en la app y no tengas en cuenta este aviso.'
  const avisoDePrueba = prueba
    ? `<p style="background:#FFF7ED;border:1px solid #F97316;padding:8px 12px;border-radius:6px;font-size:13px">
         Correo de prueba: en funcionamiento normal iría a <b>${escapar(aviso.email)}</b>.</p>`
    : ''

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#14223B;max-width:560px;margin:0 auto">
    <div style="background:${AZUL};color:#FFFFFF;padding:18px 22px;border-radius:8px 8px 0 0">
      <div style="font-size:20px;font-weight:bold">Educar para Transformar</div>
      <div style="font-size:13px">${esRecordatorio ? 'Recordatorio de pago' : 'Aviso de deuda'}</div>
    </div>
    <div style="border:1px solid #DCE2EC;border-top:0;padding:18px 22px;border-radius:0 0 8px 8px">
      ${avisoDePrueba}
      <p>Hola, ${escapar(aviso.tutor)}:</p>
      <p>${introduccion}</p>
      <p style="font-weight:bold;margin-bottom:4px">${tituloTabla}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${filas}
        <tr>
          <td style="padding:8px 0;font-weight:bold">${esRecordatorio ? 'Total' : 'Saldo'}</td>
          <td style="padding:8px 0;font-weight:bold;text-align:right">${pesos(aviso.importe)}</td>
        </tr>
      </table>
      <p>${cierre}</p>
      <p style="font-size:12px;color:#5A6A84">Este correo se envía automáticamente. No respondas a esta dirección.</p>
    </div>
  </div>`
}

async function enviarCorreo({ para, asunto, html, adjunto }) {
  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: REMITENTE, to: [para], subject: asunto, html, attachments: [adjunto] }),
  })
  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) throw new Error(datos.message ?? `Resend respondió ${respuesta.status}`)
  return datos.id
}

// ── Quién llama ──────────────────────────────────────────────────────────────

/** La clave de servicio: con el nombre nuevo de Supabase o con el anterior. */
function claveDeServicio() {
  const nuevas = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (nuevas) {
    try { return JSON.parse(nuevas).default } catch { /* se usa la anterior */ }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
}

/** 'programado' (tarea diaria), 'manual' (administrador) o un error para responder. */
async function origenDelPedido(req, admin) {
  const claveCron = req.headers.get('x-clave-cron')
  if (claveCron) {
    const { data: valida } = await admin.rpc('es_clave_cron_avisos', { p_clave: claveCron })
    return valida ? { origen: 'programado' } : { error: 'Clave de la tarea programada inválida.', estado: 401 }
  }

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) return { error: 'Iniciá sesión como administrador.', estado: 401 }
  const { data: perfil } = await admin.from('profiles').select('rol, activo').eq('id', data.user.id).maybeSingle()
  if (perfil?.rol !== 'admin' || !perfil.activo) {
    return { error: 'Solo la Administración puede enviar los avisos.', estado: 403 }
  }
  return { origen: 'manual' }
}

// ── Envío ────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return responder({ error: 'Usá POST.' }, 405)
  if (!Deno.env.get('RESEND_API_KEY')) return responder({ error: 'Falta el secreto RESEND_API_KEY.' }, 500)

  const admin = createClient(Deno.env.get('SUPABASE_URL'), claveDeServicio(), { auth: { persistSession: false } })

  const quien = await origenDelPedido(req, admin)
  if (quien.error) return responder({ error: quien.error }, quien.estado)

  // La tarea programada envía los de hoy; un administrador puede simular otra fecha.
  // Si el pedido con la clave de la tarea trae una fecha, no es la tarea diaria sino una
  // simulación hecha a mano desde la base: cuenta como manual, así no marca el aviso como
  // ya enviado y no impide el envío real cuando llegue su fecha.
  const cuerpo = await req.json().catch(() => ({}))
  const fechaPedida = typeof cuerpo?.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(cuerpo.fecha) ? cuerpo.fecha : null
  const origen = fechaPedida ? 'manual' : quien.origen
  const fechaAviso = fechaPedida ?? hoyEnArgentina()

  const { data: avisos, error } = await admin.rpc('avisos_para_enviar', { p_fecha: fechaAviso })
  if (error) return responder({ error: `No se pudieron leer los avisos: ${error.message}` }, 500)

  const correoPrueba = Deno.env.get('CORREO_PRUEBA')
  const pdfs = new Map()
  const resultado = { fecha: fechaAviso, origen, enviados: 0, errores: 0, omitidos: 0, detalle: [] }

  for (const aviso of avisos ?? []) {
    // La tarea programada no repite un aviso que ya salió (por ejemplo, si se reintenta).
    if (origen === 'programado') {
      const { count } = await admin.from('envios_avisos')
        .select('id', { count: 'exact', head: true })
        .eq('factura_id', aviso.factura_id).eq('tipo', aviso.tipo).eq('destinatario', aviso.email)
        .eq('origen', 'programado').eq('resultado', 'enviado')
      if (count) { resultado.omitidos++; continue }
    }

    const para = correoPrueba || aviso.email
    let estado = 'enviado'
    let detalle
    try {
      if (!pdfs.has(aviso.factura_id)) pdfs.set(aviso.factura_id, aBase64(await facturaEnPdf(aviso)))
      detalle = await enviarCorreo({
        para,
        asunto: asunto(aviso, Boolean(correoPrueba)),
        html: cuerpoHtml(aviso, Boolean(correoPrueba)),
        adjunto: { filename: `factura-${aviso.numero}.pdf`, content: pdfs.get(aviso.factura_id) },
      })
      resultado.enviados++
    } catch (err) {
      estado = 'error'
      detalle = err instanceof Error ? err.message : String(err)
      resultado.errores++
    }

    await admin.from('envios_avisos').insert({
      factura_id: aviso.factura_id, tipo: aviso.tipo, fecha_aviso: fechaAviso,
      destinatario: aviso.email, enviado_a: para, origen, resultado: estado, detalle,
    })
    resultado.detalle.push({ tipo: aviso.tipo, factura: aviso.numero, alumno: aviso.alumno, para, resultado: estado, detalle })
  }

  return responder(resultado)
})
