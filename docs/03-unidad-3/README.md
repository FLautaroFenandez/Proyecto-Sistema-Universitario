# Unidad 3 — Buenas prácticas en el proceso de implementación

**Actividad práctica: "Desafío de mejora de código"**

Metodología de Sistemas II · UTN FRRe · TUP 2026
Integrantes: Cerqueiro, Gonzalo — Fernández, Lautaro

| Dato | Valor |
|---|---|
| Fecha | 01/09/2026 |
| Modalidad | Práctica en clase, en equipo (3 horas), con evaluación cruzada entre equipos |
| Rama de trabajo | `mejora-buenas-practicas`, integrada después a `main` |
| Coevaluación | 95 / 100 |

---

## Cómo se organizó la actividad

Cada equipo diagnosticó, sin modificarlo, el código de otro equipo (Actividad 1). Después
recibió el diagnóstico de su propio código y aplicó las mejoras sobre él: nombres, funciones,
duplicación, comentarios, refactorización y documentación (Actividades 2 y 3). El trabajo se
registró en una rama con commits descriptivos (Actividad 4), se revisó entre pares
(Actividad 5) y se cerró con una puesta en común y una coevaluación.

---

## 1. Diagnóstico del código (Actividad 1)

### 1.1. Código del equipo evaluado

Problemas que nuestro equipo identificó en el código del otro equipo, analizado sin
modificaciones.

| N.º | Problema | Ubicación | ¿Por qué debería mejorarse? |
|---|---|---|---|
| 1 | Código duplicado con divergencia funcional: la función `logout()` está definida cinco veces en archivos distintos, y no todas hacen lo mismo. | `frontend/script.js:185`, `panel_estudiante.html:503`, `panel_docente.html:919`, `panel_padre.html:606`, `panel_admin.html:995` | Al copiar la misma función cinco veces, las versiones se desalinearon: dos de ellas no borran el token de `sessionStorage` al cerrar sesión, y la sesión queda activa después del "logout". Con una sola función reutilizada este bug no podría existir. |
| 2 | Duplicación de utilidades: el cambio de tema claro/oscuro y el auto-crecimiento de los textareas están reimplementados casi idénticos en dos lugares. | `frontend/script.js:55-89`, `frontend/campus.js:189-345` | Obliga a corregir cualquier error o cambio de estilo dos veces, y ya hay pequeñas diferencias de comportamiento entre la portada y los paneles internos. |
| 3 | Nombres de funciones poco claros: tildes en un identificador y criterios mezclados para funciones que hacen lo mismo. | `panel_docente.html:469` (`actualizarMateriasCalificación`), `panel_docente.html:480` (`manejarNivelEscolar`) | Las tildes en identificadores son poco convencionales, y dos funciones casi idénticas con nombres muy distintos ocultan que están duplicadas. |
| 4 | Convenciones de nombres inconsistentes en el backend: algunas rutas usan camelCase y otras snake_case para los mismos conceptos. | `backend/src/routes/grades.routes.ts:12`, `attendance.routes.ts:14` (`estudiante_id`, `instancia_evaluacion` frente a `estudianteId`, `padreId` en el resto) | Hay que recordar qué convención usa cada endpoint, aumenta el riesgo de errores al conectar el frontend y rompe la coherencia del código. |
| 5 | Documentación desactualizada sobre la tecnología y el estado del proyecto. | `README.md`, `package.json` (raíz) | Describen el frontend como "React + Vite + Tailwind" y el proyecto como "en construcción", cuando el frontend es HTML, CSS y JavaScript plano y el backend ya está completo. |

### 1.2. Diagnóstico recibido sobre nuestro código

Problemas que el equipo evaluador identificó en *Educar para Transformar*. Las mejoras de
las secciones siguientes responden a esta numeración.

