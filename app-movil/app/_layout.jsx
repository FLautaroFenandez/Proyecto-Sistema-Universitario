/**
 * @file _layout.jsx
 * @description Marco común de todas las pantallas (Expo Router). Define la navegación
 * en pila (Stack): cada pantalla nueva se apila sobre la anterior y el botón "atrás"
 * vuelve a la previa, como en cualquier app de Android.
 *
 * En el paso 3 suma el control de la sesión: quién no inició sesión vuelve al ingreso.
 */

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colores } from '../src/tema'

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.azul },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colores.fondo },
        }}
      />
    </>
  )
}
