/**
 * @file Card.jsx
 * @description Card contenedor con variantes de elevación y borde.
 *
 * @param {'flat'|'elevated'|'bordered'} variant
 */

const VARIANTS = {
  flat:     'bg-white',
  bordered: 'bg-white border border-gray-200 rounded-2xl',
  elevated: 'bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300',
}

export function Card({
  children,
  variant = 'bordered',
  className = '',
  ...props
}) {
  return (
    <div
      className={[VARIANTS[variant] ?? VARIANTS.bordered, className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
