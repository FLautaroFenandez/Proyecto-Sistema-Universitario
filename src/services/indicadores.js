/**
 * @file indicadores.js
 * @description Indicadores institucionales para la Autoridad (HU3 · REQ-21).
 *
 * No hay tablas propias: se calculan a partir de la matrícula (HU1), la
 * asistencia (HU4) y las notas (HU2). Así los números siempre coinciden con lo
 * cargado, que es el criterio de validación de la historia.
 *
 * El período es un trimestre. Para las notas se usa el número de período de la
 * calificación; para la asistencia, el mes de la fecha:
 *   1.er trimestre: marzo a mayo · 2.º: junio a agosto · 3.º: septiembre a diciembre.
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'
import { resumirAsistencia } from './asistencias'
import { nombreCompletoDeCurso } from './academico'

export const PERIODOS_REPORTE = [
  { clave: 'ciclo', etiqueta: 'Todo el ciclo',  meses: null },
  { clave: '1',     etiqueta: '1.er trimestre', meses: [3, 4, 5] },
  { clave: '2',     etiqueta: '2.º trimestre',  meses: [6, 7, 8] },
  { clave: '3',     etiqueta: '3.er trimestre', meses: [9, 10, 11, 12] },
]

const redondear = n => (n === null ? null : Math.round(n * 100) / 100)

function promedio(valores) {
  const numeros = valores.filter(v => v !== null && v !== undefined).map(Number)
  return numeros.length === 0 ? null : numeros.reduce((a, b) => a + b, 0) / numeros.length
}

export const indicadores = {

  /**
   * @param {{cicloId:number, periodo:string}} params - periodo: 'ciclo' | '1' | '2' | '3'
   */
  async calcular({ cicloId, periodo = 'ciclo' }) {
    const definicion = PERIODOS_REPORTE.find(p => p.clave === periodo) ?? PERIODOS_REPORTE[0]

    const matriculas = await ejecutar(
      supabase.from('matriculas')
        .select('id, curso_id, curso:cursos(id, anio, division, turno, cupo, nivel:niveles(nombre, orden))')
        .eq('ciclo_id', cicloId)
        .eq('estado', 'activa'),
      'cargar la matrícula',
    )
    const ids = matriculas.map(m => m.id)

    let consultaNotas = supabase.from('promedios_periodo')
      .select('matricula_id, curso_materia_id, periodo, promedio')
      .in('matricula_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    if (definicion.meses) consultaNotas = consultaNotas.eq('periodo', Number(periodo))

    const [registros, notas, dictados] = await Promise.all([
      ids.length === 0 ? [] : ejecutar(
        supabase.from('asistencias').select('matricula_id, fecha, estado').in('matricula_id', ids),
        'cargar la asistencia',
      ),
      ids.length === 0 ? [] : ejecutar(consultaNotas, 'cargar las notas'),
      ejecutar(supabase.from('curso_materia').select('id, curso_id, materia:materias(nombre)'), 'cargar las materias'),
    ])

    const asistenciaDelPeriodo = definicion.meses
      ? registros.filter(r => definicion.meses.includes(Number(r.fecha.slice(5, 7))))
      : registros

    const cursoDe = Object.fromEntries(matriculas.map(m => [m.id, m.curso]))
    const materiaDe = Object.fromEntries(dictados.map(d => [d.id, d.materia?.nombre ?? '—']))

    // ── Matrícula por nivel y por curso ──
    const cursos = new Map()
    for (const m of matriculas) {
      const actual = cursos.get(m.curso.id) ?? { curso: m.curso, alumnos: 0 }
      actual.alumnos += 1
      cursos.set(m.curso.id, actual)
    }

    const porCurso = [...cursos.values()].map(({ curso, alumnos }) => {
      const asistencia = resumirAsistencia(asistenciaDelPeriodo.filter(r => cursoDe[r.matricula_id]?.id === curso.id))
      const notasDelCurso = notas.filter(n => cursoDe[n.matricula_id]?.id === curso.id)
      return {
        id:         curso.id,
        nombre:     nombreCompletoDeCurso(curso),
        nivel:      curso.nivel?.nombre ?? '—',
        orden:      (curso.nivel?.orden ?? 0) * 100 + curso.anio,
        alumnos,
        cupo:       curso.cupo,
        asistencia: asistencia.porcentaje,
        registros:  asistencia.total,
        promedio:   redondear(promedio(notasDelCurso.map(n => n.promedio))),
      }
    }).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))

    const niveles = new Map()
    for (const c of porCurso) {
      const actual = niveles.get(c.nivel) ?? { nivel: c.nivel, alumnos: 0, cupo: 0, orden: c.orden }
      actual.alumnos += c.alumnos
      actual.cupo += c.cupo
      niveles.set(c.nivel, actual)
    }
    const porNivel = [...niveles.values()]
      .map(n => ({ ...n, ocupacion: n.cupo ? Math.round((n.alumnos / n.cupo) * 100) : null }))
      .sort((a, b) => a.orden - b.orden)

    // ── Rendimiento por materia ──
    const materias = new Map()
    for (const n of notas) {
      const nombre = materiaDe[n.curso_materia_id] ?? '—'
      const actual = materias.get(nombre) ?? { materia: nombre, promedios: [], alumnos: new Set() }
      actual.promedios.push(n.promedio)
      actual.alumnos.add(n.matricula_id)
      materias.set(nombre, actual)
    }
    const porMateria = [...materias.values()]
      .map(m => ({ materia: m.materia, promedio: redondear(promedio(m.promedios)), alumnos: m.alumnos.size }))
      .sort((a, b) => a.materia.localeCompare(b.materia))

    const asistenciaTotal = resumirAsistencia(asistenciaDelPeriodo)
    return {
      periodo: definicion,
      totales: {
        alumnos:    matriculas.length,
        cursos:     porCurso.length,
        asistencia: asistenciaTotal.porcentaje,
        registros:  asistenciaTotal.total,
        promedio:   redondear(promedio(notas.map(n => n.promedio))),
      },
      porNivel,
      porCurso,
      porMateria,
      sinDatos: matriculas.length === 0,
    }
  },
}
