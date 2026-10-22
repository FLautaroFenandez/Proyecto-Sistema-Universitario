# INSTRUCCIONES PARA CLAUDE CODE
## Proyecto: Centro Educativo "Educar para Transformar"
## Metodología de Sistemas II — UTN FRRe · TUP 2026

---

## CONTEXTO: DÓNDE ESTAMOS PARADOS

Este repositorio arrancó en **Metodología de Sistemas I** con la **Parte 1 — Página Web
institucional**, que está **terminada y desplegada**. Metodología de Sistemas II **continúa el
mismo proyecto**, no lo reemplaza: se construye encima el **Sistema de Gestión (Parte 2)** y,
más adelante, la **App móvil (Parte 3)**.

| Parte | Qué es | Estado |
|---|---|---|
| Parte 1 — Página Web | Sitio institucional público + auth por roles + panel admin de contenido | ✅ Terminada (MDS I) |
| Parte 2 — Sistema de Gestión | Matrícula, cursos/materias, calificaciones, asistencia, personal, comunicados, reportes | 🔨 En desarrollo (MDS II) |
| Parte 3 — App móvil | — | ⏳ No iniciada |

**Consecuencia práctica:** no romper lo que ya funciona. Todo lo nuevo se agrega
reutilizando el stack, los roles, el layout y las convenciones que ya existen.

---

## QUÉ CAMBIÓ RESPECTO DE METODOLOGÍA I

1. **El equipo pasó de 3 a 2 integrantes.** Ian Hakanson no continúa. Los archivos que él
   mantenía (auth, Supabase, arquitectura) ahora quedan bajo responsabilidad compartida.
2. **La división del trabajo ya no es por archivo/carpeta, sino por Historia de Usuario.**
   Cada integrante es dueño de sus HU de punta a punta: base de datos, backend, UI y pruebas.
3. **Se trabaja con Scrum**: backlog del producto, sprints de una semana, tablero Kanban,
   Definition of Done y revisión cruzada por Pull Request.
4. **El repositorio también es el portafolio digital** de la cursada: la documentación de cada
   unidad y parte vive en `docs/` en Markdown.

---

## INTEGRANTES

```
Gonzalo Cerqueiro  → gonzalo.cerqueiro@frre.utn.edu.ar
Lautaro Fernández  → lautaro.fernandez@frre.utn.edu.ar
```

> Verificar que estos emails coincidan con el email primario de GitHub de cada uno
> (GitHub → Settings → Emails), o el avatar no aparece en el historial de commits.

---

## MAPA DE RESPONSABILIDADES — POR HISTORIA DE USUARIO

Esta es la tabla que hay que mirar para saber a quién se le atribuye un cambio.
El criterio es **la HU que el cambio hace avanzar**, no el archivo que se tocó.

### GONZALO CERQUEIRO

| HU | Historia de Usuario | Req. | Rol | Sprint | Pts |
|---|---|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | REQ-13 | Administrador | 1 | 8 |
| HU2 | Cargar calificaciones de alumnos | REQ-15 | Docente | 1 | 5 |
| HU3 | Consultar indicadores institucionales | REQ-21 | Autoridad | 2 | 8 |

### LAUTARO FERNÁNDEZ

| HU | Historia de Usuario | Req. | Rol | Sprint | Pts |
|---|---|---|---|---|---|
| HU4 | Registrar asistencia diaria | REQ-16 | Docente | 1 | 3 |
| HU6 | Gestionar legajo de personal | REQ-19 | Administrador | 2 | 5 |
| HU5 | Enviar comunicado a padres del curso | REQ-18 | Docente | 2 | 2 |

### REQUERIMIENTOS EXTRA (fuera del cuadro de HU, consumen capacidad del sprint)

| Req. | Descripción | Sprint | Responsable |
|---|---|---|---|
| REQ-14 | Cursos, materias y asignación docente — precondición de HU2 y HU4 | 1 (~5 pts) | Compartido |
| REQ-17 | Boletines y constancias en PDF | 2 (~2 pts) | Gonzalo |
| REQ-20 | Postulaciones laborales (mismo módulo que HU6) | 2 (~2 pts) | Lautaro |
| REQ-22 | Auditoría — transversal a todas las HU | 2 (~2 pts) | Compartido |

### TRANSVERSAL (sin dueño fijo — atribuir a quien lo haga)

```
src/lib/supabase.js                    · cliente Supabase
src/hooks/useAuth.js, useRole.js       · sesión y roles
src/components/auth/*                  · AuthContext, ProtectedRoute
src/App.jsx, src/types/*               · rutas y enums de roles
src/components/ui/*, layout/*          · componentes base ya existentes
vite.config.js, tailwind.config.js     · configuración
docs/**                                · portafolio digital
```

