/**
 * @file DataTable.jsx
 * @description Tabla de datos reutilizable para todas las pantallas del admin.
 * Soporta columnas con render custom, skeleton de carga y estado vacío.
 *
 * @param {Array<{key:string, label:string, render?:(row)=>ReactNode, className?:string}>} columns
 * @param {Array<object>} data
 * @param {boolean} loading
 * @param {string} emptyMessage
 * @param {(row:object)=>void} [onRowClick]
 */

import { SkeletonTable } from '@/components/ui/Skeleton'

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No hay datos para mostrar.',
  onRowClick,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-4">
                  <SkeletonTable rows={5} cols={columns.length} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-400">
                  <span className="text-3xl block mb-2">📭</span>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-5 py-3.5 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
