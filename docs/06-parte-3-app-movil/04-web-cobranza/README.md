# Parte 3 — Etapa 4: cobranza en la web del administrador

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Requerimientos | Fijar los valores de los servicios (regla del enunciado) · generar las facturas del mes · REQ-32 — Reportes de cobranza en la web |
| Se apoya en | La tabla `conceptos`, la función `generar_facturas()` y la vista `facturas_estado` de la [Etapa 1](../01-modelo-cobranza/README.md). **No cambia el esquema** |
| Estado | ✅ Diseño validado y 11 pruebas en la web aprobadas el 13/11/2026 |

**Correcciones durante la prueba** (pedidas por el equipo al usar las pantallas):
- Cada categoría de precios se distingue por un ícono y un color propios.
- Los precios se muestran como texto: para cambiarlos hay que tocar **Editar**, y recién ahí
  aparecen el campo, **Guardar** y **Cancelar**.
- En Auditoría, un cambio de precio decía `importe: 18000 → 18500` sin decir de qué concepto.
  La base guarda solo los campos que cambiaron y el id del registro; ahora la pantalla busca
  el nombre por ese id ("Natación", "Comprobante N.º 1"), sin modificar la base.
- Los meses se mostraban "Marzo De 2027": la clase `capitalize` de CSS pone en mayúscula
  cada palabra. Ahora solo la primera letra (lo detectó la IA al verificar las pruebas).

---

## 1. Qué cubre y qué no

| Pedido | Cómo se cubre |
|---|---|
| *"Los administradores solamente pueden especificar el valor de la cuota, deportes y servicios de transporte y comedor"* | Pantalla **Precios y facturación**: se edita el importe de cada concepto |
| La familia necesita facturas para pagar | Botón **Generar facturas del mes**, que llama a `generar_facturas()` |
| REQ-32: ingresos por período, pagos completos e incompletos | Pantalla **Reporte de cobranza** |

**Fuera del alcance mínimo:** los reportes de pagos por deporte y por recorrido.

## 2. Pantallas

Se suma la sección **Cobranza** al menú lateral del panel.

```text
Precios y facturación (/admin/cobranza)    Reporte de cobranza (/admin/cobranza/reporte)
┌─────────────────────────────────────┐   ┌──────────────────────────────────────────────┐
│ Precios vigentes                    │   │ Desde [mar 2027]  Hasta [may 2027] [Exportar]│
│ Cuota mensual         [ 95000 ] ✓   │   │ ┌──────────┐┌──────────┐┌─────────┐┌───────┐ │
│ Comedor               [ 38000 ] ✓   │   │ │Facturado ││ Cobrado  ││En proceso││ Saldo │ │
│ Natación              [ 18000 ] ✓   │   │ └──────────┘└──────────┘└─────────┘└───────┘ │
│ Recorrido 1           [ 26000 ] ✓   │   │ Completas: 1 · Incompletas: 5                │
│ …                                   │   │ N.º  Alumno   Mes   Total  Pagado Saldo Estado│
│ Generar facturas                    │   │ 2    Hakanson abr   192000 133000 59000 Parcial│
│ Mes [junio 2027 ▾] [Generar]        │   │ …                                            │
└─────────────────────────────────────┘   └──────────────────────────────────────────────┘
```

## 3. Decisiones validadas

1. **Solo se edita el importe.** No se crean ni se borran conceptos: el enunciado dice que
   el administrador *"solamente"* especifica los valores. Cada cambio queda en la auditoría
   por el disparador de la Etapa 1, y las facturas ya emitidas no cambian porque copiaron el
   precio al generarse.
2. **Generar facturas pide confirmación e informa cuántas creó.** La función ya evita los
   duplicados: correrla dos veces sobre el mismo mes no crea nada nuevo y devuelve 0. El
   selector ofrece solo los meses del ciclo lectivo vigente.
