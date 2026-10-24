/**
 * Pruebas de las reglas que la interfaz valida antes de ir a la base:
 * notas (HU2), asistencia (HU4), nombres de la matrícula (HU1), auditoría
 * (REQ-22) y fechas sin hora (error corregido en las pruebas del 21/10).
 */
import { describe, it, expect } from 'vitest'
import { validarNota, notaDesdeTexto } from './calificaciones'
import { resumirAsistencia } from './asistencias'
import { separarNombre } from './matricula'
import { resumirDetalle } from './auditoria'
import { formatDateShort } from '@/utils/formatDate'

describe('Validación de notas (HU2)', () => {
  it('acepta notas entre 1 y 10 con hasta dos decimales', () => {
    expect(validarNota('7')).toBeNull()
    expect(validarNota('10')).toBeNull()
    expect(validarNota('7,5')).toBeNull()
    expect(validarNota('8.25')).toBeNull()
  })

  it('una celda vacía no es un error', () => {
    expect(validarNota('')).toBeNull()
    expect(validarNota('   ')).toBeNull()
  })

  it('rechaza notas fuera de rango', () => {
    expect(validarNota('0')).toMatch(/entre 1 y 10/i)
    expect(validarNota('11')).toMatch(/entre 1 y 10/i)
  })

  it('rechaza más de dos decimales y texto', () => {
    expect(validarNota('7,555')).toMatch(/dos decimales/i)
    expect(validarNota('siete')).toMatch(/número/i)
  })

  it('convierte la coma decimal a número', () => {
    expect(notaDesdeTexto('7,5')).toBe(7.5)
    expect(notaDesdeTexto('')).toBeNull()
  })
})

describe('Resumen de asistencia (HU4)', () => {
  it('las llegadas tarde cuentan como presentes', () => {
    const resumen = resumirAsistencia([
      { estado: 'presente' }, { estado: 'tarde' }, { estado: 'ausente' }, { estado: 'justificada' },
    ])
    expect(resumen.total).toBe(4)
    expect(resumen.porcentaje).toBe(50)
    expect(resumen.tarde).toBe(1)
  })

  it('sin registros no hay porcentaje', () => {
    expect(resumirAsistencia([]).porcentaje).toBeNull()
  })
})

describe('Nombre de la solicitud (HU1)', () => {
  it('separa el primer nombre del apellido para precargar el formulario', () => {
    expect(separarNombre('Martina Gómez')).toEqual({ nombre: 'Martina', apellido: 'Gómez' })
    expect(separarNombre('  Juan  Pérez  López ')).toEqual({ nombre: 'Juan', apellido: 'Pérez López' })
    expect(separarNombre('Cher')).toEqual({ nombre: 'Cher', apellido: '' })
  })
})

describe('Detalle de la auditoría (REQ-22)', () => {
  it('resume un cambio con el valor anterior y el nuevo', () => {
    const entrada = { accion: 'UPDATE', detalle: { rol: { antes: 'padre', despues: 'docente' } } }
    expect(resumirDetalle(entrada)).toBe('rol: padre → docente')
  })

  it('resume un alta con los campos principales', () => {
    const entrada = { accion: 'INSERT', detalle: { nota: 8, estado: 'activa', otro: 'x' } }
    expect(resumirDetalle(entrada)).toBe('estado: activa · nota: 8')
  })
})

// La zona horaria de las pruebas la fija vite.config.js (hora de Argentina).
describe('Fechas sin hora', () => {
  it('una fecha de la base se muestra en el mismo día, no en el anterior', () => {
    expect(formatDateShort('2015-03-10')).toMatch(/^10\b/)
  })

  it('una fecha con hora se sigue convirtiendo a la hora local', () => {
    // 02:00 UTC del 22/10 son las 23:00 del 21/10 en Argentina.
    expect(formatDateShort('2026-10-22T02:00:00Z')).toMatch(/^21\b/)
  })
})
