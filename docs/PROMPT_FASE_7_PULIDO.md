# 🤖 PROMPT FASE 7 — Pulido final, performance y testing
## Último paso antes de la entrega

---

```
Fase final del proyecto "Educar para Transformar".
Aplicar todas las mejoras de calidad, performance y preparar para el coloquio.

═══════════════════════════════════════════════════════════
TAREA 1: LOADING SKELETONS
═══════════════════════════════════════════════════════════

Crear src/components/ui/Skeleton.jsx:
/**
 * @description Componente de loading skeleton para estados de carga.
 * Reemplaza spinners genéricos con placeholders contextuales.
 */

Variantes a crear:
- <SkeletonCard /> → rectángulo con imagen arriba y líneas abajo (para noticias/galería)
- <SkeletonLine width="full|3/4|1/2" /> → línea de texto
- <SkeletonAvatar /> → círculo (para opiniones)
- <SkeletonTable rows={5} cols={4} /> → tabla con filas vacías

Animación: animate-pulse (Tailwind) con bg-gray-200

Usar en:
- NoticiasSection: mientras carga useNoticias()
- GaleriaPage: mientras carga useGaleria()
- OpinionesSection: mientras carga useOpiniones()
- Todas las tablas del admin mientras cargan

═══════════════════════════════════════════════════════════
TAREA 2: ERROR BOUNDARIES
═══════════════════════════════════════════════════════════

Crear src/components/ui/ErrorMessage.jsx:
/**
 * @description Componente de error amigable.
 * Reemplaza errores técnicos con mensajes en español.
 */

Props: message, onRetry (función para reintentar)

UI:
- Ícono de alerta (ti-alert-circle, naranja)
- Mensaje de error
- Botón "Intentar de nuevo" (si onRetry está presente)

Usar en todos los hooks con estado de error:
{ error && <ErrorMessage message={error} onRetry={() => refetch()} /> }

═══════════════════════════════════════════════════════════
TAREA 3: 404 PAGE
═══════════════════════════════════════════════════════════

src/pages/NotFoundPage.jsx:
- Número "404" grande (Nunito, 120px, color gris claro)
- "Página no encontrada" (24px, gris)
- "La página que buscás no existe o fue movida."
- Botón "← Volver al inicio" (naranja, link a /)
- Animación: fade-in suave

═══════════════════════════════════════════════════════════
TAREA 4: MEJORAS DE PERFORMANCE
═══════════════════════════════════════════════════════════

4.1 Imágenes lazy:
En TODOS los <img> del proyecto agregar:
- loading="lazy"
- width y height definidos (aunque sea aproximado)
- alt descriptivo

4.2 Cancelación de requests en hooks:
En todos los useEffect con fetch de Supabase:
```javascript
useEffect(() => {
  let cancelado = false
  
  async function fetchData() {
    const { data, error } = await supabase.from(...).select(...)
    if (!cancelado) {
      setData(data)
      setError(error?.message)
    }
  }
  
  fetchData()
  return () => { cancelado = true }
}, [dependencias])
```

4.3 Code splitting:
Ya está configurado con React.lazy en App.jsx.
Verificar que NINGUNA página sea importada de forma estática.

4.4 Optimización de queries Supabase:
- Siempre seleccionar solo las columnas necesarias (no usar SELECT *)
- Usar .limit() en todos los listados
- Usar índices (ya están en BASE_DE_DATOS.md)

═══════════════════════════════════════════════════════════
TAREA 5: RESPONSIVE FINAL
═══════════════════════════════════════════════════════════

Verificar y corregir en cada página:

MOBILE (< 768px):
- [ ] Navbar: solo logo + hamburguesa
- [ ] Hero cards: columna vertical, sin float
- [ ] Grids de noticias: 1 columna
- [ ] Grids de servicios: 2 columnas (4 si son iconos pequeños)
- [ ] Footer: 1 columna
- [ ] Formularios: ancho completo
- [ ] Tablas admin: scroll horizontal

TABLET (768px - 1024px):
- [ ] Grids de noticias: 2 columnas
- [ ] Grids de servicios: 3-4 columnas
- [ ] Footer: 2 columnas (logo+links)
- [ ] Navbar: links visibles (reducir padding si no caben)

DESKTOP (> 1024px):
- [ ] Todo según el diseño principal
- [ ] Sidebar admin: 240px fijo
- [ ] Hero: 3 cards flotantes en fila

Herramienta: usar DevTools de Chrome (F12 → toggle device toolbar)
Probar en: 375px (iPhone SE), 768px (iPad), 1280px (desktop)

═══════════════════════════════════════════════════════════
TAREA 6: VARIABLES DE ENTORNO Y DEPLOY
═══════════════════════════════════════════════════════════

Verificar que .env.local está en .gitignore ✓
Verificar que .env.example tiene las variables sin valores ✓

Para deploy en Vercel:
1. git add . && git commit -m "feat: proyecto completo v1.0"
2. git push origin main
3. En Vercel: importar repositorio → agregar env vars → deploy

Verificar que el build funciona: npm run build
Si hay errores de TypeScript/imports, corregirlos antes del push.

═══════════════════════════════════════════════════════════
TAREA 7: SEED DE DATOS PARA DEMO
═══════════════════════════════════════════════════════════

En Supabase SQL Editor, ejecutar para tener datos de demo en el coloquio:

-- Noticias públicas de ejemplo
INSERT INTO noticias (titulo, resumen, contenido, publica, publicada, autor_id) VALUES
(
  'Presentamos las instalaciones del Centro Educativo',
  'Con emoción presentamos las modernas instalaciones que esperan a nuestra comunidad educativa en 2027.',
  'El Centro Educativo "Educar para Transformar" se prepara para abrir sus puertas en marzo de 2027 con instalaciones de primer nivel...',
  true, true, '[UUID-DEL-ADMIN]'
),
(
  'Programa deportivo 2027: 8 disciplinas disponibles',
  'Natación, fútbol, atletismo, artes marciales, vóleibol, danza, básquet y ajedrez para todos los niveles.',
  'Nos enorgullece presentar nuestro programa deportivo integral...',
  true, true, '[UUID-DEL-ADMIN]'
),
(
  'Inscripciones abiertas para el ciclo 2027',
  'Ya podés solicitar tu inscripción para Nivel Inicial, Primario y Secundario.',
  'Las inscripciones para el ciclo lectivo 2027 ya están abiertas...',
  true, true, '[UUID-DEL-ADMIN]'
);

-- Opiniones aprobadas de ejemplo
INSERT INTO opiniones (autor_nombre, texto, estado) VALUES
('María González', 'Una institución que realmente se preocupa por el desarrollo integral. Las instalaciones son increíbles.', 'aprobada'),
('Carlos Romero', 'El programa de idiomas desde el nivel inicial es único en Resistencia. Muy buena propuesta educativa.', 'aprobada'),
('Laura Acosta', 'Las instalaciones deportivas y los laboratorios marcan una diferencia enorme. Excelente proyecto.', 'aprobada');

-- Empleo de ejemplo
INSERT INTO empleos (titulo, descripcion, requisitos, contacto_email, fecha_limite, publicado_por) VALUES
(
  'Docente de Nivel Primario',
  'Buscamos docentes comprometidos con la educación de calidad para incorporarse al equipo de nivel primario a partir de marzo de 2027.',
  'Título docente habilitante para nivel primario
Experiencia mínima 2 años en el nivel
Capacidad de trabajo en equipo
Disponibilidad para jornada extendida',
  'rrhh@educarparatransformar.edu.ar',
  '2026-12-31',
  '[UUID-DEL-ADMIN]'
);

Reemplazar [UUID-DEL-ADMIN] con el UUID real del usuario admin creado.

═══════════════════════════════════════════════════════════
TAREA 8: CHECKLIST FINAL DEL COLOQUIO
═══════════════════════════════════════════════════════════

Antes de presentar, verificar que funciona:

PÚBLICO (sin login):
[ ] Homepage carga con hero, noticias, niveles, servicios, opiniones, CTA
[ ] Galería filtra por categoría
[ ] Formulario de inscripción valida y guarda en BD
[ ] Formulario de contacto valida y guarda en BD
[ ] Formulario de opinión guarda en BD con estado 'pendiente'
[ ] Noticias lista y detalle funcionan

AUTH:
[ ] Registro de padre y estudiante funciona
[ ] Login correcto redirige al dashboard del rol
[ ] Login incorrecto muestra error
[ ] Logout funciona

DASHBOARD POR ROL:
[ ] Admin ve estadísticas reales de la BD
[ ] Padre ve estado de su inscripción
[ ] Estudiante ve noticias internas estudiantiles

PANEL ADMIN:
[ ] Moderar opinión (aprobar → aparece en el sitio)
[ ] Crear noticia pública → aparece en /noticias
[ ] Subir imagen a galería → aparece en /galeria
[ ] Ver y cambiar estado de inscripción

SEGURIDAD:
[ ] Ir a /admin sin login → redirige a /login
[ ] Ir a /admin con login de padre → redirige a /dashboard
[ ] Opinión pendiente NO aparece en el sitio público
[ ] Noticia interna NO aparece si no hay sesión

RESPONSIVE:
[ ] Ver en 375px: navbar hamburguesa funciona
[ ] Ver en 375px: formularios y grids se adaptan
[ ] Footer responsive correctamente
```
