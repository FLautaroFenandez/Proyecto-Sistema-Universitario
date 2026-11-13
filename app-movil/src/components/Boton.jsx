/**
 * @file Boton.jsx
 * @description Botón de la app. Mientras `ocupado` es true muestra un indicador y no
 * responde: así una acción (emitir, subir un archivo) no se dispara dos veces.
 */

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { colores } from '../tema'

/**
 * @param {{texto: string, alTocar: () => void, ocupado?: boolean, inactivo?: boolean,
 *          variante?: 'principal' | 'secundario'}} props
 */
export function Boton({ texto, alTocar, ocupado = false, inactivo = false, variante = 'principal' }) {
  const secundario = variante === 'secundario'
  return (
    <Pressable
      style={[estilos.boton, secundario && estilos.secundario, (inactivo || ocupado) && estilos.inactivo]}
      onPress={alTocar}
      disabled={inactivo || ocupado}
      accessibilityRole="button"
    >
      {ocupado
        ? <ActivityIndicator color={secundario ? colores.azul : '#FFFFFF'} />
        : <Text style={[estilos.texto, secundario && estilos.textoSecundario]}>{texto}</Text>}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  boton:           { backgroundColor: colores.azul, borderRadius: 8, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  secundario:      { backgroundColor: colores.tarjeta, borderColor: colores.azul, borderWidth: 1 },
  inactivo:        { opacity: 0.5 },
  texto:           { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  textoSecundario: { color: colores.azul },
})
