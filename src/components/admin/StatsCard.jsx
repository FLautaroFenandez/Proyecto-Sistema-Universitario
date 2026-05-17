/**
 * @file StatsCard.jsx
 * @description Card de métrica para el panel de administración.
 * Muestra un ícono, un número grande y un label. Clickeable para navegar.
 *
 * @param {string} titulo
 * @param {number|string} valor
 * @param {React.ElementType} icono - Componente de ícono de Lucide
 * @param {'blue'|'orange'|'green'|'red'|'purple'} color
 * @param {string} [linkTo] - Ruta de "Ver más"
 * @param {boolean} cargando
 */

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  badge: 'bg-green-100 text-green-700' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    badge: 'bg-red-100 text-red-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
}

export function StatsCard({ titulo, valor, icono: Icon, color = 'blue', linkTo, cargando = false }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue

  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {linkTo && (
          <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-azul transition-colors mt-1" />
        )}
      </div>
      {cargando
        ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
        : <p className="font-display font-bold text-gray-800 text-3xl">{valor}</p>
      }
      <p className="text-gray-400 text-xs mt-1 leading-tight">{titulo}</p>
    </div>
  )

  return linkTo
    ? <Link to={linkTo}>{inner}</Link>
    : inner
}
