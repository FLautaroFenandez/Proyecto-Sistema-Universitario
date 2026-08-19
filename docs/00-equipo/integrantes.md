# Integrantes y roles

**Materia:** Metodología de Sistemas II — UTN FRRe · TUP 2026
**Proyecto:** Centro Educativo *"Educar para Transformar"* — Parte 2: Sistema de Gestión

---

## Equipo

| Integrante | Email institucional | Rol en Scrum |
|---|---|---|
| Cerqueiro, Gonzalo | gonzalo.cerqueiro@frre.utn.edu.ar | Development Team |
| Fernández, Lautaro | lautaro.fernandez@frre.utn.edu.ar | Development Team |

Equipo de dos integrantes. En Metodología de Sistemas I el equipo era de tres
(**Grupo 8 — Zonura**, con Ian Hakanson); en esta segunda etapa continúa con dos.

---

## Cómo se reparte el trabajo

En Metodología I la división era **por archivo y carpeta** (arquitectura / base de datos /
frontend). En Metodología II la división es **por Historia de Usuario**: cada integrante es
dueño de sus HU de punta a punta — modelo de datos, políticas RLS, lógica, interfaz y pruebas.

El motivo es que Scrum organiza el sprint por incrementos de valor entregables, no por capas
técnicas: una HU se considera terminada cuando el usuario puede usarla, y eso exige atravesar
todas las capas.

### Gonzalo Cerqueiro

| HU | Historia de Usuario | Req. | Rol usuario | Sprint | Puntos |
|---|---|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | REQ-13 | Administrador | 1 | 8 |
| HU2 | Cargar calificaciones de alumnos | REQ-15 | Docente | 1 | 5 |
| HU3 | Consultar indicadores institucionales | REQ-21 | Autoridad | 2 | 8 |

Además: REQ-17 (boletines y constancias en PDF), como requerimiento extra del Sprint 2.

### Lautaro Fernández

| HU | Historia de Usuario | Req. | Rol usuario | Sprint | Puntos |
|---|---|---|---|---|---|
| HU4 | Registrar asistencia diaria | REQ-16 | Docente | 1 | 3 |
| HU6 | Gestionar legajo de personal | REQ-19 | Administrador | 2 | 5 |
| HU5 | Enviar comunicado a padres del curso | REQ-18 | Docente | 2 | 2 |

Además: REQ-20 (postulaciones laborales), como requerimiento extra del Sprint 2.

### Trabajo compartido

| Req. | Descripción | Sprint |
|---|---|---|
| REQ-14 | Cursos, materias y asignación docente — precondición técnica de HU2 y HU4 | 1 |
| REQ-22 | Auditoría — transversal a todas las HU | 2 |

También son compartidos la configuración del proyecto, el sistema de autenticación y los
componentes de interfaz reutilizables heredados de la Parte 1.

---

## Trazabilidad del aporte individual

Se sostiene por tres vías, todas exigidas por la cátedra:

1. **Autoría de los commits** — el autor de git se configura según la HU que avanza el cambio.
2. **Scope del mensaje de commit** — `feat(HU1): ...` permite filtrar el historial por HU.
3. **Tablero Kanban** — se registra la bitácora del equipo y la de cada integrante.

---

## Herencia de Metodología de Sistemas I

Al bajar de tres a dos integrantes, las responsabilidades de Ian Hakanson quedaron sin dueño
fijo y pasaron a mantenimiento compartido:

| Área | Archivos |
|---|---|
| Cliente Supabase | `src/lib/supabase.js` |
| Autenticación y roles | `src/hooks/useAuth.js`, `src/hooks/useRole.js`, `src/components/auth/` |
| Rutas y enums | `src/App.jsx`, `src/types/roles.js`, `src/types/routes.js` |
| Configuración | `vite.config.js`, `tailwind.config.js`, `package.json` |
| Login y registro | `src/pages/auth/` |

Ninguna de estas áreas se reescribe en esta etapa: se extienden según lo que pida cada HU.
