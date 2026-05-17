/**
 * @file ErrorMessage.jsx
 * @description Componente de error amigable para reemplazar mensajes técnicos.
 * Muestra ícono de alerta, mensaje en español y botón "Intentar de nuevo" si hay onRetry.
 *
 * @param {string} message - Mensaje de error a mostrar
 * @param {Function} [onRetry] - Callback para reintentar la operación
 * @param {'sm'|'md'|'lg'} size - Tamaño del bloque de error
 */

import { AlertCircle, RefreshCw } from 'lucide-react'

export function ErrorMessage({ message, onRetry, size = 'md' }) {
  const padding = size === 'sm' ? 'py-6' : size === 'lg' ? 'py-16' : 'py-10'
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 36

  return (
    <div className={`flex flex-col items-center justify-center text-center ${padding} px-4`}>
      <AlertCircle size={iconSize} className="text-brand-naranja mb-3 opacity-80" />
      <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
        {message || 'Ocurrió un error inesperado. Intentá de nuevo.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-naranja border border-brand-naranja/30 hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}
