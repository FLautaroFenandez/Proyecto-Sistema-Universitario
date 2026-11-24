/**
 * Pruebas de las reglas de la app móvil (versión 1.1): situación de una inscripción,
 * horario de un grupo, superposición de horarios y avisos de cobranza.
 * Son funciones puras: corren con el Vitest de la web.
 */
import { describe, it, expect } from 'vitest'
import {
  admiteBaja, gruposSeSuperponen, horarioDeGrupo, sigueActivaDesde, situacionDeInscripcion,
} from './situacionInscripcion'
import { avisosPorHijo, momentoDelAviso } from './avisos'

const futbol   = { dias: [1, 3], hora_inicio: '17:00:00', hora_fin: '18:30:00' }
const basquet  = { dias: [1, 3], hora_inicio: '17:30:00', hora_fin: '19:00:00' }
const natacion = { dias: [2, 4], hora_inicio: '17:00:00', hora_fin: '18:00:00' }
const marciales = { dias: [3, 5], hora_inicio: '18:30:00', hora_fin: '19:30:00' }

describe('Inscripciones a servicios (HU-M5)', () => {
  it('la situación sale de las fechas', () => {
    expect(situacionDeInscripcion({ desde: '2027-06-01', hasta: null }, '2026-11-23').clave).toBe('proxima')
    expect(situacionDeInscripcion({ desde: '2026-03-01', hasta: null }, '2026-11-23').clave).toBe('vigente')
    expect(situacionDeInscripcion({ desde: '2026-03-01', hasta: '2026-06-30' }, '2026-11-23').clave).toBe('finalizada')
  })

  it('solo admite baja una inscripción sin fecha de fin', () => {
    expect(admiteBaja({ hasta: null })).toBe(true)
    expect(admiteBaja({ hasta: '2027-06-30' })).toBe(false)
  })

  it('muestra los días y el horario del grupo', () => {
    expect(horarioDeGrupo(futbol)).toBe('Lun y Mié · 17:00 a 18:30')
    expect(horarioDeGrupo({ dias: [5], hora_inicio: '15:00', hora_fin: '16:00' })).toBe('Vie · 15:00 a 16:00')
    expect(horarioDeGrupo(null)).toBe('')
  })

  it('detecta los horarios que se superponen el mismo día', () => {
    expect(gruposSeSuperponen(futbol, basquet)).toBe(true)
  })

  it('días distintos no chocan, aunque el horario coincida', () => {
    expect(gruposSeSuperponen(futbol, natacion)).toBe(false)
  })

  it('un horario que empieza cuando termina el otro no choca', () => {
    expect(gruposSeSuperponen(futbol, marciales)).toBe(false)
  })

  it('un deporte que termina antes del mes elegido ya no ocupa lugar', () => {
    const natacionHastaMayo = { desde: '2027-04-01', hasta: '2027-05-31' }
    expect(sigueActivaDesde(natacionHastaMayo, '2027-06-01')).toBe(false)
    expect(sigueActivaDesde(natacionHastaMayo, '2027-05-01')).toBe(true)
    expect(sigueActivaDesde({ desde: '2027-03-01', hasta: null }, '2027-06-01')).toBe(true)
  })
})

describe('Avisos de cobranza', () => {
  it('un aviso con fecha pasada ya se emitió; uno futuro está programado', () => {
    expect(momentoDelAviso('2026-11-20', '2026-11-23').clave).toBe('emitido')
    expect(momentoDelAviso('2026-11-23', '2026-11-23').clave).toBe('emitido')
    expect(momentoDelAviso('2027-05-31', '2026-11-23').clave).toBe('programado')
  })

  it('agrupa los avisos por hijo, en el orden de los hijos', () => {
    const hijos = [{ id: 'a' }, { id: 'b' }]
    const avisos = [{ alumno_id: 'b', tipo: 'deuda' }, { alumno_id: 'a', tipo: 'recordatorio' }]
    const grupos = avisosPorHijo(hijos, avisos)
    expect(grupos.map(g => g.hijo.id)).toEqual(['a', 'b'])
    expect(grupos[1].avisos).toHaveLength(1)
  })
})
