# Informe de uso de IA en programación — Parte 3

Metodología de Sistemas II · UTN FRRe · TUP 2026  
Centro Educativo *"Educar para Transformar"* — **Grupo 4**  
Desarrollo de la Parte 3: Cerqueiro, Gonzalo

| Dato | Valor |
|---|---|
| Período | 09/11/2026 al 17/11/2026 |
| Producto | App móvil para las familias (React Native + Expo) y cobranza en la web del administrador, sobre la base de datos existente (Supabase) |
| Herramientas de IA | **Claude Code** (modelo Claude Opus, integrado en VS Code con acceso al repositorio) y **Gemini** (consultas fuera del repositorio) |
| Bitácora | [`bitacora-ia.md`](bitacora-ia.md): 21 registros |

**Cómo se trabajó con la IA.** El desarrollo se dividió en etapas cerradas: modelo de
datos, ingreso y cuotas, pago, cobranza en la web, cuenta e inscripciones, testing. En cada
una, la IA proponía primero el diseño con sus decisiones y el porqué, el equipo lo validaba o
lo corregía, y recién entonces se escribía el código. Cada etapa terminó con pruebas en un
celular Android real o en la web, y con un Pull Request que el pipeline verificó
automáticamente. Ningún cambio llegó a la versión estable sin pasar por esos controles.

---

## 1. Relación entre la aplicación web y la aplicación móvil

### 1.1. Qué funcionalidades ya existían en la web

| Parte | Funcionalidades |
|---|---|
| Parte 1 · Página web | Sitio institucional público, registro e ingreso con seis roles (administración, autoridad, docente, personal, padre y estudiante), panel de contenido |
| Parte 2 · Sistema de Gestión | Solicitudes de inscripción y matriculación, legajo de alumnos y tutores, cursos, materias y docentes, calificaciones, asistencia, comunicados, personal, postulaciones, indicadores, boletines y auditoría |

La web **no tenía ningún dato económico**: no existían precios, facturas ni pagos.

### 1.2. Qué se incorporó

| Dónde | Qué | Para quién |
|---|---|---|
| App móvil | Ingreso con la cuenta de la web, mis hijos, cuotas pendientes y pagadas con vencimiento, importe y estado, detalle por ítem, elegir ítems y emitir el comprobante, adjuntar la transferencia, historial de facturas y comprobantes por período, deuda por ítem, inscripciones a servicios, cambiar contraseña | Padre |
| Web | Precios de la cuota y los servicios, generación de las facturas del mes, reporte de cobranza (ingresos y pagos completos e incompletos por período), cambios de precio y pagos en la auditoría | Administración y autoridad |

El enunciado separa los dos públicos: las consultas *por alumno* van en la app y los
listados generales, en la web. Por eso la app solo admite el rol padre y el administrador
sigue usando la web.

### 1.3. Qué información comparten

Las dos aplicaciones usan **la misma base de datos y las mismas cuentas**:

- **Cuentas y roles** (`profiles` y Supabase Auth): el padre ingresa a la app con el mismo
  email y la misma contraseña que usa en la web.
- **Alumnos y tutores** (`alumnos`, `alumno_tutor`): de acá sale qué hijos ve cada padre.
- **Matrículas y ciclo lectivo** (`matriculas`, `ciclos_lectivos`): deciden a quién se le
  factura cada mes.
- **Cobranza** (tablas nuevas): `conceptos`, `inscripciones_servicio`, `facturas`,
  `factura_items`, `comprobantes` y la vista `facturas_estado`, que leen las dos.
- **Archivos**: las transferencias se guardan en un bucket privado de Supabase Storage.

### 1.4. Cómo se comunican

La web y la app **no se comunican entre sí**: cada una habla con Supabase.

```text
   Web (React + Vite)                    App móvil (React Native + Expo)
   administración, autoridad             padre
            │                                       │
            │ supabase-js · HTTPS · sesión          │ supabase-js · HTTPS · sesión
            ▼                                       ▼
   ┌────────────────────────────────────────────────────────────┐
   │ Supabase                                                    │
   │  Auth (cuentas) · PostgreSQL con RLS · Storage (archivos)   │
   │  Las reglas y los permisos viven acá                        │
   └────────────────────────────────────────────────────────────┘
```