| N.º | Problema | Ubicación | ¿Por qué debería mejorarse? |
|---|---|---|---|
| 1 | Componentes demasiado extensos con responsabilidades mezcladas | `Navbar.jsx` (459 líneas), `NivelesPage.jsx` (383), `InscripcionPage.jsx` (306) | `Navbar.jsx` concentra los datos del menú, cuatro estados, cinco `useEffect` y el render de escritorio y de mobile. Cuesta leerlo, no se puede probar por partes y cualquier cambio obliga a tocar todo el menú. |
| 2 | Lógica de permisos duplicada y escrita con strings mágicos | `Navbar.jsx:181`, `LoginPage.jsx:36`, `RegistroPage.jsx:59`, `DashboardPage.jsx:63` | La condición `profile?.rol === 'admin' \|\| profile?.rol === 'autoridad'` se repite en cuatro archivos, aunque `src/types/roles.js` ya define `PERMISOS.VER_PANEL_ADMIN` y `tienePermiso()`. Si se olvida una copia al cambiar un rol, queda un acceso inconsistente. |
| 3 | Código repetido en el panel de administración y en los hooks de datos | Las páginas de `src/pages/admin/`; `useNoticias`, `useGaleria`, `useOpiniones`, `useInscripciones` | Cada página repite la misma secuencia de carga, alta, edición y borrado cambiando solo la tabla, y los hooks repiten el mismo bloque de carga y error. Una corrección hay que aplicarla ocho veces. |
| 4 | Errores ignorados o silenciados | `NoticiasAdminPage.jsx:58` y `:85`, `GaleriaAdminPage.jsx:79` | Las consultas descartan el campo `error` de Supabase y hay bloques `catch { }` vacíos: si una consulta falla, la pantalla queda vacía sin aviso ni rastro. |
| 5 | Nombres poco expresivos y valores mágicos | `NoticiasAdminPage.jsx:42`, `:55`, `:105`; `Navbar.jsx:153` | La variable `eliminar` guarda la noticia a eliminar: parece una acción y es un dato. Se repiten identificadores de una letra y abreviaturas como `COLS`. |

### 1.3. ¿Funcionar significa estar bien desarrollado?

**Sí, el programa funciona.** Las secciones públicas responden, el ingreso distingue los
roles y cada panel muestra la información que le corresponde.

**No, eso no significa que esté bien desarrollado.** Funcionar y tener calidad son dos
propiedades distintas: la primera se verifica en un momento puntual y la percibe el usuario;
la segunda la paga el equipo después, cada vez que alguien necesita comprender, modificar,
probar o ampliar el código.

El caso más claro es el problema 1 del código evaluado. `logout()` está copiada en cinco
archivos y dos copias no borran el token: según desde qué panel se cierre sesión, la sesión
queda activa. La aplicación "funciona" —el usuario ve la pantalla de salida y nada falla a
la vista— pero queda un problema de seguridad. Ese defecto no lo produjo un error de lógica,
sino la duplicación.

Los otros cuatro problemas todavía no producen fallos visibles, pero encarecen cada cambio:
la lógica duplicada hay que corregirla dos veces, las convenciones mezcladas obligan a
averiguar qué criterio usa cada endpoint y la documentación equivocada desorienta a quien
se suma al equipo.

En síntesis, que un programa funcione demuestra que hoy cumple sus requerimientos, no que
esté bien construido. Y la deuda técnica no siempre es un costo futuro: en el caso de
`logout()`, la duplicación ya se convirtió en un defecto que las pruebas funcionales no
detectaron, justamente porque en la pantalla todo parecía correcto.

---

## 2. Mejoras aplicadas a nuestro código (Actividad 2)

El programa mantiene exactamente el mismo comportamiento.

