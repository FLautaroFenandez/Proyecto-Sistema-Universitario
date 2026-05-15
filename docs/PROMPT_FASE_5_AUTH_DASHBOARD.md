# 🤖 PROMPT FASE 5 — Autenticación y Dashboard por roles
## Login, Registro, Dashboard dinámico según rol

---

```
Generá las páginas de autenticación y el dashboard por roles.

═══════════════════════════════════════════════════════════
PÁGINA 1: src/pages/auth/LoginPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Página de login. SIN Topbar/Navbar/Footer (layout propio).
 * Diseño split: mitad izquierda imagen/branding, mitad derecha formulario.
 */

Layout: 2 columnas (solo desktop, en mobile solo el formulario)

COLUMNA IZQUIERDA (fondo azul con gradiente):
- Logo EPT grande centrado
- Slogan del centro educativo
- Imagen de fondo sutil (patrón geométrico o foto institucional)
- Color: linear-gradient(135deg, #1B3A6B, #0F2040)

COLUMNA DERECHA (fondo blanco):
- "Bienvenido de vuelta" (Nunito 24px)
- "Ingresá con tu cuenta institucional" (gris, 14px)
- Formulario:
  → Email (con ícono ti-mail)
  → Contraseña (con ícono ti-lock + botón mostrar/ocultar)
  → Botón "Ingresar" (ancho completo, naranja, con loading spinner)
  → Link "¿Olvidaste tu contraseña?" (gris, centrado)
- Separador visual: "¿No tenés cuenta?"
- Link: "Registrarse como Padre o Estudiante" → /registro
- Nota: "El acceso para docentes y personal es creado por la administración."

Validación: email requerido (formato válido), contraseña requerida (min 6 chars)

useAuth().signIn(email, password) → si error: "Email o contraseña incorrectos."

Al hacer login exitoso:
- Si rol = admin o autoridad → /admin
- Cualquier otro rol → /dashboard

═══════════════════════════════════════════════════════════
PÁGINA 2: src/pages/auth/RegistroPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Solo para registro de Padres y Estudiantes.
 * El personal es creado por el admin.
 * Mismo layout que LoginPage (split).
 */

Formulario:
- Nombre completo* (text)
- DNI* (text, solo números)
- Teléfono de contacto* (text)
- Email* (email)
- Contraseña* (min 8 chars, con indicador de fortaleza)
- Confirmar contraseña* (debe coincidir)
- Soy: (radio buttons con cards visuales)
  → 👨‍👩‍👧 Padre / Madre / Tutor
  → 🎓 Estudiante

Validación Zod completa.

Al registrarse:
useAuth().signUp(email, password, {
  nombre, dni, telefono,
  rol: 'padre' | 'estudiante'
})
→ Redirigir a /dashboard con mensaje: "¡Cuenta creada! Bienvenido/a."

═══════════════════════════════════════════════════════════
PÁGINA 3: src/pages/dashboard/DashboardPage.jsx
═══════════════════════════════════════════════════════════

/**
 * @description Dashboard personalizado según el rol del usuario.
 * Renderiza contenido diferente para cada rol.
 * SIEMPRE con Topbar + Navbar + Footer (usa Layout).
 */

Estructura base de todos los dashboards:
- Saludo personalizado: "Buenos días, [Nombre]" (hora del día real)
- Badge del rol: "Administrador" / "Padre" / "Estudiante" / etc.
- Grid de cards de acceso rápido (varía por rol)

── DASHBOARD ADMIN / AUTORIDAD ──────────────────────────

Bienvenida + estadísticas en 4 cards:
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Opiniones  │  Noticias   │Inscripciones│  Empleos    │
│ pendientes  │ publicadas  │ pendientes  │  activos    │
│    [N]      │    [N]      │    [N]      │    [N]      │
└─────────────┴─────────────┴─────────────┴─────────────┘

Datos con Supabase: COUNT de cada tabla

Accesos rápidos (grid 3x2):
- 💬 Moderar opiniones → /admin/opiniones
- 📰 Gestionar noticias → /admin/noticias
- 🖼️ Gestionar galería → /admin/galeria
- 📋 Ver inscripciones → /admin/inscripciones
- 💼 Gestionar empleos → /admin/empleos
- [Solo Admin] 👥 Gestionar usuarios → /admin/usuarios

Tabla de últimas inscripciones (5 filas): nombre, nivel, fecha, estado (badge)

── DASHBOARD DOCENTE / PERSONAL ─────────────────────────

- Saludo + "Bienvenido al portal institucional de Educar para Transformar"
- 2 cards de acceso:
  → 📰 Noticias internas — "Ver comunicados y novedades institucionales"
  → 📅 Calendario — "Próximas fechas y eventos institucionales"
- Sección de noticias internas (3 más recientes)
  (hook useNoticias con soloPublicas: false — RLS garantiza que solo vea las que le corresponden)
- Nota informativa: "Para consultas o acceso adicional, contactá a la administración."

── DASHBOARD PADRE ──────────────────────────────────────

- Saludo + card de estado de inscripción (si tiene solicitudes enviadas):
  → "Solicitud de inscripción de [Nombre hijo]" + badge estado: Pendiente / En revisión / Aceptada / Rechazada
  → Si Aceptada: confeti animado + "¡Felicitaciones! Tu hijo/a forma parte de nuestra comunidad."
- Card: 📰 Noticias para padres (filtradas por rol)
- Card: 📞 Contacto rápido con la institución (botón WhatsApp)
- Card: 📅 Próximos eventos (noticias con tag "Evento")
- Botón: "Nueva solicitud de inscripción" → /inscripcion

── DASHBOARD ESTUDIANTE ─────────────────────────────────

- Saludo + card de bienvenida
- 📰 Noticias estudiantiles (filtradas por rol 'estudiante')
- 🏆 Próximos torneos y actividades deportivas
- 📚 Información académica general
- Card: "¿Necesitás ayuda?" → contacto con servicio de apoyo estudiantil

═══════════════════════════════════════════════════════════
IMPLEMENTACIÓN DEL DASHBOARD POR ROL
═══════════════════════════════════════════════════════════

En DashboardPage.jsx usar el patrón:
const { profile } = useAuthContext()

// Componente dinámico por rol
const dashboards = {
  admin:      <DashboardAdmin />,
  autoridad:  <DashboardAdmin />,
  docente:    <DashboardPersonal />,
  personal:   <DashboardPersonal />,
  padre:      <DashboardPadre />,
  estudiante: <DashboardEstudiante />,
}

return dashboards[profile?.rol] ?? <DashboardEstudiante />

Cada sub-dashboard es un componente en src/components/dashboard/:
- DashboardAdmin.jsx
- DashboardPersonal.jsx
- DashboardPadre.jsx
- DashboardEstudiante.jsx
```
