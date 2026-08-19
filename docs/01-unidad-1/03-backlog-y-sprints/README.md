# Backlog del Producto y Planificación de Sprints

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"*
Integrantes: Cerqueiro, Gonzalo — Fernández, Lautaro

---

## 1. Backlog del Producto

El backlog reúne las seis Historias de Usuario desarrolladas en el punto 5 del
[TP1 — Parte 1](../01-parte-1-requerimientos/README.md) (tres por integrante), ordenadas por
prioridad de negocio y por dependencia funcional, evitando que haya bloqueantes entre los
requerimientos.

| ID | Historia de Usuario | Rol / Usuario | Req. | Responsable | Prioridad | Riesgo | Puntos | Sprint | Estado |
|---|---|---|---|---|---|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | Administrador | REQ-13 | G. Cerqueiro | Alta | Medio | 8 | Sprint 1 | To Do |
| HU2 | Cargar calificaciones de alumnos | Docente | REQ-15 | G. Cerqueiro | Alta | Bajo | 5 | Sprint 1 | To Do |
| HU4 | Registrar asistencia diaria | Docente | REQ-16 | L. Fernández | Alta | Bajo | 3 | Sprint 1 | To Do |
| HU3 | Consultar indicadores institucionales | Autoridad | REQ-21 | G. Cerqueiro | Media | Medio | 8 | Sprint 2 | To Do |
| HU6 | Gestionar legajo de personal | Administrador | REQ-19 | L. Fernández | Media | Medio | 5 | Sprint 2 | To Do |
| HU5 | Enviar comunicado a padres del curso | Docente | REQ-18 | L. Fernández | Media | Bajo | 2 | Sprint 2 | To Do |

---

## 2. Detalle del Backlog: tareas técnicas y criterios de aceptación

### HU1 — Matricular alumno desde solicitud aprobada (REQ-13)

**Tareas técnicas**
1. Modelar tablas de matrícula y legajo digital en la BD (con RLS).
2. Listar solicitudes de inscripción en estado "aprobada".
3. Formulario de asignación de curso/división.
4. Validar datos obligatorios antes de confirmar.
5. Generar el legajo y cambiar el estado a "matriculado".

**Criterios de aceptación**
- Solicitud aprobada + curso asignado → matrícula confirmada y legajo generado.
- Faltan datos obligatorios → el sistema los solicita y no confirma.
- La solicitud queda en estado "matriculado" y no puede duplicarse.
- Solo el rol Administrador accede al panel de matriculación.

### HU2 — Cargar calificaciones de alumnos (REQ-15)

**Tareas técnicas**
1. Modelar notas por alumno, materia y período.
2. Pantalla de carga de notas por curso y materia.
3. Validar el rango válido de la nota.
4. Calcular el promedio del período al guardar.
5. Restringir por RLS al docente titular de la materia.

**Criterios de aceptación**
- El docente titular carga y edita notas de su materia.
- Nota fuera de rango → se rechaza con mensaje de corrección.
- Al guardar, el promedio del período se recalcula automáticamente.
- Un docente no titular no puede editar notas ajenas.

### HU4 — Registrar asistencia diaria (REQ-16)

**Tareas técnicas**
1. Modelar asistencia (alumno, fecha, estado).
2. Listado de alumnos por curso y fecha seleccionada.
3. Marcado presente/ausente y guardado del registro.
4. Permitir edición si ya existe carga para esa fecha.
5. Vista de consulta para los roles Padre y Estudiante.

**Criterios de aceptación**
- La asistencia del día queda registrada por alumno.
- Fecha ya cargada → se edita, no se duplica.
- Padre y Estudiante visualizan el registro de asistencia.
- Solo el docente asignado al curso puede cargarla.

### HU3 — Consultar indicadores institucionales (REQ-21)

**Tareas técnicas**
1. Construir consultas agregadas de matrícula, asistencia y rendimiento.
2. Filtro por período y por tipo de indicador.
3. Panel de reportes (tabla + gráfico).
4. Exportación del reporte a PDF.
5. Restringir el acceso al rol Autoridad.

**Criterios de aceptación**
- El reporte se actualiza según el período seleccionado.
- Los datos son consistentes con matrícula, asistencia y notas cargadas.
- Sin datos en el período → mensaje "sin datos disponibles".
- El reporte visualizado puede exportarse a PDF.

