/**
 * Pruebas del patrón State: solicitudes de inscripción (HU1) y postulaciones
 * laborales (REQ-20). Son las mismas reglas que repiten los disparadores de la
 * base, así que una diferencia entre las dos capas se detectaría acá.
 */
import { describe, it, expect } from 'vitest'
import { estadoDe, LISTA_DE_ESTADOS } from './estadoSolicitud'
import { estadoPostulacionDe, ESTADOS_DE_POSTULACION } from './estadoPostulacion'

describe('Solicitud de inscripción (patrón State)', () => {
  it('una solicitud pendiente puede pasar a revisión, aceptada o rechazada', () => {
    const pendiente = estadoDe('pendiente')
    expect(pendiente.puedePasarA('en_revision')).toBe(true)
    expect(pendiente.puedePasarA('aceptada')).toBe(true)
    expect(pendiente.puedePasarA('rechazada')).toBe(true)
    expect(pendiente.puedePasarA('matriculada')).toBe(false)
  })

  it('solo una solicitud aceptada puede pasar a matriculada', () => {
    expect(estadoDe('aceptada').pasarA('matriculada').clave).toBe('matriculada')
    expect(() => estadoDe('pendiente').pasarA('matriculada')).toThrow()
    expect(() => estadoDe('rechazada').pasarA('matriculada')).toThrow()
  })

  it('matriculada es un estado final y explica cómo corregir un error', () => {
    const matriculada = estadoDe('matriculada')
    expect(matriculada.esFinal).toBe(true)
    expect(() => matriculada.pasarA('pendiente')).toThrow(/dar de baja|da de baja/i)
  })

  it('"matriculada" no se ofrece como opción manual en la pantalla', () => {
    expect(estadoDe('aceptada').transicionesManuales).not.toContain('matriculada')
  })

  it('pasar al mismo estado no es un error', () => {
    expect(estadoDe('en_revision').pasarA('en_revision').clave).toBe('en_revision')
  })

  it('un estado desconocido se rechaza', () => {
    expect(() => estadoDe('inventado')).toThrow()
    expect(LISTA_DE_ESTADOS).toHaveLength(5)
  })
})

describe('Postulación laboral (patrón State)', () => {
  it('sigue el circuito recibida → en revisión → entrevista → contratado', () => {
    const enRevision = estadoPostulacionDe('recibida').pasarA('en_revision')
    const entrevista = enRevision.pasarA('entrevista')
    expect(entrevista.pasarA('contratado').clave).toBe('contratado')
  })

  it('no se puede saltar la entrevista', () => {
    expect(() => estadoPostulacionDe('recibida').pasarA('contratado')).toThrow()
    expect(() => estadoPostulacionDe('en_revision').pasarA('contratado')).toThrow()
  })

  it('una postulación descartada se puede reconsiderar', () => {
    expect(estadoPostulacionDe('descartado').pasarA('en_revision').clave).toBe('en_revision')
  })

  it('contratado es un estado final', () => {
    const contratado = estadoPostulacionDe('contratado')
    expect(contratado.esFinal).toBe(true)
    expect(() => contratado.pasarA('descartado')).toThrow()
  })

  it('hay cinco estados', () => {
    expect(ESTADOS_DE_POSTULACION.map(e => e.clave))
      .toEqual(['recibida', 'en_revision', 'entrevista', 'contratado', 'descartado'])
  })
})
