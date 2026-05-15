# 🎨 Guía de Diseño UX/UI
## Centro Educativo "Educar para Transformar"

---

## 1. Identidad Visual

### Paleta de colores

```
Primarios:
  Azul institucional:  #1B3A6B  → Topbar, navbar, footer, botones secundarios
  Azul oscuro:         #0F2040  → Footer background, hovers
  Azul medio:          #2B5298  → Hero gradiente, acentos

Acento principal:
  Naranja:             #E8612C  → Botones CTA, badges, links activos, franjas

Colores del logo (usar en niveles y elementos decorativos):
  Verde:               #4CAF50  → Nivel Inicial, badges de bienestar
  Rosa/Fucsia:         #D63384  → Acentos decorativos
  Celeste:             #29ABE2  → Botones gradiente, acentos

Neutros:
  Gris 50:             #F8FAFC  → Fondos de sección alternados
  Gris 100:            #F1F5F9  → Cards de servicios, fondos suaves
  Gris 500:            #64748B  → Texto secundario, fechas, subtítulos
  Gris 800:            #1E293B  → Texto principal
  Blanco:              #FFFFFF  → Cards, contenido principal
```

### Tipografía

```
Font display (headings, navbar, hero):
  Nunito — weights: 400, 500, 700
  Usar en: h1, h2, h3, brand name, números de estadísticas

Font body (párrafos, UI, labels):
  Source Sans 3 — weights: 400, 600
  Usar en: body text, botones, labels, descripciiones

Escala tipográfica:
  Hero title:      36-48px, Nunito 700
  Page title:      28-32px, Nunito 600
  Section title:   22-24px, Nunito 600
  Card title:      16-18px, Nunito 500
  Body large:      16px, Source Sans 3 400
  Body:            14-15px, Source Sans 3 400
  Small/Label:     12-13px, Source Sans 3 400
  Tiny:            10-11px, Source Sans 3 400

NUNCA usar Inter, Roboto, Arial ni system fonts.
```

### Bordes y esquinas

```
Botones pequeños:   border-radius: 6px
Botones medianos:   border-radius: 8px
Botones grandes:    border-radius: 10px
Cards:              border-radius: 12-16px
Avatares:           border-radius: 50%
Imágenes galería:   border-radius: 12px
Hero cards (home):  border-radius: 0px (estilo UNCAUS, sin redondeo)
Pills/badges:       border-radius: 20px
```

### Sombras

```
Card hover:     box-shadow: 0 8px 24px rgba(0,0,0,0.10)
Card default:   box-shadow: 0 2px 8px rgba(0,0,0,0.06) o solo border
Navbar sticky:  box-shadow: 0 2px 8px rgba(0,0,0,0.08)
Modal:          box-shadow: 0 20px 60px rgba(0,0,0,0.20)
Hero cards:     box-shadow: 0 4px 20px rgba(0,0,0,0.15)
```

---

## 2. Estructura de páginas

### Patrón de páginas interiores

```
[TOPBAR azul]
[NAVBAR blanco sticky]
[HERO INTERIOR — 180-220px alto, gradiente azul, breadcrumb + título]
[CONTENIDO DE LA PÁGINA]
  → Máximo ancho de contenedor: 1200px, centrado
  → Padding horizontal: 24px (mobile), 48px (desktop)
  → Sections alternados: blanco / gris-50
[FOOTER oscuro]
```

### Espaciado entre secciones

```
Entre secciones grandes: padding-top: 64px, padding-bottom: 64px
Entre secciones pequeñas: padding-top: 40px, padding-bottom: 40px
Entre el hero y la primera sección: depende de si hay float de cards
Máximo ancho de contenido: max-width: 1200px, margin: 0 auto
```

---

## 3. Componentes reutilizables

### Botones

```
PRIMARY (naranja):
  bg: #E8612C, text: white
  hover: bg #C9501F (darken 15%)
  active: scale(0.98)
  disabled: opacity: 0.5

SECONDARY (azul):
  bg: #1B3A6B, text: white
  hover: bg #0F2040

OUTLINE (azul):
  bg: transparent, border: 1.5px solid #1B3A6B, text: #1B3A6B
  hover: bg #EEF2FF

OUTLINE NARANJA:
  bg: transparent, border: 1.5px solid #E8612C, text: #E8612C
  hover: bg #FFF5F0

GHOST:
  bg: transparent, text: #64748B
  hover: bg #F1F5F9

DANGER (rojo):
  bg: #DC2626, text: white
  hover: bg #B91C1C

Todos: transition: all 0.2s ease
Todos: display: flex, align-items: center, gap: 8px (para íconos)
```

### Cards de noticias (igual a UNCAUS)

```
Estructura:
  [IMAGEN — 200px height, object-fit: cover, border-radius-top]
  [FECHA con ícono de reloj]
  [TÍTULO con link, font: Nunito]
  [EXTRACTO de texto]

hover:
  box-shadow elevado
  transform: translateY(-4px)
  transition: all 0.25s ease

Click en imagen o título: navega a la noticia completa
```

### Hero cards flotantes (estilo UNCAUS)

