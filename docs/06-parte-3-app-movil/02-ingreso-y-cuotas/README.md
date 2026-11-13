# Parte 3 — Etapa 2: ingreso y consulta de cuotas en la app

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Historias | HU-M6 — Autenticarse en la aplicación móvil (REQ-23) · HU-M1 — Consultar las cuotas de mis hijos (REQ-24) |
| Tecnología | React Native + Expo SDK 58, en JavaScript |
| Código | `app-movil/` (se crea en el paso siguiente, una vez validado este diseño) |
| Estado | Diseño validado el 09/11/2026 (con las justificaciones de la sección 7 y la decisión sobre el administrador) |

---

## 1. Qué tiene que poder hacer el padre al terminar la etapa

Sale de los criterios de aceptación del plan de trabajo (sección 7.1).

| Historia | Criterio de aceptación | Cómo se cumple |
|---|---|---|
| HU-M6 | Credenciales válidas → ingresa y ve a sus hijos asociados | Después del ingreso, la primera pantalla es *Mis hijos* |
| HU-M6 | Credenciales inválidas → mensaje claro, sin detalles técnicos | Se muestra *"Email o contraseña incorrectos"*, el mismo texto de la web |
| HU-M6 | Un usuario sin hijos asociados no accede a datos de otros alumnos | Lo garantiza el RLS de la base, verificado en la Etapa 1. La app muestra *"No tenés alumnos asociados"* |
| HU-M1 | Un padre ve solo las cuotas de sus hijos | Ídem: la vista `facturas_estado` respeta el RLS |
| HU-M1 | Cada cuota muestra vencimiento, importe, estado y detalle por ítem | Tarjeta de cada factura y pantalla de detalle |
| HU-M1 | Sin cuotas emitidas, la pantalla lo explica en lugar de quedar vacía | Mensaje *"Todavía no hay cuotas emitidas para este alumno"* |

## 2. Pantallas y recorrido

Cuatro pantallas, en este orden:

```text
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ Educar para          │   │ Mis hijos     [Salir]│   │ ← Cuotas de Ana      │   │ ← Factura N.º 12     │
│ Transformar          │   │                      │   │                      │   │ Abril 2027           │
│                      │   │ ┌──────────────────┐ │   │ PENDIENTES           │   │ Vence: 10/04/2027    │
│ Email                │   │ │ Ana Pérez        │ │   │ ┌──────────────────┐ │   │                      │
│ [                  ] │ → │ │ 3.º A · Primario │ │ → │ │ Abril 2027       │ │ → │ Cuota mensual 95.000 │
│ Contraseña           │   │ └──────────────────┘ │   │ │ Vence 10/04      │ │   │   Impago             │
│ [                  ] │   │ ┌──────────────────┐ │   │ │ $ 192.000        │ │   │ Comedor       38.000 │
│                      │   │ │ Juan Pérez       │ │   │ │ [Pendiente]      │ │   │   Impago             │
│ [     Ingresar     ] │   │ │ 1.º B · Secund.  │ │   │ └──────────────────┘ │   │ ...                  │
│                      │   │ └──────────────────┘ │   │ PAGADAS              │   │ Total       192.000  │
│ Email o contraseña   │   │                      │   │ (ninguna todavía)    │   │ Saldo       192.000  │
│ incorrectos          │   │                      │   │                      │   │                      │
└──────────────────────┘   └──────────────────────┘   └──────────────────────┘   └──────────────────────┘
     1. Ingreso                 2. Mis hijos              3. Cuotas del hijo          4. Detalle
```

| Pantalla | Qué muestra | De dónde sale el dato |
|---|---|---|
| 1. Ingreso | Email, contraseña y el error si lo hay | Supabase Auth: el mismo usuario de la web |
| 2. Mis hijos | Los hijos asociados, con su curso | `alumno_tutor` → `alumnos` → matrícula activa → curso |
| 3. Cuotas del hijo | Las facturas separadas en *pendientes* y *pagadas*, con mes, vencimiento, saldo y estado; marca las vencidas | Vista `facturas_estado` (Etapa 1) |
| 4. Detalle | Cada ítem con su importe y su situación (impago, en proceso, pagado), más el total y el saldo | `factura_items` y su comprobante |

El botón **Salir** cierra la sesión y vuelve al ingreso.

## 3. Quién puede entrar

La app es para las familias: **solo entra el rol `padre`**. Si ingresa otro rol (por
ejemplo, un docente), la app cierra la sesión y le indica que use la web.

**¿Y el administrador?** El enunciado separa explícitamente qué se hace desde cada
cliente:

| Desde la aplicación móvil | Desde la aplicación web |
|---|---|
| Por alumno: facturas y comprobantes de un período, historial de deuda por ítem | Ingresos por período; pagos completos e incompletos; pagos por deporte y por recorrido |
| El padre elige qué pagar y carga el comprobante | El administrador fija los valores de la cuota, los deportes, el transporte y el comedor |

