/**
 * @file baja/[id].jsx
 * @description Pantalla 10 — Dar de baja un servicio (versión 1.1 · HU-M5 · REQ-29).
 * La ruta es /baja/<id de la inscripción>.
 *
 * Regla del enunciado: "el servicio de transporte es opcional, por lo que puede variar de
 * un mes a otro". El padre elige desde qué mes deja de usarlo: ese mes y los siguientes ya
 * no se facturan. Los meses ya facturados no cambian. Si la inscripción todavía no había
 * empezado, la base la cancela.
 */

import { useCallback, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Boton } from '../../src/components/Boton'
import { Aviso, Carga } from '../../src/components/Carga'
import { SelectorDeMes } from '../../src/components/SelectorDeMes'
import { admiteBaja, horarioDeGrupo } from '../../src/domain/situacionInscripcion'
import { useCarga } from '../../src/hooks/useCarga'
import { mensajeDeError } from '../../src/services/base'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { fecha, periodo, pesos } from '../../src/utils/formato'

export default function DarDeBaja() {
  const { id, nombre } = useLocalSearchParams()
  const router = useRouter()

  const cargarInscripcion = useCallback(async () => {
    const inscripcion = await cobranza.inscripcion(id)
    if (!inscripcion) return { inscripcion: null, meses: [] }
    return { inscripcion, meses: await cobranza.mesesParaCambiar(inscripcion.alumnoId) }
  }, [id])
  const { datos, cargando, error, recargar } = useCarga(cargarInscripcion)

  const [indiceMes, setIndiceMes] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [errorBaja, setErrorBaja] = useState(null)

  const inscripcion = datos?.inscripcion
  const meses = datos?.meses ?? []
  const mes = meses[Math.min(indiceMes, meses.length - 1)]
  // Si la baja rige desde el mes en que empezaba (o antes), nunca llegó a facturarse.
  const seCancela = inscripcion && mes && mes <= inscripcion.desde

  function confirmar() {
    const texto = seCancela
      ? `La inscripción a ${inscripcion.nombre} todavía no empezó: se va a cancelar.`
      : `${inscripcion.nombre} deja de facturarse desde ${periodo(mes)}. Los meses anteriores no cambian.`
    Alert.alert('Confirmar baja', texto, [
      { text: 'Volver', style: 'cancel' },
      { text: 'Dar de baja', style: 'destructive', onPress: darDeBaja },
    ])
  }

  async function darDeBaja() {
    setEnviando(true)
    setErrorBaja(null)
    try {
      const resultado = await cobranza.darDeBaja(inscripcion.id, mes)
      const texto = resultado === 'cancelada'
        ? 'La inscripción se canceló.'
        : `Desde ${periodo(mes)} ya no se factura ${inscripcion.nombre}.`
      Alert.alert('Baja registrada', texto, [{ text: 'Aceptar', onPress: () => router.back() }])
    } catch (err) {
      setErrorBaja(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Dar de baja' }} />

      <Carga cargando={cargando && !datos} error={error} alReintentar={recargar}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          {!inscripcion && <Aviso texto="No se encontró la inscripción." />}

          {inscripcion && (
            <>
              <View style={estilos.tarjeta}>
                <View style={estilos.fila}>
                  <Text style={estilos.nombre}>{inscripcion.nombre}</Text>
                  <Text style={estilos.importe}>{pesos(inscripcion.importe)}</Text>
                </View>
                {nombre && <Text style={estilos.detalle}>{nombre}</Text>}
                {inscripcion.grupo && (
                  <Text style={estilos.detalle}>{horarioDeGrupo(inscripcion.grupo)} · {inscripcion.grupo.profesor}</Text>
                )}
                <Text style={estilos.detalle}>Desde el {fecha(inscripcion.desde)}</Text>
              </View>

              {!admiteBaja(inscripcion) && <Aviso texto="Esta inscripción ya tiene fecha de baja." />}

              {admiteBaja(inscripcion) && meses.length === 0 && (
                <Aviso texto="No quedan meses disponibles en el ciclo lectivo." />
              )}

              {admiteBaja(inscripcion) && meses.length > 0 && (
                <>
                  <View style={estilos.tarjeta}>
                    <SelectorDeMes
                      etiqueta="Deja de usarlo desde"
                      valor={mes}
                      puedeRetroceder={indiceMes > 0}
                      puedeAvanzar={indiceMes < meses.length - 1}
                      alMover={cantidad => setIndiceMes(actual => actual + cantidad)}
                    />
                    <Text style={estilos.detalle}>
                      {seCancela
                        ? 'La inscripción todavía no empezó: se cancela.'
                        : 'Ese mes y los siguientes ya no se facturan. Los meses ya facturados no cambian.'}
                    </Text>
                  </View>

                  {errorBaja && <Text style={estilos.error} accessibilityRole="alert">{errorBaja}</Text>}

                  <Boton texto="Dar de baja" alTocar={confirmar} ocupado={enviando} />
                </>
              )}
            </>
          )}
        </ScrollView>
      </Carga>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla:  { flex: 1 },
  contenido: { padding: 16, gap: 12 },
  tarjeta:   {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10, padding: 16, gap: 8,
  },
  fila:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  nombre:    { fontSize: 17, fontWeight: '700', color: colores.texto, flexShrink: 1 },
  importe:   { fontSize: 17, fontWeight: '700', color: colores.texto, fontVariant: ['tabular-nums'] },
  detalle:   { fontSize: 14, color: colores.suave },
  error:     { fontSize: 15, color: colores.rojo },
})
