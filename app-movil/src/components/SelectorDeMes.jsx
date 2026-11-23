/**
 * @file SelectorDeMes.jsx
 * @description Un mes con flechas para retroceder y avanzar: "Desde  ‹  Marzo 2027  ›".
 * Lo usan el historial (filtro por período) y las inscripciones (desde qué mes rige un
 * alta o una baja). Estaba dentro del historial; se separó al necesitarlo en dos pantallas.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colores } from '../tema'
import { periodo } from '../utils/formato'

/**
 * @param {{etiqueta: string, valor: string, puedeRetroceder: boolean, puedeAvanzar: boolean,
 *          alMover: (cantidad: number) => void}} props
 */
export function SelectorDeMes({ etiqueta, valor, puedeRetroceder, puedeAvanzar, alMover }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.selector}>
        <Flecha simbolo="‹" descripcion={`${etiqueta}: mes anterior`} activa={puedeRetroceder} alTocar={() => alMover(-1)} />
        <Text style={estilos.mes}>{periodo(valor)}</Text>
        <Flecha simbolo="›" descripcion={`${etiqueta}: mes siguiente`} activa={puedeAvanzar} alTocar={() => alMover(1)} />
      </View>
    </View>
  )
}

function Flecha({ simbolo, descripcion, activa, alTocar }) {
  return (
    <Pressable
      style={[estilos.flecha, !activa && estilos.flechaInactiva]}
      onPress={alTocar}
      disabled={!activa}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={descripcion}
    >
      <Text style={estilos.flechaTexto}>{simbolo}</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  fila:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  etiqueta:       { fontSize: 14, color: colores.suave, flexShrink: 1 },
  selector:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mes:            { fontSize: 16, fontWeight: '600', color: colores.texto, minWidth: 130, textAlign: 'center' },
  flecha:         {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colores.azul,
    alignItems: 'center', justifyContent: 'center',
  },
  flechaInactiva: { opacity: 0.3 },
  flechaTexto:    { fontSize: 22, fontWeight: '700', color: colores.azul, lineHeight: 24 },
})
