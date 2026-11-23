/**
 * @file Marca.jsx
 * @description Las piezas de la identidad de la escuela (versión 1.1):
 *  - `FranjaMarca`: una línea con los cinco colores de las figuras del logo.
 *  - `Isotipo`: las cinco figuras del logo en un círculo blanco, para la barra superior.
 *    El logo completo, achicado a ese tamaño, no se lee.
 */

import { Image, StyleSheet, View } from 'react-native'
import { coloresDelLogo } from '../tema'

const ISOTIPO = require('../../assets/isotipo.png')

export function FranjaMarca() {
  return (
    <View style={estilos.franja} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {coloresDelLogo.map(color => <View key={color} style={[estilos.tramo, { backgroundColor: color }]} />)}
    </View>
  )
}

export function Isotipo() {
  return (
    <View style={estilos.circulo} accessibilityLabel="Educar para Transformar" accessibilityRole="image">
      <Image source={ISOTIPO} style={estilos.figuras} />
    </View>
  )
}

const estilos = StyleSheet.create({
  franja:  { flexDirection: 'row', height: 4 },
  tramo:   { flex: 1 },
  circulo: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  figuras: { width: 28, height: 28 },
})
