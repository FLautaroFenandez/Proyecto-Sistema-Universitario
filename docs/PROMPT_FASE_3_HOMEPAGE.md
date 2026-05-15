# 🤖 PROMPT FASE 3 — HomePage completa estilo UNCAUS
## Hero con foto de fondo + cards flotantes + todas las secciones

---

```
Generá la HomePage completa del proyecto "Educar para Transformar".
Seguí EXACTAMENTE la estructura visual de uncaus.edu.ar:
- Hero = foto de fondo de pantalla completa con cards blancas superpuestas flotando en la parte inferior
- Las cards tienen imagen superior, título y descripción (igual que las cards de Presenciales/Distancia/Posgrado de UNCAUS)
- Sección noticias en grid de 3 columnas con foto, fecha, título
- Resto de secciones con identidad propia

═══════════════════════════════════════════════════════════
ARCHIVO: src/pages/public/HomePage.jsx
═══════════════════════════════════════════════════════════

La página se arma con secciones separadas. Importalas todas:

import HeroSection        from '@/components/sections/HeroSection'
import NoticiasSection    from '@/components/sections/NoticiasSection'
import NivelesSection     from '@/components/sections/NivelesSection'
import ServiciosSection   from '@/components/sections/ServiciosSection'
import OpinionesSection   from '@/components/sections/OpinionesSection'
import CTASection         from '@/components/sections/CTASection'

═══════════════════════════════════════════════════════════
SECCIÓN 1: src/components/sections/HeroSection.jsx
═══════════════════════════════════════════════════════════
/**
 * ESTRUCTURA VISUAL (copiá exactamente de UNCAUS pero con identidad EPT):
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │                                                          │
 * │          FOTO DE FONDO pantalla completa                 │
 * │      (imagen de instalaciones del centro)                │
 * │                                                          │
 * │  ┌──────────────┬──────────────┬──────────────┐          │
 * │  │  [img]       │  [img]       │  [img]       │          │
 * │  │  Inicial     │  Primario    │  Secundario  │          │
 * │  │  ...desc...  │  ...desc...  │  ...desc...  │          │
 * │  └──────────────┴──────────────┴──────────────┘          │
 * └──────────────────────────────────────────────────────────┘
 *
 * Las 3 cards blancas flotan SOBRE la imagen (position absolute o
 * margin-top negativo sacando del flujo del hero).
 */

CSS del hero:
- height: 70vh (mínimo 500px)
- background-image: url('/assets/hero-bg.jpg')
- background-size: cover
- background-position: center
- position: relative
- SIN overlay oscuro (igual que UNCAUS — la foto sola)
- En la parte superior izquierda: badge pulsante "Inscripciones 2027 abiertas"
  con fondo naranja semitransparente

Cards del hero (las 3 blancas flotando):
- background: white
- border-radius: 0 (o muy sutil, como UNCAUS)
- box-shadow: 0 4px 20px rgba(0,0,0,0.15)
- padding: 0 (imagen arriba, texto abajo)
- position: relative, margin-top: -120px (sacarlas del hero)
- z-index: 10

Cada card tiene:
- Imagen superior: 200px height, object-fit: cover
  → Card Inicial: imagen de niños pequeños (placeholder gradient verde)
  → Card Primario: imagen de aula (placeholder gradient naranja)
  → Card Secundario: imagen de jóvenes (placeholder gradient azul)
- Línea de color debajo de la imagen (4px) del color del nivel
- Título en MAYÚSCULAS bold: "NIVEL INICIAL", "NIVEL PRIMARIO", "NIVEL SECUNDARIO"
  (igual que "EDUCACIÓN PRESENCIAL" en UNCAUS)
- Descripción breve del nivel
- Botón azul con gradiente: "VER MÁS INFORMACIÓN" (igual al botón de UNCAUS)
  → style: background: linear-gradient(45deg, #29ABE2 0%, #1B3A6B 84%)

En mobile: las 3 cards en columna vertical (sin flotar)

═══════════════════════════════════════════════════════════
SECCIÓN 2: src/components/sections/NoticiasSection.jsx
═══════════════════════════════════════════════════════════
/**
 * @description Grid de 3 columnas con noticias recientes.
 * Igual estructura a la sección "Últimas Noticias" de UNCAUS.
 * Usa el hook useNoticias() para traer las 3 más recientes.
 */

Estructura EXACTA de cada card de noticia (igual a UNCAUS):
- Imagen superior (click lleva a la noticia completa)
- Ícono de reloj + fecha: "May 14, 2026"
- Título de la noticia como <h3> con link
- Extracto de texto (80 chars máx)
- Contador de vistas (ícono ojo + número) — opcional

Encabezado de la sección:
- <h2> "Últimas Noticias" (igual que UNCAUS, texto negro, border-heading-style)
- border-left: 4px solid #E8612C, padding-left: 12px

Botón al final: "Ver todas las noticias" — centered, outline naranja

Loading state: 3 skeleton cards (rectángulos grises pulsantes)
Error state: mensaje "No pudimos cargar las noticias. Intentá de nuevo."

Hook a usar:
const { noticias, cargando, error } = useNoticias({ limite: 3, soloPublicas: true })

═══════════════════════════════════════════════════════════
SECCIÓN 3: src/components/sections/NivelesSection.jsx
═══════════════════════════════════════════════════════════
/**
 * @description Cards de niveles educativos con jornada extendida.
 * Fondo: gradiente suave gris/azul para diferenciarse del blanco del hero.
 */

Fondo de sección: bg-gray-50

3 cards (Inicial, Primario, Secundario) en grid:
Cada card:
- Franja de color superior (4px): verde/naranja/azul según nivel
- Ícono grande emoji: 🌱 / 📚 / 🎓
- Nombre del nivel (Nunito bold 18px)
- Lista de características:
  → Inicial: Sala 3, 4 y 5 años · Jornada extendida · Estimulación temprana · Inglés desde sala de 3
  → Primario: 1° a 6° grado · Jornada extendida · Ciencias, Tecnología, Arte · 3 idiomas · Deportes
  → Secundario: 1° a 5° año · Jornada extendida · Orientación Ciencias/Humanidades · Pre-universitario
- Badge inferior: "Jornada Extendida" (pill verde)
- Botón "Más información" outline del color del nivel

═══════════════════════════════════════════════════════════
SECCIÓN 4: src/components/sections/ServiciosSection.jsx
═══════════════════════════════════════════════════════════
/**
 * @description Grilla 4x2 de servicios e instalaciones.
 * Fondo blanco.
 */

Título sección: "Todo lo que necesita la comunidad educativa"
Sub-título: "Bienestar estudiantil integral"

8 cards de servicios (grid 4 columnas desktop, 2 tablet, 1 mobile):
Cada card: ícono emoji grande (32px) + nombre + descripción 1 línea
hover: scale(1.03) + shadow sutil

Servicios a mostrar:
1. 🏊 Pileta de Natación — "Clases de natación todos los niveles"
2. ⚽ Deportes — "Atletismo, fútbol, básquet, vóleibol y más"
3. 🍽️ Comedor — "Menú balanceado supervisado por nutricionistas"
4. 🚌 Transporte — "Servicio de micros con recorridos cubiertos"
5. 🔬 Laboratorios — "Física, química y computación equipados"
6. 🏥 Enfermería — "Profesionales de salud presentes a diario"
7. 🤝 Apoyo escolar — "Servicio de tutorías y apoyo pedagógico"
8. 🌍 Idiomas — "Inglés, Portugués y Francés desde nivel inicial"

═══════════════════════════════════════════════════════════
SECCIÓN 5: src/components/sections/OpinionesSection.jsx
═══════════════════════════════════════════════════════════
/**
 * @description Opiniones aprobadas de la comunidad + formulario para dejar opinión.
 * Las opiniones se traen de Supabase (solo las aprobadas).
 * Cualquier visitante puede dejar una opinión sin login.
 */

Parte superior: 3 opiniones aprobadas en grid
Cada opinión:
- Avatar circular con iniciales (colores variados del logo)
- Nombre del autor
- Fecha
- Texto de la opinión
- 5 estrellas doradas (decorativas, todas llenas por ahora)

Formulario "Dejá tu opinión":
- Campo: Nombre (required, max 100 chars)
- Campo: Tu opinión (textarea, required, max 300 chars, contador en tiempo real)
- Botón "Enviar opinión"
- Al enviar: INSERT a tabla opiniones con estado 'pendiente'
- Mensaje de confirmación: "¡Gracias! Tu opinión fue enviada y está pendiente de aprobación."
- Validación con React Hook Form + Zod

Hook: const { opiniones, cargando } = useOpiniones()
Y función local: submitOpinion(data) → supabase.from('opiniones').insert(...)

═══════════════════════════════════════════════════════════
SECCIÓN 6: src/components/sections/CTASection.jsx
═══════════════════════════════════════════════════════════
/**
 * @description Banner call-to-action de inscripción.
 * Fondo: gradiente azul oscuro del centro educativo.
 */

Fondo: background: linear-gradient(135deg, #1B3A6B 0%, #0F2040 100%)
Padding: 60px vertical

Contenido centrado:
- Título grande blanco: "¿Querés ser parte de nuestra comunidad?"
- Subtítulo gris claro: "Inscripciones abiertas para el ciclo lectivo 2027. Sumate a una propuesta educativa única en Resistencia."
- 2 botones:
  → "Solicitar inscripción" — blanco con texto azul oscuro (link a /inscripcion)
  → "Contactanos" — outline blanco (link a /contacto)

═══════════════════════════════════════════════════════════
HOOKS A GENERAR EN ESTA FASE
═══════════════════════════════════════════════════════════

src/hooks/useNoticias.js — (ya definido en PROMPT_FASE_1)

src/hooks/useOpiniones.js:
/**
 * @file useOpiniones.js
 * @description Trae solo las opiniones aprobadas para mostrar en el sitio público.
 */
→ SELECT * FROM opiniones WHERE estado = 'aprobada' ORDER BY created_at DESC LIMIT 6

═══════════════════════════════════════════════════════════
ANIMACIONES CON FRAMER MOTION
═══════════════════════════════════════════════════════════
En cada sección aplicar:
- initial={{ opacity: 0, y: 30 }}
- whileInView={{ opacity: 1, y: 0 }}
- viewport={{ once: true, margin: '-50px' }}
- transition={{ duration: 0.5, delay: index * 0.1 }} (en cards iteradas)

Esto crea el efecto de aparición al hacer scroll, sin ser molesto.
NO agregar animaciones en hover de texto o enlaces simples.
SÍ agregar en hover de cards: whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
```
