# Scripts del portafolio

Generan los entregables de Metodología de Sistemas II que no se escriben a mano:
el **Plan de Trabajo** en `.docx` y los **diagramas** en `.png`.

La razón de que existan es que las fechas de entrega cambian. Cuando eso pasa, el
cronograma, el diagrama de Gantt, el plan de sprint, los hitos de Scrum y las fechas
de los objetivos SMART tienen que moverse de forma coherente entre sí — eran unos
40 lugares distintos del documento. Acá se cambia **una sola línea** y se regenera.

---

## Archivos

| Archivo | Qué hace |
|---|---|
| `cronograma.py` | **Único archivo a editar si cambian las fechas.** Define el calendario y lo deriva todo. |
| `plan_docx.py` | Genera el documento Word completo (19 páginas) a partir de `cronograma.py`. |
| `diagramas.py` | Genera los 3 diagramas PNG (arquitecturas y red PERT). No depende de fechas. |

---

## Cambiar las fechas de entrega

### 1. Editar `cronograma.py`

Todo sale de este bloque:

```python
FECHA_INICIO = date(2026, 9, 1)       # primer día hábil del proyecto
INTEGRANTES = 2
HORAS_SEMANA_POR_INTEGRANTE = 6

FERIADOS = [
    date(2026, 10, 12),               # se saltean al armar el calendario
]

ETAPAS = [
    # (nombre, offset en días hábiles, duración en días hábiles, horas de equipo)
    ("Planificación del proyecto",   0,  4,  6),
    ("Estudio de requerimientos",    1,  8, 12),
    ("Codificación — Sprint 1",     10, 10, 16),
    ...
]
```

Las etapas se ubican por **posición en la lista de días hábiles**, no por fecha
absoluta. Por eso mover `FECHA_INICIO` recalcula todo solo, respetando fines de
semana y feriados, y el cronograma sigue siendo coherente.

Si además cambia la **duración** del proyecto, ajustar los `offset` y las
`duración` de `ETAPAS`. El total de horas debe seguir entrando en la capacidad
del equipo; el autodiagnóstico lo verifica.

### 2. Verificar el cronograma antes de generar nada

```bash
python cronograma.py
```

Imprime la tabla de etapas con sus fechas, los sprints, los hitos, las semanas del
Gantt y un chequeo final de que las horas planificadas entran en la capacidad
disponible. **Si esto se ve bien, el documento va a salir bien.**

### 3. Regenerar el documento

```bash
python plan_docx.py ../recursos/diagramas "../../Metodología de Sistemas II/PlanDeTrabajo_Metodología2_Grupo4.docx"
```

### 4. Regenerar los diagramas (solo si cambió su contenido)

```bash
python diagramas.py ../recursos/diagramas
```

Los diagramas no dependen del calendario: son las dos arquitecturas y la red PERT
(que trabaja en horas, no en fechas). Solo hace falta correrlo si cambian las
estimaciones del PERT o el contenido de las arquitecturas.

---

## Lo que hay que actualizar a mano

Estos archivos repiten las fechas y **no** se regeneran solos:

- [`docs/00-equipo/plan-de-trabajo.md`](../00-equipo/plan-de-trabajo.md) — la versión
  Markdown del mismo plan (tabla de cronograma, Gantt en Mermaid, tabla PERT).
- [`docs/01-unidad-1/03-backlog-y-sprints/README.md`](../01-unidad-1/03-backlog-y-sprints/README.md)
  — el plan día por día de cada sprint.

Si cambian las fechas, correr `python cronograma.py` y copiar los valores desde su
salida, que es la fuente de verdad.

---

## Dependencias

```bash
pip install python-docx matplotlib
```

`pypdfium2` es opcional: sirve para renderizar el PDF y revisar el resultado
visualmente. La conversión a PDF se hace con Word, no con Python.

---

## Notas

- El documento sale en **A4** (21 × 29,7 cm) con márgenes 2,5 / 2 / 2,5 / 2 cm y
  Calibri 11, que es el formato que pide la cátedra. La página del Gantt es la
  única apaisada.
- Los sprints corren **de martes a lunes** para que el Sprint Planning caiga
  después de la clase del martes y la Review el lunes previo a la clase siguiente.
  Eso está implícito en `FECHA_INICIO` (un martes) y en los offsets de `ETAPAS`.
- `IDX_SPRINTS` declara qué etapas son sprints de Scrum. Al agregar o quitar un
  sprint hay que actualizar esa lista y los textos de `DETALLE_SPRINTS` en
  `plan_docx.py`, que describen las actividades de cada semana.
- El cronograma vigente va del **1 de septiembre al 27 de octubre de 2026**
  (40 días hábiles, 8 semanas, 96 h de equipo) y contempla el feriado del 12 de
  octubre. La entrega del 27/10 comprende la web y el Sistema de Gestión.
