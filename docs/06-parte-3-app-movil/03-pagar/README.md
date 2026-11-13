# Parte 3 — Etapa 3: pagar desde la app

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Historias | HU-M2 — Seleccionar los ítems a pagar y obtener el comprobante (REQ-25) · HU-M4 — Cargar el comprobante de la transferencia (REQ-26) · HU-M3 — Consultar el historial de facturas y deuda (REQ-27 y REQ-28) |
| Se apoya en | Las funciones `emitir_comprobante()` e `informar_transferencia()` y el bucket privado `comprobantes` de la [Etapa 1](../01-modelo-cobranza/README.md) |
| Estado | ✅ Diseño validado y las 10 pruebas en el celular aprobadas el 13/11/2026 |

**Correcciones durante la prueba:**
- El selector de archivos ya no copia el archivo a la carpeta temporal (`copyToCacheDirectory: false`): dentro de Expo Go, esa copia no se podía leer (bitácora, registro 12).
- El marco común de la app deja un margen para la barra de navegación de Android, que tapaba el final de las pantallas.

---

## 1. Criterios de aceptación y cómo se cumplen

| Historia | Criterio | Cómo se cumple |
|---|---|---|
| HU-M2 | El total se corresponde con los ítems marcados | La pantalla suma los ítems tildados mientras se eligen; el importe definitivo lo calcula la base al emitir |
| HU-M2 | Emitido el comprobante, la factura cambia de estado | Los ítems pasan a "En proceso"; al informar la transferencia, la factura pasa a "Pago parcial" o "Pagada" (lo calcula la vista `facturas_estado`) |
| HU-M2 | Una factura pagada no puede volver a cobrarse | Patrón State: una factura `pagada` no admite pago y no muestra casillas ni botón. Además, la base rechaza los ítems que ya tienen comprobante |
| HU-M4 | El comprobante queda asociado a la factura correcta | El archivo se sube desde la pantalla de ese comprobante, que ya pertenece a una factura |
| HU-M4 | Una factura admite varios comprobantes sin sobrescribir el anterior | Cada pago es un comprobante nuevo, con su propio archivo; la familia no puede reemplazar ni borrar archivos |
| HU-M4 | Solo el tutor del alumno y la administración acceden al archivo | Bucket privado con políticas por carpeta de alumno (Etapa 1). El archivo se abre con un enlace temporal |
| HU-M3 | El listado respeta el período elegido | Pantalla de historial con "desde" y "hasta" por mes |
| HU-M3 | La deuda se muestra por concepto y no solo como total | El historial lista cada ítem impago con su mes y su importe, y al final el total adeudado |

## 2. Recorrido

```text
4. Detalle de la factura            5. Comprobante de pago               (vuelve al detalle)
┌──────────────────────────┐       ┌──────────────────────────┐       ┌──────────────────────────┐
│ ← Factura N.º 2          │       │ ← Comprobante N.º 1      │       │ ← Factura N.º 2          │
│ Abril 2027 · [Pendiente] │       │ Abril 2027               │       │ Abril 2027 · [Pago parc.]│
│                          │       │ Importe a transferir     │       │                          │
│ [x] Cuota mensual 95.000 │       │        $ 133.000         │       │ Cuota mensual     95.000 │
│ [x] Comedor       38.000 │  →    │ · Cuota mensual   95.000 │  →    │  Pagado · comp. N.º 1    │
│ [ ] Recorrido 1   26.000 │       │ · Comedor         38.000 │       │ Comedor           38.000 │
│ [ ] Natación      18.000 │       │                          │       │  Pagado · comp. N.º 1    │
│ [ ] Fútbol        15.000 │       │ Transferí a:             │       │ [ ] Recorrido 1   26.000 │
│                          │       │ Alias EDUCAR.TRANSFORMAR │       │ [ ] Natación      18.000 │
│ ┌──────────────────────┐ │       │                          │       │ [ ] Fútbol        15.000 │
│ │ Pagar 2 ítems        │ │       │ [ Adjuntar comprobante ] │       │                          │
│ │ $ 133.000            │ │       │                          │       │ Saldo             59.000 │
│ └──────────────────────┘ │       │ Estado: Falta informar   │       │                          │
└──────────────────────────┘       └──────────────────────────┘       └──────────────────────────┘
```

| Paso | Qué hace el padre | Qué pasa por detrás |
|---|---|---|
| 1 | Tilda los ítems impagos que quiere pagar | La pantalla suma el total de lo tildado |
| 2 | Toca **Pagar** y confirma | `emitir_comprobante(factura, ítems)`: la base valida y crea el comprobante N.º X en estado *emitido* |
| 3 | Ve el comprobante con el importe y los datos para transferir | — |
| 4 | Hace la transferencia desde su banco (fuera de la app) | — |
| 5 | Toca **Adjuntar comprobante** y elige la foto o el PDF | El archivo sube al bucket privado, a la carpeta del alumno |
| 6 | — | `informar_transferencia(comprobante, archivo)`: la base comprueba que el archivo exista y pasa el comprobante a *informado* |
| 7 | Vuelve a la factura: esos ítems figuran pagados | La vista recalcula saldo y estado |

Si el padre emite el comprobante y cierra la app, no pierde nada: en el detalle de la
factura, los ítems "En proceso" llevan a su comprobante para adjuntar el archivo después.

## 3. Pantallas nuevas y cambios

| Pantalla | Cambio |
|---|---|
| 4. Detalle de la factura | Suma casillas en los ítems impagos y el botón **Pagar**, solo si el estado admite pago. Los ítems con comprobante se pueden tocar para abrirlo |
| 5. Comprobante de pago *(nueva)* | Número, fecha, ítems, importe, datos para transferir, y adjuntar o ver el archivo |
| 6. Historial *(nueva)* | Se abre desde "Cuotas del hijo". Filtro por meses; facturas del período con sus comprobantes; deuda por ítem y total adeudado |

En el código:

- `src/services/cobranza.js` suma `emitirComprobante()`, `comprobante()`,
  `adjuntarTransferencia()`, `enlaceDelArchivo()` e `historial()`.
- `src/domain/estadoFactura.js` no cambia: `admitePago` ya existe desde la Etapa 2.

## 4. Decisiones a validar

1. **Los ítems se eligen en el mismo detalle de la factura**, con casillas, sin una
   pantalla aparte.
2. **Antes de emitir se pide una confirmación**: un comprobante emitido no se puede
   anular desde la app (la anulación quedó fuera del alcance mínimo en la Etapa 1).
3. **Un solo selector de archivo, que acepta imagen o PDF.** No se usa la cámara: evita
   pedir un permiso más y alcanza con la captura que da la app del banco.
4. **Los datos para transferir (alias, CBU y titular) son ficticios y van en un archivo
   de configuración de la app.** Que el administrador los cargue desde la web queda fuera
   del mínimo.
5. **El archivo se abre con un enlace temporal** (60 segundos), que solo puede generar el
   tutor o la administración.
6. **El historial filtra por mes** ("desde" y "hasta"), que es la unidad de las facturas,
   y arranca mostrando todo el ciclo lectivo.

## 5. Fuera del alcance de esta etapa

- Anular un comprobante emitido.
- Sacar la foto con la cámara desde la app.
- Aprobación del pago por el administrador.
