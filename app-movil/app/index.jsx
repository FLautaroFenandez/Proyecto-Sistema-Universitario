/**
 * @file index.jsx
 * @description Pantalla inicial PROVISORIA (Etapa 2, paso 2). Solo confirma que el
 * proyecto corre en el teléfono y que llega a Supabase. En el paso 3 se reemplaza por
 * la pantalla de ingreso (HU-M6).
 */

import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { comprobarConexion } from '../src/services/sesion'
import { colores } from '../src/tema'

export default function Inicio() {
  // null = comprobando · true = conectado · false = sin conexión
  const [conectado, setConectado] = useState(null)

  useEffect(() => {
    comprobarConexion().then(setConectado)
  }, [])

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Educar para Transformar' }} />
      <Text style={estilos.titulo}>App de familias</Text>
      <Text style={estilos.texto}>El proyecto Expo funciona en este teléfono.</Text>

      {conectado === null && <ActivityIndicator color={colores.azul} />}
      {conectado === true && (
        <Text style={[estilos.estado, { color: colores.verde }]}>Conexión con Supabase: correcta</Text>
      )}
      {conectado === false && (
        <Text style={[estilos.estado, { color: colores.rojo }]}>
          Sin conexión con Supabase. Revisá el Wi-Fi y el archivo .env.local.
        </Text>
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  titulo:   { fontSize: 24, fontWeight: '800', color: colores.azul },
  texto:    { fontSize: 16, color: colores.suave, textAlign: 'center' },
  estado:   { fontSize: 16, fontWeight: '600', textAlign: 'center' },
})
