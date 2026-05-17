# INSTRUCCIONES PARA CLAUDE CODE
## Proyecto: Centro Educativo "Educar para Transformar"
## Grupo 8 — Zonura · UTN FRRe TUP · Metodología de Sistemas I

---

## REGLA PRINCIPAL — COMMITS AUTOMÁTICOS

**Cada vez que termines una unidad lógica de trabajo, hacé un commit.**
No esperes a que te lo pida. Un componente terminado = un commit. Una página terminada = un commit. Una funcionalidad completa = un commit.

---

## INTEGRANTES Y SUS RESPONSABILIDADES

Estos son los 3 integrantes del equipo. Según qué parte del proyecto estés construyendo, el commit debe ir con el nombre y email del responsable de esa parte.

```
Ian Hakanson       → ian.hakanson@frre.utn.edu.ar
Gonzalo Cerqueiro  → gonzalo.cerqueiro@frre.utn.edu.ar
Lautaro Fernández  → lautaro.fernandez@frre.utn.edu.ar
```

> IMPORTANTE: Reemplazar los emails con los reales de GitHub de cada uno antes de usar.

---

## MAPA DE RESPONSABILIDADES POR ARCHIVO/CARPETA

Usá esta tabla para saber QUÉ nombre poner en cada commit:

### IAN HAKANSON — Arquitectura, Auth, Supabase, Backend

```
src/lib/supabase.js                    → IAN
src/hooks/useAuth.js                   → IAN
src/hooks/useRole.js                   → IAN
src/components/auth/AuthContext.jsx    → IAN
src/components/auth/ProtectedRoute.jsx → IAN
src/App.jsx                            → IAN
src/types/roles.js                     → IAN
src/types/routes.js                    → IAN
vite.config.js                         → IAN
tailwind.config.js                     → IAN
src/styles/globals.css                 → IAN
docs/ARQUITECTURA.md                   → IAN
docs/GUIA_SUPABASE.md                  → IAN
docs/BASE_DE_DATOS.md                  → IAN
.env.example                           → IAN
package.json                           → IAN
src/pages/auth/LoginPage.jsx           → IAN
src/pages/auth/RegistroPage.jsx        → IAN
src/pages/admin/UsuariosAdminPage.jsx  → IAN
src/hooks/useInscripciones.js          → IAN
src/utils/uploadImage.js               → IAN
```

### GONZALO CERQUEIRO — Base de datos, Panel admin, Testing

```
src/pages/admin/AdminPage.jsx              → GONZALO
src/pages/admin/OpinionesAdminPage.jsx     → GONZALO
src/pages/admin/InscripcionesAdminPage.jsx → GONZALO
src/pages/admin/EmpleosAdminPage.jsx       → GONZALO
src/components/admin/AdminLayout.jsx       → GONZALO
src/components/admin/AdminSidebar.jsx      → GONZALO
src/components/admin/DataTable.jsx         → GONZALO
src/components/admin/StatsCard.jsx         → GONZALO
src/pages/dashboard/DashboardPage.jsx      → GONZALO
src/components/dashboard/DashboardAdmin.jsx → GONZALO
src/components/dashboard/DashboardPersonal.jsx → GONZALO
docs/TESTING.md                            → GONZALO
docs/REQUERIMIENTOS.md                     → GONZALO
src/hooks/useOpiniones.js                  → GONZALO
src/utils/formatDate.js                    → GONZALO
src/utils/truncateText.js                  → GONZALO
```

### LAUTARO FERNÁNDEZ — Frontend, UI, Maquetado, Páginas públicas

```
src/components/layout/Topbar.jsx           → LAUTARO
src/components/layout/Navbar.jsx           → LAUTARO
src/components/layout/Footer.jsx           → LAUTARO
src/components/layout/Layout.jsx           → LAUTARO
src/components/ui/Button.jsx               → LAUTARO
src/components/ui/Card.jsx                 → LAUTARO
src/components/ui/Badge.jsx                → LAUTARO
src/components/ui/Spinner.jsx              → LAUTARO
src/components/ui/Modal.jsx                → LAUTARO
src/components/ui/Skeleton.jsx             → LAUTARO
src/components/sections/HeroSection.jsx    → LAUTARO
src/components/sections/NoticiasSection.jsx → LAUTARO
src/components/sections/NivelesSection.jsx  → LAUTARO
src/components/sections/ServiciosSection.jsx → LAUTARO
src/components/sections/OpinionesSection.jsx → LAUTARO
src/components/sections/CTASection.jsx      → LAUTARO
src/components/sections/GaleriaSection.jsx  → LAUTARO
src/pages/public/HomePage.jsx               → LAUTARO
src/pages/public/QuienesSomosPage.jsx       → LAUTARO
src/pages/public/NivelesPage.jsx            → LAUTARO
src/pages/public/BienestarPage.jsx          → LAUTARO
src/pages/public/NoticiasPage.jsx           → LAUTARO
src/pages/public/NoticiaDetallePage.jsx     → LAUTARO
src/pages/public/GaleriaPage.jsx            → LAUTARO
src/pages/public/InscripcionPage.jsx        → LAUTARO
src/pages/public/EmpleoPage.jsx             → LAUTARO
src/pages/public/ContactoPage.jsx           → LAUTARO
src/pages/NotFoundPage.jsx                  → LAUTARO
src/pages/admin/NoticiasAdminPage.jsx       → LAUTARO
src/pages/admin/GaleriaAdminPage.jsx        → LAUTARO
src/components/dashboard/DashboardPadre.jsx → LAUTARO
src/components/dashboard/DashboardEstudiante.jsx → LAUTARO
src/hooks/useNoticias.js                    → LAUTARO
src/hooks/useGaleria.js                     → LAUTARO
docs/GUIA_DISENO_UX.md                      → LAUTARO
README.md                                   → LAUTARO
```