---

## CÓMO SE HACEN LOS COMMITS

**Los commits y el push los hace el usuario**, no Claude Code. Al terminar una unidad de
trabajo, Claude deja los archivos listos y **propone el mensaje de commit** (y el `git config`
de autor que corresponda), pero **no ejecuta `git commit` ni `git push`** salvo pedido explícito.

### Formato del mensaje

```
<tipo>(<scope>): <descripción en español, en presente>
```

El **scope** identifica la HU o la etapa del portafolio:

```
feat(HU1): listar solicitudes aprobadas en el panel de matriculación
feat(HU2): calcular el promedio del período al guardar las notas
fix(HU4): evitar duplicado de asistencia en la misma fecha
feat(REQ-14): ABM de cursos, materias y asignación docente
docs(U1-P2): agregar cuadro de conceptos de repositorios
chore: actualizar .gitignore con los documentos de la cursada
```

### Tipos permitidos

```
feat:     nueva funcionalidad
fix:      corrección de un bug
style:    cambios visuales / Tailwind, sin cambiar lógica
refactor: reestructuración de código existente
docs:     documentación y portafolio
chore:    configuración, dependencias, setup
test:     casos de prueba
sql:      cambios en el esquema, RLS o triggers de la base de datos
```

### Autor del commit

Antes de commitear, el autor se configura según **la HU que avanza el cambio**:

```bash
# Si el cambio avanza HU1, HU2, HU3 o REQ-17:
git config user.name "Gonzalo Cerqueiro"
git config user.email "gonzalo.cerqueiro@frre.utn.edu.ar"

# Si el cambio avanza HU4, HU5, HU6 o REQ-20:
git config user.name "Lautaro Fernández"
git config user.email "lautaro.fernandez@frre.utn.edu.ar"
```

Si el trabajo fue conjunto (transversal, REQ-14, REQ-22):

```bash
git commit -m "feat(REQ-14): ABM de cursos, materias y asignación docente

Co-authored-by: Lautaro Fernández <lautaro.fernandez@frre.utn.edu.ar>"
```

### Cuándo commitear

Una unidad lógica cerrada y que compila: una tarea técnica de la HU, un hook, una pantalla,
un fix puntual, una migración SQL, un documento del portafolio.
**Nunca** código a medio hacer, ni todo junto al final, ni mensajes genéricos tipo "cambios".

---

## FLUJO DE TRABAJO GIT (SCRUM)

### Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable, correspondiente a lo entregado a la cátedra. |
| `develop` | Rama de integración del equipo. |
| `feature/HU1-matricula` | Una rama por Historia de Usuario. |
| `docs/unidad-1-parte-2` | Ramas de documentación del portafolio. |

### Pull Requests

Toda rama se integra por PR **revisado por el otro integrante**. El *code review* cruzado es
parte de la Definition of Done: sin review, la HU no está terminada.

### Tags

Se etiqueta el cierre de cada sprint y de cada entrega: `sprint-1`, `sprint-2`, `entrega-u1-p2`.

### Issues y Projects

Cada HU del backlog se carga como *issue* y se sigue en un tablero Kanban
(To Do / In Progress / Done). La cátedra pide mostrar la bitácora del tablero
**del equipo y de cada integrante** en la presentación final.

---

## DEFINITION OF DONE

Una HU está terminada cuando cumple **todos** estos puntos:

- [ ] Todos los criterios de aceptación de la HU se cumplen.
- [ ] Pruebas funcionales y de integración superadas.
- [ ] Permisos por rol verificados con políticas RLS en la base de datos.
- [ ] Código subido al repositorio y revisado por el otro integrante (PR).
- [ ] Funcionalidad desplegada en el entorno de pruebas (Netlify + Supabase).
- [ ] Documentación de la HU actualizada en `docs/`.

---

## STACK TECNOLÓGICO (no cambiarlo sin acordarlo)

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Estilos | Tailwind CSS v3 |
| Formularios | React Hook Form + Zod |
| Auth · API · Storage | Supabase |
| Base de datos | PostgreSQL (Supabase) con Row Level Security |
| Deploy | Netlify (frontend) + Supabase (backend/BD) |
| Íconos · animación | Lucide React · Framer Motion |

---

## REGLAS DE DESARROLLO

1. **Seguridad por rol siempre en dos capas:** RLS en la base de datos *y* verificación en la
   UI. La UI sola no alcanza — la cátedra evalúa que cada rol acceda solo a lo suyo.
2. **Reutilizar los componentes existentes** de `src/components/ui/` y `src/components/admin/`
   (Button, Card, Badge, Modal, DataTable, StatsCard) antes de crear otros nuevos.
