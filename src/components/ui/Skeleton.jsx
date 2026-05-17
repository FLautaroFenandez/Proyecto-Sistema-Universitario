/**
 * @file Skeleton.jsx
 * @description Placeholders de carga con animación pulse. Reemplaza spinners en listas de cards.
 */

/** Skeleton de card completa: imagen arriba + líneas de texto abajo */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

/** Línea de texto skeleton */
export function SkeletonLine({ width = 'full' }) {
  const widthMap = { full: 'w-full', '3/4': 'w-3/4', '1/2': 'w-1/2', '1/3': 'w-1/3' }
  return (
    <div className={`h-4 bg-gray-200 rounded animate-pulse ${widthMap[width] ?? 'w-full'}`} />
  )
}

/** Avatar circular skeleton */
export function SkeletonAvatar({ size = 10 }) {
  return (
    <div
      className="rounded-full bg-gray-200 animate-pulse flex-shrink-0"
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    />
  )
}

/** Tabla skeleton con filas y columnas */
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}
