/**
 * @file comprobante/[id].jsx
 * @description Pantalla 5 — Comprobante de pago. La ruta es /comprobante/<id>.
 *
 * HU-M2: es el comprobante que emite el sistema con los ítems elegidos y el importe a
 * transferir.
 *
 * HU-M4: desde acá el padre adjunta el archivo de la transferencia.
 *  - El comprobante queda asociado a la factura correcta: esta pantalla ya pertenece a
 *    un comprobante, y el comprobante a una factura.
 *  - Una factura admite varios comprobantes sin sobrescribir el anterior: cada pago es
 *    un comprobante distinto, con su propio archivo.
 *  - Solo el tutor y la Administración acceden al archivo: el bucket es privado y se
 *    abre con un enlace temporal.
 */

import { useCallback, useState } from 'react'
import { Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Boton } from '../../src/components/Boton'
import { Aviso, Carga } from '../../src/components/Carga'
import { Insignia } from '../../src/components/Insignia'
import { DATOS_TRANSFERENCIA } from '../../src/config/institucion'
import { estadoDeComprobante } from '../../src/domain/estadoComprobante'
import { useCarga } from '../../src/hooks/useCarga'
import { mensajeDeError } from '../../src/services/base'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { elegirArchivo } from '../../src/utils/elegirArchivo'
import { fechaDeMomento, periodo, pesos } from '../../src/utils/formato'

export default function ComprobanteDePago() {
  const { id } = useLocalSearchParams()

  const cargarComprobante = useCallback(() => cobranza.comprobante(id), [id])
  const { datos: comprobante, cargando, error, recargar } = useCarga(cargarComprobante)

  const [ocupado, setOcupado] = useState(false)
  const [problema, setProblema] = useState(null)

  const estado = comprobante ? estadoDeComprobante(comprobante.estado) : null

  async function adjuntar() {
    setProblema(null)
    try {
      const archivo = await elegirArchivo()
      if (!archivo) return // el padre canceló el selector
      setOcupado(true)
      await cobranza.adjuntarTransferencia(comprobante, archivo)
      await recargar()
    } catch (err) {
      // El detalle técnico va a la consola (la terminal de Expo) para poder diagnosticarlo.
      console.error('[comprobante] Falló al adjuntar la transferencia:', err)
      setProblema(mensajeDeError(err, 'No se pudo adjuntar el archivo.'))
    } finally {
      setOcupado(false)
    }
  }

  async function verArchivo() {
    setProblema(null)
    try {
      await Linking.openURL(await cobranza.enlaceDelArchivo(comprobante.archivo_path))
    } catch (err) {
      console.error('[comprobante] Falló al abrir el archivo adjunto:', err)
      setProblema(mensajeDeError(err, 'No se pudo abrir el archivo.'))
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: comprobante ? `Comprobante N.º ${comprobante.numero}` : 'Comprobante' }} />

      <Carga cargando={cargando && !comprobante} error={error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          {!comprobante ? (
            <Aviso texto="No se encontró el comprobante." />
          ) : (
            <>
              <View style={estilos.cabecera}>
                <Text style={estilos.detalle}>
                  Factura N.º {comprobante.factura.numero} · {periodo(comprobante.factura.periodo)}
                </Text>
                <Text style={estilos.detalle}>Emitido el {fechaDeMomento(comprobante.created_at)}</Text>
                <Text style={estilos.etiquetaImporte}>
                  {estado.admiteAdjuntar ? 'Importe a transferir' : 'Importe transferido'}
                </Text>
                <Text style={estilos.importeGrande}>{pesos(comprobante.importe)}</Text>
                <Insignia texto={estado.etiqueta} color={estado.color} />
              </View>

              <View style={estilos.tarjeta}>
                <Text style={estilos.subtitulo}>Ítems que cubre</Text>
                {comprobante.items.map(item => (
                  <View key={item.id} style={estilos.renglon}>
                    <Text style={estilos.concepto}>{item.descripcion}</Text>
                    <Text style={estilos.importe}>{pesos(item.importe)}</Text>
                  </View>
                ))}
              </View>

              {estado.admiteAdjuntar ? (
                <>
                  <View style={estilos.tarjeta}>
                    <Text style={estilos.subtitulo}>Transferí a</Text>
                    <Dato etiqueta="Titular" valor={DATOS_TRANSFERENCIA.titular} />
                    <Dato etiqueta="Banco" valor={DATOS_TRANSFERENCIA.banco} />
                    <Dato etiqueta="Alias" valor={DATOS_TRANSFERENCIA.alias} />
                    <Dato etiqueta="CBU" valor={DATOS_TRANSFERENCIA.cbu} />
                  </View>
                  <Text style={estilos.detalle}>
                    Cuando hagas la transferencia, adjuntá el comprobante del banco: una imagen JPG o PNG, o un PDF de hasta 5 MB.
                  </Text>
                  <Boton texto="Adjuntar comprobante de transferencia" alTocar={adjuntar} ocupado={ocupado} />
                </>
              ) : (
                <>
                  <Text style={estilos.detalle}>
                    Transferencia informada el {fechaDeMomento(comprobante.informado_at)}.
                  </Text>
                  <Boton texto="Ver archivo adjunto" alTocar={verArchivo} variante="secundario" />
                </>
              )}

              {problema && <Text style={estilos.error} accessibilityRole="alert">{problema}</Text>}
            </>
          )}
        </ScrollView>
      </Carga>
    </View>
  )
}

/** Un dato de la cuenta: se puede seleccionar para copiarlo a la app del banco. */
function Dato({ etiqueta, valor }) {
  return (
    <View style={estilos.renglon}>
      <Text style={estilos.detalle}>{etiqueta}</Text>
      <Text style={estilos.valor} selectable>{valor}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla:        { flex: 1 },
  contenido:       { padding: 16, gap: 12 },
  cabecera:        { gap: 4 },
  detalle:         { fontSize: 15, color: colores.suave },
  etiquetaImporte: { fontSize: 13, fontWeight: '700', color: colores.suave, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 10 },
  importeGrande:   { fontSize: 32, fontWeight: '800', color: colores.azul, fontVariant: ['tabular-nums'], marginBottom: 6 },
  tarjeta:         {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  subtitulo:       { fontSize: 13, fontWeight: '700', color: colores.suave, letterSpacing: 0.8, textTransform: 'uppercase' },
  renglon:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  concepto:        { fontSize: 16, color: colores.texto, flexShrink: 1 },
  importe:         { fontSize: 16, color: colores.texto, fontVariant: ['tabular-nums'] },
  valor:           { fontSize: 15, fontWeight: '600', color: colores.texto, flexShrink: 1, textAlign: 'right' },
  error:           { fontSize: 15, color: colores.rojo },
})
