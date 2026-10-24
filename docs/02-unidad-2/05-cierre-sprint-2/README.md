# Cierre del Sprint 2 — Review y Retrospectiva

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**
Integrantes: Cerqueiro, Gonzalo — Fernández, Lautaro

| Dato | Valor |
|---|---|
| Sprint | 2 — Calificaciones, personal y trazabilidad |
| Fechas | 29/09/2026 al 13/10/2026 |
| Patrón de diseño comprometido | State |
| Review y Retrospectiva | 24/10/2026 — **once días después de lo planificado** (13/10) |

---

## 1. Sprint Review

### 1.1. Qué se comprometió y qué se entregó

| ID | Trabajo | Puntos | Estado | Observación |
|---|---|---|---|---|
| HU2 | Cargar calificaciones de alumnos | 5 | ✅ Terminada | Los cuatro criterios de aceptación se cumplen. Probada el 21/10 (CP-38 a CP-48). |
| — | Patrón State en la solicitud de inscripción | — | ✅ Terminado | En la aplicación y en la base (`trg_transicion_solicitud`). |
| HU4 | Registrar asistencia diaria (arrastre del Sprint 1) | 3 | ❌ No iniciada | Pasa al Sprint 3. |
| HU6 | Gestionar legajo de personal | 5 | ❌ No iniciada | Pasa al Sprint 3. |
| REQ-20 | Postulaciones laborales | 2 | ❌ No iniciado | Pasa al Sprint 3. |
| REQ-22 | Auditoría | 3 | ❌ No iniciado | Pasa al Sprint 3. |

**Velocidad del sprint: 5 de 18 puntos comprometidos (28 %).** El patrón State no
tenía puntos asignados, pero era el compromiso de diseño del sprint y se cumplió.

### 1.2. Incremento demostrable

Al cerrar el sprint, la institución puede además:

1. Ver cada solicitud de inscripción con **solo las transiciones válidas**: una solicitud
   matriculada queda bloqueada y la base rechaza cualquier cambio hecho por fuera de la
   aplicación.
2. Que cada **docente** vea sus materias en el módulo Profesores (`/docente`) y cargue
   las notas por trimestre, con el promedio calculado por la base.
3. Impedir que un docente que no es el titular cargue notas, tanto en la pantalla como en
   la base.

### 1.3. Lo que apareció al probar (21 y 22/10)

La ejecución de los 48 casos de prueba encontró tres problemas, que se corrigieron antes
de integrar:

| Problema | Corrección |
|---|---|
| El cambio de rol en Usuarios quedaba cargando sin fin al volver a la pestaña | La carga del perfil se difiere fuera del aviso de sesión de Supabase (`useAuth.js`) |
| Un docente al que se le cambiaba el rol seguía viendo las notas de sus materias | `dictados_del_docente()` exige además el rol docente vigente |
| Las fechas sin hora se mostraban un día antes | `formatDate.js` las arma como fecha local |

### 1.4. Integración

HU1, REQ-14, HU2 y el patrón State llegaron a `main` el **22/10**, por los Pull Requests
#1 y #2, y quedaron publicados en Netlify ese mismo día.

---

## 2. Retrospectiva

### 2.1. Qué funcionó

- **HU2 entró completa en una semana.** Estaba planificada para dos y se terminó en la
  primera, porque el modelo del Sprint 1 ya tenía la matrícula y el docente asignado.
- **Validar en las dos capas.** El patrón State en la aplicación y el disparador en la
  base dicen lo mismo; las pruebas por API lo confirmaron.
- **Probar contra la base real.** Los tres errores de la sección 1.3 no se veían
  compilando: aparecieron solo al ejecutar los casos con usuarios de distinto rol.

### 2.2. Qué no funcionó

- **La segunda semana no tuvo avance de código.** Se dedicó a otras entregas de la
  cursada (TP de la Unidad 4 el 06/10) y no se replanificó el sprint.
- **HU4, HU6, REQ-20 y REQ-22 no se iniciaron.** Estaban a cargo del segundo integrante.
- **La integración volvió a quedar para el final.** La acción 3 de la retrospectiva
  anterior ("integrar por PR apenas una tarea está lista") no se cumplió: HU2 estuvo
  terminada desde el 05/10 y llegó a `main` el 22/10.
- **El cierre se hizo tarde.** La Review y la Retrospectiva se documentan el 24/10, once
  días después del fin del sprint.

### 2.3. Cambio en el equipo

Desde el **21/10/2026 el desarrollo lo continúa un solo integrante** (G. Cerqueiro). Las
historias pendientes del segundo integrante pasan a su cargo y el repositorio oficial
sigue siendo el mismo. La revisión cruzada por PR deja de ser posible; la reemplaza la
verificación automática del pipeline de integración continua (Unidad 4).

### 2.4. Acciones para el Sprint 3

| # | Acción | Fecha |
|---|---|---|
| 1 | Concentrar en el Sprint 3 todo el backlog pendiente (HU3, HU4, HU5, HU6, REQ-17, REQ-20 y REQ-22) | 24/10 |
| 2 | Verificar cada push con GitHub Actions (lint, pruebas y build) | 24/10 |
| 3 | Integrar a `main` por PR en cuanto el pipeline pasa, sin esperar al cierre | Durante el sprint |
| 4 | Seguir el avance en un tablero Kanban en GitHub Projects | 25/10 |

---

## 3. Estado del backlog al cerrar el sprint

| ID | Historia de Usuario | Sprint | Estado |
|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | 1 | ✅ Done |
| REQ-14 | Cursos, materias y asignación docente | 1 | ✅ Done |
| HU2 | Cargar calificaciones de alumnos | 2 | ✅ Done |
| HU4 | Registrar asistencia diaria | 1 → 2 → **3** | 🔄 Trasladada |
| HU6 | Gestionar legajo de personal | 2 → **3** | 🔄 Trasladada |
| HU3 | Consultar indicadores institucionales | 3 | To Do |
| HU5 | Enviar comunicado a padres del curso | 3 | To Do |
