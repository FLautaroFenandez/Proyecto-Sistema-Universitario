# Cierre del Sprint 3 — Review y Retrospectiva

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**
Desarrollo: Cerqueiro, Gonzalo (desde el 21/10 continúa solo el desarrollo del equipo)

| Dato | Valor |
|---|---|
| Sprint | 3 — Comunicación, reportes e integración final |
| Fechas | 14/10/2026 al 27/10/2026 |
| Patrones de diseño | Sin patrones nuevos: se verifica el uso de Singleton, Facade y State |
| Review y Retrospectiva | 25/10/2026, antes del fin del sprint |
| Entrega | 27/10/2026 — Parte 2 completa (web + Sistema de Gestión) |

---

## 1. Sprint Review

### 1.1. Qué se comprometió y qué se entregó

El sprint recibió todo lo que quedaba del backlog (ver
[cierre del Sprint 2](../05-cierre-sprint-2/README.md)).

| ID | Trabajo | Puntos | Estado | Pruebas |
|---|---|---|---|---|
| HU4 | Registrar asistencia diaria | 3 | ✅ Terminada | CP-49 a CP-54 |
| HU5 | Enviar comunicado a padres del curso | 2 | ✅ Terminada | CP-55 a CP-57 |
| HU6 | Gestionar legajo de personal | 5 | ✅ Terminada | CP-58 a CP-62 |
| HU3 | Consultar indicadores institucionales | 8 | ✅ Terminada | CP-70 a CP-72 |
| REQ-17 | Boletines y constancias en PDF | 3 | ✅ Terminado | CP-73 a CP-75 |
| REQ-20 | Postulaciones laborales | 2 | ✅ Terminado | CP-63 a CP-66 |
| REQ-22 | Auditoría de acciones críticas | 3 | ✅ Terminado | CP-67 a CP-69 |

**Velocidad del sprint: 26 de 26 puntos comprometidos (100 %).** Además se aplicaron las dos
opciones de la [Unidad 4](../../04-unidad-4/README.md), que no tenían puntos asignados: el
pipeline de integración continua y el tablero Kanban.

### 1.2. Incremento demostrable

Al cerrar el sprint, la institución puede además:

1. Que cada **docente** tome la asistencia diaria de sus cursos y envíe comunicados a las
   familias del curso, firmados con su nombre.
2. Que cada **familia** vea el porcentaje de asistencia, las inasistencias, los comunicados,
   el boletín y la constancia de **sus hijos**, y de ningún otro alumno.
3. Llevar el **legajo del personal**: al darlo de baja, la cuenta vinculada pierde el acceso
   en la base de datos, no solo en la pantalla.
4. Seguir cada **postulación laboral** por estados, desde *Recibida* hasta *Contratado* o
   *Descartado*, sin saltos.
5. Consultar los **indicadores institucionales** por período y exportarlos a PDF.
6. Emitir **boletines** y **constancias de alumno regular**. La constancia solo sale con la
   matrícula activa.
7. Revisar en **Auditoría** quién cambió qué y cuándo, con el valor anterior y el nuevo.

### 1.3. Pruebas

