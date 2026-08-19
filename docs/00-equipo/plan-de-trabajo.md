# Plan de Trabajo — Proyecto

**Centro Educativo "Educar para Transformar" — Sistema de Gestión**
Metodología de Sistemas II · UTN FRRe · TUP 2026
Equipo: Cerqueiro, Gonzalo — Fernández, Lautaro

> Este documento sigue la estructura del formulario de plan de trabajo entregado por la
> cátedra. Los apartados marcados como *pendiente* son los que todavía hay que completar.

---

## 1. Descripción del proyecto

### Problema

El Centro Educativo *"Educar para Transformar"* es una institución de gestión privada ubicada
en las afueras de Resistencia, con inicio de actividades previsto para **marzo de 2027**.
Necesita automatizar su gestión en tres partes: página web, sistema de gestión y aplicación
móvil.

La **Parte 1 (página web institucional)** se desarrolló y entregó en Metodología de Sistemas I.
Resuelto el canal de comunicación externo, persiste el problema interno: **la información
académica, deportiva y de servicios no está centralizada**. Sin un sistema de gestión, la
matrícula, las calificaciones, la asistencia, los legajos de personal y las inscripciones a
deportes, transporte y comedor se administran de forma dispersa, lo que impide que la
información sea consistente, esté actualizada y pueda consultarse según los permisos de cada rol.

### Objetivo general

Desarrollar un sistema que permita gestionar de manera integrada la información académica,
deportiva y de servicios de los alumnos, facilitando el trabajo de docentes, padres y personal
administrativo, garantizando que la información esté actualizada, sea consistente y pueda
consultarse de acuerdo con los permisos correspondientes.

### Módulos de esta etapa

| Módulo | Alcance |
|---|---|
| Módulo Alumnos | Legajo, DNI, nombre, apellido, fecha de nacimiento, domicilio, teléfono, correo, nivel educativo, curso y estado. |
| Módulo Profesores | Legajo, DNI, nombre, apellido, especialidad, correo, teléfono, estado, materias a cargo y cursos/niveles. |
| Módulo Administración | Alumnos, profesores, niveles, cursos, materias, deportes, horarios, inscripciones, transporte, comedor, usuarios y permisos, más todos los reportes. |

### Clasificación de los requerimientos

Ver [Unidad 1 — Parte 1](../01-unidad-1/01-parte-1-requerimientos/README.md), apartados 1 y 2:
requerimientos REQ-13 a REQ-22, clasificación del sistema de información, arquitectura de la
información y arquitectura de software.

---

## 2. Objetivos SMART

*(pendiente de redacción — formato exigido por la cátedra: específico, medible, alcanzable,
relevante y acotado en el tiempo)*

---

## 3. Tecnologías

| Categoría | Herramienta | Justificación |
|---|---|---|
| Gestión del proyecto | GitHub Projects (tablero Kanban) + Issues | Vive en el mismo repositorio que el código y el portafolio; una HU = un issue. Se registra la bitácora del equipo y la de cada integrante. |
| Repositorio de software | Git + GitHub | Distribuido; ver [Unidad 1 — Parte 2](../01-unidad-1/02-parte-2-repositorios/README.md). |
| Frontend | React 18 + Vite + React Router v6 | SPA con HMR y rutas protegidas por rol. |
| Estilos | Tailwind CSS v3 | Utilidades, responsive, consistente con la Parte 1. |
| Formularios | React Hook Form + Zod | Validación declarativa en cliente. |
| Backend | Supabase (BaaS) | Auth con JWT, API REST automática y Storage, sin servidor propio. |
| Gestor de base de datos | PostgreSQL (Supabase) | Relacional, con Row Level Security para los permisos por rol. |
| Maquetación | Wireframe → mockup → prototipo | *(pendiente para los módulos nuevos)* |
| Despliegue | Netlify (frontend) + Supabase (backend/BD) | Gratuito, despliegue continuo desde `main`. |

### Arquitectura de software

