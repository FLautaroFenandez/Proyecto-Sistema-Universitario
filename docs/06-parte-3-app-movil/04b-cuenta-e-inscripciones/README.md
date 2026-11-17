# Parte 3 — Etapa 4b: cuenta e inscripciones en la app

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Requerimientos | Módulo 1 del enunciado: *"recuperar o cambiar contraseña, si la infraestructura existente lo permite"* (REQ-23 · HU-M6) · Regla de negocio: *"los padres pueden acceder a… inscripción a deportes, servicio de transporte y comedor"* de cada hijo (parte de consulta de REQ-29 · HU-M5) |
| Se apoya en | La sesión de la [Etapa 2](../02-ingreso-y-cuotas/README.md) y la tabla `inscripciones_servicio` de la [Etapa 1](../01-modelo-cobranza/README.md). **No cambia el esquema** |
| Estado | ✅ Alcance aprobado el 16/11/2026 junto con el plan de testing · 9 pruebas en el celular aprobadas el 17/11/2026 |

---

## 1. Por qué existe esta etapa

Al releer el enunciado completo para diseñar el testing (16/11) aparecieron dos pedidos que
no estaban en el alcance mínimo. Se hacen antes de probar, para que las pruebas cubran la
app tal como se entrega.

| Pedido del enunciado | Qué se hace | Qué queda afuera |
|---|---|---|
| Recuperar o cambiar contraseña | **Cambiar** la contraseña con la sesión iniciada | **Recuperar** una contraseña olvidada: requiere enviar correos, y el proyecto no tiene un servicio de correo. La web tampoco lo ofrece: indica consultar en la Administración |
| Acceder a las inscripciones de cada hijo | **Consultar** deportes, transporte y comedor | **Inscribir** desde la app (HU-M5), que exige modelar grupos y horarios |

## 2. Pantallas

| Pantalla | Desde dónde se abre | Qué hace |
|---|---|---|
| 7. Cambiar contraseña *(nueva)* | Botón en "Mis hijos" | Pide la contraseña actual, la nueva y repetirla |
| 8. Inscripciones del hijo *(nueva)* | Botón en "Cuotas del hijo" | Lista de solo lectura: deportes, transporte y comedor, con su período y su precio |
| 1. Ingreso | — | Suma la leyenda "¿Olvidaste tu contraseña? Consultá en la Administración" |

```text
7. Cambiar contraseña              8. Inscripciones del hijo
┌──────────────────────────┐      ┌──────────────────────────┐
│ ← Cambiar contraseña     │      │ ← Inscripciones de yura  │
│ Padre de Prueba          │      │ DEPORTES · 2 de 2        │
│ padre.prueba@gmail.com   │      │ Fútbol            15.000 │
│                          │      │  Desde el 01/03/2027     │
│ Contraseña actual        │      │ Natación          18.000 │
│ [••••••••]               │      │  Desde el 01/04/2027     │
│ Nueva contraseña         │      │ TRANSPORTE               │
│ [••••••••]               │      │ Recorrido 1       26.000 │
│ Repetir la nueva         │      │  Desde el 01/04/2027     │
│ [••••••••]               │      │ COMEDOR                  │
│                          │      │ Comedor           38.000 │
│ [ Cambiar contraseña ]   │      │  Desde el 01/03/2027     │
└──────────────────────────┘      └──────────────────────────┘
```

## 3. Decisiones validadas

1. **Se pide la contraseña actual y se verifica antes de cambiarla.** Quien tome un teléfono
   desbloqueado no puede cambiar la clave. La verificación consiste en volver a ingresar con
   el email y la contraseña actual: si no coinciden, Supabase lo rechaza y la sesión abierta
   no se modifica (comprobado en el código de la librería, versión 2.119). El campo
   `current_password` de la librería se envía también, pero no se depende de él: solo se
   verifica si el servidor tiene activada una opción que este proyecto no configura.