### HU6 — Gestionar legajo de personal (REQ-19)

**Tareas técnicas**
1. Modelar el legajo de personal docente y no docente.
2. ABM de legajos (alta, edición y baja).
3. Validar DNI único para evitar duplicados.
4. Vincular el estado activo/inactivo al acceso al sistema.
5. Búsqueda y filtro por función y estado.

**Criterios de aceptación**
- El Administrador crea, edita y da de baja legajos de personal.
- DNI ya existente → el sistema no permite duplicar el legajo.
- El personal en estado inactivo no puede ingresar al sistema.
- Los cambios se reflejan en el listado de personal.

### HU5 — Enviar comunicado a padres del curso (REQ-18)

**Tareas técnicas**
1. Modelar comunicados (remitente, curso destino, fecha).
2. Selección de curso y redacción del mensaje.
3. Validar que el mensaje no quede vacío.
4. Mostrar el comunicado en la bandeja de los padres del curso.

**Criterios de aceptación**
- El mensaje llega a todos los padres asociados al curso.
- Queda registrado con fecha y remitente.
- Mensaje vacío → el sistema no permite el envío.
- El docente solo puede enviar a los cursos que tiene asignados.

---

## 3. Criterios de priorización y estimación

- **Prioridad de negocio:** se respeta la declarada en cada Historia de Usuario (Alta o Media).
  Las tres HU de prioridad Alta se ubican en el Sprint 1.
- **Dependencia funcional:** HU1 (matrícula) genera los datos que consumen HU2, HU4 y HU3; por
  eso encabeza el backlog. HU3 (reportes) se ubica al final porque agrega datos de matrícula,
  asistencia y notas.
- **Riesgo de desarrollo:** las HU de riesgo Medio (HU1, HU3, HU6) se distribuyen entre ambos
  sprints para no concentrar la incertidumbre en una sola iteración.
- **Valor entregado al usuario:** se prioriza que al final del Sprint 1 la institución ya pueda
  matricular alumnos, cargar notas y registrar asistencia, es decir, un incremento operativo
  utilizable.

El equipo está formado por dos integrantes y los sprints son de **una semana (5 días hábiles)**.
Se estima una **velocidad de aproximadamente 21 puntos por sprint**. De esa capacidad se reserva
alrededor del **25 % (5 a 6 puntos)** para los requerimientos extra que no forman parte del
cuadro del backlog.

---

## 4. Sprint 1 — Matrícula, calificaciones y asistencia (semana 1)

**Objetivo del Sprint:** lograr que el Administrador pueda matricular alumnos y que el Docente
pueda cargar calificaciones y registrar la asistencia diaria de su curso, dejando disponible la
información base del sistema.

| ID | Historia de Usuario | Prioridad | Puntos | Responsable | Motivo de inclusión / Dependencia |
|---|---|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | Alta | 8 | G. Cerqueiro | Es la base del sistema: sin alumnos matriculados no existen datos para notas, asistencia ni reportes. |
| HU2 | Cargar calificaciones de alumnos | Alta | 5 | G. Cerqueiro | Depende de HU1 (alumnos matriculados) y de REQ-14 (materia y docente asignados). |
| HU4 | Registrar asistencia diaria | Alta | 3 | L. Fernández | Depende de HU1. Bajo riesgo, permite entregar valor visible a Padres y Estudiantes en la primera semana. |

### Plan del Sprint 1

| Día | Actividades |
|---|---|
| Día 1 | Configuración del entorno y de la base de datos. Modelado de matrícula, legajo, cursos y materias (base de REQ-14). |
| Día 2 | HU1: listado de solicitudes aprobadas, visualización de datos del solicitante y asignación de curso/división. |
| Día 3 | HU1: validaciones, generación del legajo digital y cambio de estado a "matriculado". Inicio de HU4. |
| Día 4 | HU4: carga y edición de asistencia + vista para Padre y Estudiante. HU2: pantalla de carga de notas por curso y materia. |
| Día 5 | HU2: validación de rango y cálculo del promedio. Pruebas de integración. |

---

## 5. Sprint 2 — Gestión de personal, comunicación y reportes (semana 2)

**Objetivo del Sprint:** incorporar la gestión del legajo de personal, la comunicación entre
Docente y familias, y los reportes institucionales que consumen los datos generados en el
Sprint 1.

