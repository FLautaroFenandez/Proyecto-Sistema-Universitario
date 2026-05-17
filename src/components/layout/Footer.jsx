/**
 * @file Footer.jsx
 * @description Footer oscuro de 3 columnas: logo+descripción+redes, menú rápido, contacto.
 * Idéntico en estructura a uncaus.edu.ar pero con identidad de "Educar para Transformar".
 */

import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'

const MENU_LINKS = [
  { to: '/quienes-somos',      label: 'Quiénes somos' },
  { to: '/niveles-educativos', label: 'Niveles Educativos' },
  { to: '/bienestar',          label: 'Bienestar Estudiantil' },
  { to: '/noticias',           label: 'Noticias' },
  { to: '/galeria',            label: 'Galería' },
  { to: '/inscripcion',        label: 'Inscripción' },
  { to: '/empleo',             label: 'Empleo' },
  { to: '/contacto',           label: 'Contacto' },
]

const WHATSAPP_URL = 'https://wa.me/5493625550101'
const INSTAGRAM_URL = 'https://instagram.com/educarparatransformar'
const FACEBOOK_URL = 'https://facebook.com/CentroEducarParaTransformar'

export function Footer() {
  return (
    <footer className="bg-brand-azul-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* ── Columna 1: Logo + descripción + redes ── */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-white text-sm">EPT</span>
              </div>
              <div>
                <p className="font-display font-bold text-white text-base leading-tight">Educar para Transformar</p>
                <p className="text-white/50 text-xs">Centro Educativo</p>
              </div>
            </div>

            {/* Slogan */}
            <p className="text-white/60 text-sm leading-relaxed">
              Inspiramos, desafiamos y empoderamos a todos nuestros alumnos a ser miembros comprometidos y éticos de una comunidad global.
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-3 pt-1">
              {/* Instagram */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── Columna 2: Menú rápido ── */}
          <div>
            <h4 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Menú</h4>
            <ul className="space-y-2">
              {MENU_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/65 text-[13px] hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 3: Contacto ── */}
          <div>
            <h4 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-white/65 text-[13px]">
                <MapPin size={14} className="flex-shrink-0 mt-0.5 text-brand-naranja" />
                <span>Av. Lavalle 3500, Resistencia, Chaco, Argentina</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/65 text-[13px]">
                <Phone size={14} className="flex-shrink-0 text-brand-naranja" />
                <a href="tel:+5493625550100" className="hover:text-white transition-colors">(0362) 555-0100</a>
              </li>
              <li className="flex items-center gap-2.5 text-white/65 text-[13px]">
                <Mail size={14} className="flex-shrink-0 text-brand-naranja" />
                <a href="mailto:info@educarparatransformar.edu.ar" className="hover:text-white transition-colors break-all">
                  info@educarparatransformar.edu.ar
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-white/65 text-[13px]">
                <MessageCircle size={14} className="flex-shrink-0 text-brand-naranja" />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +54 9 362 555-0101
                </a>
              </li>
            </ul>

            {/* Horario */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-white/50 text-[11px] uppercase tracking-wide mb-1">Horario de atención</p>
              <p className="text-white/70 text-[13px]">Lunes a Viernes · 8:00 a 17:00 hs</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Línea inferior ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/35">
          <span>© 2026 Centro Educativo Educar para Transformar. Todos los derechos reservados.</span>
          <span>Grupo 8 · UTN FRRe TUP · Metodología de Sistemas I</span>
        </div>
      </div>
    </footer>
  )
}
