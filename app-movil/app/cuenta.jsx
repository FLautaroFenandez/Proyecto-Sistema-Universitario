/**
 * @file cuenta.jsx
 * @description Pantalla 7 — Cambiar contraseña (Etapa 4b · Módulo 1 del enunciado).
 *
 * El enunciado pide "recuperar o cambiar contraseña, si la infraestructura existente lo
 * permite". Se hace el cambio con la sesión iniciada. Recuperar una contraseña olvidada
 * exige enviar correos y el proyecto no tiene un servicio de correo: igual que en la web,
 * se consulta en la Administración.
 *
 * La pantalla no habla con Supabase: valida los campos con el servicio de sesión, le pide
 * el cambio y muestra el mensaje que el servicio devuelve.
 *
 * Versión 1.1: el teclado ya no tapa los campos (ver `Formulario`) y cada contraseña se
 * puede mostrar (ver `CampoClave`).
 */

import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Boton } from '../src/components/Boton'
import { CampoClave } from '../src/components/CampoClave'
import { Formulario } from '../src/components/Formulario'
import { useSesion } from '../src/context/sesion'
import { mensajeDeError } from '../src/services/base'
import { LARGO_MINIMO_CLAVE, sesion, validarClaveNueva } from '../src/services/sesion'
import { colores } from '../src/tema'

export default function CambiarClave() {
  const { usuario } = useSesion()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetida, setRepetida] = useState('')
  const [error, setError] = useState(null)
  const [cambiada, setCambiada] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const incompleto = !actual || !nueva || !repetida

  /** Al escribir se borra el resultado anterior: el mensaje siempre habla de lo último que se intentó. */
  function alEscribir(guardar) {
    return (texto) => {
      guardar(texto)
      setError(null)
      setCambiada(false)
    }
  }

  async function alCambiar() {
    const errorDeCampos = validarClaveNueva(actual, nueva, repetida)
    if (errorDeCampos) {
      setError(errorDeCampos)
      return
    }

    setError(null)
    setEnviando(true)
    try {
      await sesion.cambiarClave(usuario.email, actual, nueva)
      setActual('')
      setNueva('')
      setRepetida('')
      setCambiada(true)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Formulario estiloContenido={estilos.contenido}>
      <View style={estilos.cuenta}>
        <Text style={estilos.nombre}>{usuario?.nombre}</Text>
        <Text style={estilos.detalle}>{usuario?.email}</Text>
      </View>

      <CampoClave etiqueta="Contraseña actual" valor={actual} alCambiar={alEscribir(setActual)} editable={!enviando} />
      <CampoClave
        etiqueta="Contraseña nueva"
        ayuda={`Al menos ${LARGO_MINIMO_CLAVE} caracteres.`}
        valor={nueva}
        alCambiar={alEscribir(setNueva)}
        editable={!enviando}
      />
      <CampoClave etiqueta="Repetir la contraseña nueva" valor={repetida} alCambiar={alEscribir(setRepetida)} editable={!enviando} />

      {error && <Text style={estilos.error} accessibilityRole="alert">{error}</Text>}
      {cambiada && (
        <Text style={estilos.exito} accessibilityRole="alert">
          Contraseña cambiada. La próxima vez ingresá con la nueva, acá y en la web.
        </Text>
      )}

      <Boton texto="Cambiar contraseña" alTocar={alCambiar} ocupado={enviando} inactivo={incompleto} />

      <Text style={estilos.detalle}>
        Si olvidaste tu contraseña actual, consultá en la Administración.
      </Text>
    </Formulario>
  )
}

const estilos = StyleSheet.create({
  contenido: { padding: 24, gap: 16 },
  cuenta:    {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    padding: 16, gap: 2,
  },
  nombre:    { fontSize: 17, fontWeight: '700', color: colores.texto },
  detalle:   { fontSize: 14, color: colores.suave },
  error:    { fontSize: 15, color: colores.rojo },
  exito:     { fontSize: 15, color: colores.verde, fontWeight: '600' },
})
