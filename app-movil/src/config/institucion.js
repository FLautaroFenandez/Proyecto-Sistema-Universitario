/**
 * @file institucion.js
 * @description Datos de la cuenta a la que las familias transfieren.
 *
 * SON DATOS FICTICIOS, de prueba. Regla del enunciado: "los pagos se realizan mediante
 * transferencia bancaria". Que el administrador los cargue desde la web queda fuera del
 * alcance mínimo (docs/06-parte-3-app-movil/03-pagar/README.md, decisión 4).
 */

export const DATOS_TRANSFERENCIA = {
  titular: 'Centro Educativo Educar para Transformar',
  banco:   'Banco de prueba',
  alias:   'EDUCAR.TRANSFORMAR',
  cbu:     '0000000000000000000000',
}

/** Qué archivos se aceptan como comprobante. Coincide con el bucket `comprobantes` de la base. */
export const ARCHIVO_COMPROBANTE = {
  /** Tipo de archivo → extensión con la que se guarda. */
  tipos: {
    'image/jpeg':      'jpg',
    'image/png':       'png',
    'application/pdf': 'pdf',
  },
  tamanioMaximo: 5 * 1024 * 1024, // 5 MB
}
