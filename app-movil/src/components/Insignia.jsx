/**
 * @file Insignia.jsx
 * @description Etiqueta de color para un estado: "Pendiente", "Pagada", "Vencida".
 * Equivale al componente Badge de la web.
 */

import { StyleSheet, Text, View } from 'react-native'
import { colores } from '../tema'

/** Color de texto y de fondo para cada nombre de color que usa el dominio. */
const PALETA = {
  naranja: { texto: '#B94D1E', fondo: '#FCEBE2' },
  azul:    { texto: colores.azul, fondo: '#E3EAF6' },
  verde:   { texto: colores.verde, fondo: '#E3F2E4' },
  rojo:    { texto: colores.rojo, fondo: '#FBE4E4' },
  gris:    { texto: colores.suave, fondo: '#E9EDF3' },
}

/**
 * @param {{texto: string, color?: 'naranja'|'azul'|'verde'|'rojo'|'gris'}} props
 */
export function Insignia({ texto, color = 'gris' }) {
  const paleta = PALETA[color] ?? PALETA.gris
  return (
    <View style={[estilos.caja, { backgroundColor: paleta.fondo }]}>
      <Text style={[estilos.texto, { color: paleta.texto }]}>{texto}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  caja:  { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  texto: { fontSize: 13, fontWeight: '600' },
})
