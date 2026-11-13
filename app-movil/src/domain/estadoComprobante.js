/**
 * @file estadoComprobante.js
 * @description Estados de un comprobante de pago — patrón **State**, como
 * `estadoFactura.js`.
 *
 *   emitido   → el sistema lo emitió con los ítems elegidos; falta la transferencia.
 *               Admite adjuntar el archivo.
 *   informado → el padre adjuntó la transferencia. Es el estado final: sus ítems
 *               cuentan como pagados y el archivo ya no se puede cambiar.
 *
 * La transición emitido → informado la hace la base, en la función
 * `informar_transferencia()` de docs/supabase-cobranza.sql. Acá cada estado sabe cómo
 * mostrarse y qué permite hacer.
 */

class EstadoComprobante {
  /** @type {string} valor guardado en la base */
  clave = ''
  /** @type {string} cómo se muestra */
  etiqueta = ''
  /** @type {'naranja'|'azul'|'verde'|'rojo'|'gris'} color de la insignia */
  color = 'gris'
  /** @type {boolean} si todavía se le puede adjuntar la transferencia */
  admiteAdjuntar = false
}

class Emitido extends EstadoComprobante {
  clave = 'emitido'
  etiqueta = 'Falta informar la transferencia'
  color = 'naranja'
  admiteAdjuntar = true
}

class Informado extends EstadoComprobante {
  clave = 'informado'
  etiqueta = 'Transferencia informada'
  color = 'verde'
  admiteAdjuntar = false
}

const ESTADOS = Object.fromEntries(
  [new Emitido(), new Informado()].map(estado => [estado.clave, estado]),
)

/**
 * @param {string} clave - 'emitido' | 'informado'
 * @returns {EstadoComprobante}
 */
export function estadoDeComprobante(clave) {
  const estado = ESTADOS[clave]
  if (!estado) throw new Error(`Estado de comprobante desconocido: ${clave}`)
  return estado
}
