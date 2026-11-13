/**
 * @file hijos.jsx
 * @description Pantalla 2 — Mis hijos (HU-M6).
 *
 * Criterios de aceptación:
 *  - Después de ingresar, el padre ve a sus hijos asociados.
 *  - Un usuario sin hijos asociados no accede a datos de otros alumnos: la base no le
 *    devuelve ninguno y la pantalla lo explica.
 */

import { useCallback } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Aviso, Carga } from '../src/components/Carga'
import { useSesion } from '../src/context/sesion'
import { useCarga } from '../src/hooks/useCarga'
import { cobranza } from '../src/services/cobranza'
import { colores } from '../src/tema'

export default function MisHijos() {
  const { usuario, salir } = useSesion()
  const router = useRouter()

  const cargarHijos = useCallback(() => cobranza.misHijos(usuario?.id), [usuario?.id])
  const { datos: hijos, cargando, error, recargar } = useCarga(cargarHijos)

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={salir} hitSlop={12} accessibilityRole="button">
              <Text style={estilos.salir}>Salir</Text>
            </Pressable>
          ),
        }}
      />

      <Carga cargando={cargando} error={error} alReintentar={recargar}>
        <FlatList
          data={hijos ?? []}
          keyExtractor={hijo => hijo.id}
          contentContainerStyle={estilos.lista}
          ListHeaderComponent={<Text style={estilos.saludo}>Hola, {usuario?.nombre}</Text>}
          ListEmptyComponent={
            <Aviso texto="No tenés alumnos asociados a tu cuenta. Consultá en la Administración." />
          }
          renderItem={({ item: hijo }) => (
            <Pressable
              style={estilos.tarjeta}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/hijo/[id]', params: { id: hijo.id, nombre: hijo.nombre } })}
            >
              <Text style={estilos.nombre}>{hijo.nombre} {hijo.apellido}</Text>
              <Text style={estilos.detalle}>
                {hijo.curso || 'Sin matrícula activa'} · Legajo {hijo.legajo}
              </Text>
              <Text style={estilos.enlace}>Ver cuotas ›</Text>
            </Pressable>
          )}
        />
      </Carga>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  lista:    { padding: 16, gap: 12 },
  saludo:   { fontSize: 18, fontWeight: '700', color: colores.texto, marginBottom: 4 },
  tarjeta:  {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    padding: 16, gap: 4,
  },
  nombre:   { fontSize: 17, fontWeight: '700', color: colores.texto },
  detalle:  { fontSize: 14, color: colores.suave },
  enlace:   { fontSize: 14, fontWeight: '600', color: colores.azul, marginTop: 6 },
  salir:    { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
})
