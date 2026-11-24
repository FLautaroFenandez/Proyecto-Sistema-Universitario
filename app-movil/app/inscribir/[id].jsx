/**
 * @file inscribir/[id].jsx
 * @description Pantalla 9 — Inscribir a un hijo a un servicio (versión 1.1 · HU-M5 · REQ-29).
 * La ruta es /inscribir/<id del alumno>.
 *
 * Reglas del enunciado:
 *  - "Cada alumno puede inscribirse a dos deportes simultáneamente, al servicio de
 *    transporte por recorrido y al servicio de comedor."
 *  - "Un deporte puede tener diferentes grupos según nivel y horario", con un profesor
 *    responsable: se ofrecen los grupos del nivel del alumno.
 *  - "El sistema deberá controlar que no existan conflictos de horarios."
 *
 * Seguridad en dos capas: la pantalla avisa antes (dos deportes, horario superpuesto) y
 * la base decide al inscribir. Si la base rechaza, se muestra su motivo.
 *
 * Cada tipo de servicio lleva su ícono, y lo elegido se marca con su color (los mismos de
 * la web): todo lo de un deporte se ve en verde, el transporte en violeta y el comedor en
 * naranja.
 */

import { useCallback, useState } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Boton } from '../../src/components/Boton'
import { Aviso, Carga } from '../../src/components/Carga'
import { IconoServicio } from '../../src/components/IconoServicio'
import { SelectorDeMes } from '../../src/components/SelectorDeMes'
import {
  MAXIMO_DEPORTES, gruposSeSuperponen, horarioDeGrupo, sigueActivaDesde,
} from '../../src/domain/situacionInscripcion'
import { useCarga } from '../../src/hooks/useCarga'
import { mensajeDeError } from '../../src/services/base'
import { cobranza } from '../../src/services/cobranza'
import { colores, estiloDeServicio, servicios as ESTILOS } from '../../src/tema'
import { periodo, pesos } from '../../src/utils/formato'

const TIPOS = ['deporte', 'transporte', 'comedor']

