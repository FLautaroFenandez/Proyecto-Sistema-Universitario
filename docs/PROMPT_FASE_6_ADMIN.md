# 🤖 PROMPT FASE 6 — Panel de Administración completo
## Todas las pantallas del admin: opiniones, noticias, galería, inscripciones, empleos, usuarios

---

```
Generá el panel de administración completo del proyecto "Educar para Transformar".
El admin tiene su propio layout (sidebar fijo + área de contenido).

═══════════════════════════════════════════════════════════
LAYOUT DEL ADMIN: src/components/admin/AdminLayout.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Layout del panel admin.
 * SIDEBAR fijo a la izquierda (240px) + área de contenido a la derecha.
 * NO usa el Layout público (sin topbar/navbar/footer).
 * Solo header propio con logo, nombre de usuario y botón salir.
 */

HEADER (top, full width, bg white, border-bottom):
- Izquierda: Logo EPT + "Panel de Administración"
- Derecha: Avatar con iniciales + nombre del usuario + botón "Salir" (signOut)

SIDEBAR (fijo izquierda, bg #1B3A6B, text white):
- Sección: GESTIÓN DE CONTENIDO
  → 💬 Opiniones (/admin/opiniones) — badge con cantidad pendiente
  → 📰 Noticias (/admin/noticias)
  → 🖼️ Galería (/admin/galeria)
- Sección: GESTIÓN INSTITUCIONAL
  → 📋 Inscripciones (/admin/inscripciones) — badge con cantidad pendiente
  → 💼 Empleos (/admin/empleos)
- Sección: ADMINISTRACIÓN [solo rol admin]
  → 👥 Usuarios (/admin/usuarios)
- Divider
  → 🏠 Ir al sitio (link a /)
  → 🚪 Cerrar sesión

Link activo: fondo blanco semitransparente, texto blanco bold

CONTENIDO: flex-1, bg-gray-50, padding 24px, overflow-y auto

═══════════════════════════════════════════════════════════
PANTALLA 1: src/pages/admin/AdminPage.jsx (Overview)
═══════════════════════════════════════════════════════════

/**
 * @description Pantalla principal del admin. Resumen general del sistema.
 */

Título: "Panel de administración" + fecha actual

Fila de métricas (4 cards):
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ 💬 Opiniones   │ 📋 Inscripciones│ 📰 Noticias    │ 💼 Empleos     │
│ pendientes: [N]│ pendientes: [N] │ publicadas: [N]│ activos: [N]   │
│ [Moderar →]    │ [Ver →]         │ [Gestionar →]  │ [Ver →]        │
└────────────────┴────────────────┴────────────────┴────────────────┘

Queries:
- SELECT COUNT(*) FROM opiniones WHERE estado = 'pendiente'
- SELECT COUNT(*) FROM inscripciones WHERE estado = 'pendiente'
- SELECT COUNT(*) FROM noticias WHERE publicada = true
- SELECT COUNT(*) FROM empleos WHERE activo = true AND fecha_limite >= NOW()

Tabla de últimas inscripciones (5 filas):
Columnas: Estudiante | Nivel | Tutor | Email | Fecha | Estado (badge)
Botón al pie: "Ver todas las inscripciones →"

Tabla de últimas opiniones pendientes (3 filas):
Columnas: Nombre | Texto (truncado 60 chars) | Fecha | Acciones [Aprobar] [Rechazar]

═══════════════════════════════════════════════════════════
PANTALLA 2: src/pages/admin/OpinionesAdminPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Moderación de opiniones.
 * Ver todas las opiniones con filtro por estado.
 * Aprobar, rechazar o eliminar desde aquí.
 */

Filtros por estado (tabs o pills): Todas | Pendientes | Aprobadas | Rechazadas

Por cada opinión — card con:
- Nombre del autor + fecha
- Texto completo de la opinión
- Estado actual (badge color)
- Botones de acción:
  Si PENDIENTE: [✅ Aprobar] [❌ Rechazar]
  Si APROBADA: [❌ Rechazar] [🗑️ Eliminar]
  Si RECHAZADA: [✅ Aprobar] [🗑️ Eliminar]

Al aprobar: UPDATE opiniones SET estado='aprobada', moderado_por=[userId], moderado_at=NOW()
Al rechazar: UPDATE opiniones SET estado='rechazada', ...
Al eliminar: DELETE FROM opiniones WHERE id=...

Confirmación antes de eliminar: modal "¿Seguro querés eliminar esta opinión?"

Estado vacío: "No hay opiniones [pendientes/aprobadas/rechazadas]."

═══════════════════════════════════════════════════════════
PANTALLA 3: src/pages/admin/NoticiasAdminPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description CRUD completo de noticias.
 */

LISTADO:
- Tabla con columnas: Título | Pública/Interna | Publicada/Borrador | Fecha | Acciones
- Acciones: [✏️ Editar] [👁 Ver] [🗑️ Eliminar]
- Badge "BORRADOR" en naranja, "PUBLICADA" en verde, "INTERNA" en azul
- Botón flotante: "+ Nueva noticia"
- Filtros: Todas / Borradores / Publicadas / Públicas / Internas

FORMULARIO (modal o página separada /admin/noticias/nueva y /admin/noticias/:id/editar):
- Título* (text, max 200 chars)
- Resumen (textarea, max 500 chars, "Para previsualización en listados")
- Contenido* (textarea grande con instrucción "Podés usar saltos de línea")
- Imagen de portada (file upload → Supabase Storage bucket 'noticias')
  → Mostrar preview de la imagen al seleccionarla
  → Al subir: mostrar barra de progreso
- ¿Es pública? (toggle: Sí = visible para todos / No = solo para usuarios con sesión)
- ¿Publicar ahora? (toggle: Sí = publicada / No = guardar como borrador)
- Botones: [Cancelar] [Guardar borrador] [Publicar]

Al subir imagen: supabase.storage.from('noticias').upload(...)
Al guardar: INSERT o UPDATE en tabla noticias

═══════════════════════════════════════════════════════════
PANTALLA 4: src/pages/admin/GaleriaAdminPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Gestión de galería de imágenes.
 * Subir, organizar por categoría, eliminar.
 */

Tabs de categorías: Instalaciones | Aulas | Deportes | Eventos | Idiomas

Grid de imágenes (3 columnas) de la categoría activa:
- Cada imagen: preview + botón X (eliminar) en hover
- Al eliminar: supabase.storage.from('galeria').remove([path]) + DELETE FROM galeria

Zona de upload:
- Drag & drop o click para seleccionar (multiple files)
- Solo imágenes (.jpg, .png, .webp, max 5MB cada una)
- Al seleccionar: preview de todas las imágenes a subir
- Selector de categoría para las nuevas imágenes
- Campo opcional: título/descripción
- Botón "Subir [N] imagen(es)"
- Barra de progreso por imagen
- Al terminar: las imágenes aparecen en el grid

Al subir: 
1. supabase.storage.from('galeria').upload(path, file)
2. INSERT INTO galeria (imagen_url, categoria_id, subido_por, titulo) VALUES (...)

═══════════════════════════════════════════════════════════
PANTALLA 5: src/pages/admin/InscripcionesAdminPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Gestión de solicitudes de inscripción.
 */

Filtros: Todas | Pendientes | En revisión | Aceptadas | Rechazadas

Tabla principal:
Columnas: Estudiante | DNI | Nivel | Turno | Tutor | Email | Teléfono | Fecha | Estado | Acciones

Al click en una fila → modal con DETALLE COMPLETO:
- Todos los datos del estudiante
- Todos los datos del tutor
- Estado actual (editable)
- Campo de observaciones (textarea)
- Selector de estado: Pendiente / En revisión / Aceptada / Rechazada
- Botón "Guardar cambios"

Al cambiar estado: UPDATE inscripciones SET estado=..., revisado_por=[userId], updated_at=NOW()

Exportar: botón "Exportar CSV" (genera un CSV con todas las inscripciones filtradas)
→ Usar la API de Supabase para obtener los datos y generar el CSV en el cliente

═══════════════════════════════════════════════════════════
PANTALLA 6: src/pages/admin/EmpleosAdminPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description CRUD de avisos de empleo.
 */

Listado con columnas: Puesto | Fecha límite | Estado | Días restantes | Acciones

Formulario (modal) de nuevo aviso / editar:
- Título del puesto* (text)
- Descripción* (textarea, "Describí el puesto y las funciones principales")
- Requisitos (textarea, "Listá los requisitos uno por línea")
- Email de contacto para postulaciones* (email)
- Fecha límite de postulación* (date, mínimo: mañana)
- ¿Activo? (toggle, default: true)

Al vencer la fecha límite: el aviso se oculta automáticamente del sitio público
(filtro en el frontend: fecha_limite >= new Date().toISOString())

═══════════════════════════════════════════════════════════
PANTALLA 7: src/pages/admin/UsuariosAdminPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description SOLO ROL ADMIN. Gestión de usuarios del sistema.
 */

Tabla de usuarios:
Columnas: Nombre | DNI | Email | Rol (badge) | Activo (toggle) | Fecha registro | Acciones

Filtros: Todos | Admin | Autoridad | Docente | Personal | Padre | Estudiante

CREAR USUARIO PERSONAL (docente, autoridad, personal):
Modal con:
- Nombre completo*
- DNI*
- Teléfono
- Email* (será el email de login)
- Contraseña temporal* (se le communica al usuario)
- Rol* (select: Docente / Personal / Autoridad)

Al crear:
1. supabase.auth.admin.createUser({ email, password, ... }) → SOLO desde servidor
   ATENCIÓN: esto requiere la SERVICE ROLE KEY, no la ANON KEY.
   Alternativa para el TP: el admin puede registrarse con /registro y luego
   en Supabase Dashboard cambiar el rol manualmente en la tabla profiles.
   O crear un botón "Cambiar rol" en esta pantalla que haga UPDATE profiles SET rol=... WHERE id=...

DESACTIVAR USUARIO:
- Toggle "Activo" → UPDATE profiles SET activo = false WHERE id = ...
- El usuario puede seguir logueando pero al cargar su perfil verá mensaje "Cuenta desactivada"

═══════════════════════════════════════════════════════════
COMPONENTE COMPARTIDO: src/components/admin/DataTable.jsx
═══════════════════════════════════════════════════════════

/**
 * @file DataTable.jsx
 * @description Tabla de datos reutilizable para todas las pantallas de admin.
 * @param {Array} columns - Definición de columnas [{key, label, render}]
 * @param {Array} data - Array de objetos a mostrar
 * @param {boolean} loading - Muestra skeleton si es true
 * @param {string} emptyMessage - Mensaje cuando no hay datos
 */

Características:
- Header sticky
- Filas con hover: bg-gray-50
- Loading: skeleton de filas (5 filas con rectángulos pulsantes)
- Vacío: ícono + mensaje centrado
- Responsive: en mobile scroll horizontal
- Soporte para render custom por columna (para badges, botones de acción, etc.)

═══════════════════════════════════════════════════════════
COMPONENTE COMPARTIDO: src/components/admin/StatsCard.jsx
═══════════════════════════════════════════════════════════

/**
 * @file StatsCard.jsx
 * @description Card de métrica para el overview del admin.
 * @param {string} titulo
 * @param {number} valor
 * @param {string} icono - Nombre del ícono de Lucide
 * @param {string} color - 'blue'|'orange'|'green'|'red'
 * @param {string} linkTo - Ruta de "Ver más"
 */

Estructura:
- Ícono grande en color (bg suave del color)
- Número grande bold (24px Nunito)
- Título small (12px, gris)
- Link "Ver todos →" en color

═══════════════════════════════════════════════════════════
WRAPPER DEL ADMIN EN App.jsx
═══════════════════════════════════════════════════════════

Las rutas /admin/* deben usar AdminLayout, NO el Layout público.
Envolver con ProtectedRoute de roles [ROLES.ADMIN, ROLES.AUTORIDAD].

Nota: UsuariosAdminPage solo para [ROLES.ADMIN].
```