3. **Rutas y roles por constante**, nunca strings sueltos: usar `src/types/routes.js` y
   `src/types/roles.js`.
4. **Todo cambio de esquema va a un archivo `.sql` versionado** en `docs/` (o `database/`),
   idempotente, con sus políticas RLS incluidas.
5. **El sistema de gestión no rompe la web pública.** Las páginas de `src/pages/public/` y el
   panel de contenido siguen funcionando igual.

---

## REGLAS DE LA BASE DE DATOS (del enunciado del TP)

Estas restricciones son requisito del trabajo integrador y hay que respetarlas en el modelo:

- Cada alumno pertenece a **un único curso**; cada curso a **un único nivel educativo**.
- Una materia puede dictarse en **distintos cursos** y tener **distinto profesor según el curso**.
- Cada alumno puede inscribirse a **dos deportes como máximo, simultáneamente**.
- Cada deporte tiene **un profesor responsable** y puede tener **grupos por nivel y horario**.
- El sistema debe **controlar conflictos de horario** entre las actividades deportivas elegidas.
- El servicio de transporte tiene **cuatro recorridos**.
- Un padre puede tener **uno o varios hijos** asociados y **solo consulta y gestiona los suyos**.
- El sistema debe **evitar inscripciones duplicadas**.

---

## PORTAFOLIO DIGITAL

La documentación de la cursada vive en `docs/`, ordenada por unidad y parte.
El índice y el criterio de organización están en **`docs/PORTAFOLIO.md`** — leerlo antes de
agregar documentación nueva y actualizar su índice de etapas cuando se cierre una entrega.

Los `.docx`, `.pdf` y `.html` de trabajo **están en `.gitignore`**: al repositorio sube la
**conversión a Markdown**, para que GitHub la renderice y quede versionada línea por línea.

---

## EL DESAFÍO DEL ENUNCIADO

El enunciado pide agregar al menos una funcionalidad de valor no contemplada inicialmente. El
equipo responde con los **requerimientos extra** (REQ-14, REQ-17, REQ-20 y REQ-22), que exceden
las seis HU seleccionadas. No integran el cuadro del backlog pero sí consumen capacidad del
sprint, así que hay que tratarlos como trabajo comprometido, no como "si sobra tiempo".

---

## NOTAS ABIERTAS

- El **plan de trabajo está completo**: objetivos SMART, cronograma con duraciones, Gantt y PERT
  con ruta crítica (ver `docs/00-equipo/plan-de-trabajo.md`). La versión entregada a la cátedra
  es `Metodología de Sistemas II/PlanDeTrabajo_Metodología2_Grupo4.docx`.
- **El equipo es el Grupo 4** en Metodología II. En Metodología I fue el Grupo 8 — Zonura; las
  referencias históricas a ese nombre no se tocan.
- **El DER del Sistema de Gestión está hecho para el Sprint 1** (cursos, materias, matrícula,
  legajo y asistencia): ver `docs/02-unidad-2/01-modelado/README.md` y el script
  `docs/supabase-gestion.sql`. **Ya está ejecutado en Supabase** junto con
  `docs/supabase-gestion-datos.sql` (carga inicial: ciclo 2027, niveles, cursos, materias y
  solicitudes de prueba). Quedan sin modelar calificaciones, personal, deportes, transporte y
  comedor: entran con las HU de los sprints 2 y 3.
- **El módulo Administrador está construido** (HU1 + REQ-14): pantallas de Matriculación,
  Alumnos y Cursos y materias, documentadas en
  `docs/02-unidad-2/02-modulo-administrador/README.md`. Todo acceso a datos nuevo pasa por la
  **capa de servicios `src/services/` (patrón Facade)**: las pantallas nuevas no importan
  `@/lib/supabase` y las de la Parte 1 se migran en el Sprint 2.
- **El Sprint 1 cerró con 13 de 16 puntos**: se entregaron HU1 y REQ-14; **HU4 (asistencia
  diaria) no se inició y se trasladó al Sprint 2** como primer ítem. La Review, la
  Retrospectiva y la deuda técnica registrada están en
  `docs/02-unidad-2/03-cierre-sprint-1/README.md`; los casos de prueba, en
  `docs/02-unidad-2/02-modulo-administrador/pruebas.md` (faltan ejecutar los de permisos por rol).
- `docs/GUIA_DEPLOY.md` quedó desactualizada: describe un deploy en Vercel, pero el proyecto se
  publica en **Netlify** (hay `netlify.toml` y `public/_redirects`).
- La estructura `src/web`, `src/gestion`, `src/app` que describe `docs/PORTAFOLIO.md` es el
  **estado objetivo**; hoy el código de la web está en `src/` sin ese prefijo. Migrar recién
  cuando arranque la Parte 3, en un commit propio de `refactor:`.
