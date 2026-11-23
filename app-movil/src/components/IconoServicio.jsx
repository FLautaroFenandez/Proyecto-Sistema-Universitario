/**
 * @file IconoServicio.jsx
 * @description El ícono de un tipo de concepto (cuota, deporte, transporte o comedor) en un
 * círculo de su color. Son los mismos íconos que usa la web en Precios y facturación.
 *
 * Los íconos son de `@react-native-vector-icons/lucide`, el paquete que recomienda la
 * documentación de Expo en lugar de `@expo/vector-icons`. Se importa la versión que carga
 * la fuente al usarse (con `expo-font`), que es la que funciona en Expo Go.
 */

import { StyleSheet, View } from 'react-native'
import { Lucide } from '@react-native-vector-icons/lucide'
import { estiloDeServicio } from '../tema'

/**
 * @param {{tipo: 'cuota'|'deporte'|'transporte'|'comedor', medida?: number}} props
 */
export function IconoServicio({ tipo, medida = 18 }) {
  const estilo = estiloDeServicio(tipo)
  const lado = medida + 14
  return (
    <View
      style={[estilos.circulo, { width: lado, height: lado, borderRadius: lado / 2, backgroundColor: estilo.fondo }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Lucide name={estilo.icono} size={medida} color={estilo.texto} />
    </View>
  )
}

const estilos = StyleSheet.create({
  circulo: { alignItems: 'center', justifyContent: 'center' },
})
