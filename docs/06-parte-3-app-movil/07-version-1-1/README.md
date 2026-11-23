# Parte 3 — Versión 1.1 de la app: inscripciones y avisos de cobranza

Metodología de Sistemas II · UTN FRRe · TUP 2026  
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Requerimientos | HU-M5 · REQ-29: inscripción a deportes (dos como máximo, con control de horarios), transporte por recorrido y comedor · REQ-30 y REQ-31: avisos del último día hábil y del día 20, adaptados a la app |
| Script | [`docs/supabase-inscripciones-avisos.sql`](../../supabase-inscripciones-avisos.sql) |
| Estado | ✅ Diseño validado el 23/11/2026 · Script ejecutado y 11 pruebas en el celular aprobadas el 23/11/2026 |

> Se hizo después de la entrega del 17/11, con la fecha extendida. El informe de IA y la
> bitácora entregados no cambian; esta versión se registra en la documentación del
> repositorio.

---

## 1. Qué faltaba y qué se hace

| Pedido del enunciado | Antes | Ahora |
|---|---|---|
| *"Cada alumno puede inscribirse a dos deportes, al transporte por recorrido y al comedor"* | Solo se consultaban las inscripciones | El padre **inscribe y da de baja** desde la app |
| *"Cada deporte debe tener un profesor responsable"* y *"puede tener diferentes grupos según nivel y horario"* | No estaba modelado | Grupos de cada deporte con nivel, días, horario y profesor |
| *"El sistema deberá controlar que no existan conflictos de horarios"* | No estaba | La base rechaza dos deportes con días en común y horas que se cruzan |
| Correos del último día hábil y del día 20 | No estaban | Pantalla **Avisos de cobranza** con el contenido y la fecha de cada aviso. El envío por correo queda preparado (sección 4) |
| Reporte web de pagos por deporte, horario y profesor | Horario y profesor "Sin registrar" | Muestra los del grupo de cada inscripción |

## 2. Pantallas nuevas

| Pantalla | Desde dónde | Qué hace |
|---|---|---|
| 9. Inscribir | Inscripciones → **Inscribir a un servicio** | Tipo, servicio con su precio, grupo del nivel del alumno (días, horario y profesor) y mes de inicio |
| 10. Dar de baja | Inscripciones → **Dar de baja** | Desde qué mes deja de usarlo. Si todavía no había empezado, se cancela |
| 11. Avisos de cobranza | Mis hijos → **Avisos de cobranza** | Por hijo: recordatorio de pago (total y composición) y aviso de deuda (ítems impagos), con su fecha |

## 3. Decisiones validadas

1. **El padre no escribe en la tabla de inscripciones.** Igual que con los pagos, llama a
   dos funciones de la base (`inscribir_a_servicio` y `dar_de_baja_servicio`) que validan
   que el alumno sea suyo.
2. **Todas las reglas viven en la base**, en el disparador de la Etapa 1, ampliado: dos
   deportes, un recorrido, sin duplicados, grupo del nivel del alumno y conflictos de
   horario. La app avisa antes de enviar (dos capas), pero la que decide es la base.
3. **El alta y la baja rigen desde el primer mes todavía sin facturar.** Así ninguna
   factura emitida queda desactualizada. Lo calcula la base (`primer_mes_sin_facturar`) y
   la app ofrece solo esos meses.
4. **Los horarios que solo se tocan no chocan**: un grupo que termina 18:30 y otro que
   empieza 18:30 pueden convivir.
5. **Los avisos los arma la base** en la vista `avisos_cobranza`. La app los muestra hoy; un
   envío por correo puede leer la misma vista sin rehacer nada.
6. **El último día hábil salta sábado y domingo**; los feriados no se consideran.
7. **Grupos y profesores de ejemplo**, ficticios, cargados por el script. En primario hay
   horarios superpuestos a propósito para probar el control.

## 4. Preparado para el envío por correo

La vista `avisos_cobranza` ya devuelve, para cada factura, el tipo de aviso, la fecha de
envío, el importe y el detalle por ítem. Para mandarlos por mail faltan tres piezas, que no
cambian nada de lo hecho:

1. un servicio de envío de correos (cuenta y clave, guardada como secreto de Supabase);
2. una Edge Function que lea `avisos_cobranza` con `fecha_envio = CURRENT_DATE` y escriba a
   los tutores del alumno (`alumno_tutor` → email de la cuenta);
3. una tarea programada diaria (`pg_cron`) que la invoque.

## 5. En el código