export default function Inscribir() {
  const { id, nombre } = useLocalSearchParams()
  const router = useRouter()

  const cargarOpciones = useCallback(async () => {
    const [opciones, meses, actuales] = await Promise.all([
      cobranza.serviciosParaInscribir(id),
      cobranza.mesesParaCambiar(id),
      cobranza.inscripcionesDe(id),
    ])
    return { ...opciones, meses, actuales }
  }, [id])
  const { datos, cargando, error, recargar } = useCarga(cargarOpciones)

  const [tipo, setTipo] = useState('deporte')
  const [servicioId, setServicioId] = useState(null)
  const [grupoId, setGrupoId] = useState(null)
  const [indiceMes, setIndiceMes] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [errorAlta, setErrorAlta] = useState(null)

  const color = estiloDeServicio(tipo).borde
  const servicios = (datos?.servicios ?? []).filter(s => s.tipo === tipo)
  const servicio = servicios.find(s => s.id === servicioId) ?? null
  const grupo = servicio?.grupos.find(g => g.id === grupoId) ?? null
  const meses = datos?.meses ?? []
  const mes = meses[Math.min(indiceMes, meses.length - 1)]

  // Deportes que siguen activos desde el mes elegido: sirven para avisar antes. Se compara
  // con ese mes y no con hoy, como la base: uno que termina antes ya no ocupa lugar.
  const deportesActuales = (datos?.actuales ?? [])
    .filter(i => i.tipo === 'deporte' && mes && sigueActivaDesde(i, mes))
  const completo = tipo === 'deporte' && deportesActuales.length >= MAXIMO_DEPORTES
  const choque = grupo ? deportesActuales.find(i => gruposSeSuperponen(i.grupo, grupo)) : null
  const listo = servicio && mes && (tipo !== 'deporte' || grupo)

  function elegirTipo(clave) {
    setTipo(clave)
    setServicioId(null)
    setGrupoId(null)
    setErrorAlta(null)
  }

  function elegirServicio(clave) {
    setServicioId(clave)
    setGrupoId(null)
    setErrorAlta(null)
  }

  function confirmar() {
    const detalleGrupo = grupo ? ` (${horarioDeGrupo(grupo)})` : ''
    Alert.alert(
      'Confirmar inscripción',
      `Vas a inscribir a ${nombre ?? 'tu hijo'} en ${servicio.nombre}${detalleGrupo} desde ${periodo(mes)}. ` +
      `Se suman ${pesos(servicio.importe)} por mes a cada factura desde ese mes.`,
      [{ text: 'Cancelar', style: 'cancel' }, { text: 'Inscribir', onPress: inscribir }],
    )
  }

  async function inscribir() {
    setEnviando(true)
    setErrorAlta(null)
    try {
      await cobranza.inscribir({ alumnoId: id, conceptoId: servicio.id, grupoId: grupo?.id, desde: mes })
      Alert.alert('Inscripción registrada', `${servicio.nombre} desde ${periodo(mes)}.`, [
        { text: 'Aceptar', onPress: () => router.back() },
      ])
    } catch (err) {
      // El motivo lo redacta la base: dos deportes, horario superpuesto, ya inscripto…
      setErrorAlta(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: nombre ? `Inscribir a ${nombre}` : 'Inscribir' }} />

      <Carga cargando={cargando && !datos} error={error} alReintentar={recargar}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        >
          <Text style={estilos.seccion}>1. Tipo de servicio</Text>
          <View style={estilos.chips}>
            {TIPOS.map(clave => (
              <Opcion key={clave} activa={tipo === clave} color={ESTILOS[clave].borde} alTocar={() => elegirTipo(clave)}>
                <View style={estilos.chip}>
                  <IconoServicio tipo={clave} medida={16} />
                  <Text style={[estilos.chipTexto, tipo === clave && { color: ESTILOS[clave].texto }]}>
                    {ESTILOS[clave].etiqueta}
                  </Text>
                </View>
              </Opcion>
            ))}
          </View>
          {completo && (
            <Text style={estilos.advertencia}>
              Ya tiene {MAXIMO_DEPORTES} deportes: el máximo al mismo tiempo. Para sumar otro, primero dale de baja uno desde Inscripciones.
            </Text>
          )}

          <Text style={estilos.seccion}>2. Servicio</Text>
          {servicios.map(s => {
            const sinGrupos = s.tipo === 'deporte' && s.grupos.length === 0
            return (
              <Opcion key={s.id} activa={servicioId === s.id} color={color} alTocar={() => elegirServicio(s.id)} inactiva={sinGrupos}>
                <View style={estilos.fila}>
                  <Text style={estilos.nombre}>{s.nombre}</Text>
                  <Text style={estilos.importe}>{pesos(s.importe)}</Text>
                </View>
                {sinGrupos && <Text style={estilos.detalle}>Sin grupos para el nivel {datos?.nivel}</Text>}
              </Opcion>
            )
          })}

          {tipo === 'deporte' && servicio && (
            <>
              <Text style={estilos.seccion}>3. Grupo · nivel {datos?.nivel}</Text>
              {servicio.grupos.map(g => (
                <Opcion key={g.id} activa={grupoId === g.id} color={color} alTocar={() => { setGrupoId(g.id); setErrorAlta(null) }}>
                  <Text style={estilos.nombre}>{horarioDeGrupo(g)}</Text>
                  <Text style={estilos.detalle}>{g.profesor}</Text>
                </Opcion>
              ))}
              {choque && (
                <Text style={estilos.advertencia}>
                  Se superpone con {choque.nombre} ({horarioDeGrupo(choque.grupo)}). Elegí otro grupo u otro deporte.
                </Text>
              )}
            </>
          )}

          <Text style={estilos.seccion}>{tipo === 'deporte' ? '4.' : '3.'} Desde qué mes</Text>
          {meses.length === 0 ? (
            <Aviso texto="No quedan meses disponibles en el ciclo lectivo." />
          ) : (
            <View style={estilos.tarjeta}>
              <SelectorDeMes
                etiqueta="Desde"
                valor={mes}
                puedeRetroceder={indiceMes > 0}
                puedeAvanzar={indiceMes < meses.length - 1}
                alMover={cantidad => setIndiceMes(actual => actual + cantidad)}
              />
              <Text style={estilos.detalle}>
                Los meses anteriores ya están facturados: el servicio se suma desde el primer mes sin facturar.
              </Text>
            </View>
          )}

          {errorAlta && <Text style={estilos.error} accessibilityRole="alert">{errorAlta}</Text>}

          <Boton texto="Inscribir" alTocar={confirmar} ocupado={enviando} inactivo={!listo} />
        </ScrollView>
      </Carga>
    </View>
  )
}

/** Una opción elegible: queda marcada con un borde del color del servicio. */
function Opcion({ activa, inactiva = false, color = colores.azul, alTocar, children }) {
  return (
    <Pressable
      style={[estilos.opcion, activa && [estilos.opcionActiva, { borderColor: color }], inactiva && estilos.opcionInactiva]}
      onPress={alTocar}
      disabled={inactiva}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa, disabled: inactiva }}
    >
      {children}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  pantalla:        { flex: 1 },
  contenido:       { padding: 16, gap: 10 },
  seccion:         {
    fontSize: 13, fontWeight: '700', color: colores.suave, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 8,
  },
  chips:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipTexto:       { fontSize: 15, fontWeight: '600', color: colores.texto },
  opcion:          {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 14, gap: 4,
  },
  opcionActiva:    { borderWidth: 2 },
  opcionInactiva:  { opacity: 0.5 },
  tarjeta:         {
    backgroundColor: colores.tarjeta, borderColor: colores.borde, borderWidth: 1, borderRadius: 10, padding: 14, gap: 10,
  },
  fila:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  nombre:          { fontSize: 16, fontWeight: '600', color: colores.texto, flexShrink: 1 },
  importe:         { fontSize: 16, fontWeight: '700', color: colores.texto, fontVariant: ['tabular-nums'] },
  detalle:         { fontSize: 14, color: colores.suave },
  advertencia:     { fontSize: 14, color: colores.naranja },
  error:           { fontSize: 15, color: colores.rojo },
})