3. **El reporte toma como período el mes de la factura**, igual que el historial de la app.
   *Cobrado* suma los comprobantes informados; *En proceso*, los emitidos que esperan la
   transferencia. Una factura es **completa** si su estado es `pagada` e **incompleta** si
   es `pendiente` o `parcial` (decisión D8 de la Etapa 1).
4. **Exportar a PDF con la impresión del navegador**, como la pantalla de Indicadores (HU3).
5. **Permisos en dos capas.** El administrador ve y opera las dos pantallas. La Autoridad ve
   los precios sin poder editarlos, no ve el botón de generar y ve el reporte completo. En la
   base ya está resuelto: solo `admin` escribe en `conceptos` y `generar_facturas()` rechaza
   cualquier otro rol.
6. **La capa de servicios de la web suma `src/services/cobranza.js`** (patrón Facade). El
   cálculo de los totales del reporte es una función pura con pruebas de Vitest.
7. **Auditoría:** "Precios de cobranza" y "Comprobantes de pago" se suman al filtro de la
   pantalla de Auditoría. La base ya registraba esos cambios; faltaba poder filtrarlos.

## 4. Pruebas en la web

Hechas el 13/11/2026 con la cuenta de administrador, en la web local conectada a la base
publicada. La columna *Cómo se comprobó* separa lo que quedó a la vista en el sistema de lo
que informó el equipo (lección del registro 13 de la bitácora).

| # | Prueba | Resultado esperado | Cómo se comprobó | Resultado |
|---|---|---|---|---|
| W1 | Menú del panel | Sección **Cobranza** con dos opciones | Revisión del panel | ✅ |
| W2 | Precios y facturación | Conceptos agrupados por cuota, comedor, deportes y transporte | Revisión de la pantalla: 14 conceptos en 4 tarjetas | ✅ |
| W3 | Importes inválidos (`0`, `abc`, `10,555`) | Mensaje en rojo y **Guardar** deshabilitado | Informado por el equipo · además, 3 pruebas de Vitest | ✅ |
| W4 | Natación de 18000 a 18500 | "Precio guardado" y el valor persiste al recargar | Auditoría: `importe: 18000 → 18500` | ✅ |
| W5 | Filtro "Precios de cobranza" en Auditoría | El cambio con el nombre del concepto | Auditoría: "Natación" debajo de "Precios de cobranza" | ✅ |
| W6 | Volver Natación a 18000 | Queda como estaba | Auditoría: `18500 → 18000`. Una nueva prueba con el botón Editar la dejó en 19000 y el equipo la volvió a 18000; se verificó en pantalla | ✅ |
| W7 | Generar abril de 2027, ya facturado | "No se generó ninguna factura"; no se crea nada | Informado por el equipo · el reporte sigue con 3 facturas | ✅ |
| W8 | Reporte del ciclo | Factura de abril de yura hakanson con pago parcial y saldo | Revisión del reporte: 3 facturas, facturado $ 532.000, cobrado $ 281.000, saldo $ 251.000 | ✅ |
| W9 | Filtros de pago completo e incompleto | Cambia la tabla, no los totales | Informado por el equipo | ✅ |
| W10 | "Desde" posterior a "Hasta" | Aviso y sin reporte | Informado por el equipo | ✅ |
| W11 | Exportar PDF | Impresión sin filtros ni botones | Informado por el equipo | ✅ |

**Pasan a la Etapa 5 (testing):**
- Generar un mes nuevo, que crea facturas reales en la base publicada.
- Modo consulta de la Autoridad: precios sin editar, sin el botón de generar, y la base
  rechazando el cambio aunque se intente.

**Pruebas automáticas:** 14 pruebas nuevas de Vitest en `src/services/reglas.test.js`
(validación del importe, meses del ciclo, totales del reporte, formato del mes y detalle de
la auditoría). El total del proyecto pasa de 23 a 37, todas aprobadas.