Cada pedido viaja con la sesión de quien lo hace, y las políticas de seguridad por fila
(RLS) deciden qué filas puede leer o modificar. No hay un servidor propio entre las
aplicaciones y la base: no hizo falta, y habría sido un componente más que mantener.

### 1.5. Qué modificaciones fue necesario realizar en el backend

Un solo script versionado, [`docs/supabase-cobranza.sql`](../supabase-cobranza.sql), que
**agrega** y no modifica nada de lo existente:

| Pieza | Para qué |
|---|---|
| 5 tablas | Precios, inscripciones a servicios, facturas, ítems y comprobantes |
| Vista `facturas_estado` | Calcula total, pagado, saldo y estado de cada factura |
| `generar_facturas()` | Crea las facturas del mes. Solo la administración |
| `emitir_comprobante()` e `informar_transferencia()` | Las dos únicas escrituras del padre: validan todo y hacen el cambio completo en una transacción |
| Disparador de inscripciones | Hasta dos deportes al mismo tiempo, un solo recorrido, sin duplicados |
| Políticas RLS y bucket privado | El padre solo ve lo de sus hijos; solo la administración fija precios |
| Disparadores de auditoría | Los cambios de precio y los pagos quedan registrados |

### 1.6. Qué información se reutiliza

- Las **cuentas, contraseñas y roles** de la web.
- Las funciones de seguridad de la Parte 2: `rol_actual()`, `tiene_rol()` y
  `alumnos_a_cargo()`. La regla "un padre solo ve a sus hijos" ya estaba escrita y se aplicó
  a las tablas nuevas.
- La **matrícula activa** como criterio de facturación, y la **auditoría** de la Parte 2.
- Los **patrones de diseño** de la web, replicados en la app: Singleton para el cliente de
  Supabase, Facade para la capa de servicios y State para los estados de la factura y del
  comprobante.
- La identidad visual: los colores de la marca son los mismos en las dos.

### 1.7. Cómo se mantienen sincronizados ambos sistemas

**No hay nada que sincronizar, porque no hay copias.** Una factura que la administración
genera en la web aparece en la app porque es la misma fila de la misma base. Cuando el padre
informa una transferencia desde el teléfono, el reporte de la web la refleja en la próxima
consulta.

Además, el total y el estado de la factura **no se guardan: se calculan** en la vista
`facturas_estado` cada vez que alguien los pide. Un dato guardado se puede desactualizar si
alguien cambia un ítem y se olvida de recalcularlo; uno calculado, no. Así la web y la app
no pueden mostrar números distintos.

---

## 2. Registro de uso de la IA — Bitácora de IA

La bitácora completa está en [`bitacora-ia.md`](bitacora-ia.md), con las columnas que pide
el enunciado y un detalle de los casos que dejaron un aprendizaje. Se completó **a medida
que se trabajaba**, no al final.

| Indicador | Valor |
|---|---|
| Registros | 21 (20 de Claude Code y 1 de Gemini) |
| ¿Funcionó? — Sí | 13 |
| ¿Funcionó? — Parcialmente | 4 (registros 5, 7, 8 y 11) |
| ¿Funcionó? — No | 4 (registros 1, 6, 13 y 19) |

| N.º | Problema | Herramienta | ¿Funcionó? | Resultado |
|---|---|---|---|---|
| 1 | Elegir la tecnología de la app tras el adelanto de fecha | Claude Code | No | Reemplazado: se mantuvo Expo |
| 2 | Diseñar el modelo de cobranza | Claude Code | Sí | Correcto |
| 3 | Escribir el script SQL del modelo | Claude Code | Sí | Correcto |
| 4 | Advertencia de RLS al cargar los datos | Claude Code | Sí | Correcto |
| 5 | Diseñar ingreso y cuotas | Claude Code | Parcialmente | Correcto después de justificar los cambios al plan |
| 6 | Supuesto del plan: "la capa de servicios se comparte" | Claude Code | No | Reemplazado |
| 7 | Crear el proyecto Expo | Claude Code | Parcialmente | Correcto |
| 8 | La app no abría en el celular | Claude Code | Parcialmente | Correcto |
| 9 | Programar ingreso y cuotas | Claude Code | Sí | Correcto: 7 pruebas |
| 10 | Diseñar el pago | Claude Code | Sí | Correcto |
| 11 | Programar el pago | Claude Code | Parcialmente | Correcto: 10 pruebas |
| 12 | Adjuntar la transferencia fallaba | Claude Code | Sí | Correcto |
| 13 | Una factura que nadie generó a propósito | Claude Code | No | La prueba de seguridad se repite |
| 14 | Diseñar la cobranza en la web | Claude Code | Sí | Correcto |
| 15 | Programar precios, facturación y reporte | Claude Code | Sí | Correcto |
| 16 | Mejoras pedidas al usar las pantallas | Claude Code | Sí | Correcto |
| 17 | Cerrar las pruebas con un "listo" | Claude Code | Sí | Correcto |
| 18 | Diseñar el testing | Claude Code | Sí | Correcto: se sumó la Etapa 4b |
| 19 | Pantallas anunciadas que no existían | Claude Code | No | Corregido |
| 20 | Programar contraseña e inscripciones | Claude Code | Sí | Correcto: 9 pruebas |
| 21 | Dudas sobre el funcionamiento del sistema | Gemini | Sí | Correcto |

