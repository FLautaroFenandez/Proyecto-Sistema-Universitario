/**
 * @file formato.js
 * @description Cómo se muestran los importes y las fechas en la app.
 *
 * Las fechas de la base llegan como texto 'AAAA-MM-DD'. Se leen partiendo ese texto y
 * no con `new Date()`: al convertirlas a Date, JavaScript las toma como medianoche en
 * horario universal y en Argentina se mostrarían UN DÍA ANTES. Es el mismo defecto que
 * se corrigió en la web en el Sprint 2 (prueba "Fechas sin hora").
 */

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Separa 'AAAA-MM-DD' en sus tres partes numéricas. */
function partes(fechaIso) {
  const [anio, mes, dia] = String(fechaIso).slice(0, 10).split('-').map(Number)
  return { anio, mes, dia }
}

/** 192000 → "$ 192.000" */
export function pesos(importe) {
  const entero = Math.round(Number(importe) || 0)
  return `$ ${String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

/** '2027-04-01' → "Abril 2027" */
export function periodo(fechaIso) {
  const { anio, mes } = partes(fechaIso)
  return `${MESES[mes - 1]} ${anio}`
}

/** '2027-04-10' → "10/04/2027" */
export function fecha(fechaIso) {
  const { anio, mes, dia } = partes(fechaIso)
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`
}
