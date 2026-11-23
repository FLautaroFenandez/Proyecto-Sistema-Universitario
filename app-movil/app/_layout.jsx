/**
 * @file _layout.jsx
 * @description Marco común de todas las pantallas (Expo Router).
 *
 * Hace dos cosas:
 *  1. Define la navegación en pila (Stack): cada pantalla se apila sobre la anterior y
 *     el botón "atrás" vuelve a la previa.
 *  2. Protege las pantallas según la sesión, con `Stack.Protected` (la forma que indica
 *     la documentación de Expo Router para SDK 58):
 *       - sin sesión  → solo existe la pantalla de ingreso;
 *       - con sesión  → existen las pantallas de la familia y deja de existir el ingreso.
 *     Cuando la sesión cambia, Expo Router redirige solo: al ingresar lleva a "Mis hijos"
 *     y al salir vuelve al ingreso. Ninguna pantalla navega "a mano" por la sesión.
 *
 * Esta es la capa de seguridad de la app. La otra es el RLS de la base de datos.
 */

import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ProveedorSesion, useSesion } from '../src/context/sesion'
import { colores } from '../src/tema'

// La pantalla de bienvenida queda visible hasta saber si hay una sesión guardada.
// Así no se ve el formulario de ingreso por un instante cuando el padre ya ingresó.
// Si este pedido fallara, la bienvenida simplemente se ocultaría antes: no es un error.
// Versión 1.1: la bienvenida muestra el logo (configurada en app.json con el plugin de
// `expo-splash-screen`). Solo se ve en el APK: Expo Go muestra su propia pantalla.
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function Layout() {
  return (
    <ProveedorSesion>
      <StatusBar style="light" />
      <Navegacion />
    </ProveedorSesion>
  )
}

function Navegacion() {
  const { usuario, cargando } = useSesion()
  // Alto de la barra de navegación del teléfono (atrás, inicio, recientes). En Android la
  // app se dibuja también detrás de esa barra; sin este margen, el final de cada pantalla
  // queda tapado. Se aplica una sola vez acá, para todas las pantallas.
  const margenes = useSafeAreaInsets()

  useEffect(() => {
    if (!cargando) SplashScreen.hide()
  }, [cargando])

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.azul },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colores.fondo, paddingBottom: margenes.bottom },
      }}
    >
      <Stack.Protected guard={!usuario}>
        {/* El ingreso no tiene barra: arriba va el logo de la escuela. */}
        <Stack.Screen name="index" options={{ title: 'Educar para Transformar', headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="hijos" options={{ title: 'Mis hijos' }} />
        <Stack.Screen name="hijo/[id]" options={{ title: 'Cuotas' }} />
        <Stack.Screen name="factura/[id]" options={{ title: 'Factura' }} />
        <Stack.Screen name="comprobante/[id]" options={{ title: 'Comprobante' }} />
        <Stack.Screen name="historial/[id]" options={{ title: 'Historial' }} />
        <Stack.Screen name="inscripciones/[id]" options={{ title: 'Inscripciones' }} />
        <Stack.Screen name="inscribir/[id]" options={{ title: 'Inscribir' }} />
        <Stack.Screen name="baja/[id]" options={{ title: 'Dar de baja' }} />
        <Stack.Screen name="avisos" options={{ title: 'Avisos de cobranza' }} />
        <Stack.Screen name="cuenta" options={{ title: 'Cambiar contraseña' }} />
      </Stack.Protected>
    </Stack>
  )
}
