/**
 * @file Spinner.jsx
 * @description Spinner de carga circular. Usar para acciones puntuales (submit, fetch).
 * Para listas de cards preferir Skeleton en su lugar.
 *
 * @param {'sm'|'md'|'lg'} size
 * @param {'blue'|'orange'|'white'} color
 */

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

const COLORS = {
  blue:   'border-brand-azul',
  orange: 'border-brand-naranja',
  white:  'border-white',
}

export function Spinner({ size = 'md', color = 'blue', className = '' }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={[
        'animate-spin rounded-full border-transparent',
        SIZES[size] ?? SIZES.md,
        COLORS[color] ?? COLORS.blue,
        className,
      ].join(' ')}
      style={{ borderTopColor: 'currentColor' }}
    />
  )
}