Cliente-servidor en capas. El gráfico y el detalle de componentes, restricciones y conectores
están en [Unidad 1 — Parte 1, apartado 4](../01-unidad-1/01-parte-1-requerimientos/README.md#5-arquitectura-de-software).

---

## 4. Descripción de las actividades

| Etapa | Tareas | Duración (hs) | Resultados esperados | Responsable |
|---|---|---|---|---|
| Planificación del proyecto | Formación del equipo, plan de trabajo, backlog y planificación de sprints | *(pendiente)* | Plan de trabajo y backlog aprobados | Ambos |
| Estudio de requerimientos | REQ-13 a REQ-22, clasificación del SI, arquitecturas, HU, casos de uso y diagramas de secuencia | *(pendiente)* | TP1 – Parte 1 entregado | Ambos |
| Modelado | Modelo relacional de matrícula, cursos, materias, notas, asistencia, personal, deportes y servicios | *(pendiente)* | DER y scripts SQL con RLS | Ambos |
| Diseño | Wireframes y mockups de los módulos Alumnos, Profesores y Administración | *(pendiente)* | Prototipo navegable | Lautaro |
| Codificación | Sprint 1 (HU1, HU2, HU4) y Sprint 2 (HU3, HU5, HU6) | *(pendiente)* | Incremento funcional por sprint | Ambos |
| Pruebas | Pruebas funcionales, de integración y de permisos por rol | *(pendiente)* | Casos de prueba documentados | Ambos |
| Implementación o despliegue | Despliegue en Netlify + Supabase | *(pendiente)* | Sistema desplegado en entorno de pruebas | Ambos |

---

## 5. Cronograma

### Diagrama de Gantt

*(pendiente)*

### Diagrama de PERT

*(pendiente)*

---

## 6. Backlog y plan de sprints

Backlog del producto, backlog de cada sprint, criterios de priorización y estimación, plan
día por día y Definition of Done:
**[Unidad 1 — Backlog y Sprints](../01-unidad-1/03-backlog-y-sprints/README.md)**

Resumen:

| Sprint | Semana | Historias de Usuario | Puntos | Objetivo |
|---|---|---|---|---|
| Sprint 1 | 1 | HU1, HU2, HU4 | 16 (+5 de REQ-14) | Matricular alumnos, cargar notas y registrar asistencia |
| Sprint 2 | 2 | HU6, HU5, HU3 | 15 (+6 de REQ-17, 20 y 22) | Legajos de personal, comunicados y reportes institucionales |

Velocidad estimada: **~21 puntos por sprint**, de los que se reserva alrededor del 25 % para
los requerimientos extra que no forman parte del cuadro del backlog.

---

## 7. Desafío

El enunciado pide **agregar al menos una funcionalidad que genere valor y que no esté
contemplada inicialmente**.

El equipo responde a ese desafío con los **requerimientos extra**: los que exceden las seis
Historias de Usuario seleccionadas y no formaban parte del enunciado original.

| Req. | Funcionalidad que agrega | Valor que genera |
|---|---|---|
| **REQ-14** | Cursos, materias y asignación docente | Organiza la oferta académica y habilita técnicamente la carga de notas y asistencia. |
| **REQ-17** | Boletines y constancias descargables en PDF | Elimina el circuito administrativo manual para emitir documentación oficial. |
| **REQ-20** | Gestión de postulaciones laborales | Da seguimiento por estado a las postulaciones recibidas desde la web (REQ-08). |
| **REQ-22** | Auditoría y trazabilidad de acciones | Registra las acciones críticas de Administrador y Autoridad con usuario, fecha y acción: seguridad y transparencia administrativa. |

Las seis Historias de Usuario (HU1 a HU6) cubren el resto del alcance comprometido.

Estos requerimientos no integran el cuadro del backlog, pero **sí consumen capacidad del
sprint** y por eso se descuentan de la velocidad estimada — ver
[Backlog, sección 6](../01-unidad-1/03-backlog-y-sprints/README.md#6-requerimientos-extra-considerados-en-la-capacidad).

---

## Antecedente: Parte 1 — Página Web (Metodología de Sistemas I)

| Hito | Fecha |
|---|---|
| Documentación de requerimientos | Abril 2026 |
| Primer commit / inicio del repositorio | 15 de mayo de 2026 |
| Frontend completo (páginas, layout, componentes UI) | 15–17 de mayo de 2026 |
| Integración con base de datos (Supabase, RLS, Storage) | 4–5 de junio de 2026 |
| Testing y correcciones | 29 de mayo – 12 de junio de 2026 |
| Funcionalidades finales y ajustes de UI | 12 de junio de 2026 |
| Entrega final | 19 de junio de 2026 |

Equipo en esa etapa: Cerqueiro Gonzalo, Fernández Lautaro y Hakanson Ian (**Grupo 8 — Zonura**).
