# Unidad 5 — Verificación, validación y aseguramiento de la calidad

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Parte 1 (teoría, en equipo) | [Entregada el 27/10/2026](parte-1.md) |
| Parte 2 (aplicación, en equipo) | Entregada y coevaluada el 27/10/2026 — es este documento |
| Material de la revisión por pares | [Revisión por pares de HU2](revision-por-pares-hu2.md) |
| Funcionalidad analizada | HU2 — Cargar calificaciones de alumnos (REQ-15) |

---

## 1. Funcionalidad seleccionada

**HU2 — Cargar calificaciones de alumnos (REQ-15).** Es distinta de la funcionalidad analizada en la Unidad 4 (HU1, matrícula).

«Como Docente quiero cargar las calificaciones de mis alumnos por materia y período, para que el sistema calcule el promedio automáticamente.»

Se eligió porque sus reglas se pueden verificar con datos concretos (una nota está o no dentro del rango) y porque atraviesa todas las capas de la aplicación: la pantalla del docente, la capa de servicios y la base de datos, con políticas por rol (RLS) y disparadores. El detalle de la historia y de la arquitectura está en el documento adjunto **Revision-por-pares_HU2_Grupo4.docx**.

## 2. Requerimiento para la prueba de verificación

Criterio de aceptación de HU2: **«Nota fuera de rango → se rechaza con mensaje de corrección.»** Expresado de forma verificable:

* La nota es un número **entre 1 y 10** con **hasta dos decimales**; se acepta coma o punto decimal.
* Una celda vacía no es un error.
* Si el valor no cumple, la celda se marca, se informa la corrección y **no se puede guardar**.

Es una prueba de **verificación** porque compara el comportamiento con una especificación documentada: responde a «¿estamos construyendo correctamente el producto?». La regla está implementada en dos capas, y la prueba cubre la de la pantalla (función validarNota); la base la vuelve a controlar con la restricción calificacion_nota_en_rango.

## 3. Caso de prueba

| Campo de caso de prueba | Descripción |
|---|---|
| **ID de caso de prueba** | CP-40 (HU2) |
| **Requerimiento** | REQ-15 · HU2 — La nota debe estar entre 1 y 10, con hasta dos decimales. Una nota fuera de rango se rechaza con un mensaje de corrección y no se puede guardar. |
| **Prueba diseñada por** | Cerqueiro, Gonzalo |
| **Fecha de diseño de la prueba** | 26/10/2026 |
| **Prueba ejecutada por** | Cerqueiro, Gonzalo (manual) · Cypress (automatizada) |
| **Fecha de ejecución de la prueba** | 21/10/2026 (manual) · 26/10/2026 (automatizada) |
| **Condición previa** | Sesión iniciada con el docente titular de Lengua y Literatura de 3.º A (ciclo 2027), con al menos un alumno con matrícula activa y sin cambios pendientes en la planilla. |
| **Pasos de prueba** | **Resultados esperados** |
| 1. Ingresar a «Mis cursos», abrir Lengua y Literatura de 3.º A y elegir el 2.º trimestre. | Se muestra la planilla con los alumnos del curso y tres celdas de nota por alumno. |
| 2. Escribir 11 en una celda vacía. | La celda se marca en rojo con la ayuda «Entre 1 y 10.» y el botón «Guardar notas» queda deshabilitado. |
| 3. Reemplazar el valor por 7,555. | La celda se marca con «Hasta dos decimales.» y sigue sin poder guardarse. |
| 4. Reemplazar el valor por 8,5. | La celda deja de estar marcada y «Guardar notas» se habilita. |

**Resultado obtenido:** aprobado en las dos ejecuciones. La versión automatizada no guarda nada: al terminar deja la celda como estaba, porque el entorno local usa la misma base de datos que el sitio publicado.

## 4. Prueba estática: revisión por pares (Peer Review)

En la revisión por pares, compañeros del equipo examinan el código y los documentos **sin ejecutarlos** para detectar fallos antes de que se integren.

