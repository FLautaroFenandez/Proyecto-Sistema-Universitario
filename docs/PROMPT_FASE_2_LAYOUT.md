# 🤖 PROMPT FASE 2 — Layout completo: Topbar, Navbar, Footer
## Estructura visual inspirada en uncaus.edu.ar pero con identidad propia

---

```
Generá los componentes de layout del proyecto "Educar para Transformar".
El diseño DEBE seguir exactamente la estructura de uncaus.edu.ar:
- Topbar azul oscuro con links de acceso rápido en fila horizontal
- Navbar blanco con logo a la izquierda, links de navegación en el centro, botón login a la derecha
- Hero con imagen de fondo de pantalla completa y cards blancas superpuestas flotando abajo
- Footer oscuro de 3 columnas

═══════════════════════════════════════════════════════════
COLORES Y TIPOGRAFÍA (NO cambiar)
═══════════════════════════════════════════════════════════
Azul institucional: #1B3A6B  (topbar, navbar activo, footer)
Azul oscuro:        #0F2040  (footer bg, hover states)
Naranja acento:     #E8612C  (botones primarios, links activos, badges)
Verde:              #4CAF50  (nivel inicial)
Celeste:            #29ABE2  (topbar bg de referencia UNCAUS)
Font display:       Nunito (headings, navbar brand)
Font body:          Source Sans 3 (todo lo demás)

═══════════════════════════════════════════════════════════
ARCHIVO 1: src/components/layout/Topbar.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Topbar.jsx
 * @description Barra superior azul con accesos rápidos.
 * En mobile: scroll horizontal. En desktop: fila con todos los links.
 * Idéntica en estructura a la topbar de uncaus.edu.ar.
 */

Contenido del topbar (de izquierda a derecha):
- 📞 (0362) 555-0100   [ícono ti-phone]
- 📅 Calendario académico   [ícono ti-calendar] → link a /calendario
- 📍 Resistencia, Chaco   [ícono ti-map-pin]
- 💬 WhatsApp   [ícono ti-brand-whatsapp] → link a whatsapp institucional
- 📸 Instagram   [ícono ti-brand-instagram] → link
- 👥 Facebook   [ícono ti-brand-facebook] → link

Estilos:
- background: #1B3A6B
- color: rgba(255,255,255,0.85)
- font-size: 12px
- padding: 6px 0
- links separados por | en desktop
- en mobile: overflow-x auto, no scroll bar visible
- hover: color white, opacity 1

═══════════════════════════════════════════════════════════
ARCHIVO 2: src/components/layout/Navbar.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Navbar.jsx
 * @description Navbar principal blanco con logo + links + botón login.
 * Sticky: se queda fijo al hacer scroll.
 * En mobile: menú hamburguesa con slide-in desde la izquierda.
 * Estructura inspirada en uncaus.edu.ar pero con identidad EPT.
 */

Estructura DESKTOP (izquierda → derecha):
[LOGO EPT]  |  Quiénes somos  Niveles  Bienestar  Noticias  Galería  Inscripción  Empleo  Contacto  |  [🔒 Ingresar]

Logo:
- Imagen: /assets/logo-ept.png (o placeholder circular con "EPT" si no existe)
- Al lado: texto "Educar para Transformar" bold azul + "Centro Educativo" small gris
- Link a /

Links de navegación:
- font-size: 13px, color: #374151
- active: color #1B3A6B, font-weight: 600, border-bottom: 2px solid #E8612C
- hover: color #1B3A6B

Botón Ingresar:
- background: #E8612C, color: white
- border-radius: 8px, padding: 8px 20px
- ícono ti-login a la izquierda
- Si el usuario está autenticado: mostrar avatar iniciales + nombre + dropdown con
  "Mi panel" y "Cerrar sesión"

MOBILE:
- Solo el logo y botón hamburguesa (☰)
- Al click: menú lateral slide-in desde izquierda con overlay oscuro
- Todos los links en columna con padding generoso
- Botón "Ingresar" al final del menú

Estado sticky:
- Al hacer scroll: agregar shadow sutil (box-shadow: 0 2px 8px rgba(0,0,0,0.08))
- Transición suave con transition-shadow

═══════════════════════════════════════════════════════════
ARCHIVO 3: src/components/layout/Footer.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Footer.jsx
 * @description Footer oscuro de 3 columnas idéntico en estructura a uncaus.edu.ar
 * pero con la identidad de "Educar para Transformar".
 */

Estructura (3 columnas):

COLUMNA 1 — Logo y descripción:
- Logo EPT grande (o círculo con iniciales)
- Nombre completo de la institución
- Slogan: "Inspiramos, desafiamos y empoderamos..."
- Iconos redes sociales: Instagram, Facebook, WhatsApp
  (círculos blancos semitransparentes, hover: blanco)

COLUMNA 2 — Menú rápido:
- Título: "MENÚ" (uppercase, 10px, letra-espaciado)
- Links en lista vertical: Quiénes somos, Niveles Educativos,
  Bienestar Estudiantil, Noticias, Galería, Inscripción, Empleo, Contacto
- font-size: 13px, color: rgba(255,255,255,0.7)
- hover: color white

COLUMNA 3 — Contacto:
- Título: "CONTACTO"
- 📍 Resistencia, Chaco, Argentina
- 📞 (0362) 555-0100
- ✉️ info@educarparatransformar.edu.ar
- 💬 WhatsApp institucional

LÍNEA INFERIOR (border-top rgba blanco):
- Izquierda: "© 2026 Centro Educativo Educar para Transformar"
- Derecha: "Grupo 8 · UTN FRRe TUP · Metodología de Sistemas I"
- font-size: 11px, color: rgba(255,255,255,0.4)

Colores footer:
- background: #0F2040
- color: rgba(255,255,255,0.7)

═══════════════════════════════════════════════════════════
ARCHIVO 4: src/components/layout/Layout.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Layout.jsx
 * @description Wrapper de layout que incluye Topbar, Navbar, contenido y Footer.
 * Usado como elemento padre en App.jsx con <Outlet /> de React Router.
 */

import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

═══════════════════════════════════════════════════════════
ARCHIVO 5: src/components/ui/Button.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Button.jsx
 * @description Botón reutilizable con variantes: primary, secondary, outline, ghost, danger.
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - Muestra spinner y deshabilita el botón
 */

Variantes CSS:
- primary:   bg-brand-naranja text-white hover:bg-orange-700
- secondary: bg-brand-azul text-white hover:bg-blue-900
- outline:   border border-brand-azul text-brand-azul hover:bg-blue-50
- ghost:     text-gray-600 hover:bg-gray-100
- danger:    bg-red-600 text-white hover:bg-red-700

Sizes:
- sm: text-xs px-3 py-1.5 rounded-md
- md: text-sm px-4 py-2 rounded-lg (default)
- lg: text-base px-6 py-3 rounded-xl

Siempre incluir:
- transition-all duration-200
- disabled:opacity-50 disabled:cursor-not-allowed
- flex items-center gap-2 (para íconos)
- Si loading=true: mostrar spinner Lucide <Loader2 className="animate-spin" size={16} />

═══════════════════════════════════════════════════════════
ARCHIVO 6: src/components/ui/Card.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Card.jsx
 * @description Card contenedor con variantes de elevación.
 * @param {'flat'|'elevated'|'bordered'} variant
 */

- flat:     bg-white (sin borde ni sombra)
- bordered: bg-white border border-gray-200 rounded-2xl
- elevated: bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow
(default: bordered)

═══════════════════════════════════════════════════════════
ARCHIVO 7: src/components/ui/Badge.jsx
═══════════════════════════════════════════════════════════
/**
 * @file Badge.jsx
 * @description Badge/etiqueta de estado o categoría.
 * @param {'blue'|'orange'|'green'|'red'|'gray'} color
 */

- blue:   bg-blue-100 text-blue-800
- orange: bg-orange-100 text-orange-800
- green:  bg-green-100 text-green-800
- red:    bg-red-100 text-red-800
- gray:   bg-gray-100 text-gray-700

font-size: 11px, font-weight: 500, padding: 2px 8px, border-radius: 20px

═══════════════════════════════════════════════════════════
REGLAS GENERALES PARA TODOS LOS COMPONENTES
═══════════════════════════════════════════════════════════
1. Comentario JSDoc en la primera línea de cada archivo
2. Exports nombrados (no default) para componentes de UI
3. Props con destructuring y valores por defecto
4. className se puede extender con cn() o simplemente concatenar
5. Framer Motion solo en animaciones de entrada, no en hover simples (usar CSS)
6. Imágenes: siempre width + height + loading="lazy" + alt descriptivo
7. Links: usar <Link> de react-router-dom para rutas internas, <a> para externas
```
