/**
 * @file hijo/[id].jsx
 * @description Pantalla 3 — Cuotas de un hijo (HU-M1). La ruta es /hijo/<id del alumno>.
 *
 * Criterios de aceptación:
 *  - Un padre ve solo las cuotas de sus hijos (lo garantiza el RLS de la base).
 *  - Cada cuota muestra vencimiento, importe y estado; se separan pendientes de pagadas.
 *  - Sin cuotas emitidas, la pantalla lo explica en lugar de quedar vacía.
 */

import { useCallback } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Boton } from '../../src/components/Boton'
import { Aviso, Carga } from '../../src/components/Carga'
import { Insignia } from '../../src/components/Insignia'
import { estadoDe } from '../../src/domain/estadoFactura'
import { useCarga } from '../../src/hooks/useCarga'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { fecha, periodo, pesos } from '../../src/utils/formato'

export default function CuotasDelHijo() {
  const { id, nombre } = useLocalSearchParams()
  const router = useRouter()

  const cargarFacturas = useCallback(() => cobranza.facturasDe(id), [id])
  const { datos, cargando, error, recargar } = useCarga(cargarFacturas)

  const facturas = datos ?? []
  // El estado decide en qué lista va cada factura: las que admiten pago son las pendientes.
  const pendientes = facturas.filter(f => estadoDe(f.estado).admitePago)
  const pagadas = facturas.filter(f => !estadoDe(f.estado).admitePago)

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: nombre ? `Cuotas de ${nombre}` : 'Cuotas' }} />

      <Carga cargando={cargando && !datos} error={error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          {facturas.length === 0 ? (
            <Aviso texto="Todavía no hay cuotas emitidas para este alumno." />
          ) : (
            <>
              <Boton
                texto="Ver historial y deuda"
                variante="secundario"
                alTocar={() => router.push({ pathname: '/historial/[id]', params: { id, nombre } })}
              />
              <Text style={estilos.seccion}>Pendientes</Text>
              {pendientes.length === 0 && <Aviso texto="No hay cuotas pendientes." />}
              {pendientes.map(factura => (
                <TarjetaFactura key={factura.id} factura={factura} alAbrir={() => router.push(`/factura/${factura.id}`)} />
              ))}

              <Text style={estilos.seccion}>Pagadas</Text>
              {pagadas.length === 0 && <Aviso texto="Todavía no hay cuotas pagadas." />}
              {pagadas.map(factura => (
                <TarjetaFactura key={factura.id} factura={factura} alAbrir={() => router.push(`/factura/${factura.id}`)} />
              ))}
            </>
          )}
        </ScrollView>
      </Carga>
    </View>
  )
}

/** Resumen de una factura: mes, vencimiento, importe y estado. */
function TarjetaFactura({ factura, alAbrir }) {
  const estado = estadoDe(factura.estado)
  return (
    <Pressable style={estilos.tarjeta} onPress={alAbrir} accessibilityRole="button">
      <View style={estilos.fila}>
        <Text style={estilos.mes}>{periodo(factura.periodo)}</Text>
        <Text style={estilos.importe}>{pesos(estado.admitePago ? factura.saldo : factura.total)}</Text>
      </View>
      <Text style={estilos.detalle}>
        Factura N.º {factura.numero} · Vence el {fecha(factura.vencimiento)}
      </Text>
      {estado.clave === 'parcial' && (
        <Text style={estilos.detalle}>Pagado {pesos(factura.pagado)} de {pesos(factura.total)}</Text>
      )}
      <View style={estilos.insignias}>
        <Insignia texto={estado.etiqueta} color={estado.color} />
        {factura.vencida && <Insignia texto="Vencida" color="rojo" />}
      </View>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  pantalla:  { flex: 1 },
  contenido: { padding: 16, gap: 10 },
  seccion:   {
    fontSize: 13, fontWeight: '700', color: colores.suave, letterSpacing: 0.8,
    textTransform: 'uppercase', marginTop: 8,
  },
  tarjeta:   {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    padding: 16, gap: 6,
  },
  fila:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  mes:       { fontSize: 17, fontWeight: '700', color: colores.texto, flexShrink: 1 },
  importe:   { fontSize: 17, fontWeight: '700', color: colores.texto, fontVariant: ['tabular-nums'] },
  detalle:   { fontSize: 14, color: colores.suave },
  insignias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
})
