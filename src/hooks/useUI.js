/**
 * @file useUI.js
 * @description Hooks de interacción con el navegador, extraídos de Navbar y Modal.
 *
 * Estos efectos estaban escritos directamente dentro de los componentes, y dos de
 * ellos —el cierre con Escape y el bloqueo del scroll del body— aparecían duplicados
 * en Navbar.jsx y Modal.jsx. Al vivir acá, cada uno tiene una única responsabilidad,
 * se prueba por separado y una corrección se aplica en un solo lugar.
 */

import { useState, useEffect } from 'react'

/**
 * Indica si la página se desplazó más allá de un umbral.
 * Se usa para aplicar sombra a la barra de navegación al hacer scroll.
 *
 * @param {number} umbral - Píxeles de desplazamiento a partir de los cuales devuelve true
 * @returns {boolean}
 */
export function useScrollPasado(umbral = 8) {
  const [pasado, setPasado] = useState(false)

  useEffect(() => {
    const alHacerScroll = () => setPasado(window.scrollY > umbral)
    alHacerScroll() // estado inicial correcto si la página ya viene desplazada
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    return () => window.removeEventListener('scroll', alHacerScroll)
  }, [umbral])

  return pasado
}

/**
 * Ejecuta una acción cuando se presiona Escape, solo mientras esté activo.
 *
 * @param {boolean} activo - Si false, no registra el listener
 * @param {Function} alPresionar - Qué hacer al presionar Escape
 */
export function useTeclaEscape(activo, alPresionar) {
  useEffect(() => {
    if (!activo) return
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') alPresionar?.()
    }
    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [activo, alPresionar])
}

/**
 * Impide el scroll de la página mientras haya una capa superpuesta abierta
 * (menú mobile a pantalla completa, modal). Restaura el scroll al desmontar.
 *
 * @param {boolean} bloqueado
 */
export function useBloqueoDeScroll(bloqueado) {
  useEffect(() => {
    document.body.style.overflow = bloqueado ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [bloqueado])
}

/**
 * Ejecuta una acción cuando se hace click fuera del elemento referenciado.
 * Se usa para cerrar menús desplegables.
 *
 * @param {import('react').RefObject} referencia - Ref del elemento a vigilar
 * @param {Function} alClickAfuera
 */
export function useClickAfuera(referencia, alClickAfuera) {
  useEffect(() => {
    const alPresionarMouse = (evento) => {
      if (referencia.current && !referencia.current.contains(evento.target)) {
        alClickAfuera?.()
      }
    }
    document.addEventListener('mousedown', alPresionarMouse)
    return () => document.removeEventListener('mousedown', alPresionarMouse)
  }, [referencia, alClickAfuera])
}
