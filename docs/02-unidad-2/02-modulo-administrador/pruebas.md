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
| Fecha de ejecución | 21 y 22/10/2026 |
| Ejecutado por | G. Cerqueiro, con Claude Code (Claude in Chrome) |
| Versión probada | `feature/HU2-calificaciones` sin commitear, sobre `797fd5e` |

---

## 1. Pruebas funcionales

Marcar cada caso con ✅ o ❌ y, si falla, anotar qué pasó.

| ID | Caso | Pasos | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-01 | Ver cursos del ciclo | Entrar como `admin` → Cursos y materias | Se listan los 6 cursos con ocupación `0/cupo` | ✅ Seis cursos con su ocupación (3.º A ya tenía 1 alumno) |
| CP-02 | Crear un curso | Nuevo curso → nivel primario, año 3, división A, turno mañana, cupo 25 | El curso aparece en la lista | ✅ Curso de prueba 4.º Z tarde (3.º A mañana ya existía) |
| CP-03 | Curso duplicado | Crear otro curso con el mismo nivel, año, división y turno | Se rechaza: *"Ya existe un curso con ese nivel, año, división y turno"* | ✅ |
| CP-04 | Crear materia | Materias → Nueva materia → nombre y código | La materia queda listada como activa | ✅ "Materia de Prueba CP04", código PRB |
| CP-05 | Código de materia repetido | Crear otra materia con un código ya usado | Se rechaza: *"Ya existe una materia con ese código"* | ✅ |
| CP-06 | Asignar materia y docente | Abrir un curso → agregar materia → elegir docente | La materia aparece con su docente | ✅ |
| CP-07 | Materia repetida en el curso | Intentar asignar la misma materia otra vez | La materia ya no figura en el desplegable | ✅ |
| CP-08 | Distinto docente por curso | Asignar la misma materia en dos cursos con docentes distintos | Ambas asignaciones conviven (regla del enunciado) | ✅ 4.º Z con V. Gutierrez y 2.º A con el docente de prueba |
| CP-09 | Listar solicitudes | Matriculación → pestaña "Para matricular" | Se ven las solicitudes en estado `aceptada` | ✅ |
| CP-10 | Datos precargados | Pulsar *Matricular* en una solicitud | El formulario viene con nombre, DNI y fecha de nacimiento de la solicitud | ✅ |
| CP-11 | Validación de obligatorios | Borrar el DNI y confirmar | No guarda y pide el dato (criterio de aceptación de HU1) | ✅ *"El DNI del alumno es obligatorio."* |
| CP-12 | Curso obligatorio | Confirmar sin elegir curso | No guarda y pide el curso | ✅ *"Elegí el curso en el que se matricula."* El formulario sugiere un curso; para la prueba se dejó vacío |
| CP-13 | Matrícula correcta | Elegir curso y confirmar | Muestra el legajo con formato `AAAA-NNNN` | ✅ Legajo 2026-0002 |
| CP-14 | Solicitud cerrada | Volver al listado | La solicitud pasó a "Matriculadas" y no se puede volver a matricular | ✅ |
| CP-15 | Ocupación actualizada | Cursos y materias | La ocupación del curso subió en 1 | ✅ |
| CP-16 | Alumno en el listado | Alumnos | Figura con legajo, curso y estado `activo` | ✅ |
| CP-17 | Búsqueda | Buscar por apellido, después por DNI y por legajo | Encuentra al alumno en los tres casos | ✅ |
| CP-18 | Tutor vinculado | Abrir el detalle del alumno | Si el tutor tiene cuenta con ese DNI, aparece vinculado | ✅ Parcial: sin cuenta de tutor muestra que no hay vinculados. El caso con cuenta no se probó |
| CP-19 | **Cupo lleno** | Poner cupo 1 a un curso con un alumno y matricular otro ahí | Se rechaza: *"El curso alcanzó su cupo máximo"* — el mensaje viene de un disparador de la base | ✅ En las dos capas: la pantalla deshabilita el curso completo y la base rechaza la matrícula |
| CP-20 | DNI de alumno repetido | Matricular otra solicitud con un DNI ya usado | Se rechaza: *"Ya hay un alumno registrado con ese DNI"* | ✅ |
| CP-21 | Docente inválido | Asignar como docente a un usuario cuyo rol se cambió a `padre` | Se rechaza por el disparador `trg_validar_docente` | ✅ *"El docente asignado no existe, no tiene rol docente o está inactivo"* |
| CP-22 | Baja de matrícula | Detalle del alumno → Dar de baja | La matrícula queda en `baja` y el lugar se libera en el curso | ✅ Ver observación 2 |

---

## 2. Permisos por rol

La cátedra evalúa que cada rol acceda solo a lo suyo, y que eso **no dependa de
la interfaz**. Por eso cada caso se prueba dos veces: en pantalla y contra la
API.

### 2.1. En la interfaz