Los **28 casos** del sprint (CP-49 a CP-76) se ejecutaron el 24 y el 25/10 y **ninguno
falló**. Se probaron con cuentas de administrador, docente y padre: el padre antes y después
de vincularlo a su hijo, y el docente también con el legajo dado de baja. Los rechazos se confirmaron también
contra la base, por la API, para comprobar que no los frena solo la pantalla. A eso se suman
las 23 pruebas automáticas que corre el pipeline. El detalle y las observaciones están en
el [documento del Sprint 3](../06-sprint-3/README.md#3-casos-de-prueba).

### 1.4. Uso de los patrones de diseño

El plan del sprint pedía verificar que los tres patrones estén en uso en todos los módulos.

| Patrón | Dónde se usa | Resultado |
|---|---|---|
| Singleton | `src/lib/supabase.js`: un único cliente para toda la aplicación | ✅ |
| State | Solicitud de inscripción (Sprint 2) y postulación laboral (REQ-20), en la aplicación (`src/domain/`) y en la base | ✅ |
| Facade | Todas las pantallas del Sistema de Gestión pasan por `src/services/` | 🔶 Parcial |

La fachada no llegó a la Parte 1: 13 pantallas y componentes del panel de contenido y de la
web, 5 hooks y la utilidad de carga de imágenes siguen consultando Supabase directamente. Es la deuda registrada en el
Sprint 1, que se había previsto saldar en el Sprint 2 (ver 2.3).

### 1.5. Integración y despliegue

Todo el sprint llegó a `main` el **24/10** por el Pull Request #14, verificado por el
pipeline, y quedó publicado en Netlify el mismo día. El tiempo de espera entre el último
commit y la integración fue de **1 h 05 min**, frente a los 17 a 23 días de los sprints
anteriores. La documentación de la Unidad 4 entró por el PR #15. Los tags `sprint-1` y
`sprint-2` marcan los cierres anteriores; este sprint cierra con `sprint-3`.

---

## 2. Retrospectiva

### 2.1. Qué funcionó

- **El pipeline detectó un error antes de integrar.** Las pruebas fallaban con Node 20 y
  pasaban en la máquina de desarrollo; se corrigió el mismo día, antes de llegar a `main`.
- **Se cumplió la acción pendiente de las dos retrospectivas anteriores:** integrar por PR
  en cuanto el pipeline pasa. El trabajo llegó a producción en una hora, no en semanas.
- **La validación en dos capas se sostuvo en las pruebas.** Fechas futuras, saltos de estado,
  auditoría y documentos de otro alumno los rechaza la base aunque se intente por fuera de
  la aplicación.
- **El cierre se hizo en fecha.** La Review y la Retrospectiva se documentan antes del fin del
  sprint, no once días después como en el Sprint 2.

### 2.2. Qué no funcionó

- **El trabajo se concentró al final.** La primera semana (14 al 20/10) no tuvo avance sobre
  el backlog; el código del sprint se escribió entre el 22 y el 24/10, después del cambio en
  el equipo.
- **Un solo PR para siete historias.** La estrategia de la Unidad 4 era integrar en lotes
  chicos, uno por historia. El PR #14 las llevó juntas, así que en el tablero pasaron todas a
  *Terminado* al mismo tiempo.
- **Sin revisión cruzada.** Con un solo integrante, el pipeline verifica que el código
  compile y pase las pruebas, pero nadie más lo lee antes de integrarlo.
- **Las pruebas se hacen sobre la base de producción.** El sitio publicado y el entorno local
  usan el mismo proyecto de Supabase, así que los datos de prueba (el curso 4.º Z, la materia
  de prueba, la postulación CP63) quedan a la vista en el sitio.
- **Las cuentas de prueba no estaban registradas.** Se perdió el acceso a una cuenta de padre
  y hubo que crear otra, y la cuenta del docente de prueba se llama "padre" porque cambió de
  rol en el Sprint 2.

### 2.3. Deuda técnica al cierre

| Deuda | Origen | Estado |
|---|---|---|
| Las transiciones de estado de una solicitud no se validan | Sprint 1 | ✅ Saldada en el Sprint 2 (patrón State) |
| `npm run lint` no tenía configuración | Sprint 1 | ✅ Saldada en el Sprint 3 (Unidad 4) |
| La guía de despliegue describía Vercel | Sprint 1 | ✅ Saldada en el Sprint 3 |
| Las pantallas de la Parte 1 consultan Supabase directamente | Sprint 1 | ⏳ Pendiente: se migra junto con la reestructuración de `src/` al empezar la Parte 3 |
| La matriculación no es atómica | Sprint 1 | ⏳ Pendiente: pasarla a una función de PostgreSQL |
| Auditoría muestra el identificador de quien revisó una postulación, no su nombre | Sprint 3 | ⏳ Pendiente |
| Pruebas y producción comparten la base de datos | Sprint 3 | ⏳ Pendiente (acción 1) |

### 2.4. Acciones para la Parte 3

| # | Acción |
|---|---|
| 1 | Separar el entorno de pruebas del de producción (un segundo proyecto de Supabase) |
| 2 | Integrar un PR por historia, para que el tablero refleje el avance real |
| 3 | Llevar un registro de las cuentas de prueba por rol, sin contraseñas en el repositorio |
| 4 | Mantener el pipeline en verde y sumarle las pruebas de la app móvil |
| 5 | Saldar la deuda de la fachada en la Parte 1 al reestructurar `src/` |

---

## 3. Estado del backlog al cerrar el sprint

| ID | Historia de Usuario | Sprint | Estado |
|---|---|---|---|
| HU1 | Matricular alumno desde solicitud aprobada | 1 | ✅ Done |
| REQ-14 | Cursos, materias y asignación docente | 1 | ✅ Done |
| HU2 | Cargar calificaciones de alumnos | 2 | ✅ Done |
| HU4 | Registrar asistencia diaria | 1 → 2 → 3 | ✅ Done |
| HU6 | Gestionar legajo de personal | 2 → 3 | ✅ Done |
| HU3 | Consultar indicadores institucionales | 3 | ✅ Done |
| HU5 | Enviar comunicado a padres del curso | 3 | ✅ Done |
| REQ-17 | Boletines y constancias | 3 | ✅ Done |
| REQ-20 | Postulaciones laborales | 2 → 3 | ✅ Done |
| REQ-22 | Auditoría y trazabilidad | 2 → 3 | ✅ Done |

### Velocidad de los tres sprints

| Sprint | Comprometido | Entregado | Velocidad |
|---|---|---|---|
| 1 | 16 | 13 | 81 % |
| 2 | 18 | 5 | 28 % |
| 3 | 26 | 26 | 100 % |
| **Backlog** | **44** | **44** | **Completo** |

El total comprometido suma más que el backlog porque HU4, HU6, REQ-20 y REQ-22 se
comprometieron en más de un sprint. Las seis historias de usuario y los cuatro
requerimientos extra del plan de trabajo quedaron entregados para el 27/10.
