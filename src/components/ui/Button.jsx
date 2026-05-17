/**
 * @file Button.jsx
 * @description Botón reutilizable con variantes de estilo y tamaño.
 * Soporta estado de carga con spinner y deshabilitar.
 *
 * @param {'primary'|'secondary'|'outline'|'outline-naranja'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - Muestra spinner y deshabilita el botón
 * @param {boolean} fullWidth - Si true, ocupa todo el ancho
 */

import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:           'bg-brand-naranja text-white hover:bg-orange-700 active:scale-[0.98]',
  secondary:         'bg-brand-azul text-white hover:bg-brand-azul-dark active:scale-[0.98]',
  outline:           'border border-brand-azul text-brand-azul hover:bg-blue-50 bg-transparent',
  'outline-naranja': 'border border-brand-naranja text-brand-naranja hover:bg-orange-50 bg-transparent',
  ghost:             'text-gray-600 hover:bg-gray-100 bg-transparent',
  danger:            'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
}

const SIZES = {
  sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-4 py-2 rounded-lg gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 12 : 16} className="animate-spin flex-shrink-0" />}
      {children}
    </button>
  )
}
