/**
 * @file Topbar.jsx
 * @description Barra superior azul con accesos rápidos (teléfono, redes, ubicación).
 * Placeholder — se implementa completamente en Fase 2.
 */

export function Topbar() {
  return (
    <div className="bg-brand-azul text-white text-xs py-1.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <span>📞 (0362) 555-0100</span>
        <span className="hidden md:inline">📍 Resistencia, Chaco</span>
      </div>
    </div>
  )
}
