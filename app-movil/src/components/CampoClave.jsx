/**
 * @file CampoClave.jsx
 * @description Un campo de contraseña con su etiqueta y un botón para mostrarla u ocultarla
 * (versión 1.1). Se usa en el ingreso y en Cambiar contraseña.
 *
 * La contraseña empieza oculta. Verla antes de enviar evita errores de tipeo, que en el
 * teléfono son frecuentes.
 */

import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Lucide } from '@react-native-vector-icons/lucide'
import { colores } from '../tema'

/**
 * @param {{etiqueta: string, valor: string, alCambiar: (texto: string) => void,
 *          editable?: boolean, ayuda?: string, ref?: object, onSubmitEditing?: () => void}} props
 */
export function CampoClave({ etiqueta, valor, alCambiar, editable = true, ayuda, ref, onSubmitEditing }) {
  const [visible, setVisible] = useState(false)
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={estilos.caja}>
        <TextInput
          ref={ref}
          style={estilos.entrada}
          value={valor}
          onChangeText={alCambiar}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          editable={editable}
          accessibilityLabel={etiqueta}
          onSubmitEditing={onSubmitEditing}
        />
        <Pressable
          onPress={() => setVisible(actual => !actual)}
          hitSlop={8}
          style={estilos.ojo}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
        >
          <Lucide name={visible ? 'eye-off' : 'eye'} size={20} color={colores.suave} />
        </Pressable>
      </View>
      {ayuda && <Text style={estilos.ayuda}>{ayuda}</Text>}
    </View>
  )
}

const estilos = StyleSheet.create({
  campo:    { gap: 6 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.texto },
  ayuda:    { fontSize: 13, color: colores.suave },
  caja:     {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 8,
  },
  entrada:  { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colores.texto },
  ojo:      { paddingHorizontal: 12, paddingVertical: 10 },
})