### 4.1. Buenas prácticas que debería cumplir el código para agilizar la revisión

| Práctica | Cómo se aplica en el proyecto | Por qué agiliza la revisión |
|---|---|---|
| **Nombres que expresan la intención** | validarNota, notaDesdeTexto, promediosDelPeriodo, en español como todo el proyecto | Se entiende qué hace cada pieza sin leer su cuerpo |
| **Una responsabilidad por función** | La validación está fuera de la pantalla y se prueba sola | Se revisa por partes, contra un criterio claro |
| **Capa de servicios (patrón Facade)** | Las pantallas no consultan la base: todo pasa por src/services/ | El revisor sabe dónde buscar el acceso a datos |
| **Reglas en dos capas, documentadas** | Pantalla + base (restricción CHECK, disparador y RLS) con comentarios que citan el criterio de la HU | Cada capa se revisa contra el mismo requisito |
| **Cero avisos del linter** | ESLint en el editor, en el pre-commit y en el pipeline | Lo mecánico ya llega resuelto; la revisión se concentra en la lógica |
| **Comentarios que explican decisiones** | La cabecera de cada pantalla lista los criterios de aceptación que cubre | El revisor conoce el «porqué» sin preguntar |
| **Commits y PR chicos, por historia** | feat(HU2): …; un PR por historia o documento | Se revisa en una sola sesión y el historial cuenta qué cambió |
| **Pruebas junto con el código** | Vitest para las reglas y Cypress para los flujos | Se ve qué está cubierto y qué falta |

### 4.2. Estrategias para aplicar la técnica

1. **Preparar el paquete de revisión** y distribuirlo antes de la sesión: un documento Word con la historia de usuario, la arquitectura de la aplicación e información adicional (archivos a revisar, cómo ejecutar el sistema y una lista de verificación). Se entrega junto con este trabajo: **Revision-por-pares_HU2_Grupo4.docx**.

2. **Automatizar lo mecánico antes de la revisión humana:** linter en el editor, pre-commit con Husky, pipeline de integración continua y SonarCloud. Al revisor solo le llega código que compila y pasa el lint y las pruebas.

3. **Usar el Pull Request como espacio de revisión:** comentarios sobre cada línea, la lista de la plantilla y la vista previa de Netlify para probar el cambio funcionando.

4. **Revisar con una lista de verificación común**, basada en los criterios de la Unidad 3: nombres, responsabilidades, duplicación, organización, convenciones, documentación y seguridad por rol.

5. **Limitar el tamaño y el tiempo:** PR de hasta unas 400 líneas y sesiones de hasta 60 minutos, para que la atención no decaiga.

6. **Definir roles:** el autor explica y no defiende; el revisor señala el problema, no a la persona; un moderador ordena la sesión si hace falta.

7. **Registrar cada hallazgo como issue**, con severidad y prioridad, y volver a revisar la corrección antes de cerrarlo.

### 4.3. Configuración disponible para el 27/10

**a) Linter en el editor (IDE).** El proyecto ya tenía ESLint configurado (.eslintrc.cjs, Unidad 4). Se agregó la carpeta .vscode/: recomienda las extensiones ESLint y SonarQube for IDE, valida mientras se escribe y corrige lo que se pueda al guardar.

```jsonc
// .vscode/settings.json
{
 "eslint.validate": ["javascript", "javascriptreact"],
 "eslint.run": "onType",
 "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

**b) Pre-commit hooks con Husky.** Husky 9 instala el hook al ejecutar npm install (script prepare). El hook corre lint-staged, que pasa ESLint solo sobre los archivos del commit. Si hay un error, el commit se bloquea.

```sh
# .husky/pre-commit
npx lint-staged
```

```jsonc
// package.json
"lint-staged": { "*.{js,jsx}": "eslint --max-warnings 0" }
```

Evidencia: se agregó al commit un archivo con una variable sin usar y el hook lo rechazó:

```text
[STARTED] eslint --max-warnings 0
[FAILED] eslint --max-warnings 0 [FAILED]
✖ eslint --max-warnings 0:
src\demo-hook.js
 4:9 error 'sinUsar' is assigned a value but never used no-unused-vars
