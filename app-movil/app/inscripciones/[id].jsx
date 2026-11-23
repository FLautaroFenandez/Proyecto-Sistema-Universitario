/**
 * @file inscripciones/[id].jsx
 * @description Pantalla 8 — Inscripciones de un hijo. La ruta es /inscripciones/<id del alumno>.
 *
 * Regla del enunciado: "los padres pueden acceder a… inscripción a deportes, servicio de
 * transporte y comedor" de cada hijo. Muestra a qué está inscripto, desde cuándo, el
 * precio vigente y, en los deportes, el grupo (días, horario y profesor responsable).
 *
 * Versión 1.1 (HU-M5): desde acá se inscribe a un servicio nuevo y se da de baja uno.
 *
 * Un padre ve solo las inscripciones de sus hijos: lo garantiza el RLS de la base.
 */

import { useCallback } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Boton } from '../../src/components/Boton'
import { Aviso, Carga } from '../../src/components/Carga'
import { Insignia } from '../../src/components/Insignia'
import {
  MAXIMO_DEPORTES, admiteBaja, horarioDeGrupo, situacionDeInscripcion,
} from '../../src/domain/situacionInscripcion'
import { useCarga } from '../../src/hooks/useCarga'
import { cobranza } from '../../src/services/cobranza'
import { colores } from '../../src/tema'
import { fecha, hoyIso, pesos } from '../../src/utils/formato'

/** Los tres servicios, en el orden en que se muestran, y qué decir si no hay ninguno. */
const SERVICIOS = [
  { tipo: 'deporte',    titulo: 'Deportes',   vacio: 'No está inscripto a ningún deporte.' },
  { tipo: 'transporte', titulo: 'Transporte', vacio: 'No usa el servicio de transporte.' },
  { tipo: 'comedor',    titulo: 'Comedor',    vacio: 'No está inscripto al comedor.' },
]

export default function InscripcionesDelHijo() {
  const { id, nombre } = useLocalSearchParams()
  const router = useRouter()

  const cargarInscripciones = useCallback(() => cobranza.inscripcionesDe(id), [id])
  const { datos, cargando, error, recargar } = useCarga(cargarInscripciones)

  const hoy = hoyIso()
  const inscripciones = (datos ?? []).map(i => ({ ...i, situacion: situacionDeInscripcion(i, hoy) }))

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: nombre ? `Inscripciones de ${nombre}` : 'Inscripciones' }} />

      <Carga cargando={cargando && !datos} error={error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          <Boton
            texto="Inscribir a un servicio"
            alTocar={() => router.push({ pathname: '/inscribir/[id]', params: { id, nombre } })}
          />

          {SERVICIOS.map(servicio => {
            const delServicio = inscripciones.filter(i => i.tipo === servicio.tipo)
            return (
              <View key={servicio.tipo} style={estilos.grupo}>
                <Text style={estilos.seccion}>{tituloDe(servicio, delServicio)}</Text>
                {delServicio.length === 0 && <Aviso texto={servicio.vacio} />}
                {delServicio.map(inscripcion => (
                  <TarjetaInscripcion
                    key={inscripcion.id}
                    inscripcion={inscripcion}
                    alDarDeBaja={() => router.push({ pathname: '/baja/[id]', params: { id: inscripcion.id, nombre } })}
                  />
                ))}
              </View>
            )
          })}

          <Text style={estilos.nota}>
            El importe es el precio vigente por mes; cada factura conserva el precio con el que se emitió.
            Las altas y las bajas rigen desde el primer mes todavía sin facturar.
          </Text>
        </ScrollView>
      </Carga>
    </View>
  )
}

/** En deportes se muestra cuántos lugares ocupa sobre el máximo: "Deportes · 2 de 2". */
function tituloDe(servicio, inscripciones) {
  if (servicio.tipo !== 'deporte') return servicio.titulo
  const ocupados = inscripciones.filter(i => i.situacion.ocupaLugar).length
  return `${servicio.titulo} · ${ocupados} de ${MAXIMO_DEPORTES}`
}

/** Una inscripción: servicio, precio por mes, grupo, período, situación y la baja. */
function TarjetaInscripcion({ inscripcion, alDarDeBaja }) {
  const { situacion, grupo } = inscripcion
  const periodo = inscripcion.hasta
    ? `Del ${fecha(inscripcion.desde)} al ${fecha(inscripcion.hasta)}`
    : `Desde el ${fecha(inscripcion.desde)}`
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.fila}>
        <Text style={estilos.servicio}>{inscripcion.nombre}</Text>
        <Text style={estilos.importe}>{pesos(inscripcion.importe)}</Text>
      </View>
      {grupo && <Text style={estilos.horario}>{horarioDeGrupo(grupo)} · {grupo.profesor}</Text>}
      <Text style={estilos.detalle}>{periodo}</Text>
      <View style={estilos.pie}>
        <Insignia texto={situacion.etiqueta} color={situacion.color} />
        {admiteBaja(inscripcion) && (
          <Pressable onPress={alDarDeBaja} hitSlop={8} accessibilityRole="button">
            <Text style={estilos.enlace}>Dar de baja</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  pantalla:  { flex: 1 },
  contenido: { padding: 16, gap: 16 },
  grupo:     { gap: 10 },
  seccion:   {
    fontSize: 13, fontWeight: '700', color: colores.suave, letterSpacing: 0.8, textTransform: 'uppercase',
  },
  tarjeta:   {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    padding: 16, gap: 6,
  },
  fila:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  servicio:  { fontSize: 17, fontWeight: '700', color: colores.texto, flexShrink: 1 },
  importe:   { fontSize: 17, fontWeight: '700', color: colores.texto, fontVariant: ['tabular-nums'] },
  detalle:   { fontSize: 14, color: colores.suave },
  horario:   { fontSize: 14, color: colores.texto },
  pie:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  enlace:    { fontSize: 14, fontWeight: '600', color: colores.rojo },
  nota:      { fontSize: 14, color: colores.suave, marginTop: 4 },
})
