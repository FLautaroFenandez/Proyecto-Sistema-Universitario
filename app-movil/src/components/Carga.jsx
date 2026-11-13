/**
 * @file Carga.jsx
 * @description Lo que se ve mientras una pantalla espera sus datos, y lo que se ve si
 * fallan. Ninguna pantalla queda en blanco: o hay un indicador, o un mensaje con un
 * botón para reintentar, o el contenido.
 */

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { colores } from '../tema'

/**
 * @param {{cargando: boolean, error: string | null, alReintentar: () => void, children: any}} props
 */
export function Carga({ cargando, error, alReintentar, children }) {
  if (error) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.error}>{error}</Text>
        <Pressable style={estilos.boton} onPress={alReintentar} accessibilityRole="button">
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={colores.azul} />
      </View>
    )
  }

  return children
}

/** Mensaje para cuando no hay nada que listar: explica en lugar de dejar la pantalla vacía. */
export function Aviso({ texto }) {
  return <Text style={estilos.aviso}>{texto}</Text>
}

const estilos = StyleSheet.create({
  centro:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  error:      { fontSize: 16, color: colores.rojo, textAlign: 'center' },
  boton:      { backgroundColor: colores.azul, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  aviso:      { fontSize: 15, color: colores.suave, paddingVertical: 12 },
})