---

## 3. IA vs. conocimiento del sistema

> ¿Por qué una IA puede generar una solución técnicamente correcta pero incorrecta para
> nuestro sistema?

Porque la IA razona sobre **lo que es habitual** en una tecnología o en un tipo de problema,
y nuestro sistema tiene decisiones, compromisos y particularidades que **no son habituales
ni están escritas en ningún lado salvo en el proyecto**. Cuando la IA no las lee, o las lee
pero no las pondera, produce algo que compila, que funcionaría en otro proyecto y que en el
nuestro está mal. En la Parte 3 pasó en cada una de las siete dimensiones:

| Dimensión | Qué pasó en el proyecto | Registro |
|---|---|---|
| **Contexto** | Con la entrega adelantada, la IA recomendó cambiar Expo por una app web instalable. Era viable y más rápido, pero contradecía el plan de trabajo ya entregado a la cátedra. La IA optimizó el plazo, que era lo visible en la conversación; el compromiso con la cátedra lo aportó el equipo. | 1 |
| **Arquitectura** | El plan de trabajo, generado con IA, afirmaba que la app "comparte la capa de servicios" de la web. Suena razonable porque las dos usan JavaScript y la misma librería, pero el código de la web depende de Vite y del navegador. Se descubrió al implementar. | 6 |
| **Reglas de negocio** | El plan proponía el patrón Strategy para calcular importes. Con nuestras reglas, en las que cada deporte y cada recorrido tiene su propio precio, el cálculo es igual para todos y el patrón no aporta nada. Otras reglas, como el vencimiento el día 10, que cada ítem se pague completo y una cuota única, las definió el equipo: el enunciado no las dice. | 2 |
| **Base de datos** | La auditoría mostraba `importe: 18000 → 18500` sin decir de qué concepto, porque el disparador de la Parte 2 guarda solo los campos que cambiaron. Y si una política RLS bloquea un cambio, Supabase no da error: devuelve cero filas. Una pantalla "correcta" habría dicho "Guardado" sin que se guardara nada. | 15, 16 |
| **Requisitos** | Dos pedidos del enunciado, cambiar la contraseña y que el padre consulte las inscripciones de cada hijo, quedaron fuera del alcance mínimo hasta que se releyó el enunciado completo para diseñar el testing. | 18 |
| **Permisos** | La prueba de que un padre no puede generar facturas se ejecutó como administrador de la base y no como padre, y se registró como aprobada. La consulta era correcta; el rol con el que se ejecutó, no. Lo reveló una factura de mayo que nadie había pedido. | 13 |
| **Tecnologías** | Expo SDK 58 es posterior a lo que la IA conocía, y hubo que configurarlo leyendo la documentación oficial. Aun así, la opción que la documentación recomienda para leer archivos fallaba dentro de Expo Go en Android, y la causa apareció leyendo el código nativo de la librería. Antes, un comando que "hacía funcionar" la instalación ignorando un conflicto de versiones quitó 21 paquetes. | 7, 8, 12 |

**Conclusión del apartado.** En casi todos los casos el código de la IA era técnicamente
válido. Los errores no fueron de sintaxis ni de lógica, sino de **ajuste a nuestro sistema**:
un supuesto sin verificar contra el código, una regla interpretada sin preguntar, una prueba
con el rol equivocado o un entorno distinto del que describe la documentación. Por eso el
método fue que la IA explicara cada decisión antes de programar y que todo se probara en el
entorno real.

