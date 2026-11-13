/**
 * @file index.jsx
 * @description Pantalla 1 — Ingreso (HU-M6).
 *
 * Criterios de aceptación:
 *  - Credenciales válidas → ingresa y ve a sus hijos (la redirección la hace _layout.jsx).
 *  - Credenciales inválidas → mensaje claro, sin detalles técnicos.
 *
 * La pantalla no habla con Supabase: le pide a la sesión que ingrese y muestra el
 * mensaje que devuelve el servicio.
 */

import { useState } from 'react'
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native'
import { useSesion } from '../src/context/sesion'
import { mensajeDeError } from '../src/services/base'
import { colores } from '../src/tema'

export default function Ingreso() {
  const { ingresar } = useSesion()
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const incompleto = !email.trim() || !clave

  async function alIngresar() {
    setError(null)
    setEnviando(true)
    try {
      await ingresar(email, clave)
      // Si sale bien no hay nada más que hacer acá: al haber sesión, esta pantalla
      // deja de existir y Expo Router muestra "Mis hijos".
    } catch (err) {
      setError(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>App de familias</Text>
        <Text style={estilos.ayuda}>Ingresá con el mismo email y contraseña que usás en la web.</Text>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Email</Text>
          <TextInput
            style={estilos.entrada}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="nombre@ejemplo.com"
            placeholderTextColor={colores.suave}
            editable={!enviando}
          />
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Contraseña</Text>
          <TextInput
            style={estilos.entrada}
            value={clave}
            onChangeText={setClave}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            editable={!enviando}
            onSubmitEditing={incompleto ? undefined : alIngresar}
          />
        </View>

        {error && <Text style={estilos.error} accessibilityRole="alert">{error}</Text>}

        <Pressable
          style={[estilos.boton, (incompleto || enviando) && estilos.botonInactivo]}
          onPress={alIngresar}
          disabled={incompleto || enviando}
          accessibilityRole="button"
        >
          {enviando
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={estilos.botonTexto}>Ingresar</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const estilos = StyleSheet.create({
  pantalla:      { flex: 1 },
  contenido:     { flexGrow: 1, justifyContent: 'center', gap: 16, padding: 24 },
  titulo:        { fontSize: 26, fontWeight: '800', color: colores.azul },
  ayuda:         { fontSize: 15, color: colores.suave },
  campo:         { gap: 6 },
  etiqueta:      { fontSize: 14, fontWeight: '600', color: colores.texto },
  entrada:       {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colores.texto,
  },
  error:         { fontSize: 15, color: colores.rojo },
  boton:         { backgroundColor: colores.azul, borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  botonInactivo: { opacity: 0.5 },
  botonTexto:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})
