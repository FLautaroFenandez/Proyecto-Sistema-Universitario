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
| HU4 | Registrar asistencia diaria | Docente | REQ-16 | L. Fernández | Alta | Bajo | 3 | Sprint 1 | To Do |
| HU2 | Cargar calificaciones de alumnos | Docente | REQ-15 | G. Cerqueiro | Alta | Bajo | 5 | Sprint 2 | To Do |
| HU6 | Gestionar legajo de personal | Administrador | REQ-19 | L. Fernández | Media | Medio | 5 | Sprint 2 | To Do |
| HU3 | Consultar indicadores institucionales | Autoridad | REQ-21 | G. Cerqueiro | Media | Medio | 8 | Sprint 3 | To Do |
| HU5 | Enviar comunicado a padres del curso | Docente | REQ-18 | L. Fernández | Media | Bajo | 2 | Sprint 3 | To Do |

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

El equipo está formado por dos integrantes y los sprints son de **dos semanas (10 días
hábiles)**, y corren de martes a lunes. Se estima una **velocidad de aproximadamente 15 puntos
por sprint**. De esa capacidad se reserva alrededor del **25 % (3 a 5 puntos)** para los
requerimientos extra que no forman parte del cuadro del backlog.

Cada sprint incorpora **una Historia de Usuario de cada integrante**, de modo que ambos
entreguen valor en todas las iteraciones y que la revisión cruzada por Pull Request tenga
siempre trabajo del otro para revisar.

---

## 4. Sprint 1 — Base académica: matrícula, cursos y asistencia (15/09 al 28/09)

**Objetivo del Sprint:** dejar operativa la base del sistema: el Administrador matricula alumnos
desde las solicitudes aprobadas y el Docente registra la asistencia diaria de su curso. Sin
estos datos ninguna de las historias siguientes tiene sobre qué trabajar.

| ID | Historia de Usuario | Prioridad | Puntos | Responsable | Motivo de inclusión / Dependencia |
|---|---|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | Alta | 8 | G. Cerqueiro | Es la base del sistema: sin alumnos matriculados no existen datos para calificaciones, asistencia ni reportes. |
| HU4 | Registrar asistencia diaria | Alta | 3 | L. Fernández | Depende de HU1 y de REQ-14, que se cierran en la primera semana del sprint. Bajo riesgo y entrega valor visible a Padres y Estudiantes desde la primera iteración. |

**Patrón de diseño de este sprint: Facade.** Se construye la capa de servicios sobre la que se
apoyan todas las historias siguientes. Se migran los catorce archivos que hoy consultan la base
directamente y se fija la regla de que ningún componente vuelve a hacerlo.

### Plan del Sprint 1

| Semana | Fechas | Actividades |
|---|---|---|
| Semana 1 | 15/09 al 21/09 | Sprint Planning. Modelado de matrícula, legajo, cursos y materias (REQ-14). Creación de la capa de servicios (patrón Facade) y migración de los accesos existentes. HU1: listado de solicitudes aprobadas y asignación de curso. |
| Semana 2 | 22/09 al 28/09 | HU1: validaciones, generación del legajo digital y cambio de estado a "matriculado". HU4: carga y edición de asistencia, y vista de consulta para Padre y Estudiante. Pruebas de integración. Sprint Review y Retrospectiva. |

---

## 5. Sprint 2 — Calificaciones, personal y trazabilidad (29/09 al 13/10)

**Objetivo del Sprint:** incorporar la carga de calificaciones con cálculo automático del
promedio y la gestión del legajo del personal, dejando registrada toda acción crítica sobre los
datos.

| ID | Historia de Usuario | Prioridad | Puntos | Responsable | Motivo de inclusión / Dependencia |
|---|---|---|---|---|---|
| HU2 | Cargar calificaciones de alumnos | Alta | 5 | G. Cerqueiro | Depende de HU1 (alumnos matriculados) y de REQ-14 (materia y docente asignados), ambos cerrados en el Sprint 1. |
| HU6 | Gestionar legajo de personal | Media | 5 | L. Fernández | Independiente de las historias anteriores. Se agrupa con REQ-20 (postulaciones laborales) por afinidad de módulo. |

**Patrón de diseño de este sprint: State.** Se modela el ciclo de vida de la matrícula y el de
las postulaciones laborales como máquinas de estado. Cada estado declara a qué estados puede
pasar, lo que hace verificable el criterio de aceptación de HU1 —una solicitud matriculada no
puede volver a matricularse— y ordena el flujo de REQ-20.

### Plan del Sprint 2

| Semana | Fechas | Actividades |
|---|---|---|
| Semana 1 | 29/09 al 05/10 | Sprint Planning. HU2: modelo de notas por alumno, materia y período; pantalla de carga por curso. HU6: modelo y ABM de legajos con validación de DNI único. Implementación de la máquina de estados (patrón State). |
| Semana 2 | 06/10 al 13/10 | HU2: validación de rango y cálculo del promedio del período. HU6: estado activo/inactivo vinculado al acceso, búsqueda y filtros. REQ-20: postulaciones sobre la máquina de estados. REQ-22: registro de auditoría. Sprint Review y Retrospectiva. |