✖ 1 problem (1 error, 0 warnings)
```

**c) Políticas de Pull Requests.**

* **Plantilla** .github/pull_request_template.md: cada PR indica qué cambia, qué historia cierra (Closes #N), cómo se probó y el estado de la Definition of Done.
* **Check obligatorio:** el pipeline «CI / Lint, pruebas y build» corre en cada PR hacia main. En el PR #18, con esta configuración, pasó en 26 segundos; el análisis de SonarCloud se omitió en el repositorio oficial, como está previsto, y Netlify generó la vista previa.
* **Protección de la rama main:** exigir PR para integrar, exigir el check del pipeline en verde y prohibir el push forzado. Se configura en Settings → Branches del repositorio (requiere permisos de administrador).

**d) Orquestador centralizado: SonarCloud.** Reúne en un panel la deuda técnica, la duplicación, las vulnerabilidades y la cobertura. Se configuró con sonar-project.properties y el workflow .github/workflows/sonarcloud.yml, que mide la cobertura con Vitest y envía el informe. Se analiza desde un fork en la cuenta del integrante, porque SonarCloud solo importa repositorios de la cuenta que autoriza su aplicación.

```properties
# sonar-project.properties
sonar.organization=gonzac96
sonar.projectKey=Gonzac96_Proyecto-Sistema-Universitario
sonar.sources=src
sonar.exclusions=**/*.test.js
sonar.tests=src
sonar.test.inclusions=**/*.test.js
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

Resultado del análisis del 27/10/2026 sobre main (commit 455a741), ejecutado por el workflow en el fork:

| Métrica de SonarCloud | Valor | Lectura |
|---|---|---|
| **Quality Gate (Sonar way)** | Aprobado | El código cumple las condiciones mínimas de calidad |
| **Líneas de código analizadas** | 11 374 | Solo src/, sin las pruebas |
| **Seguridad** | A · 0 vulnerabilidades | Sin vulnerabilidades detectadas |
| **Fiabilidad** | C · 49 problemas | A revisar y priorizar como issues |
| **Mantenibilidad** | A · 27 code smells | Deuda técnica estimada en 2 h 30 min |
| **Duplicación** | 0,8 % | Muy baja |
| **Cobertura** | 6,0 % | Coincide con Vitest (sección 6.1) |

## 5. Prueba dinámica

Las pruebas dinámicas ejecutan el sistema y comparan el resultado obtenido con el esperado.

### 5.1. Cypress configurado para pruebas de QA

Se eligió **Cypress** y no Selenium por los criterios de comparación del material: el proyecto está escrito en JavaScript, Cypress corre contra el servidor de desarrollo de Vite, espera solo a que aparezcan los elementos y guarda una captura cuando una prueba falla. Simula las acciones de un usuario real en el navegador.

```js
// cypress.config.js
export default defineConfig({
 e2e: {
 baseUrl: 'http://localhost:5173',
 specPattern: 'cypress/e2e/**/*.cy.js',
 defaultCommandTimeout: 10000,
 },
})
```

* npm run test:e2e levanta el servidor de desarrollo, corre todas las suites y lo apaga al terminar (scripts/e2e.mjs).
* La cuenta de prueba del docente se lee de cypress.env.json, que no se sube al repositorio.
* Las suites viven en cypress/e2e/: una de regresión y una de HU2.

### 5.2. Prueba de regresión

Una prueba de regresión verifica que un cambio no haya afectado funcionalidades que antes andaban. En el proyecto tiene un sentido concreto: el Sistema de Gestión se construyó encima de la web institucional, y una regla del equipo es que la Parte 2 no rompa la Parte 1.

