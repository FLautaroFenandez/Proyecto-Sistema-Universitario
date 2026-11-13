/**
 * @file factura/[id].jsx
 * @description Pantalla 4 — Detalle de una factura. La ruta es /factura/<id>.
 *
 * HU-M1: cada cuota muestra el detalle por ítem. Es también la deuda "discriminada por
 * cada ítem de pago" que pide el enunciado.
 *
 * HU-M2 (Etapa 3): el padre tilda los ítems impagos y emite el comprobante.
 *  - El total se corresponde con los ítems marcados: se suma mientras se elige, y el
 *    importe definitivo lo calcula la base al emitir.
 *  - Una factura pagada no puede volver a cobrarse: si el estado no admite pago, no
 *    hay casillas ni botón (patrón State). La base, además, rechaza un ítem ya pagado.
 */

import { useCallback, useState } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Boton } from '../../src/components/Boton'
import { Aviso, Carga } from '../../src/components/Carga'
import { Insignia } from '../../src/components/Insignia'
import { estadoDe, situacionDeItem } from '../../src/domain/estadoFactura'
import { useCarga } from '../../src/hooks/useCarga'
import { mensajeDeError } from '../../src/services/base'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { fecha, periodo, pesos } from '../../src/utils/formato'

export default function DetalleDeFactura() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const cargarFactura = useCallback(() => cobranza.factura(id), [id])
  const { datos, cargando, error, recargar } = useCarga(cargarFactura)

  /** Ids de los ítems tildados. */
  const [elegidos, setElegidos] = useState([])
  const [emitiendo, setEmitiendo] = useState(false)
  const [errorDePago, setErrorDePago] = useState(null)

  const factura = datos?.factura
  const items = datos?.items ?? []
  const estado = factura ? estadoDe(factura.estado) : null

  // Solo se puede elegir lo que sigue impago. Si la factura cambió al recargar, un ítem
  // tildado que ya tiene comprobante deja de contarse.
  const impagos = items.filter(item => !item.comprobante)
  const aPagar = impagos.filter(item => elegidos.includes(item.id))
  const totalElegido = aPagar.reduce((suma, item) => suma + item.importe, 0)

  function alternar(itemId) {
    setElegidos(actuales => (
      actuales.includes(itemId) ? actuales.filter(x => x !== itemId) : [...actuales, itemId]
    ))
  }

  function confirmarPago() {
    Alert.alert(
      'Emitir comprobante',
      `Vas a emitir un comprobante por ${pesos(totalElegido)}. Después tenés que hacer la ` +
      'transferencia y adjuntarla. Un comprobante emitido no se puede anular desde la app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Emitir', onPress: emitir },
      ],
    )
  }

  async function emitir() {
    setEmitiendo(true)
    setErrorDePago(null)
    try {
      const comprobanteId = await cobranza.emitirComprobante(factura.id, aPagar.map(item => item.id))
      setElegidos([])
      router.push(`/comprobante/${comprobanteId}`)
    } catch (err) {
      // Por ejemplo, si otro tutor pagó el mismo ítem un instante antes. Se muestra el
      // motivo que devuelve la base y se recarga para ver el estado real.
      setErrorDePago(mensajeDeError(err))
      await recargar()
    } finally {
      setEmitiendo(false)
    }
  }

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
                  <Insignia texto={estado.etiqueta} color={estado.color} />
                  {factura.vencida && <Insignia texto="Vencida" color="rojo" />}
                </View>
              </View>

              {estado.admitePago && impagos.length > 0 && (
                <Text style={estilos.ayuda}>Tildá los ítems que querés pagar.</Text>
              )}

              <View style={estilos.tarjeta}>
                {items.map((item, indice) => (
                  <Item
                    key={item.id}
                    item={item}
                    conBorde={indice > 0}
                    elegible={estado.admitePago}
                    elegido={elegidos.includes(item.id)}
                    alElegir={() => alternar(item.id)}
                    alAbrirComprobante={() => router.push(`/comprobante/${item.comprobante.id}`)}
                  />
                ))}
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

        {(aPagar.length > 0 || errorDePago) && (
          <View style={estilos.pie}>
            {errorDePago && <Text style={estilos.error} accessibilityRole="alert">{errorDePago}</Text>}
            {aPagar.length > 0 && (
              <Boton
                texto={`Pagar ${aPagar.length} ${aPagar.length === 1 ? 'ítem' : 'ítems'} · ${pesos(totalElegido)}`}
                alTocar={confirmarPago}
                ocupado={emitiendo}
              />
            )}
          </View>
        )}
      </Carga>
    </View>
  )
}

