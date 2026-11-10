# Bitácora de uso de IA — Parte 3 (aplicación móvil)

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

Registro que pide el enunciado de la Parte 3: cada intervención relevante de la IA en el
desarrollo de la app móvil, si funcionó y qué hubo que cambiar. Se completa **a medida que
se trabaja**, no al final. Solo incluye la Parte 3.

**Herramienta:** Claude Code (modelo Claude Opus 5.5), integrado en VS Code, con acceso al
repositorio.

## Registro

| N.º | Fecha | Problema | Prompt utilizado | Herramienta | Respuesta de la IA | ¿Funcionó? | Modificaciones realizadas | Resultado |
|---|---|---|---|---|---|---|---|---|
| 1 | 09/11 | Elegir la tecnología de la app después de que la cátedra adelantara la entrega una semana | "¿Cómo podemos empezar, teniendo en cuenta estas nuevas directivas?" ([detalle](#1-tecnología-de-la-app)) | Claude Code | Recomendó una app web instalable (PWA) dentro del proyecto web, en lugar de Expo | No | El equipo mantuvo React Native + Expo, comprometido en el plan de trabajo | Reemplazado |
| 2 | 09/11 | Diseñar el modelo de datos de cobranza integrado al esquema existente | "Vayamos con Expo y haciendo todo por partes… que lo que vayamos haciendo pueda tener el por qué se hace y cómo se hace" ([detalle](#2-modelo-de-datos-de-cobranza)) | Claude Code | Diseño de 5 tablas, una vista y 3 funciones ([documento](01-modelo-cobranza/README.md)) | Sí | Ninguna: el equipo revisó el diseño y aprobó las cuatro decisiones planteadas | Correcto |
| 3 | 09/11 | Implementar el modelo validado en la base de datos | "Listo, me parece correcto" (aprobación del diseño, que habilita escribir el script) ([detalle](#3-script-sql-de-cobranza)) | Claude Code | `supabase-cobranza.sql` (tablas, reglas, funciones de pago, vista, RLS y Storage) y `supabase-cobranza-datos.sql` (precios, servicios y facturas de prueba) | Sí | Ninguna: los dos scripts corrieron sin errores en la primera ejecución | Correcto |
| 4 | 09/11 | Al ejecutar los datos de prueba, Supabase advierte que se crea una tabla sin RLS | "Me aparece esto al querer correr supabase-cobranza-datos.sql" (con la captura de la advertencia) | Claude Code | Es un falso positivo: el script solo inserta datos. Antes de ejecutarlo, comprobar con una consulta a `pg_class` que las 5 tablas tienen RLS activo, y después elegir "Run without RLS" | Sí | Ninguna: la consulta confirmó RLS activo en las 5 tablas antes de ejecutar | Correcto |
| 5 | 09/11 | Diseñar las pantallas de ingreso y consulta de cuotas (HU-M6 y HU-M1) | "Listo, sigamos" (inicio de la Etapa 2, con el método acordado: primero el diseño, después el código) ([detalle](#5-diseño-de-la-app-ingreso-y-cuotas)) | Claude Code | 4 pantallas, estructura del proyecto Expo con Expo Router y los patrones Singleton, Facade y State ([documento](02-ingreso-y-cuotas/README.md)) | Parcialmente | El equipo aprobó el recorrido, pero pidió justificar por qué cambiaban la carpeta, la capa de servicios y el lenguaje respecto de lo planificado, y preguntó qué pasa con el rol administrador. Se agregó la sección 7 y el apartado sobre el administrador; el equipo aceptó que el administrador use la web | Correcto (después de los cambios) |
| 7 | 09/11 | Crear el proyecto Expo y conectarlo a Supabase | "Estoy de acuerdo… Sigamos así" ([detalle](#7-creación-del-proyecto-expo)) | Claude Code | Proyecto Expo SDK 58 con Expo Router y el cliente de Supabase; antes de configurarlo, consultó la documentación oficial de esa versión | Parcialmente | Ejecutó un comando antes de instalar la base del proyecto y lo repitió en el orden correcto. Cambió de "ignorar la app en ESLint" a "lintearla con una regla propia" | Correcto: el equipo abrió la app en su celular con Expo Go y confirmó la conexión con Supabase |
| 6 | 29/09 (detectado el 09/11) | El plan de trabajo afirmaba que la app compartiría la capa de servicios de la web | Pedido de generar el plan de trabajo de la Parte 3 ([detalle](#6-supuesto-del-plan-la-capa-de-servicios-se-comparte)) | Claude Code | En la sección 1.7 del plan: "la capa de servicios se comparte" | No | Al revisar el código para la Etapa 2 se vio que los servicios dependen de Vite. Se mantiene el patrón Facade con una capa propia de la app | Reemplazado |

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
  [documento del modelo](01-modelo-cobranza/README.md). La prueba de seguridad se hizo con
  la función de impersonación del SQL Editor: como la cuenta de padre de prueba, la base
  solo devolvió las facturas de sus hijos y rechazó generar facturas.
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
