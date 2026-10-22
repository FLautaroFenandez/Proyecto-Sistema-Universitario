# Cierre del Sprint 1 — Review y Retrospectiva

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**
Integrantes: Cerqueiro, Gonzalo — Fernández, Lautaro

| Dato | Valor |
|---|---|
| Sprint | 1 — Base académica: matrícula, cursos y asistencia |
| Fechas | 15/09/2026 al 28/09/2026 (10 días hábiles) |
| Capacidad planificada | 16 horas de equipo |
| Patrón de diseño comprometido | Facade |
| Review y Retrospectiva | 29/09/2026 — un día después de lo planificado (28/09) |

---

## 1. Sprint Review

### 1.1. Qué se comprometió y qué se entregó

| ID | Trabajo | Puntos | Estado | Observación |
|---|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | 8 | ✅ Terminada | Los cuatro criterios de aceptación se cumplen. |
| REQ-14 | Cursos, materias y asignación docente | 5 | ✅ Terminado | ABM completo, con cupo y ocupación. |
| HU4 | Registrar asistencia diaria | 3 | ❌ No iniciada | Pasa al Sprint 2. Ver punto 2.2. |
| — | Modelado del Sistema de Gestión (etapa 3 del cronograma) | — | ✅ Terminado | 9 tablas, disparadores y políticas RLS. |
| — | Capa de servicios (patrón Facade) | — | ✅ Terminada | `src/services/`, usada por todas las pantallas nuevas. |

**Velocidad del sprint: 13 de 16 puntos comprometidos (81 %).**

### 1.2. Incremento demostrable

Al cerrar el sprint la institución puede, en el sistema:

1. Crear cursos con su nivel, año, división, turno y cupo.
2. Cargar materias y asignarles un docente **distinto por curso**.
3. Tomar una solicitud de inscripción ya aceptada y convertirla en un alumno
   con legajo, ubicado en un curso.
4. Consultar los legajos, buscar por apellido, DNI o legajo, ver los tutores
   vinculados y dar de baja una matrícula.

Es el **módulo Administrador completo**, que era lo pedido: al menos un módulo
terminado de punta a punta.

### 1.3. Guion de la demostración

| Paso | Qué se muestra |
|---|---|
| 1 | Cursos y materias: los seis cursos del ciclo 2027 con su ocupación. |
| 2 | Asignar una materia a un curso y elegir su docente. |
| 3 | Matriculación: una solicitud aprobada, el formulario precargado desde la solicitud. |
| 4 | Confirmar sin elegir curso → el sistema lo pide y no guarda. |
| 5 | Elegir curso y confirmar → aparece el legajo generado por la base. |
| 6 | La solicitud pasa a la pestaña "Matriculadas" y no se puede volver a procesar. |
| 7 | Alumnos: el legajo nuevo, con su curso y su tutor vinculado. |
| 8 | Poner cupo 1 en un curso e intentar una segunda matrícula → la **base** la rechaza. |

El paso 8 es el que conviene remarcar: el mensaje de error no lo produce el
formulario sino un disparador de PostgreSQL. La regla vive en la base y se
cumple aunque alguien consulte la API por fuera de la aplicación.

### 1.4. Verificación de los criterios de aceptación de HU1

| Criterio | Resultado |
|---|---|
| Solicitud aprobada + curso asignado → matrícula confirmada y legajo generado | ✅ |
| Faltan datos obligatorios → el sistema los solicita y no confirma | ✅ |
| La solicitud queda en "matriculada" y no puede duplicarse | ✅ |
| Solo Administración accede al panel de matriculación | ⏳ Pendiente de probar con cada rol |

El detalle de los casos está en
[`pruebas.md`](../02-modulo-administrador/pruebas.md).

---

## 2. Retrospectiva

### 2.1. Qué funcionó

- **Poner las reglas en la base de datos.** Cupo, unicidad de matrícula y
  generación del legajo se resolvieron con restricciones y disparadores. La
  aplicación no tiene que acordarse de validarlas y la regla no quedó escrita
  dos veces.