| Mejora | Antes | Después | Justificación |
|---|---|---|---|
| Nombre de variable | `const [eliminar, setEliminar] = useState(null)` (`NoticiasAdminPage.jsx:42`) | `const [noticiaAEliminar, setNoticiaAEliminar] = useState(null)` | El nombre tenía forma de verbo y se leía como una acción, pero guarda un dato: la noticia marcada para borrar. Además deja de competir con `confirmarEliminar()`, que sí es una acción. |
| Nombre de función | `handleImagenChange` (`NoticiasAdminPage.jsx:74`) | `seleccionarImagenDePortada` | El nombre describía el evento del navegador y no la intención —tomar la imagen elegida y mostrar la vista previa—, y mezclaba inglés y español en un código que usa español. |
| Función extensa | `Navbar()` concentraba cinco `useEffect`: scroll, cierre al navegar, tecla Escape, bloqueo del scroll y click afuera (`Navbar.jsx:136-171`) | Cuatro efectos pasaron a hooks con una responsabilidad cada uno: `useScrollPasado()`, `useTeclaEscape()`, `useBloqueoDeScroll()` y `useClickAfuera()`, en `src/hooks/useUI.js` | Había que leer el componente entero para entender cualquiera de los efectos. Ahora cada comportamiento tiene nombre propio y el componente declara qué hace, no cómo. `Navbar` bajó de 459 a 440 líneas. |
| Código duplicado | `profile?.rol === 'admin' \|\| profile?.rol === 'autoridad'` en cuatro archivos | `tienePermiso(profile?.rol, PERMISOS.VER_PANEL_ADMIN)` en los cuatro | La regla ya estaba en `src/types/roles.js`. Ahora un rol nuevo se habilita modificando un solo array. La misma extracción eliminó el cierre con Escape y el bloqueo de scroll, que estaban escritos dos veces entre `Navbar.jsx` y `Modal.jsx`. |
| Comentario | `catch { /* continúa sin imagen */ }` (`NoticiasAdminPage.jsx:83`) | `catch (error)` con el comentario *"Decisión: se guarda igual sin portada; el contenido vale más que la imagen"* y `console.error('No se pudo subir la imagen:', error)` | El comentario original ocultaba que el error se descartaba: si la subida fallaba no quedaba rastro. El nuevo explica la decisión de negocio, que el código no puede expresar solo, y el fallo queda registrado. |

---

## 3. Refactorización y documentación (Actividad 3)

Refactorizar es modificar la estructura interna del código sin alterar su comportamiento
externo. Se eligieron dos problemas del diagnóstico.

### Refactorización 1 — Dividir una unidad con demasiadas responsabilidades

*Problema de origen: N.º 1, componentes extensos con responsabilidades mezcladas.*

`Navbar()` concentraba cinco efectos sin relación entre sí, mezclados con el render de
escritorio y el de mobile. Cuatro de ellos se extrajeron a `src/hooks/useUI.js`, cada uno con
una única responsabilidad y un nombre que la expresa.

**Hallazgo adicional:** al extraer los efectos apareció que `Modal.jsx` tenía escritos los
mismos dos efectos —cierre con Escape y bloqueo del scroll— con el mismo código. Esa
duplicación no figuraba en el diagnóstico y quedó eliminada de paso. Una refactorización por
responsabilidades descubre duplicación que no se ve mirando un archivo a la vez.

### Refactorización 2 — Una única fuente de verdad para los permisos

*Problema de origen: N.º 2, lógica de permisos duplicada y escrita con strings mágicos.*

El caso es particular porque no faltaba la solución: sobraba. `src/types/roles.js` ya definía
el enumerado de roles, la matriz de permisos y `tienePermiso()`, y `NoticiasPage.jsx` la usaba
bien. En los otros cuatro lugares la regla se había copiado en vez de reutilizarse. La
refactorización reemplazó las cuatro copias por la función existente.

### Documentación

El `README.md` del proyecto ya cubría los cinco puntos de la consigna: nombre, descripción,
cómo ejecutarlo, funcionalidades e integrantes. Por eso no se redactó uno nuevo: solo se
incorporó `src/hooks/useUI.js` al árbol de estructura. Duplicar el README habría reproducido
el mismo error que se corrigió en el código.

---

## 4. Registro del trabajo en Git (Actividad 4)

Las mejoras se hicieron en la rama `mejora-buenas-practicas`, creada desde `main`, para que el
código estable quedara intacto y las mejoras pudieran revisarse por separado.

Se hicieron **cinco commits** en lugar del mínimo de tres, uno por tipo de mejora, para que
cada uno pueda revertirse sin arrastrar a los demás.