---

## CÓMO HACER CADA COMMIT

### Paso 1 — Identificar al responsable

Mirá qué archivo(s) terminaste de crear o modificar y buscalos en la tabla de arriba.

### Paso 2 — Cambiar el autor de git ANTES del commit

```bash
# Si el responsable es IAN:
git config user.name "Ian Hakanson"
git config user.email "ian.hakanson@frre.utn.edu.ar"

# Si el responsable es GONZALO:
git config user.name "Gonzalo Cerqueiro"
git config user.email "gonzalo.cerqueiro@frre.utn.edu.ar"

# Si el responsable es LAUTARO:
git config user.name "Lautaro Fernández"
git config user.email "lautaro.fernandez@frre.utn.edu.ar"
```

### Paso 3 — Agregar y commitear

```bash
git add [archivos del responsable]
git commit -m "[tipo]: [descripción clara en español]"
```

### Paso 4 — Si el trabajo fue conjunto, agregar co-autores

```bash
git commit -m "feat: implementar sistema de autenticación con roles

Co-authored-by: Gonzalo Cerqueiro <gonzalo.cerqueiro@frre.utn.edu.ar>"
```

---

## TIPOS DE COMMIT (Conventional Commits)

Usá siempre uno de estos prefijos:

```
feat:     nueva funcionalidad o componente
fix:      corrección de un bug
style:    cambios de estilos CSS/Tailwind (sin cambiar lógica)
refactor: reestructuración de código existente
docs:     cambios en documentación
chore:    configuración, dependencias, archivos de setup
test:     casos de prueba
```

---

## EJEMPLOS DE MENSAJES DE COMMIT BIEN ESCRITOS

```bash
# Setup inicial — IAN
git commit -m "chore: inicializar proyecto Vite + React con Tailwind y dependencias"

# Supabase — IAN
git commit -m "feat: configurar cliente Supabase y hook useAuth con persistencia de sesión"

# Auth context — IAN
git commit -m "feat: implementar AuthContext y ProtectedRoute con verificación de roles"

# Navbar — LAUTARO
git commit -m "feat: agregar Navbar responsive con menú hamburguesa en mobile"

# Hero section — LAUTARO
git commit -m "feat: implementar HeroSection con cards flotantes estilo UNCAUS"

# Homepage — LAUTARO
git commit -m "feat: construir HomePage con todas las secciones (hero, noticias, niveles, servicios, opiniones, CTA)"

# Formulario inscripción — LAUTARO
git commit -m "feat: agregar formulario de inscripción con validación Zod y confirmación"

# Panel admin — GONZALO
git commit -m "feat: crear AdminLayout con sidebar y header del panel de administración"

# Moderación — GONZALO
git commit -m "feat: implementar moderación de opiniones (aprobar, rechazar, eliminar)"

# Base de datos — GONZALO
git commit -m "docs: agregar modelo relacional completo con SQL, RLS y triggers"

# Login page — IAN
git commit -m "feat: agregar LoginPage con diseño split y manejo de errores"

# Galería admin — LAUTARO
git commit -m "feat: agregar gestión de galería con drag & drop y upload a Supabase Storage"

# Fix — quien lo corrija
git commit -m "fix: corregir validación de DNI en formulario de inscripción"
```

---

## FRECUENCIA DE COMMITS

Commitear cuando termines UNA de estas unidades:
- Un componente completo y funcionando
- Un hook completo
- Una página completa
- Un fix puntual
- La configuración de setup (un solo commit al inicio)

NO commitear:
- Código a medio hacer que no compila
- TODO junto al final de la sesión de trabajo
- Con mensaje genérico tipo "cambios" o "update"

---

## FLUJO TÍPICO DE UNA SESIÓN

```bash
# 1. Al empezar, verificar en qué rama estás
git status

# 2. Crear rama si estás trabajando en una feature nueva (opcional)
git checkout -b feature/galeria-imagenes

# 3. Trabajar... terminar un componente...

# 4. Configurar el autor que corresponde según la tabla
git config user.name "Lautaro Fernández"
git config user.email "lautaro.fernandez@frre.utn.edu.ar"

# 5. Commitear solo los archivos de ese autor
git add src/components/sections/GaleriaSection.jsx
git commit -m "feat: agregar GaleriaSection con filtro por categoría y lazy loading"

# 6. Si el próximo archivo es de otro integrante, cambiar config
git config user.name "Ian Hakanson"
git config user.email "ian.hakanson@frre.utn.edu.ar"
git add src/hooks/useGaleria.js
git commit -m "feat: hook useGaleria con filtro por categoría y manejo de errores"

# 7. Al terminar la sesión, pushear todo
git push origin main
```

---

## NOTA IMPORTANTE

Antes de empezar a construir el proyecto, actualizá los emails en este archivo
con los emails REALES de GitHub de cada integrante.

Si el email no coincide con la cuenta de GitHub, el avatar no va a aparecer
en el historial de commits aunque el nombre esté bien.

Para saber el email de GitHub de cada uno:
GitHub → Settings → Emails → Primary email address
