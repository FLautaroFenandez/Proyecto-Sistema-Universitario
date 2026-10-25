# Trabajo Práctico Unidad 4 — Parte 1

**Técnicas de optimización del ciclo de desarrollo de software · Actividad individual**

Metodología de Sistemas II · UTN FRRe · TUP 2026
Alumno: Cerqueiro, Gonzalo — Grupo 4

| Dato | Valor |
|---|---|
| Fecha | 06/10/2026 |
| Parte 2 (grupal) | [Integración continua, tablero Kanban y métricas](README.md) |

---

## Actividad 1 — Verdadero o falso

Se indica si cada contenido es verdadero o falso y se justifica con el material de la unidad.

| Contenido | V/F | Justificación |
|---|---|---|
| **Flujo típico de integración continua.** El desarrollador sube un cambio; el servidor de CI lo detecta y ejecuta compilación, pruebas unitarias y de integración y análisis de calidad (linting, cobertura, vulnerabilidades); si todo pasa, el cambio puede fusionarse en la rama principal; si falla, se notifica al equipo. | V | Coincide con el flujo Desarrollador → Commit → Repositorio → Build → Pruebas → Resultado. El merge queda condicionado al resultado del pipeline, que es la idea de *quality gate*. |
| **Proceso de integración continua.** Se trabaja en ramas separadas que se integran con frecuencia; un servidor de CI compila y prueba cada cambio; si hay un error, se notifica para corregirlo rápido. | V | La clave es la frecuencia: integrar cambios chicos hace que los errores sean pequeños y fáciles de localizar, en lugar de acumularse hasta el final. |
| **Principios clave de la CI.** Integrar con frecuencia, mantener el código listo para desplegar, automatizar pruebas y validaciones, usar un repositorio compartido con control de versiones y revisar los resultados del CI antes de aprobar un merge. | V | Son los mismos que la unidad enumera entre los objetivos de la CI y las buenas prácticas de CI/CD. |
| **Relación con la entrega continua (CD).** CI asegura que el código nuevo funcione e integre bien; CD automatiza el despliegue en prueba o producción; juntos forman el flujo CI/CD, clave en DevOps. | V | CD parte del código ya verificado por CI. Una precisión: en la entrega continua el despliegue está automatizado, pero la liberación a producción puede requerir una aprobación manual; cuando también esa liberación es automática se habla de *despliegue continuo*. |
| **Flujo típico de un pipeline CI/CD.** Commit → Build → Test → Package → Deploy → Notify. | V | Responde a la secuencia de etapas del pipeline (Source → Build → Test → Package → Deploy), donde cada etapa depende de que la anterior termine bien. |
| **Etapas típicas del despliegue automatizado.** Build, Test, Package (artefactos `.jar`, `.zip` o imágenes Docker), Deploy y Verify. | V | Las etapas y los artefactos coinciden con los de la unidad. La verificación posterior al despliegue es la base para decidir un *rollback*. |

## Actividad 2 — Beneficios de la integración continua

| Beneficio | Descripción |
|---|---|
| Detección temprana de errores | Los fallos se detectan enseguida, sin dejar pasar demasiado tiempo. |
| Reducción de conflictos de integración | Al integrar con frecuencia se evitan los errores que traen las integraciones grandes. |
| Mayor calidad del software | Las pruebas automáticas dan estabilidad. |
| Entrega más rápida | El producto está siempre en condiciones de desplegarse. |
| Transparencia | Todos ven el estado del proyecto: builds, pruebas y resultados. |

## Actividad 3 — Herramienta propuesta: Netlify

La unidad menciona GitHub Actions, GitLab CI/CD, Jenkins, CircleCI y Travis CI. Se propone
**Netlify**, una plataforma de entrega y despliegue continuo para aplicaciones web que no
figura en el material.

**¿Qué hace?** Se conecta con el repositorio de GitHub y, con cada cambio en la rama
principal, ejecuta el build y publica la nueva versión sin intervención manual. Es el tramo
de despliegue del pipeline (Build → Deploy) resuelto como servicio.

**¿Por qué aplicarla?**

- **Experiencia propia.** Es donde el equipo ya publica la web del proyecto, configurada con un
  `netlify.toml` versionado en el repositorio: ya mostró que funciona con React + Vite.
- **Deploy Previews.** Cada Pull Request genera una versión publicada en una URL propia, así
  quien revisa puede probar el cambio antes de aprobar el merge.
- **Rollback inmediato.** Cada despliegue queda guardado como una versión inmutable; si una
  falla, se vuelve a la anterior con un clic.
- **Variables por entorno.** Producción y versiones de prueba tienen variables distintas, sin
  guardar claves en el repositorio.
- **Costo y administración.** No requiere servidores propios, a diferencia de Jenkins, y su
  plan gratuito alcanza para un proyecto de este tamaño.

> Netlify no reemplaza a una herramienta de integración continua, porque no ejecuta las
> pruebas del proyecto. Lo adecuado es combinarla con GitHub Actions: Actions verifica el
> código y Netlify lo publica.