**Suite regresion-web-publica.cy.js (14 pruebas):** la portada carga con su menú; las ocho páginas públicas muestran su título; las noticias se leen de la base; /admin, /docente y /dashboard sin sesión llevan al login; y el login rechaza credenciales inválidas. No usa cuentas ni escribe datos, así que también puede correr contra el sitio publicado.

```text
Regresión: la web pública sigue funcionando
 √ la portada carga con el menú institucional
 √ /quienes-somos muestra "Quiénes Somos" √ /niveles-educativos muestra "Niveles Educativos"
 √ /bienestar muestra "Bienestar Estudiantil" √ /noticias muestra "Noticias"
 √ /galeria muestra "Galería" √ /inscripcion muestra "Solicitud de Inscripción"
 √ /empleo muestra "Oportunidades de Empleo" √ /contacto muestra "Contacto"
 √ las noticias se leen de la base de datos
Regresión: el sistema sigue protegido
 √ /admin sin sesión lleva al login √ /docente sin sesión lleva al login
 √ /dashboard sin sesión lleva al login √ el login rechaza credenciales inválidas
14 passing (5 s)
```

**Regresión de un defecto corregido.** El 21/10, al probar el Sprint 2, apareció que las fechas sin hora se mostraban un día antes. Se corrigió y se agregó una prueba unitaria que impide que el defecto vuelva:

```js
// src/services/reglas.test.js
describe('Fechas sin hora', () => {
 it('una fecha de la base se muestra en el mismo día, no en el anterior', () => {
 expect(formatDateShort('2015-03-10')).toMatch(/^10\b/)
 })
})
```

### 5.3. Herramienta de pruebas automatizadas según la tecnología

La aplicación usa React con Vite, así que se combinan dos herramientas del ecosistema JavaScript:

* **Vitest** para las pruebas unitarias: es nativo de Vite, usa la misma configuración del proyecto y ya corre en el pipeline de cada push y PR.
* **Cypress** para las pruebas de extremo a extremo de los flujos del usuario.

La suite **hu2-calificaciones.cy.js** automatiza el caso CP-40 de la sección 3 (junto con CP-41) y el CP-45: inicia sesión como docente, escribe valores inválidos y válidos y comprueba mensajes y botón, sin guardar; después intenta abrir la materia de otro docente.

```js
it('CP-40 y CP-41: rechaza notas fuera de rango o con más de dos decimales', () => {
 cy.get('@celda').clear().type('11')
 cy.get('@celda').should('have.attr', 'aria-invalid', 'true').and('have.attr', 'title', 'Entre 1 y 10.')
 cy.contains('button', 'Guardar notas').should('be.disabled')
 cy.get('@celda').clear().type('7,555')
 cy.get('@celda').should('have.attr', 'title', 'Hasta dos decimales.')
 cy.get('@celda').clear().type('8,5')
 cy.contains('button', 'Guardar notas').should('be.enabled')
})
```

```text
HU2: carga de calificaciones
 √ CP-40 y CP-41: rechaza notas fuera de rango o con más de dos decimales (7081ms)
 √ CP-45: un docente que no es titular no puede cargar notas (1751ms)
2 passing (9s)
```

| Nivel | Herramienta | Pruebas | Resultado | Dónde corre |
|---|---|---|---|---|
| Unitarias | Vitest | 23 | 23 aprobadas | En local y en el pipeline, en cada push y PR |
| E2E · regresión | Cypress | 14 | 14 aprobadas | En local; también contra el sitio publicado |
| E2E · HU2 | Cypress | 2 | 2 aprobadas | En local, con la cuenta de prueba del docente |

## 6. Métricas

### 6.1. Cobertura de código

Indica qué proporción del código ejecutaron las pruebas: **cobertura = sentencias ejecutadas / sentencias consideradas × 100**. Se mide con Vitest y el proveedor v8 (npm run test:coverage); el pipeline guarda el informe como artefacto y SonarCloud lo muestra en su panel.