- **La capa de servicios (Facade) se pagó sola dentro del mismo sprint.** Las
  tres pantallas comparten el manejo de errores y ninguna conoce el nombre de
  las tablas.
- **Reutilizar el panel de la Parte 1.** Layout, tabla, modales y badges ya
  existían: el esfuerzo se fue en la lógica del negocio y no en rehacer la
  interfaz.
- **Validar el modelo antes de programar sobre él.** El diagnóstico del
  modelado se consultó con la cátedra antes de escribir la primera pantalla.

### 2.2. Qué no funcionó

- **HU4 no se empezó.** Es el desvío principal del sprint y la causa no fue la
  estimación, que era correcta, sino el punto de partida: el 15/09 no existía
  **ninguna** tabla del Sistema de Gestión. La primera semana se consumió
  modelando, que era precondición de las dos historias, y HU4 además depende de
  REQ-14, que recién cerró en la segunda semana.
- **El trabajo fue secuencial y no paralelo.** Las dos HU dependían de lo mismo,
  así que mientras no estuvo el modelo y los cursos, el segundo integrante no
  tenía sobre qué trabajar.
- **La integración quedó toda para el final.** Los siete commits se subieron
  juntos al cerrar el sprint, de modo que la revisión cruzada también se
  concentró al final en lugar de repartirse.
- **El sprint se planificó con etapas del cronograma todavía abiertas.**
  Modelado (hasta el 17/09) y Diseño (hasta el 21/09) se solapaban con el
  Sprint 1, y ese solapamiento se subestimó al comprometer los puntos.

### 2.3. Acciones para el Sprint 2

| # | Acción | Responsable | Fecha |
|---|---|---|---|
| 1 | HU4 entra como **primer ítem** del Sprint 2, antes de HU6 | L. Fernández | 05/10 |
| 2 | Modelar calificaciones y personal en los dos primeros días, antes de codificar | G. Cerqueiro · L. Fernández | 30/09 |
| 3 | Integrar por PR apenas una tarea está lista, no al cierre del sprint | Ambos | Durante todo el sprint |
| 4 | No comprometer una HU cuyo modelo de datos no exista ni esté planificado para la primera semana | Ambos | Planning del Sprint 2 |

### 2.4. Deuda técnica registrada

| Deuda | Por qué se aceptó | Cuándo se salda |
|---|---|---|
| Las pantallas de la Parte 1 siguen consultando Supabase directamente | Ya estaban entregadas y funcionando; migrarlas en el Sprint 1 era riesgo sin valor nuevo | Sprint 2 |
| La matriculación no es atómica: son tres operaciones con compensación manual | PostgREST no expone transacciones; la compensación cubre el caso real | Sprint 2, con una función de PostgreSQL |
| Las transiciones de estado de una solicitud no se validan | Hoy lo cubre una restricción única en la base | Sprint 2, con el patrón State |
| `npm run lint` falla: el script existe pero no hay configuración de ESLint | No bloquea el build ni el deploy | Sprint 2 |
| `docs/GUIA_DEPLOY.md` describe Vercel y el proyecto se publica en Netlify | Documentación heredada de la Parte 1 | Sprint 3, con el cierre de la documentación |

---

## 3. Estado del backlog al cerrar el sprint

| ID | Historia de Usuario | Sprint | Estado |
|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | 1 | ✅ Done |
| REQ-14 | Cursos, materias y asignación docente | 1 | ✅ Done |
| HU4 | Registrar asistencia diaria | 1 → **2** | 🔄 Trasladada |
| HU2 | Cargar calificaciones de alumnos | 2 | To Do |
| HU6 | Gestionar legajo de personal | 2 | To Do |
| HU3 | Consultar indicadores institucionales | 3 | To Do |
| HU5 | Enviar comunicado a padres del curso | 3 | To Do |

El Sprint 2 arranca con **19 puntos** (HU2 5 + HU6 5 + HU4 3 arrastrada + los
requerimientos extra REQ-20 y REQ-22), por encima de la velocidad medida de 13.
Es una señal a tener presente en el Planning: si no entra todo, el ítem que se
posterga se decide al principio y no al final.
