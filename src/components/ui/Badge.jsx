/**
 * @file Badge.jsx
 * @description Badge/etiqueta de estado o categoría. Pill redondeado con color semántico.
 *
 * @param {'blue'|'orange'|'green'|'red'|'gray'|'purple'} color
 */

const COLORS = {
  blue:   'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
}

export function Badge({
  children,
  color = 'gray',
  className = '',
  ...props
}) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium',
        COLORS[color] ?? COLORS.gray,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