---

## 4. Comparación: desarrollo tradicional vs. desarrollo asistido por IA

Completada a partir de la experiencia de la Parte 3. La columna *Sin IA* describe cómo
trabajaba el equipo sin asistencia, o cómo habría encarado la misma tarea.

| Aspecto | Sin IA | Con IA |
|---|---|---|
| **Generación de código** | Cada pantalla, consulta y política se escribe a mano, buscando ejemplos en la documentación. Lo repetitivo, como formularios, estilos y manejo de errores, consume la mayor parte del tiempo. | La IA genera pantallas completas, servicios y scripts SQL siguiendo las convenciones del proyecto. El trabajo pasa a ser revisar, probar y pedir correcciones. |
| **Tiempo de desarrollo** | Una app de 8 pantallas, 2 pantallas web y un modelo de datos nuevo habrían llevado varias semanas a una sola persona. | Se hizo en unos nueve días, por etapas. Parte del tiempo ganado se usó en verificar, y algunos errores de la IA costaron rondas de prueba. |
| **Comprensión del código** | Se entiende lo que uno escribe, pero el código suele quedar con poca documentación. | Hay que pedir explícitamente que explique el porqué. Con ese pedido, cada archivo quedó con su propósito y sus criterios de aceptación. Sin él, es fácil aceptar código que no se entiende. |
| **Detección de errores** | Los errores se encuentran al probar, depurando a mano. | La IA ayudó a diagnosticar leyendo errores, documentación y el código de las librerías. También introdujo errores propios, de contexto más que de sintaxis, que se detectaron al probar en el entorno real. |
| **Documentación** | Suele quedar para el final o no hacerse. | Se generó en cada etapa: diseño, decisiones, pruebas y bitácora. El costo es revisar que diga exactamente lo que pasó. |
| **Aprendizaje** | Se aprende investigando, con más esfuerzo y más retención. | Se aprende al discutir alternativas y pedir justificaciones. El riesgo es delegar sin entender; se mitigó validando cada diseño antes de programarlo. |
| **Integración** | Hay que conocer a fondo cómo se conectan las piezas: web, base y app. | La IA leyó el esquema existente y colgó el modelo nuevo de las tablas que ya había. Falló al suponer integraciones que no verificó, como la capa de servicios compartida. |
| **Seguridad** | Depende del conocimiento del desarrollador sobre RLS y permisos. | La IA aplicó las políticas por rol de forma consistente, pero una prueba de seguridad mal ejecutada pasó como aprobada. La seguridad requiere verificar cada resultado, no aceptar un "salió bien". |
| **Mantenimiento** | El código refleja el estilo de cada uno, con variaciones. | El código es uniforme y comentado, con los patrones del proyecto. Mantenerlo exige entender lo que la IA escribió; por eso se documentó el porqué. |
| **Calidad del resultado** | Depende del tiempo disponible: con plazos cortos se recortan pruebas y documentación. | Con el mismo plazo se pudo sostener lint, pruebas automáticas, pruebas en el celular y documentación. La calidad dependió de que el equipo validara y probara; la IA sola no la garantiza. |

---

## 5. Reflexión crítica

**1. ¿La utilización de IA redujo realmente el tiempo de desarrollo?**
Sí. En unos nueve días se construyeron el modelo de cobranza, ocho pantallas de la app, dos
de la web, las pruebas y la documentación, con una sola persona desarrollando. Pero la
reducción no fue proporcional a la velocidad con que la IA escribe: buena parte del tiempo se
fue en leer, validar, probar en el celular y corregir. Algunos errores de la IA (la
instalación que quitó paquetes, la prueba de seguridad mal ejecutada, las pantallas que se
anunciaron sin estar programadas) costaron tiempo extra.

**2. ¿En qué tareas resultó más útil?**
- En el modelo de datos y el SQL: tablas, funciones, políticas RLS y consultas de
  verificación, siguiendo las convenciones de la Parte 2.
- En el código repetitivo de las pantallas y los servicios.
- En leer documentación y código ajeno: la documentación de Expo SDK 58, el código nativo de
  las librerías de archivos y el de la librería de Supabase.
- En el diagnóstico de errores a partir de un mensaje o una captura.
- En la documentación de cada etapa y en mantener la bitácora al día.

