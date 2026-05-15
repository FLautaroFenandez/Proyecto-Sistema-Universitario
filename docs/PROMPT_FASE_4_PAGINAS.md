# 🤖 PROMPT FASE 4 — Páginas interiores públicas
## Quiénes somos, Niveles, Bienestar, Noticias, Galería, Inscripción, Empleo, Contacto

---

```
Generá todas las páginas públicas del proyecto "Educar para Transformar".
Cada página tiene su propio hero de sección (más pequeño que el home, con fondo azul y título).

HERO DE PÁGINA INTERIOR (compartido):
- height: 200px
- background: linear-gradient(135deg, #1B3A6B, #2B5298)
- Breadcrumb: Inicio > [Nombre de la sección]
- Título grande blanco (Nunito bold)
- Subtítulo gris claro

═══════════════════════════════════════════════════════════
PÁGINA 1: src/pages/public/QuienesSomosPage.jsx
═══════════════════════════════════════════════════════════

Secciones en orden:
1. Hero interior ("Quiénes somos")

2. MISIÓN Y VISIÓN — 2 columnas:
   Misión: "Brindar una educación integral de calidad que inspire, desafíe y empodere a cada alumno para convertirse en un agente de cambio comprometido, ético e innovador."
   Visión: "Ser la institución educativa de referencia en Resistencia por la excelencia académica, la formación en valores y la preparación de ciudadanos globales."

3. NUESTROS VALORES — grid de 4 cards:
   - 🌟 Excelencia: "Compromiso con la calidad en todo lo que hacemos"
   - 🤝 Comunidad: "Construimos vínculos sólidos entre alumnos, familias y docentes"
   - 🌍 Globalidad: "Preparamos ciudadanos para un mundo interconectado"
   - 💡 Innovación: "Fomentamos el pensamiento crítico y la creatividad"

4. NUESTRO EQUIPO DIRECTIVO — (placeholder, foto + nombre + cargo)

5. HISTORIA — línea de tiempo simple:
   2024 → Fundación y diseño del proyecto educativo
   2025 → Construcción e implementación de instalaciones
   2026 → Proceso de inscripciones y selección de personal
   2027 → Inicio de actividades académicas (Marzo)

═══════════════════════════════════════════════════════════
PÁGINA 2: src/pages/public/NivelesPage.jsx
═══════════════════════════════════════════════════════════

3 secciones grandes, una por nivel con tabs o scroll:

NIVEL INICIAL (fondo verde muy sutil):
- Rango: Sala de 3, 4 y 5 años
- Modalidad: Jornada extendida (8:00 a 16:30 hs)
- Propuesta pedagógica: juego, exploración, arte, música
- Idiomas: Inglés desde sala de 3
- Actividades extracurriculares disponibles
- Imagen de referencia (placeholder)

NIVEL PRIMARIO (fondo naranja muy sutil):
- Rango: 1° a 6° grado
- Modalidad: Jornada extendida (7:30 a 16:30 hs)
- Materias: Matemática, Lengua, Ciencias Naturales, Sociales, Ed. Física, Tecnología, Arte, Música
- Idiomas: Inglés, Portugués (desde 3°), Francés (desde 5°)
- Talleres: Robótica, Teatro, Danza, Ajedrez
- Deportes: Natación, Fútbol, Básquet, Atletismo

NIVEL SECUNDARIO (fondo azul muy sutil):
- Rango: 1° a 5° año
- Modalidad: Jornada extendida (7:00 a 17:00 hs)
- Orientaciones: Ciencias Naturales / Humanidades y Ciencias Sociales
- Materias especiales: Filosofía, Economía, Programación
- Preparación universitaria incluida
- Deportes y actividades artísticas completas

Sección final: tabla comparativa de los 3 niveles

═══════════════════════════════════════════════════════════
PÁGINA 3: src/pages/public/BienestarPage.jsx
═══════════════════════════════════════════════════════════

DEPORTES — grid con info de cada deporte:
🏃 Atletismo — Pista de atletismo oficial · Todos los niveles
🏊 Natación — Pileta olímpica cubierta · Todos los niveles
⚽ Fútbol — 2 canchas de césped sintético
🥋 Artes Marciales — Dojo cubierto · Karate y Judo
🏐 Vóleibol — Canchas internas y externas
💃 Danza — Salón equipado · Danza clásica y contemporánea
🏀 Básquet — 2 canchas cubierta y al aire libre
♟️ Ajedrez — Club de ajedrez · Torneos internos y externos

INSTALACIONES — con descripción detallada:
- Pileta de natación: 25m × 8 carriles, cubierta, climatizada
- Canchas de fútbol: césped sintético, iluminación LED
- Pista de atletismo: 400m reglamentaria
- Gimnasio cubierto: 1200m², equipamiento completo
- Laboratorios: Física (40 bancos), Química (40 bancos), Computación (60 puestos)
- Comedor: 300 cubiertos, menú balanceado supervisado
- Enfermería: 2 consultorios, guardia permanente

SERVICIOS:
- Servicio de Apoyo Estudiantil: psicólogos y psicopedagogos
- Micros de traslado: recorridos por toda Resistencia, GPS en tiempo real
- Biblioteca: 5000 volúmenes, sala de lectura

═══════════════════════════════════════════════════════════
PÁGINA 4: src/pages/public/NoticiasPage.jsx
═══════════════════════════════════════════════════════════

/**
 * Lista paginada de noticias.
 * Noticias públicas: visibles para todos.
 * Si el usuario está autenticado: también ve las internas según su rol.
 */

Layout:
- Filtro por categoría (pills): Todas | Institucional | Deportes | Idiomas | Eventos | Comunicados
- Grid 3 columnas (1 en mobile, 2 en tablet)
- Paginación: botones Anterior/Siguiente + número de página
- 9 noticias por página

Cada card: igual a la sección de noticias del home
Si no hay noticias: "Próximamente publicaremos novedades de la institución."

Hooks: const { noticias, total, cargando, error } = useNoticias({ pagina, limite: 9 })

═══════════════════════════════════════════════════════════
PÁGINA 5: src/pages/public/NoticiaDetallePage.jsx
═══════════════════════════════════════════════════════════

Layout:
- Breadcrumb: Inicio > Noticias > [Título]
- Imagen de portada (ancho completo, height 400px, object-fit cover)
- Título grande (Nunito 32px)
- Fecha + autor (si está disponible)
- Contenido completo (renderizado como HTML o texto con párrafos)
- Botón "← Volver a noticias"
- Sidebar (en desktop): "Otras noticias" — las 3 más recientes

Hook: const { noticia, cargando, error } = useNoticiaById(id)
→ SELECT * FROM noticias WHERE id = :id AND publicada = true

═══════════════════════════════════════════════════════════
PÁGINA 6: src/pages/public/GaleriaPage.jsx
═══════════════════════════════════════════════════════════

/**
 * Galería de imágenes organizadas por categoría.
 * Filtro por categoría en pills horizontales.
 * Masonry grid o grid uniforme 3 columnas.
 */

Filtros (pills): Todas | Instalaciones | Aulas | Deportes | Eventos | Idiomas

Grid de imágenes:
- 3 columnas desktop, 2 tablet, 1 mobile
- Cada imagen: aspect-ratio 4/3, object-fit cover, border-radius 12px
- hover: overlay oscuro semitransparente con ícono de lupa
- click: no hace nada en esta versión (se puede agregar lightbox en el futuro)

Loading: skeleton de 9 rectángulos
Vacío por categoría: "No hay imágenes en esta categoría aún."

Hook: const { imagenes, cargando } = useGaleria(categoriaId)

═══════════════════════════════════════════════════════════
PÁGINA 7: src/pages/public/InscripcionPage.jsx
═══════════════════════════════════════════════════════════

/**
 * Formulario de solicitud de inscripción.
 * Accesible sin login.
 * Validación completa con React Hook Form + Zod.
 */

Layout: 2 columnas (formulario izquierda, info derecha en desktop)

INFO LATERAL (derecha):
- "¿Por qué elegirnos?" con 4 puntos clave
- Horarios de atención para consultas presenciales
- Teléfono y WhatsApp de contacto

FORMULARIO (izquierda):
Sección A — Datos del estudiante:
- Nombre completo* (text, max 100)
- Fecha de nacimiento* (date)
- DNI* (text, solo números, 7-8 dígitos)
- Nivel educativo al que se inscribe* (select: Inicial / Primario / Secundario)
- Turno preferido* (radio: Mañana / Tarde)

Sección B — Datos del padre/tutor:
- Nombre completo del tutor* (text)
- DNI del tutor* (text)
- Relación con el estudiante* (select: Padre / Madre / Tutor Legal)
- Teléfono de contacto* (text)
- Email de contacto* (email)

Sección C — Información adicional:
- ¿Cómo nos conoció? (select: Instagram / Facebook / Recomendación / Otro)
- Observaciones (textarea, opcional, max 500 chars)

Botón: "Enviar solicitud de inscripción" (ancho completo, naranja)

Validaciones Zod:
- DNI: solo números, entre 7 y 8 dígitos
- Email: formato válido
- Fecha nacimiento: no puede ser futura
- Todos los campos * son obligatorios

Al enviar exitosamente:
- INSERT en tabla inscripciones con estado 'pendiente'
- Mostrar pantalla de confirmación:
  "✅ ¡Tu solicitud fue enviada con éxito!
   Nos pondremos en contacto a la brevedad al email [email ingresado].
   Guardá este número de solicitud: #[id corto]"

═══════════════════════════════════════════════════════════
PÁGINA 8: src/pages/public/EmpleoPage.jsx
═══════════════════════════════════════════════════════════

/**
 * Lista de búsquedas laborales activas.
 * Solo se muestran las que tienen fecha_limite >= hoy Y activo = true.
 */

Si hay avisos: grid de cards (1 columna, ancho contenedor)
Cada card:
- Badge de área: "Docente" / "Administrativo" / "Servicio"
- Título del puesto (bold, grande)
- Requisitos en lista
- Fecha límite de postulación (con días restantes: "Quedan 5 días")
- Botón "Postularme" → link a email institucional con subject pre-llenado

Si no hay avisos:
"Actualmente no tenemos búsquedas activas. Podés dejarnos tu CV para futuras oportunidades."
+ formulario básico: nombre, email, área de interés, CV (texto con link)

Sección inferior: "¿Por qué trabajar con nosotros?" — 3 puntos

═══════════════════════════════════════════════════════════
PÁGINA 9: src/pages/public/ContactoPage.jsx
═══════════════════════════════════════════════════════════

Layout: 2 columnas (formulario + info/mapa)

FORMULARIO:
- Nombre completo*
- Email*
- Asunto* (select: Consulta general / Inscripción / Empleo / Otro)
- Mensaje* (textarea, max 1000 chars)
- Botón: "Enviar mensaje"
→ INSERT en tabla contacto_mensajes
→ Confirmación: "¡Mensaje recibido! Te respondemos en menos de 48 horas hábiles."

INFO DE CONTACTO (columna derecha):
- 📍 Av. [Dirección], Resistencia, Chaco
- 📞 (0362) 555-0100
- ✉️ info@educarparatransformar.edu.ar
- 💬 WhatsApp: [link]
- Horario de atención: Lunes a Viernes 8:00 a 17:00 hs

MAPA: Google Maps embed del centro de Resistencia
(iframe responsive, border-radius 12px)

REDES SOCIALES: iconos grandes con links
```