| Archivo | Qué cambia |
|---|---|
| `docs/supabase-inscripciones-avisos.sql` | Grupos, control de horarios, funciones de alta y baja, vista de avisos, auditoría y datos |
| `app-movil/src/services/cobranza.js` | `serviciosParaInscribir`, `mesesParaCambiar`, `inscribir`, `inscripcion`, `darDeBaja`, `avisos` |
| `app-movil/src/domain/situacionInscripcion.js` | `horarioDeGrupo`, `gruposSeSuperponen`, `admiteBaja` |
| `app-movil/src/domain/avisos.js` *(nuevo)* | Tipos de aviso y si ya se emitió o está programado |
| `app-movil/src/components/SelectorDeMes.jsx` *(nuevo)* | Sale del historial para usarlo también en altas y bajas |
| `app-movil/app/inscribir/[id].jsx`, `baja/[id].jsx`, `avisos.jsx` *(nuevas)* | Las tres pantallas |
| `src/services/cobranza.js` y `ReporteCobranzaPage.jsx` (web) | Horario y profesor reales en el reporte por deporte |
| `src/services/auditoria.js` (web) | "Inscripciones a servicios" en el filtro de Auditoría |
| `app-movil/src/domain/reglas.test.js` *(nuevo)* | 8 pruebas de las reglas de la app, que ahora corren con el Vitest del proyecto |
| `app-movil/app.json` | Versión 1.1.0 |

## 6. Pruebas

### 6.1. Base de datos

El equipo ejecutó `supabase-inscripciones-avisos.sql` en el SQL Editor de Supabase el
23/11/2026 y corrió las tres consultas de verificación del final del script.

| Consulta | Resultado esperado | Cómo se comprobó | Resultado |
|---|---|---|---|
| Cantidad de grupos | 20 | Informado por el equipo | ✅ |
| Inscripciones a deportes sin grupo | 0 filas | Informado por el equipo | ✅ |
| Avisos de cobranza | Recordatorios y avisos de deuda de marzo, abril y mayo de 2027 | Informado por el equipo | ✅ |

### 6.2. En el celular

Hechas el 23/11/2026 con Expo Go, con la cuenta de padre de prueba y la alumna yura hakanson.
La columna *Cómo se comprobó* sigue el criterio de la Etapa 4 (registro 17 de la bitácora):
el equipo informó que las 11 dieron el resultado esperado.

| # | Prueba | Resultado esperado | Cómo se comprobó | Resultado |
|---|---|---|---|---|
| V1 | Mis hijos → **Avisos de cobranza** | Recordatorios del 26/02, 31/03 y 30/04/2027, y avisos de deuda del 20/04 ($ 59.000) y del 20/05 ($ 192.000), cada uno con sus ítems | Informado por el equipo | ✅ |
| V2 | **Ver inscripciones** | Fútbol "Lun y Mié · 17:00 a 18:30 · Prof. Martín Acosta" y Natación "Mar y Jue · 17:00 a 18:00 · Prof. Lucía Benítez" | Informado por el equipo | ✅ |
| V3 | Inscribir Vóleibol con dos deportes vigentes | Aviso previo en la app; al confirmar, la base lo rechaza | Informado por el equipo | ✅ |
| V4 | Natación → **Dar de baja** desde junio de 2027 | "Desde Junio 2027 ya no se factura Natación"; la inscripción queda del 01/04 al 31/05 | Informado por el equipo | ✅ |
| V5 | Inscribir Básquet (Lun y Mié 17:30) desde junio | Aviso de superposición; la base responde "Conflicto de horario: Básquet se superpone con Fútbol…" | Informado por el equipo | ✅ |
| V6 | Inscribir Artes Marciales (Mié y Vie 18:30) desde junio | Se registra: empieza justo cuando termina Fútbol | Informado por el equipo | ✅ |
| V7 | Inscribir el Recorrido 2 | "…un solo recorrido de transporte a la vez" | Informado por el equipo | ✅ |
| V8 | Inscribir al comedor | "El alumno ya está inscripto a Comedor…" | Informado por el equipo | ✅ |
| V9 | Selector de mes en alta y baja | Arranca en junio de 2027, el primer mes sin facturar, y no deja ir antes | Informado por el equipo | ✅ |
| V10 | Artes Marciales → Dar de baja desde junio | "La inscripción se canceló" y desaparece de la lista | Informado por el equipo | ✅ |
| V11 | **Historial** | Funciona igual que antes, con el selector de mes compartido | Informado por el equipo | ✅ |

**Datos que dejan las pruebas en la base publicada:** V4 deja la Natación de yura dada de
baja desde junio de 2027. V6 y V10 se compensan: Artes Marciales se inscribe y después se
cancela. Las tres operaciones quedan en Auditoría, en "Inscripciones a servicios".

### 6.3. Automáticas

`npm run lint` sin avisos y `npm test` con 52 pruebas en verde: 8 nuevas de las reglas de la
app (situación de la inscripción, baja, horario del grupo, horarios que se superponen y que
solo se tocan, y avisos) y 3 de la web (horario
y grupo de cada ítem del reporte). La app compila para Android con `npx expo export`.