## Actividad 4 — Interrogantes

### a) Relación entre la Unidad 3 (buenas prácticas) y la Unidad 4

Las dos unidades se complementan: la Unidad 3 define cómo debe escribirse el código y la
Unidad 4 automatiza la verificación de que se cumpla. Sin buenas prácticas, la automatización
no tiene sobre qué apoyarse; sin automatización, las buenas prácticas dependen de que cada
persona se acuerde de aplicarlas.

| Unidad 3 — Buena práctica | Unidad 4 — Cómo se automatiza o potencia |
|---|---|
| Commits pequeños y descriptivos | Son la condición para integrar con frecuencia: un cambio chico se verifica y se revisa rápido. |
| Estándares de código y nombres significativos | Se convierten en reglas de linting que el pipeline ejecuta en cada cambio. |
| Código modular, con responsabilidad única | Se puede probar por partes: habilita las pruebas unitarias automatizadas. |
| Revisión de código entre pares | Se formaliza en el Pull Request, que llega al revisor con el build y las pruebas ya ejecutados. |
| Refactorización | Las pruebas automatizadas son la red de seguridad para refactorizar sin miedo a romper algo. |
| Manejo explícito de errores | Los errores registrados permiten el monitoreo y el diagnóstico después de un despliegue. |
| Documentación del proyecto | Vive junto al código en el repositorio y se actualiza en el mismo flujo de trabajo. |

Un ejemplo del propio proyecto: en la [actividad de la Unidad 3](../03-unidad-3/README.md),
otro equipo revisó nuestro código y aplicamos cinco mejoras a mano, como dejar de descartar
errores en silencio o unificar la verificación de permisos. Con CI, varias de esas reglas
pueden quedar como verificaciones automáticas en cada cambio, para que el problema no vuelva.

### b) ¿Cómo modifica CI/CD el proceso tradicional y qué aporta?

En el modelo tradicional cada desarrollador trabaja semanas en su rama, la integración y las
pruebas se concentran al final y el despliegue es manual y riesgoso. Los problemas aparecen
todos juntos, cuando corregirlos es más caro.

CI/CD invierte esa lógica: cada cambio se integra apenas está listo, se compila y se prueba
automáticamente, y queda en condiciones de desplegarse. La integración deja de ser un evento
al final del proyecto y pasa a ser una actividad continua.

- **Calidad:** cada cambio pasa por las mismas pruebas; los errores se detectan cuando el
  cambio es reciente y manejable.
- **Tiempo:** no hace falta esperar a una integración final ni a un despliegue manual.
- **Trazabilidad:** cada versión desplegada se relaciona con su commit, su autor, su Pull
  Request y las pruebas que la validaron.
- **Productividad:** compilar, probar y desplegar lo hace el pipeline; el equipo dedica ese
  tiempo a desarrollar.

### c) ¿Qué mejoras introduce CI/CD en el trabajo colaborativo?

- **Menos conflictos.** Al integrar seguido, las ramas duran poco y se alejan menos de la
  principal.
- **Revisiones más útiles.** El revisor recibe el PR con el build y las pruebas ya ejecutados y
  se concentra en la lógica y el diseño.
- **Transparencia.** Todos ven qué se integró, qué falló y qué está desplegado.
- **Criterios comunes.** Las reglas de calidad no dependen de la memoria de cada integrante: el
  pipeline las aplica igual a todos.
- **Retroalimentación rápida.** Un error se le informa a quien hizo el cambio en minutos, no
  días después.
- **Rama principal confiable.** Si `main` siempre funciona, cualquiera puede partir de ella sin
  arrastrar errores ajenos.

### d) ¿Cómo se podría incorporar la IA a los contenidos de la unidad?

| Contenido de la unidad | Aporte posible de la IA |
|---|---|
| Pipelines | Generar un primer borrador del workflow en YAML a partir de la descripción del proyecto. |
| Pruebas automatizadas | Proponer casos de prueba, incluidos los casos límite que suelen olvidarse. |
| Pull Requests | Resumir los cambios de un PR y señalar posibles errores antes de la revisión humana. |
| Builds fallidos | Interpretar el registro de un error de compilación y sugerir su causa probable. |
| Seguridad | Detectar dependencias vulnerables o secretos escritos por error en el código. |
| Issues y Kanban | Clasificar issues, detectar duplicados y sugerir prioridades. |
| Métricas | Analizar el historial de despliegues y el lead time para detectar dónde se acumulan las esperas. |

En todos los casos la IA es un apoyo y no reemplaza la validación del equipo. Puede generar un
pipeline correcto en general pero incorrecto para el proyecto: con otra versión de Node, un
comando de prueba que no existe o una clave escrita en el archivo. Nunca se le deben entregar
secretos ni credenciales, y lo que proponga tiene que pasar por el mismo Pull Request y la misma
revisión que el código escrito por una persona.