| Alcance | Sentencias | Ramas | Funciones |
|---|---|---|---|
| Todo src/ | 5,05 % (669 de 13 235) | 38,18 % | 20,91 % |
| src/domain/ (patrón State) | 100 % | 88,88 % | 100 % |
| src/services/ | 25,80 % | 65,11 % | 15,90 % |
| src/services/calificaciones.js (HU2) | 52,60 % | 86,66 % | 22,22 % |
| src/utils/ | 41,86 % | 50,00 % | 33,33 % |

**Cómo se evalúa.** El porcentaje global es bajo porque el denominador incluye todas las pantallas (JSX), que se verifican con pruebas de extremo a extremo y no con pruebas unitarias; Vitest no cuenta lo que ejecuta Cypress. Las reglas de negocio puras sí están cubiertas: el dominio llega al 100 %. Por eso la meta se fija por zona y no en global: **al menos 80 % de sentencias en src/domain/ y en las funciones de validación de src/services/**, y que la cobertura no baje en ningún PR. Como advierte el material, una cobertura alta no garantiza la calidad: se lee junto con la cobertura de requisitos (qué criterios de cada HU tienen un caso de prueba).

### 6.2. Tasa de aprobación y tiempo de ejecución de las pruebas

**Tasa de aprobación = pruebas aprobadas / pruebas ejecutadas × 100.** El tiempo de ejecución muestra si las suites empiezan a demorar el pipeline. Las dos salen de las herramientas ya aplicadas: el resumen de Vitest y de Cypress, y la duración de cada ejecución en GitHub Actions.

| Suite | Ejecutadas | Aprobadas | Tasa | Tiempo |
|---|---|---|---|---|
| Unitarias (Vitest) | 23 | 23 | 100 % | 0,9 s |
| E2E de regresión (Cypress) | 14 | 14 | 100 % | 5 s |
| E2E de HU2 (Cypress) | 2 | 2 | 100 % | 8 s |
| Pipeline completo en el PR #18 | — | Aprobado | — | 26 s |
| Casos manuales del Sprint 3 | 28 | 28 | 100 % | — |

**Cómo se evalúa.** La condición para integrar es una tasa del **100 %**: el pipeline bloquea el PR si una prueba falla. Una falla se analiza para saber si es un defecto, un problema de datos o una prueba mal escrita. El tiempo tiene un límite de referencia (pipeline por debajo de 2 minutos y suites E2E por debajo de 1 minuto); si se supera, se revisan las pruebas más lentas.

Otras métricas que ya entregan las herramientas aplicadas: SonarCloud informa deuda técnica, duplicación, problemas de código y vulnerabilidades; Lighthouse mide el rendimiento de carga (Unidad 4).

## 7. Resumen de lo aplicado

| Punto de la consigna | Dónde está |
|---|---|
| **Funcionalidad, requerimiento y caso de prueba** | Secciones 1 a 3 (HU2, CP-40) |
| **Buenas prácticas y estrategias de revisión por pares** | Sección 4.1 y 4.2 |
| **Documento Word: HU, arquitectura e información adicional** | Revision-por-pares_HU2_Grupo4.docx |
| **Linter en el IDE** | .vscode/settings.json y .vscode/extensions.json |
| **Pre-commit hooks con Husky** | .husky/pre-commit y lint-staged en package.json |
| **Políticas de Pull Requests** | .github/pull_request_template.md, check obligatorio y protección de main |
| **Orquestador centralizado** | SonarCloud: sonar-project.properties y .github/workflows/sonarcloud.yml |
| **Cypress y prueba de regresión** | cypress/e2e/regresion-web-publica.cy.js (14 pruebas) |
| **Herramienta según la tecnología** | Vitest + Cypress; cypress/e2e/hu2-calificaciones.cy.js |
| **Dos métricas** | Cobertura de código y tasa de aprobación con tiempo de ejecución |
