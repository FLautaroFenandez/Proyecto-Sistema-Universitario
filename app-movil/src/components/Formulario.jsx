/**
 * @file Formulario.jsx
 * @description Marco de una pantalla con campos de texto, para que el teclado no los tape.
 *
 * Por qué hace falta (versión 1.1): desde el SDK 54, en Android las apps de Expo se dibujan
 * de borde a borde, y la ventana ya no se achica cuando aparece el teclado. La documentación
 * de Expo (Keyboard handling) lo dice así: "A view without a `behavior` stays under the
 * keyboard". Antes el ingreso solo se corría en iPhone.
 *
 * Cómo se resuelve, según esa documentación:
 *  - `behavior="padding"` en los dos sistemas;
 *  - si la pantalla tiene barra superior, `keyboardVerticalOffset` con su alto
 *    (`useHeaderHeight`). En el ingreso, que no tiene barra, vale 0.
 */

import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native'
import { useHeaderHeight } from 'expo-router/react-navigation'

export function Formulario({ children, estiloContenido, estilo }) {
  const altoDeLaBarra = useHeaderHeight()
  return (
    <KeyboardAvoidingView style={[estilos.pantalla, estilo]} behavior="padding" keyboardVerticalOffset={altoDeLaBarra}>
      <ScrollView contentContainerStyle={estiloContenido} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
})
