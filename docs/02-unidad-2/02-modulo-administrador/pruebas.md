# Pruebas del módulo Administrador — Sprint 1

Metodología de Sistemas II · UTN FRRe · TUP 2026 — **Grupo 4**

> Casos de prueba de **HU1** (matriculación y legajo) y **REQ-14** (cursos,
> materias y asignación docente). Cubren los dos puntos de la Definition of
> Done que se verifican a mano: pruebas funcionales y permisos por rol.

## Entorno

| Dato | Valor |
|---|---|
| Base de datos | Supabase, con `supabase-gestion.sql` y `supabase-gestion-datos.sql` ejecutados |
| Frontend | `npm run dev` en `http://localhost:5173` |
| Datos de partida | Ciclo 2027 activo, 3 niveles, 6 cursos, 9 materias, 3 solicitudes aceptadas de prueba |

Completar al ejecutar:

| Campo | |
|---|---|
| Fecha de ejecución | |
| Ejecutado por | |
| Versión probada | commit `________` de `feature/HU1-matricula` |

---

## 1. Pruebas funcionales

Marcar cada caso con ✅ o ❌ y, si falla, anotar qué pasó.

| ID | Caso | Pasos | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-01 | Ver cursos del ciclo | Entrar como `admin` → Cursos y materias | Se listan los 6 cursos con ocupación `0/cupo` | |
| CP-02 | Crear un curso | Nuevo curso → nivel primario, año 3, división A, turno mañana, cupo 25 | El curso aparece en la lista | |
| CP-03 | Curso duplicado | Crear otro curso con el mismo nivel, año, división y turno | Se rechaza: *"Ya existe un curso con ese nivel, año, división y turno"* | |
| CP-04 | Crear materia | Materias → Nueva materia → nombre y código | La materia queda listada como activa | |
| CP-05 | Código de materia repetido | Crear otra materia con un código ya usado | Se rechaza: *"Ya existe una materia con ese código"* | |
| CP-06 | Asignar materia y docente | Abrir un curso → agregar materia → elegir docente | La materia aparece con su docente | |
| CP-07 | Materia repetida en el curso | Intentar asignar la misma materia otra vez | La materia ya no figura en el desplegable | |
| CP-08 | Distinto docente por curso | Asignar la misma materia en dos cursos con docentes distintos | Ambas asignaciones conviven (regla del enunciado) | |
| CP-09 | Listar solicitudes | Matriculación → pestaña "Para matricular" | Se ven las solicitudes en estado `aceptada` | |
| CP-10 | Datos precargados | Pulsar *Matricular* en una solicitud | El formulario viene con nombre, DNI y fecha de nacimiento de la solicitud | |
| CP-11 | Validación de obligatorios | Borrar el DNI y confirmar | No guarda y pide el dato (criterio de aceptación de HU1) | |
| CP-12 | Curso obligatorio | Confirmar sin elegir curso | No guarda y pide el curso | |
| CP-13 | Matrícula correcta | Elegir curso y confirmar | Muestra el legajo con formato `AAAA-NNNN` | |
| CP-14 | Solicitud cerrada | Volver al listado | La solicitud pasó a "Matriculadas" y no se puede volver a matricular | |
| CP-15 | Ocupación actualizada | Cursos y materias | La ocupación del curso subió en 1 | |
| CP-16 | Alumno en el listado | Alumnos | Figura con legajo, curso y estado `activo` | |
| CP-17 | Búsqueda | Buscar por apellido, después por DNI y por legajo | Encuentra al alumno en los tres casos | |
| CP-18 | Tutor vinculado | Abrir el detalle del alumno | Si el tutor tiene cuenta con ese DNI, aparece vinculado | |
| CP-19 | **Cupo lleno** | Poner cupo 1 a un curso con un alumno y matricular otro ahí | Se rechaza: *"El curso alcanzó su cupo máximo"* — el mensaje viene de un disparador de la base | |
| CP-20 | DNI de alumno repetido | Matricular otra solicitud con un DNI ya usado | Se rechaza: *"Ya hay un alumno registrado con ese DNI"* | |
| CP-21 | Docente inválido | Asignar como docente a un usuario cuyo rol se cambió a `padre` | Se rechaza por el disparador `trg_validar_docente` | |
| CP-22 | Baja de matrícula | Detalle del alumno → Dar de baja | La matrícula queda en `baja` y el lugar se libera en el curso | |

---

## 2. Permisos por rol

La cátedra evalúa que cada rol acceda solo a lo suyo, y que eso **no dependa de
la interfaz**. Por eso cada caso se prueba dos veces: en pantalla y contra la
API.

### 2.1. En la interfaz

| ID | Rol | Acción | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-23 | `admin` | Entrar al panel | Ve la sección "Sistema de Gestión" completa | |
| CP-24 | `autoridad` | Entrar al panel | Ve las mismas pantallas (gestiona la estructura académica) | |
| CP-25 | `docente` | Ir a `/admin/matriculacion` escribiendo la URL | La ruta lo rebota: no es rol con acceso al panel | |
| CP-26 | `padre` | Ir a `/admin/alumnos` escribiendo la URL | La ruta lo rebota | |
| CP-27 | `estudiante` | Ir a `/admin/cursos` escribiendo la URL | La ruta lo rebota | |

### 2.2. Contra la API (Row Level Security)

Esta es la prueba que demuestra que la seguridad no está solo en la pantalla.
Con la sesión iniciada como `padre`, desde la consola del navegador (F12):

```js
// Debe devolver [] o solo los hijos del usuario, nunca todos los alumnos
const { data, error } = await window.supabase.from('alumnos').select('*')
console.log(data, error)
```

> Si `window.supabase` no está expuesto, la alternativa es pedir la URL de la
> API con el token de la sesión desde la pestaña Network del navegador.

| ID | Rol | Consulta | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-28 | `padre` | `select` sobre `alumnos` | Solo los alumnos de los que es tutor | |
| CP-29 | `padre` | `insert` sobre `matriculas` | Rechazado por RLS | |
| CP-30 | `docente` | `select` sobre `cursos` | Lectura permitida | |
| CP-31 | `docente` | `insert` sobre `cursos` | Rechazado por RLS | |
| CP-32 | `estudiante` | `select` sobre `matriculas` | Solo las propias o ninguna | |

---

## 3. Pruebas de regresión sobre la Parte 1

El Sprint 1 tocó archivos compartidos (`App.jsx`, `AdminLayout.jsx`,
`roles.js`, `routes.js`), así que hay que confirmar que la web pública sigue
igual.

| ID | Caso | Resultado esperado | Resultado |
|---|---|---|---|
| CP-33 | Home, Noticias, Galería, Contacto | Cargan sin errores en consola | |
| CP-34 | Enviar una solicitud de inscripción desde la web | Se guarda como `pendiente` | |
| CP-35 | Login y logout | Funcionan y respetan el rol | |
| CP-36 | Panel de contenido (Opiniones, Noticias, Galería) | Sin cambios de comportamiento | |
| CP-37 | Inscripciones del panel | Sigue permitiendo aceptar y rechazar solicitudes | |

---

## 4. Resumen

| | Cantidad |
|---|---|
| Casos totales | 37 |
| Aprobados | |
| Fallados | |
| Bloqueados | |

**Observaciones:**
