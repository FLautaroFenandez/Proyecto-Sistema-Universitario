# Bitácora de uso de IA — Parte 3 (aplicación móvil)

Metodología de Sistemas II · UTN FRRe · TUP 2026  
Centro Educativo *"Educar para Transformar"* — **Grupo 4**  

Registro que pide el enunciado de la Parte 3: cada intervención relevante de la IA en el
desarrollo de la app móvil, si funcionó y qué hubo que cambiar. Se completa **a medida que
se trabaja**, no al final. Solo incluye la Parte 3.

**Prompt utilizado:** el pedido que se le hizo a la IA en ese momento, con el problema que había que resolver. Entre comillas, las frases textuales; sin comillas, el pedido resumido a partir de los mensajes de la conversación.

**Herramientas:** Claude Code (modelo Claude Opus 5.5), integrado en VS Code, con acceso al
repositorio (registros 1 a 20, 22 y 23), y Gemini, para consultas fuera del repositorio (registro 21).

> Los registros 22 y 23 son de la versión 1.1 de la app, hecha el 23/11 con la fecha de
> entrega extendida. No están en la bitácora entregada a la cátedra.

## Registro

| N.º | Fecha | Problema | Prompt utilizado | Herramienta | Respuesta de la IA | ¿Funcionó? | Modificaciones realizadas | Resultado |
|---|---|---|---|---|---|---|---|---|
| 1 | 09/11 | Elegir la tecnología de la app después de que la cátedra adelantara la entrega una semana | La cátedra adelantó una semana la entrega: mañana se presentan la app terminada, la actividad de testing y el informe de IA con la bitácora. Para comenzar el desarrollo de la app en este tiempo acotado tengo que decidir cómo abordarlo, teniendo en cuenta las nuevas directivas: por etapas cerradas, paso a paso, con lo mínimo indispensable y explicando cada punto. ¿Cómo podemos empezar? ([detalle](#1-tecnología-de-la-app)) | Claude Code | Recomendó una app web instalable (PWA) dentro del proyecto web, en lugar de Expo | No | El equipo mantuvo React Native + Expo, comprometido en el plan de trabajo | Reemplazado |
| 2 | 09/11 | Diseñar el modelo de datos de cobranza integrado al esquema existente | Decidí que vayamos con Expo, como dice el plan, y por partes. Empecemos por el modelo de datos de cobranza (cuotas, facturas y comprobantes) sobre la base que ya existe, sin apurar desarrollos ni saltear explicaciones: cada decisión con su porqué y su cómo. ([detalle](#2-modelo-de-datos-de-cobranza)) | Claude Code | Diseño de 5 tablas, una vista y 3 funciones ([documento](01-modelo-cobranza/README.md)) | Sí | Ninguna: el equipo revisó el diseño y aprobó las cuatro decisiones planteadas | Correcto |
| 3 | 09/11 | Implementar el modelo validado en la base de datos | El diseño del modelo me parece correcto. Pasalo a un script SQL para ejecutar en Supabase, con las reglas del proyecto para los scripts: versionado, idempotente y con sus políticas RLS. ([detalle](#3-script-sql-de-cobranza)) | Claude Code | `supabase-cobranza.sql` (tablas, reglas, funciones de pago, vista, RLS y Storage) y `supabase-cobranza-datos.sql` (precios, servicios y facturas de prueba) | Sí | Ninguna: los dos scripts corrieron sin errores en la primera ejecución | Correcto |
| 4 | 09/11 | Al ejecutar los datos de prueba, Supabase advierte que se crea una tabla sin RLS | Al ejecutar `supabase-cobranza-datos.sql`, Supabase advierte que la consulta crea una tabla sin RLS (adjunto la captura). ¿Es un problema real o puedo ejecutarlo así? | Claude Code | Es un falso positivo: el script solo inserta datos. Antes de ejecutarlo, comprobar con una consulta a `pg_class` que las 5 tablas tienen RLS activo, y después elegir "Run without RLS" | Sí | Ninguna: la consulta confirmó RLS activo en las 5 tablas antes de ejecutar | Correcto |
| 5 | 09/11 | Diseñar las pantallas de ingreso y consulta de cuotas (HU-M6 y HU-M1) | Etapa 1 cerrada. Sigamos con la Etapa 2: el ingreso a la app y la consulta de cuotas (HU-M6 y HU-M1). Primero el diseño de las pantallas, para validarlo, y después el código. ([detalle](#5-diseño-de-la-app-ingreso-y-cuotas)) | Claude Code | 4 pantallas, estructura del proyecto Expo con Expo Router y los patrones Singleton, Facade y State ([documento](02-ingreso-y-cuotas/README.md)) | Parcialmente | El equipo aprobó el recorrido, pero pidió justificar por qué cambiaban la carpeta, la capa de servicios y el lenguaje respecto de lo planificado, y preguntó qué pasa con el rol administrador. Se agregó la sección 7 y el apartado sobre el administrador; el equipo aceptó que el administrador use la web | Correcto (después de los cambios) |
| 7 | 09/11 | Crear el proyecto Expo y conectarlo a Supabase | Estoy de acuerdo con el diseño de ingreso y cuotas. Creá el proyecto Expo y conectalo a Supabase. Y documentá brevemente las decisiones y los pasos de la app, para ir llevando cuenta de lo que hacemos. ([detalle](#7-creación-del-proyecto-expo)) | Claude Code | Proyecto Expo SDK 58 con Expo Router y el cliente de Supabase; antes de configurarlo, consultó la documentación oficial de esa versión | Parcialmente | Ejecutó un comando antes de instalar la base del proyecto y lo repitió en el orden correcto. Cambió de "ignorar la app en ESLint" a "lintearla con una regla propia" | Correcto: el equipo abrió la app en su celular con Expo Go y confirmó la conexión con Supabase |
| 6 | 29/09 (detectado el 09/11) | El plan de trabajo afirmaba que la app compartiría la capa de servicios de la web | Pedido de generar el plan de trabajo de la Parte 3 (app móvil): tecnologías, arquitectura, historias de usuario y cronograma. ([detalle](#6-supuesto-del-plan-la-capa-de-servicios-se-comparte)) | Claude Code | En la sección 1.7 del plan: "la capa de servicios se comparte" | No | Al revisar el código para la Etapa 2 se vio que los servicios dependen de Vite. Se mantiene el patrón Facade con una capa propia de la app | Reemplazado |
| 8 | 12/11 | La app dejó de abrir en el celular ("Failed to download remote update") y falló una actualización de Expo | "Corrí npx expo start y me dio error del tipo 'Uncaught Error: java.io.IOException: Failed to download remote update'. Me aparecía un update en la terminal para Expo y quise actualizar, pero también me dio error." Después, los errores del túnel y de ngrok, con capturas. ([detalle](#8-la-app-no-abría-en-el-celular)) | Claude Code | Diagnóstico: el Wi-Fi figuraba como red pública y el firewall bloqueaba al celular. Para el túnel, intentó instalar ngrok forzando las dependencias | Parcialmente | Se descartó forzar la instalación (quitaba 21 paquetes) y se corrigió la causa real: `react-dom` desalineado con el SDK. El antivirus bloqueó ngrok, y se pasó al túnel propio de Expo con un token de acceso | Correcto: la app abre por el túnel de Expo y la instalación desde cero funciona |
| 9 | 12/11 y 13/11 | Programar las pantallas de ingreso y de consulta de cuotas (HU-M6 y HU-M1) | Ya conecté el celular por el túnel de Expo con el token. Sigamos con las pantallas de la Etapa 2 según el diseño aprobado: ingreso, mis hijos, cuotas del hijo y detalle de la factura. ([detalle](#9-pantallas-de-ingreso-y-cuotas)) | Claude Code | 4 pantallas, la capa de servicios, el patrón State para la factura y la protección de pantallas con `Stack.Protected`, consultando antes la documentación del SDK 58 | Sí | Ninguna en el código. Faltaba un dato: la cuenta de padre de prueba no era tutora de ningún alumno, y se la vinculó desde la web | Correcto: las 7 pruebas en el celular dieron el resultado esperado |
| 10 | 13/11 | Diseñar el pago desde la app (HU-M2, HU-M4 y HU-M3) | Las pruebas de ingreso y cuotas salieron como se esperaba. Hay cosas para cambiar, pero primero completemos los requisitos: sigamos con el pago desde la app (elegir ítems, comprobante, transferencia e historial), empezando por el diseño. | Claude Code | Recorrido de pago en 7 pasos, 2 pantallas nuevas y 6 decisiones a validar ([documento](03-pagar/README.md)) | Sí | Ninguna: el equipo aprobó las seis decisiones, con la reserva de revisarlas después de usarlo | Correcto |
| 11 | 13/11 | Programar el pago desde la app (HU-M2, HU-M4 y HU-M3) | Las seis decisiones del diseño del pago me parecen correctas. Implementémoslo: elegir los ítems, emitir el comprobante, adjuntar la transferencia y el historial con la deuda por ítem. Si hay que cambiar algo, lo vemos después. | Claude Code | Casillas y botón Pagar en la factura, pantalla del comprobante con adjuntar y ver el archivo, pantalla de historial y deuda por ítem. Antes consultó la documentación del SDK 58 para elegir y leer el archivo | Parcialmente | Corrigió dos avisos del analizador del editor. En el celular, adjuntar el archivo falló (registro 12); además, el final de las pantallas quedaba tapado por la barra de navegación de Android, y se agregó el margen en el marco común | Correcto: las 10 pruebas en el celular dieron el resultado esperado |
| 12 | 13/11 | Adjuntar la transferencia fallaba con cualquier imagen o PDF | En la prueba 5 no me deja adjuntar ningún archivo: probé con PDF y con imágenes y no hay caso. La consola muestra: "Missing 'READ' permission for accessing the file". ([detalle](#12-el-archivo-no-se-podía-leer)) | Claude Code | La causa estaba en Expo Go: el selector copiaba el archivo a una carpeta que el módulo de archivos no deja leer. Se dejó de copiar y se lee el enlace que da Android | Sí | Antes hubo que agregar el registro del error en la consola: la pantalla lo capturaba sin dejar el detalle técnico | Correcto |
| 13 | 13/11 | Una factura de mayo de 2027 que nadie generó a propósito | Terminé las pruebas del pago y adjunto la captura del historial: todo funcionó, solo que al hacer scroll la barra de botones del celular tapa la app. La IA notó en la captura ítems de mayo que nadie había facturado. ([detalle](#13-prueba-de-seguridad-de-la-etapa-1-sin-confirmar)) | Claude Code | La factura salió de la prueba de seguridad de la Etapa 1, que se ejecutó como `postgres` y no como padre: esa prueba quedó registrada como aprobada sin haberse hecho | No | La IA había aceptado "todo salió bien" sin pedir el resultado de cada consulta. Se corrigió el registro de la Etapa 1 | La prueba se repite en la Etapa 5 |
| 14 | 13/11 | Diseñar la cobranza en la web del administrador: precios, facturas del mes y reporte | Ya integré los PR de las etapas 2 y 3. Arranquemos la Etapa 4, la web del administrador: fijar los precios, generar las facturas del mes y el reporte de cobranza. Primero el diseño. | Claude Code | 2 pantallas y 7 decisiones a validar, sin cambios en la base: el modelo de la Etapa 1 ya lo preveía ([documento](04-web-cobranza/README.md)) | Sí | Ninguna: el equipo aprobó las siete decisiones | Correcto |
| 15 | 13/11 | Programar las pantallas de precios, facturación y reporte | De acuerdo con las siete decisiones del diseño. Programá las pantallas de precios y facturación y el reporte de cobranza. | Claude Code | Servicio `cobranza.js` de la web, 2 pantallas, sección en el menú, filtro de auditoría y 13 pruebas de Vitest. Controla que un precio se haya guardado de verdad: si RLS bloquea un cambio, Supabase no da error, devuelve cero filas | Sí | Corrigió los avisos de ESLint y del analizador del editor antes de entregar | Correcto: lint, pruebas y compilación en verde |
| 16 | 13/11 | Mejoras pedidas al usar las pantallas: categorías indistinguibles, precios editables de entrada y auditoría sin decir qué se cambió | "Con respecto a Precios y facturación, me parecería mejor que las categorías sean distinguibles entre sí, ya sea por color, algún emoji o algo distintivo. También que los números no sean editables de primera, sino que haya que apretar el botón para Editar y luego poder Guardar. En Auditoría, en el detalle aparece bien el cambio pero no indica qué se cambió." ([detalle](#16-la-auditoría-no-decía-qué-se-cambió)) | Claude Code | Ícono y color por categoría; botón Editar con Guardar y Cancelar; la auditoría busca el nombre del registro por su id | Sí | Ninguna | Correcto |
| 17 | 13/11 | Cerrar las pruebas con un "listo" del equipo | "Listo", como respuesta a la lista de 11 pruebas de la web, sin el resultado de cada una. ([detalle](#17-verificar-antes-de-dar-por-aprobado)) | Claude Code | Antes de registrar las pruebas, revisó en el navegador lo que había quedado: Natación estaba en $ 19.000 y no en $ 18.000, y los meses decían "Marzo De 2027" | Sí | El equipo volvió el precio a $ 18.000 y la IA corrigió el formato del mes | Correcto: se registró cómo se comprobó cada prueba |
| 18 | 16/11 | Diseñar el testing de la app | ¿Qué falta para completar el mínimo, y dónde podemos agregar o modificar cosas después? Con ese resumen: sigamos con la Etapa 5, el diseño del testing de la app y de la web. | Claude Code | Antes de diseñar releyó el enunciado completo y encontró dos pedidos fuera del mínimo: cambiar la contraseña y que el padre consulte las inscripciones de cada hijo. Propuso hacerlos antes de probar ([documento](04b-cuenta-e-inscripciones/README.md)) | Sí | Ninguna: el equipo aprobó sumar la Etapa 4b | Correcto |
| 19 | 17/11 | El equipo no veía en el celular las pantallas nuevas | "Te dejé una pequeña grabación de pantalla, pero no veo estas nuevas pantallas a las que te referís, de cambiar contraseña e inscripciones." ([detalle](#19-pantallas-anunciadas-que-todavía-no-existían)) | Claude Code | Las pantallas no existían: la IA había presentado el diseño detallado para validarlo otra vez, aunque el equipo ya había aprobado la etapa, y no dijo con claridad que todavía no estaban programadas | No | Se programó la etapa a continuación | Corregido: costó una ronda de prueba |
| 20 | 17/11 | Programar el cambio de contraseña y la consulta de inscripciones | Las pantallas de cambiar contraseña e inscripciones no aparecen en la app (misma grabación): hay que programarlas según el diseño aprobado de la Etapa 4b. | Claude Code | Dos pantallas nuevas, sin cambios en la base. Para verificar la contraseña actual leyó el código de la librería de Supabase instalada (2.119): volver a ingresar con ella la comprueba sin tocar la sesión, y el campo `current_password` solo se valida con una opción del servidor que el proyecto no tiene | Sí | Ninguna | Correcto: 9 pruebas en el celular aprobadas |
| 21 | 09/11 al 17/11 | Dudas menores sobre el funcionamiento del sistema durante el desarrollo | Consultas puntuales del equipo sobre el funcionamiento del sistema, fuera del repositorio. ([detalle](#21-gemini-como-segunda-herramienta)) | Gemini | Explicaciones generales sobre cómo funcionan las piezas del sistema | Sí | Ninguna: no generó código del proyecto | Correcto: complementó las explicaciones de Claude Code |
| 22 | 23/11 | Mejorar la app con la fecha de entrega extendida, sin tocar el informe ni la bitácora entregados | "Se me extendió hasta mañana la entrega, pero no puedo modificar los informes ni los trabajos, por lo cual los cambios que puedo hacer son menores. Me interesa cambiar la APK, dejándola un poco mejor, con más funcionalidades y abarcando todo lo requerido." ([detalle](#22-versión-11-de-la-app)) | Claude Code | Comparó el enunciado con la app. Faltaban inscribir y dar de baja (HU-M5), los grupos de cada deporte por nivel y horario con su profesor, el control de conflictos de horario y los avisos del último día hábil y del día 20. Propuso una versión 1.1 en dos partes: A, inscripciones; B, avisos en la app. Dejó fuera recuperar la contraseña, que necesita un servicio de correo | Sí | El equipo aprobó A y B sin la notificación en el teléfono que se ofrecía como opcional, y pidió que los avisos queden preparados para enviarse por correo | Correcto |
| 23 | 23/11 | Programar la versión 1.1: inscripciones con control de horarios y avisos de cobranza | "Procedamos así con A y B, dejando la posibilidad de hacer escalable para sistema de correo, dependiendo cómo vayamos con el tiempo." ([detalle](#22-versión-11-de-la-app)) | Claude Code | Script `supabase-inscripciones-avisos.sql` (grupos de deportes, control de horarios en el disparador, funciones para inscribir y dar de baja, vista `avisos_cobranza`), 3 pantallas nuevas, horario y profesor en el reporte de la web y 11 pruebas de Vitest ([documento](07-version-1-1/README.md)) | Sí | Ninguna | Correcto: el script corrió y las 11 pruebas en el celular dieron lo esperado, según informó el equipo |

**Herramientas:** Claude Code para el diseño, el código, la documentación y el diagnóstico
de errores (registros 1 a 20, 22 y 23); Gemini para consultas de comprensión (registro 21).

## Detalle de cada registro

### 1. Tecnología de la app

- **Contexto:** la cátedra adelantó la entrega de la app al 10/11, el mismo día que el
  informe de IA, y el desarrollo lo continúa una sola persona.
- **Qué propuso la IA:** reemplazar Expo por una PWA dentro de la web existente. Sus
  argumentos: menos piezas nuevas, publicación automática con Netlify, y que quien prueba
  la app la abre con un enlace sin instalar nada.
- **Qué se decidió:** mantener Expo. La propuesta era técnicamente viable, pero se
  apartaba del plan de trabajo entregado a la cátedra (sección 1.7, *Tecnologías*). El
  equipo priorizó la coherencia con el plan y aceptó correr el riesgo de no terminar a
  tiempo.
- **Aprendizaje:** la IA optimizó el plazo, que era el criterio visible en la
  conversación. No pesó igual un compromiso que ya existía con la cátedra. Ese contexto lo
  aporta el equipo.

### 2. Modelo de datos de cobranza

- **Qué se pidió:** después de leer el esquema actual (`supabase-gestion.sql` y
  `supabase-sprint3.sql`), proponer el modelo antes de escribir el SQL y explicar el
  porqué de cada decisión.
- **Qué propuso la IA:**
  - Las cinco tablas del plan.
  - Calcular el total y el estado de la factura en una vista, en lugar de guardarlos.
  - Dejar fuera del alcance mínimo el patrón Strategy y el control de horarios.
- **Validación del equipo:** se aprobaron las cuatro decisiones planteadas:
  - el vencimiento (día 10);
  - que el pago cuente al informar la transferencia, sin aprobación del administrador;
  - que cada ítem se pague completo;
  - una cuota única para todos los niveles.

### 3. Script SQL de cobranza

- **Qué se pidió:** traducir el diseño aprobado a un script idempotente, con las mismas
  convenciones de los scripts de la Parte 2: pasos numerados, políticas RLS incluidas y
  consultas de verificación al final.
- **Qué entregó la IA:** dos archivos.
  - `docs/supabase-cobranza.sql`: el modelo.
  - `docs/supabase-cobranza-datos.sql`: los datos de prueba, separados del modelo como en
    la Parte 2.
- **Cómo se verificó:** el equipo ejecutó los dos scripts en Supabase y las consultas de
  verificación. Las seis pruebas dieron el resultado esperado: el detalle está en el
  [documento del modelo](01-modelo-cobranza/README.md). La prueba de seguridad debía
  hacerse con la función de impersonación del SQL Editor, como la cuenta de padre de
  prueba. **Corrección del 13/11:** la parte de "rechazar generar facturas" se ejecutó en
  realidad como `postgres` y quedó registrada como aprobada sin serlo (ver
  [registro 13](#13-prueba-de-seguridad-de-la-etapa-1-sin-confirmar)).
- **Por qué importa:** la seguridad se probó contra la base y no solo en pantalla, como
  pide el plan (sección 1.8, *Seguridad*).

### 4. Advertencia de RLS en Supabase

- **Qué pasó:** al ejecutar los datos de prueba, el SQL Editor advirtió que la consulta
  "creaba una tabla sin RLS". El script solo inserta datos.
- **Qué propuso la IA:** no aceptar la advertencia ni ignorarla a ciegas. Primero
  comprobar con una consulta a `pg_class` que las cinco tablas tuvieran RLS activo, y
  después ejecutar el script tal como estaba.
- **Aprendizaje:** las herramientas también dan falsos positivos. La decisión se tomó con
  un dato verificado y no con la palabra de la IA.

### 5. Diseño de la app: ingreso y cuotas

- **Qué se pidió:** diseñar las pantallas a partir de los criterios de aceptación de HU-M6
  y HU-M1 del plan de trabajo, antes de escribir código.
- **Qué hizo la IA antes de proponer:**
  - Consultó la versión vigente de Expo (SDK 58) y confirmó que es compatible con el Node
    instalado (24.16).
  - Revisó cómo están configurados el ESLint y el cliente de Supabase de la web, para no
    romperlos.
- **Diferencias con el plan que propone:**
  - La app tiene su propia capa de servicios, en lugar de compartir la de la web.
  - El código va en una carpeta `app-movil/` en la raíz, en lugar de `src/app`.
  - Las dos razones están en la sección 7 del documento.
- **Qué pidió el equipo antes de aprobar:**
  - Justificar por qué se planteó así al principio y por qué cambia ahora: la carpeta, la
    capa de servicios y el lenguaje.
  - Aclarar qué pasa con el rol administrador.

  La primera versión del diseño enunciaba los cambios, pero no explicaba su historia.

### 6. Supuesto del plan: "la capa de servicios se comparte"

- **Origen:** el plan de trabajo de la Parte 3 (29/09) se generó con asistencia de IA,
  mediante los scripts de `docs/scripts/*_movil.py`. En la sección 1.7 afirma que, al usar
  Expo, *"la capa de servicios se comparte"* con la web.
- **Por qué era incorrecto para nuestro sistema:** la afirmación es razonable en general
  (mismo lenguaje y misma librería), pero nadie la verificó contra el código. Al leerlo
  aparecen tres dependencias de la web:
  - el cliente de Supabase lee la configuración con `import.meta.env`, que solo existe en
    Vite;
  - la sesión se guarda en `localStorage` del navegador;
  - los servicios importan con el alias `@/`, definido en `vite.config.js`.

  Además, la web no tiene servicios de cobranza que reutilizar.
- **Qué se hizo:** la app tiene su propia capa de servicios, con el mismo patrón. Lo que se
  comparte es la base de datos con sus reglas.
- **Aprendizaje (apartado 3 del informe):** la IA generó una afirmación técnicamente
  plausible pero incorrecta para este sistema, porque razonó sobre las tecnologías y no
  sobre el código concreto. El error apareció recién al implementar.

### 7. Creación del proyecto Expo

- **Conocimiento desactualizado:** Expo SDK 58 es posterior a lo que la IA conoce. La
  propia plantilla de Expo trae un archivo para asistentes de IA que advierte que Expo
  cambia en cada versión y que no hay que confiar en lo que el modelo recuerda.
  - Antes de configurar, la IA consultó la documentación oficial de Expo Router (SDK 58) y
    la guía de Supabase para React Native.
  - De ahí salieron los paquetes, la entrada `expo-router/entry` y el almacenamiento de la
    sesión en AsyncStorage.
- **Errores y correcciones:**
  - La IA creó el proyecto sin instalar dependencias y quiso agregar paquetes antes de
    instalar la base. El comando falló y lo repitió en el orden correcto.
  - El diseño proponía que ESLint ignorara la app. Al probarlo, solo aparecieron dos
    diferencias de entorno, y se optó por lintear la app con las mismas reglas que la web.
- **Archivos de la plantilla quitados:** `AGENTS.md` y `.claude/`, que configuraban
  asistentes de IA (uno activaba un complemento). No forman parte de la app.
- **Verificado por la IA:**
  - La app compila para Android.
  - El lint y las 23 pruebas de la web siguen en verde.
  - `.env.local` y `node_modules` quedan fuera del repositorio.
- **Verificado por el equipo (09/11):** la app abrió en un Android real con Expo Go y
  mostró *"Conexión con Supabase: correcta"*.

### 8. La app no abría en el celular

- **Qué pasó:** tres días después de la primera prueba, Expo Go no descargaba la app, y la
  actualización de Expo que ofrecía la terminal fallaba.
- **Diagnóstico de la IA:**
  - Windows tenía el Wi-Fi como red pública, y el firewall bloqueaba la conexión del
    celular a la PC.
  - La actualización fallaba por un conflicto de versiones ajeno al código de la app.
- **Error de la IA:** para instalar ngrok (el túnel) usó `--legacy-peer-deps`, que ignora
  los conflictos. npm quitó 21 paquetes necesarios. Lo detectó al revisar qué se había
  quitado, antes de darlo por bueno, y volvió al estado commiteado.
- **Causa real:** el `package-lock.json` del 09/11 traía `react-dom` 19.3.1, que exige un
  React más nuevo que el que fija el SDK 58 (19.3.0). `npm install` lo había tolerado;
  `npm ci`, que es estricto, lo rechazaba. Se corrigió con `npx expo install react-dom`,
  que elige la versión compatible, y se verificó con una instalación desde cero.
- **Lo que decidió el equipo:**
  - Preguntó qué implicaba marcar la red como privada antes de cambiarla.
  - El antivirus puso en cuarentena el ejecutable de ngrok, y se respetó el bloqueo: se
    quitó ngrok del proyecto.
  - Usó el túnel propio de Expo, con su cuenta y un token de acceso creado por él.
- **Aprendizaje:** un comando que "hace que funcione" ignorando un aviso puede romper otra
  cosa. La verificación (qué cambió, si compila, si instala desde cero) fue lo que frenó
  el error.

### 9. Pantallas de ingreso y cuotas

- **Qué entregó la IA:** el código en capas (servicios, dominio, sesión, pantallas), con
  los criterios de aceptación de HU-M6 y HU-M1 citados en el encabezado de cada pantalla.
- **Qué verificó la IA antes de entregar:**
  - El lint de todo el repositorio.
  - La compilación para Android.
  - Que las consultas fueran válidas y que, sin iniciar sesión, la base no devolviera
    ningún dato.
- **Qué verificó el equipo en el celular (13/11):**
  - Contraseña equivocada → mensaje claro.
  - Cuenta de otro rol → no entra.
  - Cuenta de padre → ve a su hijo, las cuotas de marzo y abril de 2027 con sus importes,
    y el detalle por ítem.
  - La sesión se conserva al cerrar la app, y "Salir" vuelve al ingreso.
- **Hallazgo:** en la primera prueba la app mostró "No tenés alumnos asociados". El código
  estaba bien: la cuenta de padre de prueba no era tutora de ningún alumno. La IA lo
  comprobó en el panel de administración de la web y, con la confirmación del equipo, la
  vinculó desde la ficha del alumno. Sirvió como prueba real del criterio "un usuario sin
  hijos asociados no accede a datos de otros alumnos".

### 12. El archivo no se podía leer

- **Qué pasó:** al adjuntar la transferencia, la app mostraba solo "No se pudo adjuntar el
  archivo", con imágenes y con PDF.
- **Primer error de la IA:** la pantalla capturaba el error para mostrar un mensaje claro,
  pero no dejaba el detalle técnico en la consola, como sí hace la capa de servicios. Sin
  ese dato no había forma de saber qué fallaba. Se agregó el registro y el equipo envió la
  captura: *"Call to function 'FileSystemFile.bytes' has been rejected. Missing 'READ'
  permission for accessing the file."*
- **Causa:** la IA no la dedujo. La encontró leyendo el código nativo de Android de los dos
  paquetes, en `node_modules`:
  1. el selector (`expo-document-picker`), con `copyToCacheDirectory: true`, copiaba el
     archivo a la carpeta temporal general;
  2. dentro de Expo Go conviven los archivos de todos los proyectos abiertos, así que el
     módulo de archivos (`expo-file-system`) solo deja leer los del proyecto actual, y esa
     carpeta no entraba en el control.
- **Corrección:** `copyToCacheDirectory: false`. El selector devuelve el enlace que da
  Android al archivo (`content://…`), que el control acepta, y se lee directo de ahí.
- **Aprendizaje (apartado 3 del informe):** la IA siguió la documentación oficial al pie de
  la letra (la opción `true` es la recomendada "para que otras APIs de Expo lean el archivo
  enseguida") y aun así falló en el entorno real del proyecto: Expo Go en Android. La
  documentación describe el caso general; el contexto concreto lo aporta la prueba.

### 13. Prueba de seguridad de la Etapa 1 sin confirmar

- **Qué pasó:** el 13/11 apareció una factura de mayo de 2027. La única llamada que la
  podía crear era la prueba de la Etapa 1 en la que `generar_facturas('2027-05-01')` tenía
  que fallar como padre. Esa prueba se registró como aprobada.
- **Lo que se concluye:** la prueba se ejecutó como `postgres` y no con la cuenta de padre.
  La IA dio por buena la respuesta "todo salió bien" sin pedir el resultado de cada
  consulta, y anotó las seis pruebas como aprobadas.
- **Qué se hizo:** se corrigió el documento de la Etapa 1 y la prueba se repite en la Etapa
  5. La factura de mayo se conserva.
- **Aprendizaje:** en una verificación de seguridad, "salió bien" no alcanza: hay que
  registrar qué devolvió cada prueba.

### 16. La auditoría no decía qué se cambió

- **Qué pasó:** al cambiar el precio de Natación, la auditoría mostraba
  `importe: 18000 → 18500`, pero no de qué concepto.
- **Causa:** el disparador de auditoría de la Parte 2 guarda, en un cambio, solo los campos
  que cambiaron y el id del registro. El nombre "Natación" no cambió, así que no queda en el
  detalle. La IA había probado la auditoría con altas, donde sí aparece el nombre.
- **Opciones:** modificar el disparador para que guarde también el nombre (cambia la base,
  afecta a todas las tablas y obliga a ejecutar otro script) o buscar el nombre por el id al
  mostrar la auditoría. Se eligió la segunda: no toca la base y alcanza para las tablas de
  cobranza.
- **Pendiente:** las tablas de la Parte 2 (notas, matrículas, legajos) tienen la misma
  limitación. Queda como mejora para después.

### 17. Verificar antes de dar por aprobado

- **Qué pasó:** el equipo respondió "listo" a la lista de 11 pruebas. Por lo aprendido en el
  registro 13, la IA no las anotó como aprobadas de entrada: revisó en el navegador los
  precios, la auditoría y el reporte.
- **Qué encontró:**
  1. Natación estaba en $ 19.000. La auditoría mostraba la prueba completa (18000 → 18500 →
     18000) y un cambio más, hecho al volver a probar con el botón Editar, que no se había
     revertido. El equipo lo corrigió desde la pantalla.
  2. Los meses se veían "Marzo De 2027": la clase `capitalize` de CSS, que eligió la IA, pone
     en mayúscula la inicial de cada palabra. Se reemplazó por una función que solo cambia la
     primera letra, con su prueba.
- **Cómo se registró:** el documento de la etapa dice, para cada prueba, si se comprobó en
  el sistema o si la informó el equipo.
- **Aprendizaje:** una prueba que modifica datos reales tiene que terminar con el dato
  verificado en su valor original. Y conviene mirar el resultado con los propios ojos: el
  error de formato no lo detectaban ni el lint ni las pruebas.

### 19. Pantallas anunciadas que todavía no existían

- **Qué pasó:** el 16/11 el equipo aprobó el plan de testing, que incluía sumar la Etapa 4b
  ("estoy de acuerdo con todo lo que planteaste, empecemos"). La IA preparó el diseño
  detallado de las dos pantallas y lo presentó para validarlo de nuevo, sin programarlo. El
  17/11 el equipo abrió la app esperando verlas y mandó una grabación: no estaban.
- **Causa:** la forma de trabajo acordada pide validar el diseño de cada etapa antes de
  programar. La IA la aplicó también a una etapa cuyo alcance ya estaba aprobado, y el
  mensaje no dejó claro que el código todavía no existía.
- **Qué se hizo:** se programó la etapa a continuación. El documento registra que el alcance
  se aprobó con el plan de testing.
- **Aprendizaje (apartado 5 del informe):** al cerrar un mensaje hay que decir qué está hecho
  y qué no, no solo qué se propone. Una frase como "diseño para validar" no le avisa a quien
  lee que no hay nada para probar.

### 21. Gemini como segunda herramienta

- **Para qué se usó:** dudas menores sobre el funcionamiento del sistema, mientras se
  desarrollaba con Claude Code.
- **Diferencia con Claude Code:** Gemini no tuvo acceso al repositorio, así que sus
  respuestas eran generales y no sobre el código del proyecto. Por eso se usó para entender,
  no para producir: ningún archivo del proyecto salió de Gemini.
- **Evidencia:** el historial de las conversaciones queda en la cuenta del integrante.

### 22. Versión 1.1 de la app

- **Contexto:** la cátedra extendió la entrega al 24/11, pero el informe de IA y la bitácora
  ya estaban entregados y no se podían cambiar. El equipo quiso aprovechar el día para que
  la app cubriera todo el enunciado.
- **Cómo eligió la IA qué hacer:** releyó el enunciado contra lo que la app ya hacía y separó
  lo que faltaba del pedido de cambios menores. Lo que necesitaba piezas externas, como
  recuperar la contraseña o mandar correos, quedó fuera o preparado para después.
- **Preparado para el correo:** los avisos no los arma la app sino la base, en la vista
  `avisos_cobranza`. La app los muestra hoy, y un envío por correo puede leer la misma vista
  sin rehacer nada (sección 4 del [documento](07-version-1-1/README.md)).
- **Cómo se registraron las pruebas:** el equipo informó que el script y las 11 pruebas en
  el celular salieron bien. Siguiendo el criterio del registro 17, el documento las anota como
  *informadas por el equipo* y no como comprobadas en el sistema.