---

## 6. Sprint 3 — Comunicación, reportes e integración final (14/10 al 27/10)

**Objetivo del Sprint:** cerrar la comunicación con las familias y los reportes institucionales,
y verificar que el Sistema de Gestión se integra con la página web ya desplegada sin romper su
funcionamiento, de cara a la entrega conjunta del 27 de octubre de 2026.

| ID | Historia de Usuario | Prioridad | Puntos | Responsable | Motivo de inclusión / Dependencia |
|---|---|---|---|---|---|
| HU3 | Consultar indicadores institucionales | Media | 8 | G. Cerqueiro | Depende de HU1, HU2 y HU4: sin matrícula, calificaciones y asistencia cargadas no hay datos que agregar. Por eso se ubica en la última iteración. |
| HU5 | Enviar comunicado a padres del curso | Media | 2 | L. Fernández | Requiere cursos con padres asociados (REQ-14 y HU1). Bajo esfuerzo, lo que libera capacidad para la integración y las pruebas de regresión. |

**Patrones de diseño.** No se incorporan patrones nuevos. Se verifica que los tres aplicados
estén efectivamente en uso en todos los módulos, como parte de la Definition of Done.

### Plan del Sprint 3

| Semana | Fechas | Actividades |
|---|---|---|
| Semana 1 | 14/10 al 20/10 | Sprint Planning. HU3: consultas agregadas de matrícula, asistencia y rendimiento; filtro por período. HU5: modelo de comunicados, envío por curso y bandeja de los padres. REQ-17: boletines y constancias en PDF. |
| Semana 2 | 21/10 al 27/10 | HU3: panel de reportes y exportación a PDF. Integración con la web institucional y pruebas de regresión sobre la Parte 1. Pruebas de permisos por rol. Despliegue final y entrega. Sprint Review y Retrospectiva. |

---

## 7. Requerimientos extra considerados en la capacidad

Los siguientes requerimientos no integran el cuadro del backlog porque no corresponden a las
seis Historias de Usuario seleccionadas, pero sí ocupan tiempo del equipo dentro de cada sprint
y por eso se descuentan de la capacidad disponible.

Son, además, la respuesta del equipo al **DESAFÍO** del enunciado: agregar al menos una
funcionalidad que genere valor y que no esté contemplada inicialmente.

| Requerimiento extra | Sprint en que se atiende | Motivo por el que consume tiempo del sprint |
|---|---|---|
| **REQ-14** — Cursos, materias y asignación docente | Sprint 1 (≈ 5 pts) | Es precondición técnica de HU2 y HU4: sin cursos, materias y docente asignado no se pueden cargar notas ni asistencia. |
| **REQ-17** — Boletines y constancias | Sprint 3 (≈ 3 pts) | Se apoya en las calificaciones de HU2; se avanza en paralelo sin comprometerse como entregable del sprint. |
| **REQ-20** — Postulaciones laborales | Sprint 2 (≈ 2 pts) | Comparte el módulo de personal con HU6, por lo que se aprovecha el mismo contexto de desarrollo. |
| **REQ-22** — Auditoría y trazabilidad de acciones | Sprint 2 (≈ 3 pts) | Requerimiento transversal: cada acción crítica de Administrador y Autoridad debe quedar registrada con usuario, fecha y acción. |

---

## 8. Eventos de Scrum y Definition of Done

### Eventos

| Evento | Duración (sprint de 2 semanas) | Objetivo |
|---|---|---|
| Sprint Planning (al comienzo del Sprint) | Máx. 3 h | Seleccionar las HU del sprint y definir el Sprint Backlog. |
| Daily Scrum | 15 min por día | Sincronizar a los dos integrantes y detectar impedimentos. |
| Sprint Review (al final del Sprint) | Máx. 1,5 h | Presentar el incremento y ajustar el Backlog del producto. |
| Sprint Retrospective (al final del Sprint) | Máx. 1 h | Analizar el proceso y definir mejoras para el sprint siguiente. |

### Definition of Done — aplicable a ambos sprints

- [ ] Todos los criterios de aceptación de la Historia de Usuario se cumplen.
- [ ] Pruebas funcionales y de integración superadas.
- [ ] Permisos por rol verificados (políticas de seguridad a nivel de fila en la base de datos).
- [ ] Código subido al repositorio y revisado por el otro integrante (*code review* cruzado).
- [ ] Funcionalidad desplegada en el entorno de pruebas (frontend en Netlify, backend y base de
      datos en Supabase).
- [ ] Documentación de la HU actualizada en el trabajo práctico.