```
EXACTAMENTE igual a las cards de Presenciales/Distancia/Posgrado de uncaus.edu.ar:

Estructura:
  [IMAGEN — 200px height, sin border-radius, object-fit: cover]
  [BARRA DE COLOR — 4px, debajo de la imagen]
  [TÍTULO EN MAYÚSCULAS — font-size: 16px, font-weight: 700, color: #333]
  [DESCRIPCIÓN — text-align: justify, 14px]
  [BOTÓN CON GRADIENTE AZUL — igual al de UNCAUS]

CSS del botón hero:
  background: linear-gradient(45deg, #29ABE2 0%, #1B3A6B 84%)
  border: none
  color: white
  font-size: 14px
  padding: 10px 20px
  width: 100%
  border-radius: 4px

Cards flotando:
  margin-top: -100px (sacar del flujo del hero)
  position: relative
  z-index: 10
  background: white
  box-shadow: 0 4px 20px rgba(0,0,0,0.15)
```

---

## 4. Comportamientos UX

### Estados de loading
- NUNCA mostrar datos vacíos sin indicar que está cargando
- Skeletons > spinners para listas de cards
- Spinner solo para acciones puntuales (submit de formulario)
- El spinner del botón reemplaza el texto del botón al cargar

### Estados de error
- Nunca mostrar errores técnicos al usuario
- Siempre en español descriptivo
- Siempre ofrecer un botón "Intentar de nuevo"
- Loguear el error real en console.error() para debugging

### Formularios
- Validar en tiempo real (onBlur), no al presionar submit
- Errores debajo del campo, en rojo, font-size 12px
- Campos con error: border-color: #DC2626
- Submit deshabilitado mientras el formulario tiene errores
- Loading spinner en el botón mientras procesa
- Confirmación visual (toast o pantalla de éxito) siempre tras submit exitoso

### Navegación
- El link activo del navbar tiene border-bottom naranja
- Al navegar, hacer scroll to top automáticamente (ScrollRestoration de React Router)
- El breadcrumb siempre muestra la ubicación actual
- Botón "← Volver" en páginas de detalle

### Transiciones entre páginas
- Fade-in suave al cambiar de ruta (Framer Motion en el Layout)
- Las secciones aparecen al hacer scroll (whileInView)
- Cards tienen hover con elevación sutil (translateY -4px)

---

## 5. Información de contenido (ficticios para el TP)

### Datos institucionales del centro

```
Nombre completo: Centro Educativo "Educar para Transformar"
Dirección: Av. Lavalle 3500 (a definir), Resistencia, Chaco
Teléfono: (0362) 555-0100
Email: info@educarparatransformar.edu.ar
WhatsApp: +54 9 362 555-0101
Instagram: @educarparatransformar
Facebook: /CentroEducarParaTransformar
Horario de atención: Lunes a Viernes 8:00 a 17:00 hs
Inicio de actividades: Marzo 2027
```

### Misión
"Brindar una educación integral de calidad que inspire, desafíe y empodere a cada alumno para convertirse en un agente de cambio comprometido, ético e innovador, capaz de impactar positivamente en su comunidad y en el mundo."

### Visión
"Ser la institución educativa de referencia en Resistencia y el NEA por la excelencia académica, la formación en valores, la innovación pedagógica y la preparación de ciudadanos globales, seguros, creativos y colaborativos."

### Valores
1. Excelencia académica
2. Comunidad y pertenencia
3. Perspectiva global
4. Innovación y creatividad
5. Ética y compromiso

---

## 6. Accesibilidad mínima

```
- Todos los <img> tienen alt descriptivo
- Contraste de texto sobre fondo blanco: mínimo 4.5:1
- Contraste de texto sobre fondos de color: verificar con herramienta
- Focus visible en todos los elementos interactivos (no quitar outline)
- Labels en todos los inputs del formulario (no solo placeholder)
- Botones con solo íconos tienen aria-label
- Heading hierarchy: una sola h1 por página
```

---

## 7. Guía rápida de implementación en React

```jsx
// ✅ CORRECTO — fuente Nunito en heading
<h2 className="font-display font-bold text-2xl text-gray-800">
  Niveles Educativos
</h2>

// ✅ CORRECTO — botón primary naranja
<button className="bg-brand-naranja hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
  Inscribirme
</button>

// ✅ CORRECTO — card con hover
<motion.div
  whileHover={{ y: -4 }}
  className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
>
  {/* contenido */}
</motion.div>

// ✅ CORRECTO — imagen lazy con dimensiones
<img
  src={noticia.imagen_url}
  alt={`Imagen de ${noticia.titulo}`}
  loading="lazy"
  width={400}
  height={200}
  className="w-full h-48 object-cover"
/>

// ✅ CORRECTO — skeleton mientras carga
{cargando ? (
  <div className="grid grid-cols-3 gap-6">
    {[1,2,3].map(i => <SkeletonCard key={i} />)}
  </div>
) : (
  <div className="grid grid-cols-3 gap-6">
    {noticias.map(n => <NoticiaCard key={n.id} {...n} />)}
  </div>
)}
```
