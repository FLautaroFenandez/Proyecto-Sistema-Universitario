/**
 * @file tema.js
 * @description Colores de la app: los mismos de la marca que usa la web
 * (`tailwind.config.js` → `brand`), para que las dos se reconozcan como una sola institución.
 *
 * Versión 1.1: los colores tienen un significado.
 *  - El azul es la institución: barra superior, botones y la cuota.
 *  - Cada servicio tiene su color y su ícono, los mismos que en la web
 *    (Precios y facturación): deportes verde, comedor naranja y transporte violeta.
 *  - Los cinco colores de las figuras del logo van juntos, como firma de la marca.
 *  - Los estados (Pagada, Pendiente, Vencida) siguen siendo etiquetas con texto, para no
 *    confundirlos con el color de un servicio.
 */

export const colores = {
  azul:      '#1B3A6B',
  azulOscuro:'#0F2040',
  naranja:   '#E8612C',
  verde:     '#2E7D32',
  rojo:      '#C62828',
  fondo:     '#F4F6FA',
  tarjeta:   '#FFFFFF',
  texto:     '#14223B',
  suave:     '#5A6A84',
  borde:     '#DCE2EC',
}

/**
 * Los colores de las cinco figuras del logo, en el orden en que aparecen (en el sentido de
 * las agujas del reloj, desde arriba). Se usan juntos: en la franja de la marca y para
 * distinguir a cada hijo.
 */
export const coloresDelLogo = ['#F14C2B', '#EC0F92', '#9B2091', '#56AFE6', '#8AC73E']

/**
 * Ícono (de la familia Lucide, la misma que usa la web) y colores de cada tipo de concepto.
 * `texto` es el color del ícono, `borde` el de la línea que marca la tarjeta y `fondo` el
 * del círculo del ícono.
 */
export const servicios = {
  cuota:      { etiqueta: 'Cuota',      icono: 'graduation-cap',   texto: colores.azul, borde: colores.azul, fondo: '#EFF6FF' },
  deporte:    { etiqueta: 'Deporte',    icono: 'trophy',           texto: '#15803D',    borde: '#16A34A',    fondo: '#F0FDF4' },
  transporte: { etiqueta: 'Transporte', icono: 'bus',              texto: '#7E22CE',    borde: '#9333EA',    fondo: '#FAF5FF' },
  comedor:    { etiqueta: 'Comedor',    icono: 'utensils-crossed', texto: '#EA580C',    borde: '#F97316',    fondo: '#FFF7ED' },
}

/** El estilo de un tipo de concepto. Si el tipo no se conoce, el de la cuota. */
export function estiloDeServicio(tipo) {
  return servicios[tipo] ?? servicios.cuota
}
