/**
 * @file cobranza.js
 * @description Servicio de cobranza de la app (patrón **Facade**) — HU-M1.
 * Las pantallas piden "mis hijos" o "las cuotas de este alumno"; solo este archivo
 * sabe qué tablas y vistas se consultan.
 *
 * Regla del enunciado: "un padre solamente puede consultar la información de sus
 * hijos". La aplica la base (función alumnos_a_cargo y políticas RLS de
 * docs/supabase-cobranza.sql): aunque acá se pidiera otro alumno, no devolvería nada.
 */

import { supabase } from '../lib/supabase'
import { ejecutar } from './base'

const ALUMNO_CON_CURSO =
  'id, legajo, apellido, nombre, ' +
  'matriculas(estado, curso:cursos(anio, division, nivel:niveles(nombre), ciclo:ciclos_lectivos(activo)))'

/** Curso de la matrícula activa del ciclo vigente: "3.º A · Primario". Vacío si no tiene. */
function cursoVigente(alumno) {
  const matricula = (alumno.matriculas ?? []).find(m => m.estado === 'activa' && m.curso?.ciclo?.activo)
  if (!matricula) return ''
  const { anio, division, nivel } = matricula.curso
  const nombreNivel = nivel?.nombre ?? ''
  return `${anio}.º ${division} · ${nombreNivel.charAt(0).toUpperCase()}${nombreNivel.slice(1)}`
}

export const cobranza = {

  /**
   * Hijos vinculados al tutor, con su curso.
   * @param {string} tutorId
   * @returns {Promise<Array<{id: string, nombre: string, apellido: string, legajo: string, curso: string}>>}
   */
  async misHijos(tutorId) {
    if (!tutorId) return []
    const vinculos = await ejecutar(
      supabase.from('alumno_tutor').select(`alumno:alumnos(${ALUMNO_CON_CURSO})`).eq('tutor_id', tutorId),
      'cargar tus hijos',
    )
    return vinculos
      .filter(v => v.alumno)
      .map(({ alumno }) => ({
        id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        legajo: alumno.legajo,
        curso: cursoVigente(alumno),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  },

  /**
   * Facturas de un alumno, de la más nueva a la más vieja, con su estado calculado.
   * Lee la vista `facturas_estado`: total, pagado, saldo, estado y vencida no se
   * guardan, se calculan en la base, así la web y la app ven siempre lo mismo.
   */
  async facturasDe(alumnoId) {
    return ejecutar(
      supabase
        .from('facturas_estado')
        .select('id, numero, periodo, vencimiento, total, pagado, en_proceso, saldo, estado, vencida')
        .eq('alumno_id', alumnoId)
        .order('periodo', { ascending: false }),
      'cargar las cuotas',
    )
  },

  /**
   * Una factura con el detalle de sus ítems. Cada ítem trae su comprobante, si tiene:
   * es lo que permite ver la deuda discriminada por ítem.
   * @returns {Promise<{factura: object, items: object[]} | null>} null si no existe o no es de un hijo.
   */
  async factura(facturaId) {
    const [factura, items] = await Promise.all([
      ejecutar(
        supabase
          .from('facturas_estado')
          .select('id, numero, periodo, vencimiento, total, pagado, en_proceso, saldo, estado, vencida')
          .eq('id', facturaId)
          .maybeSingle(),
        'cargar la factura',
      ),
      ejecutar(
        supabase
          .from('factura_items')
          .select('id, descripcion, importe, comprobante:comprobantes(numero, estado)')
          .eq('factura_id', facturaId)
          .order('importe', { ascending: false }),
        'cargar el detalle de la factura',
      ),
    ])
    return factura ? { factura, items } : null
  },
}
