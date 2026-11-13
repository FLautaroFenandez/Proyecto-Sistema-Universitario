/**
 * @file historial/[id].jsx
 * @description Pantalla 6 — Historial de facturas y deuda de un hijo (HU-M3).
 * La ruta es /historial/<id del alumno>.
 *
 * Criterios de aceptación:
 *  - El listado respeta el período elegido: se filtra por mes, "desde" y "hasta", que
 *    es la unidad de las facturas. Arranca mostrando todo el ciclo lectivo.
 *  - La deuda se muestra por concepto y no solo como total: cada ítem adeudado aparece
 *    con su mes y su importe, y al final va el total.
 */

import { useCallback, useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Aviso, Carga } from '../../src/components/Carga'
import { Insignia } from '../../src/components/Insignia'
import { estadoDeComprobante } from '../../src/domain/estadoComprobante'
import { estadoDe } from '../../src/domain/estadoFactura'
import { useCarga } from '../../src/hooks/useCarga'
import { mensajeDeError } from '../../src/services/base'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { fechaDeMomento, inicioDeMes, periodo, pesos, sumarMeses } from '../../src/utils/formato'

export default function Historial() {
  const { id, nombre } = useLocalSearchParams()
  const router = useRouter()

  /**
   * Meses entre los que se filtra. `minimo` y `maximo` son los del ciclo lectivo.
   * @type {[{minimo: string, maximo: string, desde: string, hasta: string} | null, Function]}
   */
  const [rango, setRango] = useState(null)
  const [errorDeCiclo, setErrorDeCiclo] = useState(null)

  // El filtro arranca con todo el ciclo lectivo vigente.
  useEffect(() => {
    cobranza.cicloVigente()
      .then((ciclo) => {
        if (!ciclo) throw new Error('sin ciclo')
        const minimo = inicioDeMes(ciclo.fecha_inicio)
        const maximo = inicioDeMes(ciclo.fecha_fin)
        setRango({ minimo, maximo, desde: minimo, hasta: maximo })
      })
      .catch(err => setErrorDeCiclo(mensajeDeError(err, 'No hay un ciclo lectivo vigente.')))
  }, [])

  const cargarHistorial = useCallback(
    () => (rango ? cobranza.historial(id, rango.desde, rango.hasta) : Promise.resolve(null)),
    [id, rango],
  )
  const { datos, cargando, error, recargar } = useCarga(cargarHistorial)

  /** Corre "desde" o "hasta" un mes, sin salirse del ciclo ni cruzarse entre sí. */
  function mover(extremo, cantidad) {
    setRango(actual => ({ ...actual, [extremo]: sumarMeses(actual[extremo], cantidad) }))
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: nombre ? `Historial de ${nombre}` : 'Historial' }} />

      <Carga cargando={(cargando || !rango) && !datos && !errorDeCiclo} error={errorDeCiclo ?? error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          {rango && (
            <View style={estilos.tarjeta}>
              <SelectorDeMes
                etiqueta="Desde"
                valor={rango.desde}
                puedeRetroceder={rango.desde > rango.minimo}
                puedeAvanzar={rango.desde < rango.hasta}
                alMover={cantidad => mover('desde', cantidad)}
              />
              <SelectorDeMes
                etiqueta="Hasta"
                valor={rango.hasta}
                puedeRetroceder={rango.hasta > rango.desde}
                puedeAvanzar={rango.hasta < rango.maximo}
                alMover={cantidad => mover('hasta', cantidad)}
              />
            </View>
          )}

          {datos && (
            <>
              <Text style={estilos.seccion}>Facturas del período</Text>
              {datos.facturas.length === 0 && <Aviso texto="No hay facturas en el período elegido." />}
              {datos.facturas.map(factura => (
                <View key={factura.id} style={estilos.tarjeta}>
                  <Pressable onPress={() => router.push(`/factura/${factura.id}`)} accessibilityRole="button">
                    <View style={estilos.fila}>
                      <Text style={estilos.titulo}>{periodo(factura.periodo)}</Text>
                      <Text style={estilos.importeFuerte}>{pesos(factura.total)}</Text>
                    </View>
                    <View style={estilos.filaInsignias}>
                      <Text style={estilos.detalle}>Factura N.º {factura.numero}</Text>
                      <Insignia texto={estadoDe(factura.estado).etiqueta} color={estadoDe(factura.estado).color} />
                      {factura.vencida && <Insignia texto="Vencida" color="rojo" />}
                    </View>
                  </Pressable>

                  {factura.comprobantes.length === 0 ? (
                    <Text style={estilos.detalle}>Sin comprobantes.</Text>
                  ) : (
                    factura.comprobantes.map((comprobante) => {
                      const estado = estadoDeComprobante(comprobante.estado)
                      return (
                        <Pressable
                          key={comprobante.id}
                          style={estilos.comprobante}
                          onPress={() => router.push(`/comprobante/${comprobante.id}`)}
                          accessibilityRole="button"
                        >
                          <View style={estilos.fila}>
                            <Text style={estilos.concepto}>
                              Comprobante N.º {comprobante.numero} · {fechaDeMomento(comprobante.created_at)}
                            </Text>
                            <Text style={estilos.importe}>{pesos(comprobante.importe)}</Text>
                          </View>
                          <Insignia texto={estado.etiqueta} color={estado.color} />
                        </Pressable>
                      )
                    })
                  )}
                </View>
              ))}

              <Text style={estilos.seccion}>Deuda por ítem</Text>
              {datos.deuda.length === 0 ? (
                <Aviso texto="No hay deuda en el período elegido." />
              ) : (
                <View style={estilos.tarjeta}>
                  {datos.deuda.map(item => (
                    <View key={item.id} style={estilos.fila}>
                      <View style={estilos.columna}>
                        <Text style={estilos.concepto}>{item.descripcion}</Text>
                        <Text style={estilos.detalle}>
                          {periodo(item.periodo)}{item.enProceso ? ' · falta informar la transferencia' : ''}
                        </Text>
                      </View>
                      <Text style={estilos.importe}>{pesos(item.importe)}</Text>
                    </View>
                  ))}
                  <View style={[estilos.fila, estilos.total]}>
                    <Text style={estilos.titulo}>Total adeudado</Text>
                    <Text style={estilos.totalImporte}>{pesos(datos.totalAdeudado)}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Carga>
    </View>
  )
}

/** Un mes con flechas para retroceder y avanzar: "Desde  ‹  Marzo 2027  ›". */
function SelectorDeMes({ etiqueta, valor, puedeRetroceder, puedeAvanzar, alMover }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.detalle}>{etiqueta}</Text>
      <View style={estilos.selector}>
        <Flecha simbolo="‹" descripcion={`${etiqueta}: mes anterior`} activa={puedeRetroceder} alTocar={() => alMover(-1)} />
        <Text style={estilos.mes}>{periodo(valor)}</Text>
        <Flecha simbolo="›" descripcion={`${etiqueta}: mes siguiente`} activa={puedeAvanzar} alTocar={() => alMover(1)} />
      </View>
    </View>
  )
}

function Flecha({ simbolo, descripcion, activa, alTocar }) {
  return (
    <Pressable
      style={[estilos.flecha, !activa && estilos.flechaInactiva]}
      onPress={alTocar}
      disabled={!activa}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={descripcion}
    >
      <Text style={estilos.flechaTexto}>{simbolo}</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  pantalla:       { flex: 1 },
  contenido:      { padding: 16, gap: 10 },
  seccion:        {
    fontSize: 13, fontWeight: '700', color: colores.suave, letterSpacing: 0.8,
    textTransform: 'uppercase', marginTop: 8,
  },
  tarjeta:        {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    padding: 16, gap: 10,
  },
  fila:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  filaInsignias:  { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 4 },
  columna:        { flex: 1, gap: 2 },
  titulo:         { fontSize: 17, fontWeight: '700', color: colores.texto, flexShrink: 1 },
  detalle:        { fontSize: 14, color: colores.suave },
  concepto:       { fontSize: 15, color: colores.texto, flexShrink: 1 },
  importe:        { fontSize: 15, color: colores.texto, fontVariant: ['tabular-nums'] },
  importeFuerte:  { fontSize: 17, fontWeight: '700', color: colores.texto, fontVariant: ['tabular-nums'] },
  comprobante:    { borderTopColor: colores.borde, borderTopWidth: 1, paddingTop: 10, gap: 6 },
  total:          { borderTopColor: colores.borde, borderTopWidth: 1, paddingTop: 10 },
  totalImporte:   { fontSize: 17, fontWeight: '800', color: colores.azul, fontVariant: ['tabular-nums'] },
  selector:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mes:            { fontSize: 16, fontWeight: '600', color: colores.texto, minWidth: 130, textAlign: 'center' },
  flecha:         {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colores.azul,
    alignItems: 'center', justifyContent: 'center',
  },
  flechaInactiva: { opacity: 0.3 },
  flechaTexto:    { fontSize: 22, fontWeight: '700', color: colores.azul, lineHeight: 24 },
})