2. **La misma regla que el registro de la web:** mínimo 8 caracteres. Además, la nueva tiene
   que ser distinta de la actual.
3. **Después del cambio, la sesión sigue abierta** y se muestra una confirmación.
4. **Recuperar la contraseña olvidada no se hace** (sección 1).
5. **Las inscripciones se agrupan por tipo y muestran su período y el precio vigente.** Se
   listan todas las del alumno, no solo las que rigen hoy: el ciclo lectivo es 2027 y hoy no
   rige ninguna. Cada una indica si está vigente, si todavía no empezó o si ya terminó. En
   deportes se muestra cuántos tiene sobre el máximo de dos.
6. **Es solo consulta.** La pantalla indica que para inscribir o dar de baja hay que
   consultar en la Administración.
7. **Permisos:** la política `insc_servicio_lectura` de la Etapa 1 ya deja que un padre lea
   las inscripciones de sus hijos y nada más. No hace falta tocar la base.

## 4. En el código

- `src/services/sesion.js` suma `cambiarClave()` y `validarClaveNueva()`.
- `src/services/cobranza.js` suma `inscripcionesDe()`.
- `src/domain/situacionInscripcion.js` *(nuevo)*: decide si una inscripción está vigente, es
  próxima o finalizó, a partir de sus fechas.
- `app/cuenta.jsx` e `app/inscripciones/[id].jsx` *(nuevas)*, registradas en `app/_layout.jsx`
  dentro del grupo que exige sesión.

Antes de probar en el celular: `npm run lint` sin avisos (revisa también la app), las 37
pruebas de Vitest de la web en verde y la app compilada para Android con `npx expo export`.

## 5. Pruebas en el celular

Hechas el 17/11/2026 en un Android real con Expo Go, con la cuenta de padre de prueba. La
columna *Cómo se comprobó* sigue el criterio de la Etapa 4 (registro 17 de la bitácora): las
pruebas de contraseña ocurren dentro de Supabase Auth, que no deja rastro en la auditoría, así
que quedan como informadas por el equipo.

| # | Prueba | Resultado esperado | Cómo se comprobó | Resultado |
|---|---|---|---|---|
| A1 | Pantalla de ingreso | Leyenda "¿Olvidaste tu contraseña? Consultá en la Administración." | Informado por el equipo | ✅ |
| A2 | Pie de "Mis hijos" | El email de la cuenta y el botón **Cambiar contraseña** | Informado por el equipo | ✅ |
| A3 | Contraseña actual equivocada | "La contraseña actual no es correcta."; la sesión sigue abierta | Informado por el equipo | ✅ |
| A4 | Nueva de menos de 8 caracteres, igual a la actual, o repetida distinta | Un mensaje para cada caso; no se envía nada | Informado por el equipo | ✅ |
| A5 | Cambio correcto | Mensaje de confirmación, campos vacíos y la sesión sigue abierta | Informado por el equipo | ✅ |
| A6 | Ingresar con la contraseña vieja y con la nueva | La vieja se rechaza; con la nueva entra | Informado por el equipo | ✅ |
| A7 | Volver a la contraseña original | La cuenta de prueba queda como estaba | Informado por el equipo | ✅ |
| A8 | Inscripciones de yura hakanson | Deportes 2 de 2 (Fútbol desde el 01/03 y Natación desde el 01/04), Recorrido 1 desde el 01/04 y Comedor desde el 01/03, con su precio | Informado por el equipo · coincide con los datos de `supabase-cobranza-datos.sql` | ✅ |
| A9 | Situación de cada inscripción | "Todavía no empezó": el ciclo 2027 arranca en marzo | Informado por el equipo · se deduce de las fechas | ✅ |

**Pasa a la Etapa 5 (testing):** comprobar, suplantando a un padre en el editor SQL, que no
recibe las inscripciones de un alumno que no es su hijo.
