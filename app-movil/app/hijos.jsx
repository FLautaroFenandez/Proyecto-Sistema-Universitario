/**
 * @file hijos.jsx
 * @description Pantalla 2 — Mis hijos (HU-M6).
 *
 * Criterios de aceptación:
 *  - Después de ingresar, el padre ve a sus hijos asociados.
 *  - Un usuario sin hijos asociados no accede a datos de otros alumnos: la base no le
 *    devuelve ninguno y la pantalla lo explica.
 *
 * Etapa 4b: al pie está el acceso para cambiar la contraseña de la cuenta.
 * Versión 1.1: arriba, el acceso a los avisos de cobranza. Es la pantalla de inicio: lleva
 * las figuras del logo en la barra, la franja de la marca y, en cada hijo, sus iniciales en
 * un círculo con uno de los colores del logo, para distinguir a los hermanos de un vistazo.
 */

import { useCallback } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Boton } from '../src/components/Boton'
import { Aviso, Carga } from '../src/components/Carga'
import { FranjaMarca, Isotipo } from '../src/components/Marca'
import { useSesion } from '../src/context/sesion'
import { useCarga } from '../src/hooks/useCarga'
import { cobranza } from '../src/services/cobranza'
import { colores, coloresDelLogo } from '../src/tema'

export default function MisHijos() {
  const { usuario, salir } = useSesion()
  const router = useRouter()

  const cargarHijos = useCallback(() => cobranza.misHijos(usuario?.id), [usuario?.id])
  const { datos: hijos, cargando, error, recargar } = useCarga(cargarHijos)

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen
        options={{
          headerLeft: Isotipo,
          headerRight: () => (
            <Pressable onPress={salir} hitSlop={12} accessibilityRole="button">
              <Text style={estilos.salir}>Salir</Text>
            </Pressable>
          ),
        }}
      />
      <FranjaMarca />

      <Carga cargando={cargando} error={error} alReintentar={recargar}>
        <FlatList
          data={hijos ?? []}
          keyExtractor={hijo => hijo.id}
          contentContainerStyle={estilos.lista}
          ListHeaderComponent={
            <View style={estilos.cabecera}>
              <Text style={estilos.saludo}>Hola, {usuario?.nombre}</Text>
              <Boton texto="Avisos de cobranza" variante="secundario" alTocar={() => router.push('/avisos')} />
            </View>
          }
          ListEmptyComponent={
            <Aviso texto="No tenés alumnos asociados a tu cuenta. Consultá en la Administración." />
          }
          ListFooterComponent={
            <View style={estilos.cuenta}>
              <Text style={estilos.detalle}>Tu cuenta: {usuario?.email}</Text>
              <Boton texto="Cambiar contraseña" variante="secundario" alTocar={() => router.push('/cuenta')} />
            </View>
          }
          renderItem={({ item: hijo, index }) => (
            <Pressable
              style={estilos.tarjeta}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/hijo/[id]', params: { id: hijo.id, nombre: hijo.nombre } })}
            >
              <Iniciales hijo={hijo} color={coloresDelLogo[index % coloresDelLogo.length]} />
              <View style={estilos.datos}>
                <Text style={estilos.nombre}>{hijo.nombre} {hijo.apellido}</Text>
                <Text style={estilos.detalle}>
                  {hijo.curso || 'Sin matrícula activa'} · Legajo {hijo.legajo}
                </Text>
                <Text style={estilos.enlace}>Ver cuotas ›</Text>
              </View>
            </Pressable>
          )}
        />
      </Carga>
    </View>
  )
}

/**
 * Las iniciales del hijo en un círculo con un color del logo. El texto va en azul sobre un
 * fondo claro: varios colores del logo (el verde, el celeste) no se leen con letras blancas.
 */
function Iniciales({ hijo, color }) {
  const iniciales = `${hijo.nombre?.[0] ?? ''}${hijo.apellido?.[0] ?? ''}`.toUpperCase()
  return (
    <View style={[estilos.iniciales, { borderColor: color, backgroundColor: `${color}1F` }]}>
      <Text style={estilos.inicialesTexto}>{iniciales}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  lista:    { padding: 16, gap: 12 },
  cabecera: { gap: 12, marginBottom: 4 },
  saludo:   { fontSize: 18, fontWeight: '700', color: colores.texto },
  tarjeta:  {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  datos:    { flex: 1, gap: 4 },
  iniciales: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  inicialesTexto: { fontSize: 17, fontWeight: '800', color: colores.azul },
  nombre:   { fontSize: 17, fontWeight: '700', color: colores.texto },
  detalle:  { fontSize: 14, color: colores.suave },
  enlace:   { fontSize: 14, fontWeight: '600', color: colores.azul, marginTop: 6 },
  cuenta:   { gap: 10, marginTop: 20, paddingTop: 16, borderTopColor: colores.borde, borderTopWidth: 1 },
  salir:    { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
})
