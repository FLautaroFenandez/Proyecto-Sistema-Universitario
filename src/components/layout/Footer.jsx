/**
 * @file Footer.jsx
 * @description Footer oscuro de 3 columnas con info institucional.
 * Placeholder — se implementa completamente en Fase 2.
 */

import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-brand-azul-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display font-bold text-lg mb-2">Educar para Transformar</h3>
          <p className="text-sm text-white/70">Centro Educativo — Resistencia, Chaco</p>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-3 text-white/50">Menú</h4>
          <ul className="space-y-1 text-sm text-white/70">
            <li><Link to="/quienes-somos" className="hover:text-white transition-colors">Quiénes somos</Link></li>
            <li><Link to="/noticias" className="hover:text-white transition-colors">Noticias</Link></li>
            <li><Link to="/inscripcion" className="hover:text-white transition-colors">Inscripción</Link></li>
            <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest mb-3 text-white/50">Contacto</h4>
          <p className="text-sm text-white/70">📞 (0362) 555-0100</p>
          <p className="text-sm text-white/70">✉️ info@educarparatransformar.edu.ar</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between text-xs text-white/40">
        <span>© 2026 Centro Educativo Educar para Transformar</span>
        <span>Grupo 8 · UTN FRRe TUP · Metodología de Sistemas I</span>
      </div>
    </footer>
  )
}