Además, el Módulo 1 pide *"acceder únicamente a las funcionalidades correspondientes a su
rol"*. Todas las historias de la app en el plan son del rol padre (HU-M1 a HU-M6), y las
tareas del administrador están planificadas en la web (REQ-32). Por eso, si entra un
administrador, la app le indica que la cobranza se administra desde la web.

El modelo de datos no impide ampliarlo más adelante: el RLS ya le permite al administrador
leer todas las facturas. Un modo de consulta en la app (buscar un alumno y ver sus cuotas)
reutilizaría las pantallas 3 y 4. Queda fuera del alcance mínimo.

La seguridad vuelve a estar en **dos capas**, como en todo el proyecto:

1. **La app** decide qué pantallas mostrar según el rol.
2. **La base** decide qué datos devolver. Aunque alguien modificara la app, el RLS le
   seguiría negando los datos de otros alumnos.

## 4. Cómo está organizado el código

```text
app-movil/                     ← proyecto Expo, separado de la web
├── app/                       ← pantallas: cada archivo es una ruta (Expo Router)
│   ├── _layout.jsx            ← marco común: sesión y navegación
│   ├── index.jsx              ← 1. Ingreso
│   ├── hijos.jsx              ← 2. Mis hijos
│   ├── hijo/[id].jsx          ← 3. Cuotas del hijo
│   └── factura/[id].jsx       ← 4. Detalle de la factura
├── src/
│   ├── lib/supabase.js        ← cliente único de Supabase (Singleton)
│   ├── services/              ← acceso a datos (Facade): las pantallas no conocen las tablas
│   │   ├── sesion.js
│   │   └── cobranza.js
│   └── domain/estadoFactura.js  ← qué significa cada estado (State)
├── .env.local                 ← URL y clave pública de Supabase (no se sube)
└── package.json
```

**Expo Router** funciona como React Router en la web, pero las rutas salen de los nombres
de los archivos: `app/hijo/[id].jsx` es la ruta `/hijo/<id del alumno>`.

## 5. Patrones de diseño

Son los del plan de trabajo (sección 1.6), aplicados en la app:

| Patrón | Dónde | Para qué |
|---|---|---|
| **Singleton** | `src/lib/supabase.js` | Un solo cliente con la sesión del usuario, igual que en la web |
| **Facade** | `src/services/` | Las pantallas piden *"las cuotas de este alumno"*; solo el servicio sabe que eso es la vista `facturas_estado` |
| **State** | `src/domain/estadoFactura.js` | Cada estado (pendiente, parcial, pagada) sabe su etiqueta, su color y si admite pagar. En la Etapa 3 decide si se muestra el botón *Pagar* |

## 6. Cómo se prueba en el teléfono

1. `cd app-movil` y `npx expo start` en la PC.
2. Aparece un código QR en la terminal.
3. Se escanea con **Expo Go** (Android), con el celular en la misma red Wi-Fi que la PC.
4. La app se abre en el teléfono y se recarga sola con cada cambio del código.

Si la red no deja conectarse a los dos equipos (pasa en redes públicas), se usa
`npx expo start --tunnel`.

## 7. Decisiones que cambian lo planificado, y por qué

### 7.1. La app va en `app-movil/` y no en `src/app`

**Por qué se planteó `src/app`.** La estructura `src/web`, `src/gestion` y `src/app` se
definió el 18/08/2026, al armar el portafolio digital en la Unidad 1. La idea era un único
repositorio con una carpeta por cada parte del proyecto. En ese momento **todavía no se
había elegido la tecnología de la app**: Expo se eligió el 29/09, en el plan de la Parte 3.
La estructura suponía, sin decirlo, que las tres partes serían el mismo tipo de proyecto.

**Por qué cambia ahora.** Con Expo, la app es otro proyecto:

| | Web (Partes 1 y 2) | App (Parte 3) |
|---|---|---|
| Empaquetador | Vite | Metro (el de React Native) |
| Versión de React | 18.2 | 19.3 (la que exige Expo SDK 58) |
| Componentes | HTML (`div`, `p`, `input`) | Nativos (`View`, `Text`, `TextInput`) |
| Dependencias | `package.json` de la raíz | Uno propio |

Dos versiones de React no pueden convivir en un mismo `package.json`, y Vite compila todo lo
que hay en `src/`. Dentro de `src/`, la app rompería el build de la web publicada. Además,
pasar la web a `src/web` y `src/gestion` implica mover decenas de archivos y sus imports el
día antes de una entrega, sin ningún beneficio funcional.

