/**
 * @file Footer.jsx
 * @description Footer institucional estilo UNCAUS: fondo oscuro, logo, menú vertical,
 * info de contacto. Limpio, sin emojis, iconografía Lucide React profesional.
 */

import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react'

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
const FACEBOOK_URL  = 'https://facebook.com/CentroEducarParaTransformar'

/* Ícono SVG de WhatsApp */
function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer style={{ background: '#0F2040' }} className="text-white">

      {/* ── Cuerpo principal ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Columna 1 — Logo + descripción + redes */}
          <div className="md:col-span-2 space-y-5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4">
              <div className="w-[64px] h-[64px] bg-white rounded-xl flex items-center justify-center p-1 flex-shrink-0">
                <img
                  src="/assets/logo-ept.png"
                  alt="Logo Educar para Transformar"
                  width={56} height={56}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'block'
                  }}
                />
                <span className="text-brand-azul font-display font-bold text-xl hidden">EPT</span>
              </div>
              <div>
                <p className="font-display font-bold text-white text-lg leading-tight">
                  Educar para Transformar
                </p>
                <p className="text-white/50 text-xs mt-1">Centro Educativo Privado</p>
              </div>
            </Link>

            {/* Slogan */}
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Inspiramos, desafiamos y empoderamos a todos nuestros alumnos a ser miembros
              comprometidos y éticos de una comunidad global, para que se conviertan en
              agentes de cambio conscientes, seguros, innovadores y colaborativos.
            </p>

            {/* Redes sociales */}
            <div className="flex items-center gap-2 pt-1">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Columna 2 — Menú */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-5">
              MENÚ
            </h4>
            <ul className="space-y-2.5">
              {MENU_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-[13px] text-white/65 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Contacto */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-5">
              CONTACTO
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-brand-naranja mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-white/65 leading-snug">
                  Av. Lavalle 3500, Resistencia, Chaco
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-brand-naranja flex-shrink-0" />
                <a href="tel:+5493625550100" className="text-[13px] text-white/65 hover:text-white transition-colors">
                  (0362) 555-0100
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-brand-naranja flex-shrink-0" />
                <a href="mailto:info@educarparatransformar.edu.ar"
                  className="text-[13px] text-white/65 hover:text-white transition-colors break-all">
                  info@educarparatransformar.edu.ar
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon size={14} />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="text-[13px] text-white/65 hover:text-white transition-colors">
                  +54 9 362 555-0101
                </a>
              </li>
            </ul>

            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-[11px] text-white/40 uppercase tracking-wide mb-1">Horario de atención</p>
              <p className="text-[13px] text-white/65">Lunes a Viernes · 8:00 a 17:00 hs</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Línea inferior ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/35">
            © 2026 Centro Educativo Educar para Transformar. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-white/35">
            Grupo 8 · UTN FRRe TUP · Metodología de Sistemas I
          </p>
        </div>
      </div>
    </footer>
  )
}