| ID | Rol | Acción | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-23 | `admin` | Entrar al panel | Ve la sección "Sistema de Gestión" completa | ✅ |
| CP-24 | `autoridad` | Entrar al panel | Ve las mismas pantallas (gestiona la estructura académica) | ✅ Sin acceso a Usuarios, que es solo de admin |
| CP-25 | `docente` | Ir a `/admin/matriculacion` escribiendo la URL | La ruta lo rebota: no es rol con acceso al panel | ✅ Lo redirige a su panel |
| CP-26 | `padre` | Ir a `/admin/alumnos` escribiendo la URL | La ruta lo rebota | ✅ |
| CP-27 | `estudiante` | Ir a `/admin/cursos` escribiendo la URL | La ruta lo rebota | ✅ |

### 2.2. Contra la API (Row Level Security)

Esta es la prueba que demuestra que la seguridad no está solo en la pantalla.
Con `npm run dev`, el cliente queda disponible en la consola del navegador (F12)
como `supabase`, con la sesión del usuario conectado. Solo pasa en desarrollo:
el build de producción no lo expone. Iniciar sesión con el rol de cada caso y
pegar su consulta:

```js
// CP-28 · padre: solo sus hijos, nunca todos los alumnos
(await supabase.from('alumnos').select('id, apellido, nombre')).data

// CP-29 · padre: tiene que fallar con code '42501' (RLS)
(await supabase.from('matriculas').insert({ alumno_id: crypto.randomUUID(), curso_id: crypto.randomUUID() })).error

// CP-30 · docente: lectura permitida
(await supabase.from('cursos').select('id, anio, division')).data

// CP-31 · docente: tiene que fallar con code '42501' (RLS)
(await supabase.from('cursos').insert({ anio: 9, division: 'Z' })).error

// CP-32 · estudiante: solo sus matrículas, o ninguna
(await supabase.from('matriculas').select('*')).data
```

| ID | Rol | Consulta | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-28 | `padre` | `select` sobre `alumnos` | Solo los alumnos de los que es tutor | ✅ Ninguno: el usuario de prueba no es tutor |
| CP-29 | `padre` | `insert` sobre `matriculas` | Rechazado por RLS | ✅ Código 42501 |
| CP-30 | `docente` | `select` sobre `cursos` | Lectura permitida | ✅ |
| CP-31 | `docente` | `insert` sobre `cursos` | Rechazado por RLS | ✅ Código 42501 |
| CP-32 | `estudiante` | `select` sobre `matriculas` | Solo las propias o ninguna | ✅ Ninguna |

---

## 3. Pruebas de regresión sobre la Parte 1

El Sprint 1 tocó archivos compartidos (`App.jsx`, `AdminLayout.jsx`,
`roles.js`, `routes.js`), así que hay que confirmar que la web pública sigue
igual.

| ID | Caso | Resultado esperado | Resultado |
|---|---|---|---|
| CP-33 | Home, Noticias, Galería, Contacto | Cargan sin errores en consola | ✅ |
| CP-34 | Enviar una solicitud de inscripción desde la web | Se guarda como `pendiente` | ✅ Solicitud #82745EEC |
| CP-35 | Login y logout | Funcionan y respetan el rol | ✅ |
| CP-36 | Panel de contenido (Opiniones, Noticias, Galería) | Sin cambios de comportamiento | ✅ Se revisó que carguen; no se moderó contenido |
| CP-37 | Inscripciones del panel | Sigue permitiendo aceptar y rechazar solicitudes | ✅ |

---

## 4. Resumen

| | Cantidad |
|---|---|
| Casos totales | 37 |
| Aprobados | 37 (CP-18 en forma parcial) |
| Fallados | 0 |
| Bloqueados | 0 |

**Observaciones:**

1. **Fechas corridas un día.** Las columnas sin hora (nacimiento, fecha de
   matriculación) se mostraban con un día menos: `new Date('2015-03-10')` se
   interpreta como medianoche UTC y en Argentina (UTC-3) cae el día anterior.
   Se corrigió en `src/utils/formatDate.js` y se verificó en pantalla.
2. **Baja de matrícula.** No pide confirmación antes de ejecutarse, y la lista de
   Alumnos sigue mostrando el curso y el estado *activo* después de la baja,
   porque esa columna es el estado del alumno y no el de su matrícula. El
   detalle sí muestra la matrícula en *baja*.
3. **Redacción.** El mensaje del disparador de cupo dice *"(1 lugares)"*.
4. **Cómo se probaron los roles.** Se usó un único usuario de prueba al que se le
   cambió el rol desde el panel (docente, padre, estudiante y autoridad). Al
   terminar quedó otra vez como docente.
5. **Datos de prueba que quedaron en la base:** el curso 4.º Z tarde, la materia
   PRB (asignada en 4.º Z y 2.º A), el alumno 2026-0002 con la matrícula en baja y
   las solicitudes *Prueba Automatizada CP34* (matriculada) y *CP37* (rechazada).

