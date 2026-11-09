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