**Lo que se conserva del planteo original:** cada parte sigue en su propio lugar e
identificable. La web queda en `src/` y la app en `app-movil/`. Se actualiza la nota del
portafolio.

### 7.2. La app tiene su propia capa de servicios

**Por qué el plan decía que se compartía.** El plan (sección 1.7) eligió Expo porque usa
*"el mismo lenguaje y la misma librería de Supabase que la web"*, y de ahí concluyó que *"la
capa de servicios se comparte"*. Esa conclusión se redactó con asistencia de IA al generar
el plan y **no se verificó contra el código** ([bitácora, registro 6](../bitacora-ia.md#6-supuesto-del-plan-la-capa-de-servicios-se-comparte)).

**Por qué no se puede compartir tal como está.** Al leer el código, aparecen tres
dependencias de la web:

1. `src/lib/supabase.js` lee la configuración con `import.meta.env.VITE_…`, que solo existe
   en Vite. Expo usa `process.env.EXPO_PUBLIC_…`.
2. El cliente está configurado para un navegador: la sesión va en `localStorage` y hay un
   arreglo específico de `navigator.locks`. En el teléfono, la sesión se guarda en el
   almacenamiento del dispositivo.
3. Todos los servicios importan con el alias `@/`, que está definido en `vite.config.js`.

Además, **la web no tiene servicios de cobranza**: tiene los de matrícula, calificaciones,
asistencia, etc. Lo que la app necesita no existe en la web, así que no habría nada para
reutilizar todavía.

**Qué sí se comparte, que es lo importante:** la **base de datos con sus reglas**. Las
políticas RLS, las funciones de pago y la vista `facturas_estado` son las mismas para la
web y para la app. Ahí vive la lógica de negocio, y es lo que garantiza que los dos
clientes no se contradigan. La app repite el **patrón** (Facade) y las convenciones de la
web, no el código.

### 7.3. JavaScript y no TypeScript

- **Coherencia con el plan:** su argumento para elegir Expo es *"el mismo lenguaje que la
  web"*, y la web está en JavaScript.
- **Comprensión del código:** el enunciado exige que todo el código sea comprendido y
  justificado por el equipo. TypeScript sumaría un sistema de tipos para aprender con el
  plazo encima.
- **Es una elección explícita:** la plantilla por defecto de Expo es TypeScript. Se usa la
  plantilla `blank`, en JavaScript.
- **Lo que se resigna:** la verificación de tipos al compilar. Se compensa como en la web,
  con comentarios JSDoc que documentan qué recibe y devuelve cada función. Las reglas que
  importan (quién ve qué, qué se puede pagar) están en la base de datos, no en los tipos.

## 8. Cuidados para no romper la web

- `app-movil/` tiene su propio `package.json` y sus propias dependencias: `npm install`
  en la raíz no las toca, y Netlify sigue compilando solo la web.
- **La app pasa por el mismo ESLint que la web.** El diseño proponía ignorarla, pero al
  probarlo solo aparecieron dos diferencias de entorno: Expo lee la configuración con
  `process.env` y usa React 19. Se resolvieron con una regla específica para
  `app-movil/**` en `.eslintrc.cjs`. Así la app tiene el mismo control de calidad que la
  web: el editor, el pre-commit con Husky y el pipeline de GitHub Actions.

## 9. Paso 2: proyecto creado

| Qué | Cómo |
|---|---|
| Proyecto | `npx create-expo-app app-movil --template blank` (JavaScript), sin repositorio git propio: queda dentro del repo |
| Archivos de la plantilla quitados | `App.js` e `index.js` (la entrada pasa a ser Expo Router), `LICENSE` (era la licencia de la plantilla), y `AGENTS.md` y `.claude/`, que configuraban asistentes de IA y no forman parte de la app |
| Dependencias | Instaladas con `npx expo install`, que elige las versiones compatibles con el SDK 58: Expo Router, Supabase y AsyncStorage |
| Configuración | `package.json` → `"main": "expo-router/entry"`; `app.json` → nombre *Educar para Transformar* y `scheme` |
| Conexión | `.env.local` con los mismos valores que la web, con el prefijo `EXPO_PUBLIC_` (no se sube; `.env.example` muestra el formato) |
| Código | `src/lib/supabase.js` (Singleton), `src/services/sesion.js` (Facade), `src/tema.js` (colores de la marca), `app/_layout.jsx` (navegación) y `app/index.jsx` (pantalla provisoria que comprueba la conexión) |
| Verificación | La app compila para Android (`npx expo export`); `npm run lint` y las 23 pruebas de la web siguen en verde |

**Para tener en cuenta:** `npm install` informa 5 vulnerabilidades moderadas en
dependencias de Expo. No se corrigen con `npm audit fix --force`, porque cambiaría
versiones que Expo exige para el SDK 58. Se vuelven a revisar al actualizar el SDK.