| ID | Historia de Usuario | Prioridad | Puntos | Responsable | Motivo de inclusión / Dependencia |
|---|---|---|---|---|---|
| HU6 | Gestionar legajo de personal | Media | 5 | L. Fernández | Independiente de las HU del Sprint 1; se agrupa con REQ-20 (postulaciones) por afinidad de módulo. |
| HU5 | Enviar comunicado a padres del curso | Media | 2 | L. Fernández | Requiere cursos con padres asociados (REQ-14 y HU1, cerrados en el Sprint 1). |
| HU3 | Consultar indicadores institucionales | Media | 8 | G. Cerqueiro | Depende de HU1, HU2 y HU4: sin matrícula, notas y asistencia cargadas no hay datos que agregar. |

### Plan del Sprint 2

| Día | Actividades |
|---|---|
| Día 6 | HU6: modelo y ABM de legajos de personal, validación de DNI único. Avance de REQ-20. |
| Día 7 | HU6: estado activo/inactivo vinculado al acceso, búsqueda y filtros. HU5: modelo de comunicados y envío por curso. |
| Día 8 | HU5: validaciones y bandeja de padres (cierre). HU3: consultas agregadas de matrícula, asistencia y rendimiento. |
| Día 9 | HU3: panel de reportes, filtro por período y exportación a PDF. Avance de REQ-17 (boletines y constancias, reserva). |
| Día 10 | Pruebas de integración y de permisos por rol, registro de auditoría (REQ-22). |

---

## 6. Requerimientos extra considerados en la capacidad

Los siguientes requerimientos no integran el cuadro del backlog porque no corresponden a las
seis Historias de Usuario seleccionadas, pero sí ocupan tiempo del equipo dentro de cada sprint
y por eso se descuentan de la capacidad disponible.

Son, además, la respuesta del equipo al **DESAFÍO** del enunciado: agregar al menos una
funcionalidad que genere valor y que no esté contemplada inicialmente.

| Requerimiento extra | Sprint en que se atiende | Motivo por el que consume tiempo del sprint |
|---|---|---|
| **REQ-14** — Cursos, materias y asignación docente | Sprint 1 (≈ 5 pts) | Es precondición técnica de HU2 y HU4: sin cursos, materias y docente asignado no se pueden cargar notas ni asistencia. |
| **REQ-17** — Boletines y constancias | Sprint 2 (≈ 2 pts) | Se apoya en las calificaciones de HU2; se avanza en paralelo sin comprometerse como entregable del sprint. |
| **REQ-20** — Postulaciones laborales | Sprint 2 (≈ 2 pts) | Comparte el módulo de personal con HU6, por lo que se aprovecha el mismo contexto de desarrollo. |
| **REQ-22** — Auditoría y trazabilidad de acciones | Sprint 2 (≈ 2 pts) | Requerimiento transversal: cada acción crítica de Administrador y Autoridad debe quedar registrada con usuario, fecha y acción. |

---

## 7. Eventos de Scrum y Definition of Done

### Eventos

| Evento | Duración (sprint de 1 semana) | Objetivo |
|---|---|---|
| Sprint Planning (al comienzo del Sprint) | Máx. 2 h | Seleccionar las HU del sprint y definir el Sprint Backlog. |
| Daily Scrum | 15 min por día | Sincronizar a los dos integrantes y detectar impedimentos. |
| Sprint Review (al final del Sprint) | Máx. 1 h | Presentar el incremento y ajustar el Backlog del producto. |
| Sprint Retrospective (al final del Sprint) | Máx. 45 min | Analizar el proceso y definir mejoras para el sprint siguiente. |

### Definition of Done — aplicable a ambos sprints

- [ ] Todos los criterios de aceptación de la Historia de Usuario se cumplen.
- [ ] Pruebas funcionales y de integración superadas.
- [ ] Permisos por rol verificados (políticas de seguridad a nivel de fila en la base de datos).
- [ ] Código subido al repositorio y revisado por el otro integrante (*code review* cruzado).
- [ ] Funcionalidad desplegada en el entorno de pruebas (frontend en Netlify, backend y base de
      datos en Supabase).
- [ ] Documentación de la HU actualizada en el trabajo práctico.