**3. ¿En qué tareas produjo errores?**
En las que dependían del contexto del proyecto y no de la técnica:
- elegir la tecnología sin pesar el compromiso con la cátedra;
- suponer que la capa de servicios se podía compartir;
- dar por aprobada una prueba sin pedir su resultado;
- forzar la instalación de dependencias;
- un detalle de presentación ("Marzo De 2027");
- un mensaje que no dejó claro que el código todavía no existía.

**4. ¿Qué tipo de errores fueron más frecuentes?**
Los **supuestos sin verificar**: afirmar algo razonable en general sin comprobarlo contra el
código, el entorno o los datos reales. No hubo errores de sintaxis que llegaran a la versión
estable, porque el lint, la compilación y el pipeline los habrían frenado.

**5. ¿Fue necesario modificar código generado por IA?**
Sí:
- el selector de archivos, que no se podía leer en Expo Go;
- el margen para la barra de navegación de Android;
- una dependencia desalineada con el SDK;
- la auditoría, para que nombre lo que cambió;
- el formato de los meses.

Además, el equipo pidió cambios al usar las pantallas: categorías distinguibles por color e
ícono y un botón Editar antes de Guardar los precios. La IA hizo las modificaciones, pero las
necesidades las detectó el equipo al probar.

**6. ¿La IA comprendió correctamente la base de datos?**
En lo estructural, sí: leyó los scripts existentes y colgó el modelo nuevo de las tablas y
funciones de seguridad de la Parte 2, sin duplicar nada. Le costaron los **comportamientos**
que no se ven en la estructura: que la auditoría guarda solo los campos modificados. El caso
de que un cambio bloqueado por RLS no devuelve error sí lo anticipó.

**7. ¿La IA comprendió correctamente las reglas de negocio?**
Las explícitas, sí: dos deportes como máximo, cuatro recorridos, pago solo por transferencia,
varios comprobantes por factura. Las que el enunciado deja abiertas, como el día de
vencimiento, si un ítem se puede pagar en partes o qué es un "pago incompleto", las planteó
como decisiones y las resolvió el equipo. Dos requisitos quedaron afuera hasta que se releyó
el enunciado completo.

**8. ¿Qué riesgos identificaron?**
- **Dar por verificado lo que no se verificó**, sobre todo en seguridad.
- **Comandos que "hacen funcionar" algo** ignorando advertencias.
- **Conocimiento desactualizado** sobre tecnologías nuevas, como Expo SDK 58.
- **Datos de prueba en producción**: la base de pruebas es la misma que usa el sitio
  publicado, y una prueba dejó un precio cambiado.
- **Exposición de credenciales**: tokens y claves nunca se pegaron en el chat ni se subieron
  al repositorio.
- **Perder la comprensión del propio código** si se acepta sin leer.

**9. ¿Qué conocimientos necesitó el equipo para validar las respuestas de IA?**
- SQL y PostgreSQL, en especial las políticas RLS y los roles.
- React y la idea de componentes y estado, para leer las pantallas de la app.
- Supabase: cuentas, almacenamiento y cómo viaja la sesión.
- Git y Pull Requests.
- Conocer a fondo el enunciado, el plan de trabajo y los criterios de aceptación de cada
  historia, que fueron la vara para decidir si una propuesta servía.
- Criterio para probar: qué caso puede fallar y cómo comprobar el resultado en el sistema y
  no en la palabra de la IA.

**10. ¿Consideran que utilizar IA permite reemplazar el conocimiento del programador?
Fundamentar la respuesta.**
No. La IA reemplazó buena parte del trabajo de **escribir**, pero no el de **decidir ni el de
verificar**. En la Parte 3, las decisiones que importaron las tomó el equipo:
- mantener Expo;
- las reglas de vencimiento y de pago;
- qué entraba en el alcance mínimo;
- frenar un comando que rompía dependencias;
- respetar el bloqueo del antivirus.

Los errores más serios de la IA, como la prueba de seguridad aprobada sin hacerse o la
arquitectura supuesta, solo se detectan si quien la usa sabe qué debería pasar. Sin ese
conocimiento, el código generado parece correcto y no lo es. La IA multiplica el trabajo de
quien sabe validarlo; a quien no sabe, le multiplica los errores. Y la responsabilidad
sobre lo que se entrega sigue siendo del equipo.
