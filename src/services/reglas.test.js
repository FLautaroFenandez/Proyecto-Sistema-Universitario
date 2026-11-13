/**
 * Pruebas de las reglas que la interfaz valida antes de ir a la base:
 * notas (HU2), asistencia (HU4), nombres de la matrícula (HU1), auditoría
 * (REQ-22), fechas sin hora (error corregido en las pruebas del 21/10) y
 * cobranza de la Parte 3: precios, meses del ciclo y totales del reporte.
 */
import { describe, it, expect, vi } from 'vitest'

// Estas pruebas son de funciones puras: no necesitan conectarse a Supabase.
// Sin este reemplazo, importar un servicio crea el cliente real, que en Node 20
// falla por no tener WebSocket nativo (lo detectó el pipeline el 24/10).
vi.mock('@/lib/supabase', () => ({ supabase: {} }))

import { validarNota, notaDesdeTexto } from './calificaciones'
import { resumirAsistencia } from './asistencias'
import { separarNombre } from './matricula'
import { resumirDetalle } from './auditoria'
import { validarImporte, mesesDelCiclo, resumirCobranza } from './cobranza'
import { formatDateShort, formatMes, formatMesTitulo } from '@/utils/formatDate'

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

  it('el mes de una factura no se corre al mes anterior', () => {
    expect(formatMes('2027-04-01')).toMatch(/abril/i)
  })

  it('en un título, solo la primera letra del mes va en mayúscula', () => {
    expect(formatMesTitulo('2027-03-01')).toBe('Marzo de 2027')
  })
})

// ── Parte 3 · Etapa 4: cobranza en la web ───────────────────────────────────

describe('Precio de un concepto (cobranza)', () => {
  it('acepta enteros y hasta dos decimales, con punto o coma', () => {
    expect(validarImporte('95000')).toBeNull()
    expect(validarImporte('95000,5')).toBeNull()
    expect(validarImporte('95000.25')).toBeNull()
  })

  it('rechaza vacío, cero, negativos, texto y más de dos decimales', () => {
    expect(validarImporte('')).toMatch(/ingresá un importe/i)
    expect(validarImporte('0')).toMatch(/mayor que cero/i)
    expect(validarImporte('-10')).toMatch(/número/i)
    expect(validarImporte('mil')).toMatch(/número/i)
    expect(validarImporte('10,555')).toMatch(/dos decimales/i)
  })

  it('rechaza un importe que no entra en la columna de la base', () => {
    expect(validarImporte('10000000000')).toMatch(/demasiado grande/i)
  })
})

describe('Meses facturables del ciclo lectivo', () => {
  it('va del mes de inicio al mes de fin, inclusive', () => {
    const meses = mesesDelCiclo({ fecha_inicio: '2027-03-01', fecha_fin: '2027-12-15' })
    expect(meses).toHaveLength(10)
    expect(meses[0]).toBe('2027-03-01')
    expect(meses.at(-1)).toBe('2027-12-01')
  })

  it('cruza de año sin saltear meses', () => {
    expect(mesesDelCiclo({ fecha_inicio: '2027-11-20', fecha_fin: '2028-02-10' }))
      .toEqual(['2027-11-01', '2027-12-01', '2028-01-01', '2028-02-01'])
  })

  it('sin ciclo activo no hay meses', () => {
    expect(mesesDelCiclo(null)).toEqual([])
  })
})

describe('Totales del reporte de cobranza (REQ-32)', () => {
  const facturas = [
    { total: 192000, pagado: 133000, en_proceso: 0,     saldo: 59000,  estado: 'parcial',   vencida: true },
    { total: 95000,  pagado: 95000,  en_proceso: 0,     saldo: 0,      estado: 'pagada',    vencida: false },
    { total: 133000, pagado: 0,      en_proceso: 38000, saldo: 133000, estado: 'pendiente', vencida: false },
  ]

  it('suma facturado, cobrado, en proceso y saldo', () => {
    const t = resumirCobranza(facturas)
    expect(t.facturado).toBe(420000)
    expect(t.cobrado).toBe(228000)
    expect(t.enProceso).toBe(38000)
    expect(t.saldo).toBe(192000)
  })

  it('completa es solo la pagada; parcial y pendiente son incompletas', () => {
    const t = resumirCobranza(facturas)
    expect(t.completas).toBe(1)
    expect(t.incompletas).toBe(2)
    expect(t.vencidas).toBe(1)
  })

  it('suma centavos sin errores de redondeo', () => {
    const t = resumirCobranza([
      { total: 0.1, pagado: 0, en_proceso: 0, saldo: 0.1, estado: 'pendiente' },
      { total: 0.2, pagado: 0, en_proceso: 0, saldo: 0.2, estado: 'pendiente' },
    ])
    expect(t.facturado).toBe(0.3)
  })

  it('sin facturas, todo en cero', () => {
    expect(resumirCobranza([])).toMatchObject({ cantidad: 0, facturado: 0, completas: 0, incompletas: 0 })
  })
})

describe('Auditoría de la cobranza', () => {
  it('resume un comprobante nuevo con su número, estado e importe', () => {
    const entrada = { accion: 'INSERT', detalle: { numero: 3, estado: 'emitido', importe: 38000, factura_id: 'x' } }
    expect(resumirDetalle(entrada)).toBe('numero: 3 · estado: emitido · importe: 38000')
  })

  it('un cambio de precio muestra el valor anterior y el nuevo', () => {
    const entrada = { accion: 'UPDATE', detalle: { importe: { antes: 95000, despues: 98000 } } }
    expect(resumirDetalle(entrada)).toBe('importe: 95000 → 98000')
  })
})
