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
 *
 * Versión 1.1: sin barra superior, con el logo y la franja de la marca. El teclado ya no
 * tapa los campos (ver `Formulario`), la tecla "Siguiente" pasa del email a la contraseña y
 * la contraseña se puede mostrar.
 */

import { useRef, useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CampoClave } from '../src/components/CampoClave'
import { Formulario } from '../src/components/Formulario'
import { FranjaMarca } from '../src/components/Marca'
import { useSesion } from '../src/context/sesion'
import { mensajeDeError } from '../src/services/base'
import { colores } from '../src/tema'

const LOGO = require('../assets/logo.png')

export default function Ingreso() {
  const { ingresar } = useSesion()
  const margenes = useSafeAreaInsets()
  const campoClave = useRef(null)
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
    <View style={[estilos.pantalla, { paddingTop: margenes.top }]}>
      {/* Sin barra superior el fondo es claro: los íconos del sistema van oscuros. */}
      <StatusBar style="dark" />
      <FranjaMarca />

      <Formulario estiloContenido={estilos.contenido}>
        <Image source={LOGO} style={estilos.logo} accessibilityLabel="Educar para Transformar, centro educativo" />
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
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => campoClave.current?.focus()}
          />
        </View>

        <CampoClave
          ref={campoClave}
          etiqueta="Contraseña"
          valor={clave}
          alCambiar={setClave}
          editable={!enviando}
          onSubmitEditing={incompleto ? undefined : alIngresar}
        />

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

        {/* Recuperar la contraseña exige enviar correos; como en la web, lo resuelve la Administración. */}
        <Text style={estilos.olvido}>¿Olvidaste tu contraseña? Consultá en la Administración.</Text>
      </Formulario>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla:      { flex: 1, backgroundColor: colores.tarjeta },
  contenido:     { flexGrow: 1, justifyContent: 'center', gap: 16, padding: 24 },
  logo:          { width: 170, height: 170, alignSelf: 'center' },
  titulo:        { fontSize: 26, fontWeight: '800', color: colores.azul, textAlign: 'center' },
  ayuda:         { fontSize: 15, color: colores.suave, textAlign: 'center' },
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
  olvido:        { fontSize: 14, color: colores.suave, textAlign: 'center' },
})
