/**
 * @file ScrollToTop.jsx
 * @description Componente que hace scroll al tope en cada cambio de ruta.
 * Se monta una sola vez dentro del Router en App.jsx.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
