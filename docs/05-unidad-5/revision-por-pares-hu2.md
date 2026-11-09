# Revisión por pares — HU2: cargar calificaciones de alumnos

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Para qué es | Material para quien revisa el código de HU2 sin ejecutarlo (prueba estática, Unidad 5 — Parte 2) |
| Volver | [Unidad 5 — Parte 2](README.md) |

---

Este documento reúne lo que necesita quien revisa el código de HU2 sin ejecutarlo: qué tiene que hacer la funcionalidad, cómo está armada la aplicación y dónde mirar. Conviene leerlo antes de la sesión de revisión.

## 1. Historia de usuario

| Campo | Valor |
|---|---|
| **Identificador** | HU2 · REQ-15 · Caso de uso CU-2 · Diagrama de secuencia DS-2 |
| **Usuario** | Docente |
| **Nombre** | Cargar calificaciones de alumnos |
| **Prioridad en negocio** | Alta |
| **Riesgo en desarrollo** | Bajo |
| **Puntos estimados** | 5 |
| **Sprint** | Sprint 2 (29/09 al 13/10/2026) · integrada a main el 22/10 (PR #2) |

**Descripción.** Como Docente quiero cargar las calificaciones de mis alumnos por materia y período, para que el sistema calcule el promedio automáticamente.

**Validación.** Solo el Docente titular de la materia puede cargar o editar notas de su curso; el sistema calcula el promedio al guardar.

### 1.1. Criterios de aceptación

1. El docente titular carga y edita las notas de su materia.

2. Una nota fuera de rango se rechaza con un mensaje de corrección.

3. Al guardar, el promedio del período se recalcula automáticamente.

4. Un docente que no es titular no puede editar notas ajenas.

### 1.2. Reglas de negocio

| Regla | Dónde se controla |
|---|---|
| La nota está entre 1 y 10 | Pantalla: validarNota · Base: restricción calificacion_nota_en_rango |
| Hasta dos decimales; se acepta coma o punto | Pantalla: validarNota · Base: columna NUMERIC(4,2) |
| Tres trimestres y hasta tres notas por trimestre | Pantalla: PERIODOS e INSTANCIAS · Base: restricciones de período e instancia |
| Una sola nota por alumno, materia, trimestre e instancia | Base: restricción calificacion_unica |
| El alumno debe tener una matrícula activa en ese curso | Base: disparador trg_validar_calificacion |
| Solo el titular carga y edita | Pantalla: bloqueo de la planilla · Base: política RLS con dictados_del_docente() |
| El promedio lo calcula la base al guardar | Base: promedio del período por alumno |

### 1.3. Flujo principal y alternativo

1. El docente entra a «Mis cursos» y elige una de sus materias.

2. El sistema muestra la planilla del trimestre con los alumnos matriculados.

3. El docente escribe las notas; cada celda se valida al escribir.

4. El docente guarda; el sistema graba las notas y recalcula el promedio del período.

**Flujo alternativo:** si una nota está fuera del rango válido, la celda se marca, se explica la corrección y el botón «Guardar notas» queda deshabilitado hasta que se corrija.

## 2. Arquitectura de la aplicación

La aplicación sigue una arquitectura **cliente-servidor en capas**. El cliente es una aplicación web de una sola página (SPA) hecha en React; el servidor es Supabase, que aporta autenticación, una API REST generada sobre PostgreSQL y la seguridad por fila (RLS).

![](data:image/png;base64...)

*Arquitectura de software del Sistema de Gestión (Unidad 1 — Parte 1).*

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| **Presentación** | React 18 + Vite, Tailwind CSS, React Router; publicada en Netlify | Pantallas por rol; validación inmediata para el usuario |
| **Servicios (patrón Facade)** | src/services/*.js | Único punto de acceso a los datos; traduce los errores de la base a mensajes en español |
| **Aplicación / lógica de negocio** | Supabase: Auth, API REST (PostgREST) | Sesión con JWT; expone las tablas según los permisos del usuario |
| **Datos** | PostgreSQL con RLS, restricciones y disparadores | Reglas que no dependen de la pantalla: rango, unicidad, titularidad, auditoría |
| **Infraestructura** | Netlify, Supabase y GitHub Actions | Publicación automática en cada merge a main; verificación de cada cambio |

### 2.1. Recorrido de HU2 por las capas

| Capa | Pieza | Archivo |
|---|---|---|
| Presentación | Planilla de notas por trimestre | src/pages/docente/CalificacionesPage.jsx (314 líneas) |
| Presentación | Listado de materias del docente | src/pages/docente/MisCursosPage.jsx |
| Servicios | Validación, lectura y guardado de notas | src/services/calificaciones.js (173 líneas) |
| Servicios | Manejo común de errores | src/services/base.js |
| Datos | Tabla, restricciones, disparador y políticas RLS | docs/supabase-sprint2.sql |
| Seguridad | Ruta protegida por rol | src/App.jsx y src/components/auth/ProtectedRoute.jsx |

## 3. Información adicional

### 3.1. Alcance de la revisión

* **validarNota y notaDesdeTexto** (calificaciones.js, líneas 43 a 58): que la validación coincida con las reglas de la sección 1.2, incluidos los bordes (1, 10, 0, 11, «7,5», «7,555», celda vacía).
* **guardar** (calificaciones.js, línea 143 en adelante): que solo envíe las celdas modificadas y que una celda vaciada borre la nota.
* **CalificacionesPage.jsx**: que el botón «Guardar notas» se deshabilite con errores, que se pida confirmación al cambiar de trimestre con cambios sin guardar y que el no titular vea el bloqueo.
* **supabase-sprint2.sql**: que la política RLS y el disparador cubran los mismos casos que la pantalla, para que nada dependa solo de la interfaz.

### 3.2. Lista de verificación para quien revisa

| Criterio | Sí | No | Observación |
|---|---|---|---|
| Los nombres son claros y expresan la intención |  |  |  |
| Cada función tiene una responsabilidad definida |  |  |  |
| No hay duplicación innecesaria |  |  |  |
| El código está organizado según la arquitectura (pantalla → servicio → base) |  |  |  |
| Se respetan las convenciones del proyecto (ESLint sin avisos, español, rutas y roles por constante) |  |  |  |
| Los errores se informan al usuario y no se descartan en silencio |  |  |  |
| La seguridad por rol está en las dos capas (pantalla y RLS) |  |  |  |
| Las reglas de la sección 1.2 tienen una prueba asociada |  |  |  |
| La documentación es suficiente para entender las decisiones |  |  |  |

Al final, quien revisa indica una **fortaleza** del código y una **mejora** que recomienda.

### 3.3. Cómo registrar los hallazgos

Cada hallazgo se carga como issue en GitHub con: título, descripción, archivo y línea, resultado esperado y obtenido, **severidad** (impacto técnico) y **prioridad** (urgencia). El autor corrige en una rama, abre un PR que cierra el issue (Closes #N) y quien revisó verifica la corrección antes de darlo por cerrado.

### 3.4. Verificaciones automáticas ya aplicadas

Antes de llegar a la revisión, el código pasó por estos controles. No hace falta revisar a mano lo que ya cubren.

| Control | Qué verifica | Cuándo corre |
|---|---|---|
| **ESLint en el editor** | Errores de sintaxis, variables sin usar, reglas de React | Mientras se escribe |
| **Husky + lint-staged** | ESLint sobre los archivos del commit | En cada commit |
| **Pipeline de GitHub Actions** | Lint, 23 pruebas unitarias con cobertura y build | En cada push y en cada PR |
| **Cypress** | Regresión de la web (14 pruebas) y flujo de HU2 (CP-40, CP-41, CP-45) | npm run test:e2e |
| **SonarCloud** | Deuda técnica, duplicación, vulnerabilidades y cobertura | En cada push al fork analizado |

### 3.5. Cómo ejecutar el sistema

```bash
git clone https://github.com/FLautaroFenandez/Proyecto-Sistema-Universitario.git
cd Proyecto-Sistema-Universitario
npm install # instala dependencias y el hook de pre-commit
# crear .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev # http://localhost:5173
npm run lint # ESLint
npm test # pruebas unitarias (Vitest)
npm run test:e2e # pruebas de extremo a extremo (Cypress)
```

Las cuentas de prueba por rol y las variables de entorno no se incluyen en este documento: se entregan por separado.

### 3.6. Enlaces

* Repositorio: https://github.com/FLautaroFenandez/Proyecto-Sistema-Universitario
* Aplicación publicada: https://educar-para-transforma.netlify.app
* Casos de prueba de HU2 (CP-38 a CP-45): docs/02-unidad-2/04-sprint-2/README.md
* Diagrama de secuencia DS-2 y caso de uso CU-2: docs/01-unidad-1/01-parte-1-requerimientos/README.md
