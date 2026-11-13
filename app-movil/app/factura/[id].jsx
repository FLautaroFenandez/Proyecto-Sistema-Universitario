/**
 * @file factura/[id].jsx
 * @description Pantalla 4 — Detalle de una factura (HU-M1). La ruta es /factura/<id>.
 *
 * Criterio de aceptación: cada cuota muestra el detalle por ítem. Es también la deuda
 * "discriminada por cada ítem de pago" que pide el enunciado: cada renglón dice si está
 * impago, en proceso o pagado.
 */

import { useCallback } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Aviso, Carga } from '../../src/components/Carga'
import { Insignia } from '../../src/components/Insignia'
import { estadoDe, situacionDeItem } from '../../src/domain/estadoFactura'
import { useCarga } from '../../src/hooks/useCarga'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { fecha, periodo, pesos } from '../../src/utils/formato'

export default function DetalleDeFactura() {
  const { id } = useLocalSearchParams()

  const cargarFactura = useCallback(() => cobranza.factura(id), [id])
  const { datos, cargando, error, recargar } = useCarga(cargarFactura)

  const factura = datos?.factura
  const items = datos?.items ?? []

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: factura ? `Factura N.º ${factura.numero}` : 'Factura' }} />

      <Carga cargando={cargando && !datos} error={error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          {!factura ? (
            <Aviso texto="No se encontró la factura." />
          ) : (
            <>
              <View style={estilos.cabecera}>
                <Text style={estilos.mes}>{periodo(factura.periodo)}</Text>
                <Text style={estilos.detalle}>Vence el {fecha(factura.vencimiento)}</Text>
                <View style={estilos.insignias}>
                  <Insignia texto={estadoDe(factura.estado).etiqueta} color={estadoDe(factura.estado).color} />
                  {factura.vencida && <Insignia texto="Vencida" color="rojo" />}
                </View>
              </View>

              <View style={estilos.tarjeta}>
                {items.map((item, indice) => {
                  const situacion = situacionDeItem(item)
                  return (
                    <View key={item.id} style={[estilos.item, indice > 0 && estilos.itemConBorde]}>
                      <View style={estilos.fila}>
                        <Text style={estilos.concepto}>{item.descripcion}</Text>
                        <Text style={estilos.importe}>{pesos(item.importe)}</Text>
                      </View>
                      <Insignia texto={situacion.etiqueta} color={situacion.color} />
                    </View>
                  )
                })}
              </View>

              <View style={estilos.tarjeta}>
                <Renglon etiqueta="Total" valor={pesos(factura.total)} />
                <Renglon etiqueta="Pagado" valor={pesos(factura.pagado)} />
                {factura.en_proceso > 0 && <Renglon etiqueta="En proceso" valor={pesos(factura.en_proceso)} />}
                <Renglon etiqueta="Saldo" valor={pesos(factura.saldo)} destacado />
              </View>
            </>
          )}
        </ScrollView>
      </Carga>
    </View>
  )
}

/** Una línea del resumen: etiqueta a la izquierda, importe a la derecha. */
function Renglon({ etiqueta, valor, destacado = false }) {
  return (
    <View style={estilos.renglon}>
      <Text style={destacado ? estilos.totalEtiqueta : estilos.detalle}>{etiqueta}</Text>
      <Text style={destacado ? estilos.total : estilos.importe}>{valor}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla:      { flex: 1 },
  contenido:     { padding: 16, gap: 12 },
  cabecera:      { gap: 4 },
  mes:           { fontSize: 22, fontWeight: '800', color: colores.azul },
  detalle:       { fontSize: 15, color: colores.suave },
  insignias:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  tarjeta:       {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  item:          { paddingVertical: 12, gap: 6 },
  itemConBorde:  { borderTopColor: colores.borde, borderTopWidth: 1 },
  fila:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  concepto:      { fontSize: 16, fontWeight: '600', color: colores.texto, flexShrink: 1 },
  importe:       { fontSize: 16, color: colores.texto, fontVariant: ['tabular-nums'] },
  renglon:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalEtiqueta: { fontSize: 17, fontWeight: '700', color: colores.texto },
  total:         { fontSize: 17, fontWeight: '800', color: colores.azul, fontVariant: ['tabular-nums'] },
})
