/**
 * @file CampoFormulario.jsx
 * @description Campos de formulario del panel de administración.
 *
 * Los estilos de los inputs estaban repetidos en cada página del admin, con
 * pequeñas diferencias entre una y otra. Acá quedan una sola vez, así todos los
 * formularios del Sistema de Gestión se ven y se comportan igual.
 */

import { ChevronDown } from 'lucide-react'

const ESTILO_CONTROL =
  'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none ' +
  'focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ' +
  'disabled:bg-gray-50 disabled:text-gray-400'

/**
 * Etiqueta + control + ayuda o error.
 *
 * @param {string} etiqueta
 * @param {string} [htmlFor] - id del control que envuelve
 * @param {string} [ayuda] - texto auxiliar debajo del campo
 * @param {string} [error] - si viene, reemplaza a la ayuda y se muestra en rojo
 * @param {boolean} [requerido]
 */
export function Campo({ etiqueta, htmlFor, ayuda, error, requerido = false, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {etiqueta}
        {requerido && <span className="text-brand-naranja ml-0.5">*</span>}
      </label>
      {children}
      {(error || ayuda) && (
        <p className={`text-xs ${error ? 'text-red-600' : 'text-gray-400'}`}>{error || ayuda}</p>
      )}
    </div>
  )
}

export function Entrada({ className = '', ...props }) {
  return <input className={`${ESTILO_CONTROL} ${className}`} {...props} />
}

export function Seleccion({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select className={`${ESTILO_CONTROL} appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  )
}
