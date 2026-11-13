/**
 * @file useCarga.js
 * @description Carga datos para una pantalla y lleva la cuenta de los tres momentos
 * posibles: cargando, con error o con datos. Evita repetir esa lógica en cada pantalla.
 *
 * Vuelve a cargar cada vez que la pantalla recupera el foco: si el padre paga una
 * cuota y vuelve atrás, la lista ya muestra el estado nuevo.
 */

import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { mensajeDeError } from '../services/base'

/**
 * @param {() => Promise<any>} cargar - Función que trae los datos. Tiene que venir de
 *   `useCallback`, para que solo cambie cuando cambian sus datos de entrada.
 * @returns {{datos: any, cargando: boolean, error: string | null, recargar: () => Promise<void>}}
 */
export function useCarga(cargar) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null })

  const recargar = useCallback(async () => {
    setEstado(anterior => ({ ...anterior, cargando: true, error: null }))
    try {
      setEstado({ datos: await cargar(), cargando: false, error: null })
    } catch (err) {
      setEstado({ datos: null, cargando: false, error: mensajeDeError(err) })
    }
  }, [cargar])

  useFocusEffect(useCallback(() => { recargar() }, [recargar]))

  return { ...estado, recargar }
}
