/**
 * @file avisos.jsx
 * @description Pantalla 11 — Avisos de cobranza (versión 1.1).
 *
 * Requerimientos del enunciado:
 *  - "Enviar el último día hábil del mes un recordatorio del total que cada padre debe
 *    abonar, detallando la composición de ese valor. Adjuntar la factura."
 *  - "Enviar el día 20 de cada mes a cada padre la deuda, en caso de no haber realizado el
 *    pago completo."
 *
 * La base arma cada aviso (vista `avisos_cobranza`): fecha, importe y detalle por ítem. La
 * app los muestra por hijo, y cada uno abre su factura. El envío por correo puede leer la
 * misma vista sin cambiar nada de esto.
 */

import { useCallback } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Aviso, Carga } from '../src/components/Carga'
import { Insignia } from '../src/components/Insignia'
import { useSesion } from '../src/context/sesion'
import { TIPOS_DE_AVISO, avisosPorHijo, momentoDelAviso } from '../src/domain/avisos'
import { useCarga } from '../src/hooks/useCarga'
import { cobranza } from '../src/services/cobranza'
import { colores } from '../src/tema'
import { fecha, hoyIso, periodo, pesos } from '../src/utils/formato'

export default function Avisos() {
  const { usuario } = useSesion()
  const router = useRouter()

  const cargarAvisos = useCallback(async () => {
    const hijos = await cobranza.misHijos(usuario?.id)
    const avisos = await cobranza.avisos(hijos.map(h => h.id))
    return avisosPorHijo(hijos, avisos)
  }, [usuario?.id])
  const { datos, cargando, error, recargar } = useCarga(cargarAvisos)
  const hoy = hoyIso()

  return (
    <View style={estilos.pantalla}>
      <Carga cargando={cargando && !datos} error={error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          <View style={estilos.explicacion}>
            {Object.values(TIPOS_DE_AVISO).map(t => (
              <View key={t.titulo} style={estilos.filaExplicacion}>
                <Insignia texto={t.titulo} color={t.color} />
                <Text style={estilos.detalle}>{t.explicacion}</Text>
              </View>
            ))}
          </View>

          {(datos ?? []).length === 0 && <Aviso texto="No tenés alumnos asociados a tu cuenta." />}

          {(datos ?? []).map(({ hijo, avisos }) => (
            <View key={hijo.id} style={estilos.grupo}>
              <Text style={estilos.hijo}>{hijo.nombre} {hijo.apellido}</Text>
              {avisos.length === 0 && <Aviso texto="Todavía no hay facturas, así que no hay avisos." />}
              {avisos.map(aviso => (
                <TarjetaAviso
                  key={`${aviso.tipo}-${aviso.factura_id}`}
                  aviso={aviso}
                  hoy={hoy}
                  alAbrir={() => router.push(`/factura/${aviso.factura_id}`)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </Carga>
    </View>
  )
}

/** Un aviso: tipo, fecha, importe y cada ítem que lo compone. Abre la factura. */
function TarjetaAviso({ aviso, hoy, alAbrir }) {
  const tipo = TIPOS_DE_AVISO[aviso.tipo]
  const momento = momentoDelAviso(aviso.fecha_envio, hoy)
  const esDeuda = aviso.tipo === 'deuda'
  return (
    <Pressable style={estilos.tarjeta} onPress={alAbrir} accessibilityRole="button">
      <View style={estilos.insignias}>
        <Insignia texto={tipo?.titulo ?? aviso.tipo} color={tipo?.color} />
        <Insignia texto={`${momento.etiqueta} · ${fecha(aviso.fecha_envio)}`} color="gris" />
      </View>
      <View style={estilos.fila}>
        <View style={estilos.columna}>
          <Text style={estilos.titulo}>{periodo(aviso.periodo)}</Text>
          <Text style={estilos.detalle}>
            Factura N.º {aviso.numero} · {esDeuda ? 'deuda pendiente' : `vence el ${fecha(aviso.vencimiento)}`}
          </Text>
        </View>
        <Text style={[estilos.total, esDeuda && estilos.totalDeuda]}>{pesos(aviso.importe)}</Text>
      </View>
      {(aviso.detalle ?? []).map((item, indice) => (
        <View key={`${item.descripcion}-${indice}`} style={estilos.fila}>
          <Text style={estilos.concepto}>{item.descripcion}</Text>
          <Text style={estilos.importe}>{pesos(item.importe)}</Text>
        </View>
      ))}
      <Text style={estilos.enlace}>Ver factura ›</Text>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  pantalla:        { flex: 1 },
  contenido:       { padding: 16, gap: 12 },
  explicacion:     { gap: 8 },
  filaExplicacion: { gap: 4 },
  grupo:           { gap: 10, marginTop: 8 },
  hijo:            { fontSize: 18, fontWeight: '700', color: colores.texto },
  tarjeta:         {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10, padding: 16, gap: 8,
  },
  insignias:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fila:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  columna:         { flex: 1, gap: 2 },
  titulo:          { fontSize: 17, fontWeight: '700', color: colores.texto },
  total:           { fontSize: 18, fontWeight: '800', color: colores.azul, fontVariant: ['tabular-nums'] },
  totalDeuda:      { color: colores.rojo },
  concepto:        { fontSize: 15, color: colores.texto, flexShrink: 1 },
  importe:         { fontSize: 15, color: colores.texto, fontVariant: ['tabular-nums'] },
  detalle:         { fontSize: 14, color: colores.suave },
  enlace:          { fontSize: 14, fontWeight: '600', color: colores.azul, marginTop: 4 },
})