| Hash | Tipo | Descripción | Responde a |
|---|---|---|---|
| `fb0c65d` | refactor | Renombrar variable y función según su intención | Problema 5 |
| `0f92852` | fix | Registrar el error al subir la imagen en lugar de descartarlo | Problema 4 |
| `8d77685` | refactor | Unificar la verificación de permisos con `tienePermiso()` | Problema 2 |
| `98cbba4` | refactor | Extraer los efectos de UI a hooks reutilizables | Problema 1 |
| `67f81e4` | docs | Incorporar `useUI.js` a la estructura del proyecto en el README | Actividad 3 |

![Historial de la rama mejora-buenas-practicas](../recursos/imagenes/historial-git-buenas-practicas.png)

*Historial de la rama `mejora-buenas-practicas`, con los cinco commits y su publicación en el
repositorio remoto.*

| Archivo | Saldo | Qué cambió |
|---|---|---|
| `src/hooks/useUI.js` | +80 | Nuevo: los cuatro hooks extraídos de `Navbar` |
| `src/components/layout/Navbar.jsx` | −19 | Efectos reemplazados por hooks; permisos unificados |
| `src/components/ui/Modal.jsx` | −11 | Deja de duplicar el Escape y el bloqueo de scroll |
| `src/pages/admin/NoticiasAdminPage.jsx` | +6 | Renombres y manejo del error de subida |
| `src/pages/auth/LoginPage.jsx` | +2 | Permisos con `tienePermiso()` |
| `src/pages/auth/RegistroPage.jsx` | +2 | Permisos con `tienePermiso()` |
| `src/pages/dashboard/DashboardPage.jsx` | +1 | Permisos con `tienePermiso()` |
| `README.md` | +1 | Estructura del proyecto actualizada |

Balance: 126 líneas agregadas y 66 eliminadas en 8 archivos. Descontando el módulo nuevo de
hooks, el código existente quedó 21 líneas más corto haciendo lo mismo.

---

## 5. Code Review (Actividad 5)

| Criterio | Resultado |
|---|---|
| Los nombres son claros | ✅ |
| Las funciones tienen responsabilidades claras | ✅ |
| No existe duplicación innecesaria | ✅ |
| El código está correctamente organizado | ✅ |
| Se aplican convenciones | ✅ |
| La documentación es suficiente | ✅ |
| El programa continúa funcionando | ✅ |

---

## 6. Cierre y puesta en común (Actividad 6)

| Pregunta | Respuesta |
|---|---|
| ¿Cuál era el principal problema? | La duplicación: la regla de quién entra al panel de administración estaba copiada en cuatro archivos, aunque el proyecto ya tenía una función para eso que solo se usaba en un lugar. |
| ¿Qué mejoras realizaron? | Cinco: renombrar una variable y una función, dividir `Navbar` sacando sus efectos a hooks, unificar los permisos y registrar un error que se descartaba en silencio. |
| ¿Cómo comprobaron que seguía funcionando? | Compilando el proyecto (`npm run build`, sin errores), levantando la versión compilada para verificar las rutas principales y buscando que no quedara ninguna aparición de las cadenas viejas. |
| ¿Qué buena práctica es la más importante? | Eliminar la duplicación. En el código que evaluamos, `logout()` copiado cinco veces ya había producido un bug de seguridad real: la duplicación termina generando defectos. |

---

## 7. Coevaluación

| Criterio | Puntaje | Obtenido |
|---|---|---|
| Diagnóstico del código | 20 | 15 |
| Aplicación de Clean Code | 25 | 25 |
| Refactorización | 20 | 20 |
| Documentación | 10 | 10 |
| Uso correcto de Git y commits | 15 | 15 |
| Code Review | 10 | 10 |
| **Total** | **100** | **95** |

---

## Continuidad en el proyecto

- La [Unidad 4](../04-unidad-4/README.md) automatizó parte de estas prácticas: ESLint y las
  pruebas corren en cada push dentro del pipeline de integración continua.
- Los problemas 3 y 4 del diagnóstico recibido no se trataron en la actividad. El Sistema de
  Gestión (Parte 2) los evita con la capa de servicios, que informa cada error de Supabase,
  pero las pantallas de la Parte 1 siguen con el patrón anterior. Es deuda técnica registrada
  en el [cierre del Sprint 3](../02-unidad-2/07-cierre-sprint-3/README.md#23-deuda-técnica-al-cierre).