/**
 * Un renglón de la factura.
 *  - Impago y la factura admite pago → se puede tildar.
 *  - Con comprobante → se puede tocar para abrirlo (y adjuntar la transferencia si falta).
 */
function Item({ item, conBorde, elegible, elegido, alElegir, alAbrirComprobante }) {
  const situacion = situacionDeItem(item)
  const sePuedeElegir = elegible && !item.comprobante

  // Qué pasa al tocar el renglón, según su situación.
  let alTocar
  let rol
  if (sePuedeElegir) {
    alTocar = alElegir
    rol = 'checkbox'
  } else if (item.comprobante) {
    alTocar = alAbrirComprobante
    rol = 'button'
  }

  return (
    <Pressable
      style={[estilos.item, conBorde && estilos.itemConBorde]}
      onPress={alTocar}
      accessibilityRole={rol}
      accessibilityState={sePuedeElegir ? { checked: elegido } : undefined}
    >
      <View style={estilos.fila}>
        {sePuedeElegir && (
          <View style={[estilos.casilla, elegido && estilos.casillaTildada]}>
            {elegido && <Text style={estilos.tilde}>✓</Text>}
          </View>
        )}
        <Text style={estilos.concepto}>{item.descripcion}</Text>
        <Text style={estilos.importe}>{pesos(item.importe)}</Text>
      </View>
      <View style={estilos.filaSituacion}>
        <Insignia texto={situacion.etiqueta} color={situacion.color} />
        {item.comprobante && <Text style={estilos.enlace}>Ver comprobante ›</Text>}
      </View>
    </Pressable>
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
  pantalla:       { flex: 1 },
  contenido:      { padding: 16, gap: 12 },
  cabecera:       { gap: 4 },
  mes:            { fontSize: 22, fontWeight: '800', color: colores.azul },
  detalle:        { fontSize: 15, color: colores.suave },
  ayuda:          { fontSize: 14, color: colores.suave },
  insignias:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  tarjeta:        {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  item:           { paddingVertical: 12, gap: 8 },
  itemConBorde:   { borderTopColor: colores.borde, borderTopWidth: 1 },
  fila:           { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filaSituacion:  { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  casilla:        {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colores.azul,
    alignItems: 'center', justifyContent: 'center',
  },
  casillaTildada: { backgroundColor: colores.azul },
  tilde:          { color: '#FFFFFF', fontSize: 15, fontWeight: '800', lineHeight: 18 },
  concepto:       { fontSize: 16, fontWeight: '600', color: colores.texto, flex: 1 },
  importe:        { fontSize: 16, color: colores.texto, fontVariant: ['tabular-nums'] },
  enlace:         { fontSize: 14, fontWeight: '600', color: colores.azul },
  renglon:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  totalEtiqueta:  { fontSize: 17, fontWeight: '700', color: colores.texto },
  total:          { fontSize: 17, fontWeight: '800', color: colores.azul, fontVariant: ['tabular-nums'] },
  pie:            {
    backgroundColor: colores.tarjeta, borderTopColor: colores.borde, borderTopWidth: 1,
    padding: 16, gap: 10,
  },
  error:          { fontSize: 15, color: colores.rojo },
})
