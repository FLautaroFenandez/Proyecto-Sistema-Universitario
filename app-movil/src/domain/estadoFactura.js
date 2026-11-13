/**
 * @file estadoFactura.js
 * @description Estados de una factura — patrón **State**, igual que
 * `src/domain/estadoSolicitud.js` de la web.
 *
 * El estado lo CALCULA la base (vista `facturas_estado`): pendiente, parcial o pagada.
 * Acá cada estado es un objeto que sabe cómo mostrarse y qué permite hacer. Las
 * pantallas no comparan textos ("si estado === 'pagada'…"): le preguntan al estado.
 *
 *   pendiente → no se pagó ningún ítem ............ admite pagar
 *   parcial   → se pagó al menos un ítem .......... admite pagar el resto
 *   pagada    → no queda saldo .................... no admite pagar (estado final)
 *
 * "Vencida" no es un estado sino una condición: una factura pendiente o parcial pasa
 * a estar vencida cuando se supera la fecha de vencimiento.
 */

/** Estado genérico: lo que comparten todos. */
class EstadoFactura {
  /** @type {string} valor que devuelve la base */
  clave = ''
  /** @type {string} cómo se muestra */
  etiqueta = ''
  /** @type {'naranja'|'azul'|'verde'|'rojo'|'gris'} color de la insignia */
  color = 'gris'
  /** @type {boolean} si todavía tiene ítems para pagar */
  admitePago = false
}

class Pendiente extends EstadoFactura {
  clave = 'pendiente'
  etiqueta = 'Pendiente'
  color = 'naranja'
  admitePago = true
}

class Parcial extends EstadoFactura {
  clave = 'parcial'
  etiqueta = 'Pago parcial'
  color = 'azul'
  admitePago = true
}

class Pagada extends EstadoFactura {
  clave = 'pagada'
  etiqueta = 'Pagada'
  color = 'verde'
  admitePago = false
}

const ESTADOS = Object.fromEntries(
  [new Pendiente(), new Parcial(), new Pagada()].map(estado => [estado.clave, estado]),
)

/**
 * Devuelve el objeto de estado para la clave que calculó la base.
 * @param {string} clave - 'pendiente' | 'parcial' | 'pagada'
 * @returns {EstadoFactura}
 */
export function estadoDe(clave) {
  const estado = ESTADOS[clave]
  if (!estado) throw new Error(`Estado de factura desconocido: ${clave}`)
  return estado
}

/**
 * Situación de un ítem según su comprobante.
 *   sin comprobante          → impago
 *   comprobante "emitido"    → en proceso: falta informar la transferencia
 *   comprobante "informado"  → pagado
 *
 * @param {{comprobante: {numero: number, estado: string} | null}} item
 * @returns {{etiqueta: string, color: string, pagado: boolean}}
 */
export function situacionDeItem(item) {
  const comprobante = item.comprobante
  if (!comprobante) return { etiqueta: 'Impago', color: 'naranja', pagado: false }
  if (comprobante.estado === 'informado') {
    return { etiqueta: `Pagado · comprobante N.º ${comprobante.numero}`, color: 'verde', pagado: true }
  }
  return { etiqueta: `En proceso · comprobante N.º ${comprobante.numero}`, color: 'azul', pagado: false }
}
