# -*- coding: utf-8 -*-
"""
Genera el Plan de Trabajo de la PARTE 3 — Aplicacion movil integrada con IA.
Metodologia de Sistemas II (UTN FRRe, TUP 2026)

Formato exigido por la catedra: A4, margenes 2,5 sup / 2 inf / 2,5 izq / 2 der,
Calibri 11, interlineado simple.

    python plan_movil_docx.py <carpeta_diagramas> <salida.docx>

Las fechas, el Gantt y el PERT salen de cronograma_movil.py: no hay ninguna
fecha escrita a mano en este archivo.
"""
import sys, os
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION, WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

import cronograma_movil as C

DIAG = sys.argv[1]
DEST = sys.argv[2]

AZUL = RGBColor(0x1F, 0x4E, 0x79)
NEGRO = RGBColor(0x1A, 0x1A, 0x1A)
GRIS = RGBColor(0x59, 0x59, 0x59)

HDR_FILL = "1F4E79"
SUB_FILL = "DCE7F2"
TOT_FILL = "C6D9EC"

doc = Document()

# ----------------------------------------------------------------- estilos base
st = doc.styles["Normal"]
st.font.name = "Calibri"
st.font.size = Pt(11)
st.font.color.rgb = NEGRO
st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
pf = st.paragraph_format
pf.space_after = Pt(6)
pf.space_before = Pt(0)
pf.line_spacing = 1.0

sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
sec.top_margin, sec.bottom_margin = Cm(2.5), Cm(2.0)
sec.left_margin, sec.right_margin = Cm(2.5), Cm(2.0)

USABLE = Emu(sec.page_width - sec.left_margin - sec.right_margin)


# ----------------------------------------------------------------- helpers
def _runfont(run, size=11, bold=False, italic=False, color=NEGRO, name="Calibri"):
    run.font.name = name
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    return run


def _borde_inferior(p):
    pPr = p._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "2")
    bottom.set(qn("w:color"), "1F4E79")
    pbdr.append(bottom)
    pPr.append(pbdr)


def h1(texto, before=14, after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.keep_with_next = True
    _runfont(p.add_run(texto.upper()), 12.5, True, color=AZUL)
    _borde_inferior(p)
    return p


def h2(texto, before=10, after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.keep_with_next = True
    _runfont(p.add_run(texto), 11, True, color=AZUL)
    return p


def h3(texto, before=8, after=3):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.keep_with_next = True
    _runfont(p.add_run(texto), 11, True)
    return p


def par(texto="", size=11, bold=False, italic=False, align=None, color=NEGRO,
        after=6, before=0, izq=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.space_before = Pt(before)
    if izq:
        p.paragraph_format.left_indent = Cm(izq)
    if align == "j":
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    elif align == "c":
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if texto:
        _runfont(p.add_run(texto), size, bold, italic, color)
    return p


def rico(partes, align="j", after=6, izq=0, size=11):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    if izq:
        p.paragraph_format.left_indent = Cm(izq)
    if align == "j":
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    for t, b, i in partes:
        _runfont(p.add_run(t), size, b, i)
    return p


def vin(texto, size=11, izq=0.55, after=3, bold=False):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Cm(izq)
    p.paragraph_format.space_after = Pt(after)
    _runfont(p.add_run(texto), size, bold)
    return p


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def cell_text(cell, texto, size=9.5, bold=False, color=NEGRO, align=None,
              italic=False):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    if align == "c":
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "r":
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for j, linea in enumerate(str(texto).split("\n")):
        if j:
            p.add_run("\n")
        _runfont(p.add_run(linea), size, bold, italic, color)
    return cell


def _repetir_encabezado(t):
    tr = t.rows[0]._tr
    trPr = tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    trPr.append(el)


def tabla(filas, anchos=None, size=9.5, header=True, aligns=None,
          total_row=False, after=8):
    t = doc.add_table(rows=len(filas), cols=len(filas[0]))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for i, fila in enumerate(filas):
        for j, val in enumerate(fila):
            c = t.cell(i, j)
            es_hdr = header and i == 0
            es_tot = total_row and i == len(filas) - 1
            al = "c" if es_hdr else (aligns[j] if aligns else None)
            cell_text(c, val, size,
                      bold=es_hdr or es_tot,
                      color=RGBColor(0xFF, 0xFF, 0xFF) if es_hdr else NEGRO,
                      align=al)
            if es_hdr:
                shade(c, HDR_FILL)
            elif es_tot:
                shade(c, TOT_FILL)
            if anchos:
                c.width = Cm(anchos[j])
    if anchos:
        for j, w in enumerate(anchos):
            for row in t.rows:
                row.cells[j].width = Cm(w)
    _repetir_encabezado(t)
    doc.add_paragraph().paragraph_format.space_after = Pt(after)
    return t


def campo_pagina(p):
    for instr, txt in [("PAGE", "1"), (None, " de "), ("NUMPAGES", "1")]:
        if instr is None:
            _runfont(p.add_run(txt), 8.5, color=GRIS)
            continue
        r = p.add_run()
        _runfont(r, 8.5, color=GRIS)
        f1 = OxmlElement("w:fldChar"); f1.set(qn("w:fldCharType"), "begin")
        it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve")
        it.text = " %s " % instr
        f2 = OxmlElement("w:fldChar"); f2.set(qn("w:fldCharType"), "end")
        r._r.append(f1); r._r.append(it); r._r.append(f2)


def encabezado_pie(section, titulo="Metodología de Sistemas II"):
    hp = section.header.paragraphs[0]
    hp.text = ""
    hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _runfont(hp.add_run(titulo + "   ·   "), 9, True, color=AZUL)
    _runfont(hp.add_run("Tecnicatura Universitaria en Programación   ·   UTN FRRe   ·   2026"),
             9, False, color=GRIS)
    _borde_inferior(hp)
    fp = section.footer.paragraphs[0]
    fp.text = ""
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _runfont(fp.add_run("Plan de Trabajo — Parte 3: Aplicación Móvil   |   Grupo 4   |   "),
             8.5, color=GRIS)
    campo_pagina(fp)


def imagen(ruta, ancho_cm, caption=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(ruta, width=Cm(ancho_cm))
    if caption:
        c = doc.add_paragraph()
        c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        c.paragraph_format.space_after = Pt(10)
        _runfont(c.add_run(caption), 8.5, False, True, GRIS)


encabezado_pie(sec)

# ================================================================= PORTADA
tp = doc.add_paragraph()
tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
tp.paragraph_format.space_after = Pt(2)
_runfont(tp.add_run("PLAN DE TRABAJO — PROYECTO"), 16, True, color=AZUL)

tp = doc.add_paragraph()
tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
tp.paragraph_format.space_after = Pt(2)
_runfont(tp.add_run("CENTRO EDUCATIVO “EDUCAR PARA TRANSFORMAR”"), 13, True)

tp = doc.add_paragraph()
tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
tp.paragraph_format.space_after = Pt(14)
_runfont(tp.add_run("Parte 3 — Aplicación móvil integrada con Inteligencia Artificial"),
         12, False, True, GRIS)

h1("Nombre del equipo de trabajo", before=6)
par("Grupo 4", 12, bold=True)

h1("Apellido y nombre del equipo de trabajo")
tabla([
    ["Apellido y nombre", "Correo institucional", "Rol en Scrum", "Historias de Usuario"],
    ["Cerqueiro, Gonzalo", "gonzalo.cerqueiro@frre.utn.edu.ar", "Development Team",
     "HU-M1 · HU-M2 · HU-M3"],
    ["Fernández, Lautaro", "lautaro.fernandez@frre.utn.edu.ar", "Development Team",
     "HU-M4 · HU-M5 · HU-M6"],
], anchos=[4.2, 6.0, 3.0, 3.3], aligns=[None, None, "c", "c"])

rico([("Equipo de dos integrantes, con la misma organización que en las partes anteriores: "
       "el trabajo se reparte ", False, False),
      ("por Historia de Usuario", True, False),
      (" y cada integrante es responsable de las suyas de punta a punta —modelo de datos, "
       "políticas de seguridad, lógica, interfaz y pruebas—. No hay Scrum Master ni Product "
       "Owner externos: ambas responsabilidades se asumen de forma compartida.", False, False)])

# ================================================================= 1. DESCRIPCION
h1("1. Descripción del proyecto")

h2("1.1. Enunciado del problema")
par("El Centro Educativo “Educar para Transformar” inicia sus actividades en marzo de 2027. "
    "Las dos primeras partes del proyecto ya están resueltas: la página web institucional "
    "(Parte 1) y el Sistema de Gestión académico (Parte 2), ambos desplegados y en uso.",
    align="j")
rico([("Esta tercera parte incorpora una ", False, False),
      ("aplicación móvil", True, False),
      (" que centraliza la gestión económica del servicio educativo: el ", False, False),
      ("pago de cuotas", True, False), (", y las inscripciones y el cobro del ", False, False),
      ("comedor, los deportes y el transporte", True, False),
      (". Hasta hoy esa información no existe en el sistema: la institución no tiene forma de "
       "informarle a una familia cuánto debe, por qué concepto, ni de registrar que pagó.",
       False, False)])
par("El enunciado agrega una segunda condición, que no es técnica sino metodológica: el "
    "desarrollo debe realizarse con asistencia de herramientas de Inteligencia Artificial, "
    "llevando una bitácora de su uso. La IA no reemplaza el análisis ni la responsabilidad "
    "del equipo: todo código o solución que se incorpore debe ser comprendido, verificado y "
    "justificado por quien lo integra.", align="j")

h2("1.2. Relación entre la aplicación web y la aplicación móvil")
par("La aplicación móvil no es un sistema nuevo: es un cliente más del mismo backend. "
    "Este cuadro responde, punto por punto, cómo se relaciona con lo que ya existe.", align="j")
tabla([
    ["Pregunta", "Respuesta"],
    ["¿Qué funcionalidades ya existían en la web?",
     "Sitio institucional público, solicitudes de inscripción, autenticación con seis roles, "
     "panel de administración de contenido y el Sistema de Gestión académico: matrícula, "
     "legajo, cursos, materias, asignación de docentes y asistencia."],
    ["¿Cuáles se incorporan en la aplicación móvil?",
     "Consulta de cuotas y vencimientos, selección de ítems a pagar con emisión de "
     "comprobante, carga del comprobante de transferencia, historial de facturas y deuda, e "
     "inscripción a deportes, transporte y comedor."],
    ["¿Qué información comparten?",
     "Los usuarios y sus roles (profiles), el vínculo entre padre e hijo (alumno_tutor), los "
     "alumnos, sus matrículas y sus cursos. La app no crea su propio padrón: lee el que "
     "produjo la matriculación de la Parte 2."],
    ["¿Cómo se comunican?",
     "Contra la misma API REST de Supabase, autenticando con el mismo JWT. La app móvil no "
     "habla con la web: ambas hablan con el mismo backend."],
    ["¿Qué modificaciones hay que hacer en el backend?",
     "Agregar las tablas de conceptos, cuotas, facturas, comprobantes e inscripciones a "
     "servicios, con sus políticas RLS; una función de PostgreSQL que genere las cuotas del "
     "mes; y una Edge Function que envíe los correos de recordatorio y de deuda."],
    ["¿Qué información se reutiliza?",
     "Todo el padrón académico y el esquema de permisos. La regla “un padre solo ve a sus "
     "hijos” ya está implementada con la función alumnos_a_cargo() y se aplica igual a las "
     "tablas nuevas."],
    ["¿Cómo se mantienen sincronizados?",
     "No hay sincronización que mantener: hay una única base de datos. Al no duplicarse los "
     "datos, no pueden quedar inconsistentes. La web suma las pantallas de reportes de "
     "cobranza sobre esas mismas tablas."],
], anchos=[5.0, 11.5], size=9)

h2("1.3. Requerimientos de la Parte 3")
par("Se numeran a continuación del Sistema de Gestión, que llegó hasta el REQ-22.", align="j")
tabla([
    ["Código", "Requerimiento funcional", "Módulo del enunciado"],
    ["REQ-23", "Autenticación en la app móvil con el mismo usuario de la web, cierre de sesión y "
               "acceso limitado según el rol.", "Módulo 1"],
    ["REQ-24", "Consulta de cuotas pendientes y pagadas, con vencimiento, importe y estado.",
     "Módulo 2"],
    ["REQ-25", "Selección de los ítems a pagar y emisión del comprobante de pago.", "Módulo 2"],
    ["REQ-26", "Carga del comprobante de transferencia asociado a una factura. Una factura "
               "admite más de un comprobante.", "Módulo 2"],
    ["REQ-27", "Historial de facturas y comprobantes por alumno en un período de fechas.",
     "Módulo 2"],
    ["REQ-28", "Historial de deuda discriminado por cada ítem de pago.", "Módulo 2"],
    ["REQ-29", "Inscripción a deportes (máximo dos simultáneos), transporte por recorrido y "
               "comedor, con control de conflictos de horario.", "Reglas de negocio"],
    ["REQ-30", "Envío por correo, el último día hábil del mes, del detalle a abonar con la "
               "factura adjunta.", "Notificaciones"],
    ["REQ-31", "Envío por correo, el día 20 de cada mes, del saldo pendiente a quien no "
               "completó el pago.", "Notificaciones"],
    ["REQ-32", "Reportes de cobranza en la aplicación web: ingresos por período, pagos "
               "completos e incompletos, y pagos por deporte y por recorrido.", "Aplicación web"],
], anchos=[1.8, 10.2, 4.5], size=9, aligns=["c", None, None])

h3("Requerimientos no funcionales")
for txt in [
    "La aplicación debe funcionar en Android, que es el sistema mayoritario entre las familias "
    "destinatarias.",
    "Ningún dato económico puede quedar accesible a un usuario que no sea el tutor del alumno "
    "o personal autorizado: se verifica en la base con Row Level Security, no solo en pantalla.",
    "Los comprobantes cargados por las familias se almacenan en Supabase Storage con acceso "
    "restringido por rol.",
    "La aplicación debe ser usable con conexión móvil intermitente: toda operación informa su "
    "resultado y ningún pago queda en estado ambiguo.",
    "El código generado con asistencia de IA debe ser revisado y comprendido por el equipo "
    "antes de integrarse, y su uso registrado en la bitácora.",
]:
    vin(txt, size=10)

h2("1.4. Arquitectura de la solución")
par("La decisión central de esta parte es no construir un backend propio para el teléfono. "
    "La aplicación móvil consume los mismos servicios que la web, con el mismo esquema de "
    "autenticación y las mismas políticas de seguridad por fila.", align="j")
imagen(os.path.join(DIAG, "arq-movil.png"), 15.6,
       "Figura 1. Integración de la aplicación móvil con la web y el backend existentes.")

h2("1.5. Modelo de datos que se incorpora")
par("El modelo actual cubre lo académico. La Parte 3 agrega la dimensión económica, "
    "colgándola del alumno y de su matrícula, que ya existen.", align="j")
tabla([
    ["Tabla", "Para qué", "Requerimiento"],
    ["conceptos", "Catálogo de lo que se cobra: cuota mensual, comedor, cada deporte y cada "
                  "recorrido de transporte, con su importe vigente.", "REQ-24 · REQ-29"],
    ["inscripciones_servicio", "Inscripción de un alumno a un deporte, a un recorrido o al "
                               "comedor, con su período. Es la que determina qué se le cobra.",
     "REQ-29"],
    ["facturas", "Resumen mensual por alumno: período, vencimiento, total y estado.",
     "REQ-24 · REQ-30"],
    ["factura_items", "Detalle de la factura: un renglón por concepto, con su importe. Es lo "
                      "que permite discriminar la deuda por ítem.", "REQ-25 · REQ-28"],
    ["comprobantes", "Comprobante de transferencia cargado por la familia, asociado a una "
                     "factura. Una factura admite varios.", "REQ-26"],
], anchos=[3.6, 10.4, 2.5], size=9)

h3("Reglas del enunciado que se resuelven en el modelo")
for txt in [
    "Un alumno no puede inscribirse a más de dos deportes simultáneos: se controla con una "
    "restricción sobre inscripciones_servicio.",
    "No puede haber conflicto de horario entre las actividades deportivas elegidas: lo valida "
    "un disparador al inscribir.",
    "El transporte es opcional y puede variar mes a mes: por eso la inscripción tiene período "
    "y la factura se arma a partir de lo vigente en ese mes.",
    "Una factura puede tener más de un comprobante asociado: la relación es de uno a muchos.",
    "No se registran pagos en efectivo: todo comprobante corresponde a una transferencia.",
    "Un padre solo accede a la información de sus hijos: se reutiliza la función "
    "alumnos_a_cargo() que ya aplica el Sistema de Gestión.",
]:
    vin(txt, size=10)

h2("1.6. Patrones de diseño aplicados")
par("Se sostienen los tres patrones adoptados en la Parte 2 y se incorpora uno más, que "
    "aparece por una necesidad concreta de esta etapa.", align="j")
tabla([
    ["Patrón", "Tipo", "Dónde se aplica en la Parte 3"],
    ["Singleton", "Creacional",
     "El cliente de Supabase es único por aplicación. En la app móvil se replica el mismo "
     "criterio: una sola instancia con la sesión del usuario."],
    ["Facade", "Estructural",
     "La capa de servicios creada en el Sprint 1 se extiende con los servicios de cuotas, "
     "facturas y servicios contratados. La app móvil consume esa misma capa y ninguna "
     "pantalla conoce el nombre de las tablas."],
    ["State", "De comportamiento",
     "El ciclo de vida de una factura —emitida, parcialmente pagada, pagada, vencida— se "
     "modela como máquina de estados: cada estado declara a qué otros puede pasar. Es lo que "
     "impide, por ejemplo, que una factura pagada vuelva a cobrarse."],
    ["Strategy", "De comportamiento",
     "El importe se calcula distinto según el concepto: la cuota es fija, el transporte "
     "depende del recorrido y el deporte del grupo. Cada concepto aporta su forma de "
     "calcular, y agregar uno nuevo no obliga a tocar el código que factura."],
], anchos=[2.4, 2.8, 11.3], size=9)

h2("1.7. Tecnologías")
tabla([
    ["Capa", "Tecnología", "Por qué"],
    ["Aplicación móvil", "React Native + Expo",
     "Mismo lenguaje y misma librería de Supabase que la web ya desarrollada: el equipo "
     "reutiliza lo que sabe y la capa de servicios se comparte. Expo permite compilar y "
     "distribuir la app de prueba sin depender de un equipo Apple."],
    ["Autenticación y API", "Supabase Auth · API REST",
     "Ya está en producción y resuelve el inicio de sesión con los mismos usuarios y roles."],
    ["Base de datos", "PostgreSQL con Row Level Security",
     "Única base para los dos clientes, con las reglas de negocio en restricciones y "
     "disparadores."],
    ["Archivos", "Supabase Storage",
     "Guarda los comprobantes de transferencia con permisos por rol."],
    ["Correos automáticos", "Supabase Edge Functions programadas",
     "Ejecutan los envíos del día 20 y del último día hábil del mes sin servidor propio."],
    ["Asistencia de IA", "Claude Code · ChatGPT",
     "Apoyo al desarrollo con registro en la bitácora de uso de IA exigida por el enunciado."],
], anchos=[3.2, 4.2, 9.1], size=9)

h2("1.8. Cómo se va a trabajar con Inteligencia Artificial")
par("El enunciado evalúa el proceso y no solo el producto, así que el equipo define desde el "
    "plan cómo se usa la IA y cómo se controla lo que produce.", align="j")
tabla([
    ["Momento", "Qué se le pide a la IA", "Qué valida el equipo"],
    ["Modelado", "Propuestas de estructura para facturas, ítems y comprobantes.",
     "Que respeten las reglas del enunciado y el modelo ya existente, y que no dupliquen "
     "datos que ya viven en otra tabla."],
    ["Codificación", "Pantallas, formularios y consultas de la app móvil.",
     "Que usen la capa de servicios y las constantes de rutas y roles del proyecto, en lugar "
     "de inventar accesos nuevos."],
    ["Seguridad", "Borradores de políticas RLS.",
     "Que ningún rol acceda a datos ajenos: se prueba contra la API, no solo en pantalla."],
    ["Documentación", "Redacción y ordenamiento del informe.",
     "Que lo afirmado sea cierto y verificable en el repositorio."],
], anchos=[2.6, 6.4, 7.5], size=9)
par("Cada intervención relevante se registra en la bitácora con el problema, el prompt, la "
    "herramienta, la respuesta, si funcionó, qué se modificó y el resultado final. La "
    "bitácora es una etapa del cronograma —no una tarea de último momento— y se entrega el "
    + C.largo(C.FECHA_INFORME_IA) + ".", align="j")

# ================================================================= 2. OBJETIVOS
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h1("2. Objetivos del proyecto", before=0)
par("Los objetivos siguen el criterio SMART: específicos, medibles, alcanzables, relevantes "
    "y con plazo definido. Las fechas se corresponden con las etapas del cronograma.",
    align="j")

objetivos = [
    ("OE-1", "Modelar la dimensión económica del sistema",
     "Diseñar e implementar en la base de datos las tablas de conceptos, servicios "
     "contratados, facturas, ítems y comprobantes, con sus restricciones y políticas RLS, "
     "antes del %s." % C.largo_sin_anio(C.ETAPAS_CALC[2].fin),
     [("Específico", "Amplía el modelo actual con lo necesario para facturar; no incluye "
                     "calificaciones ni asistencia, ya resueltas."),
      ("Medible", "Cinco tablas creadas, con script SQL idempotente y políticas RLS "
                  "verificadas con cada rol."),
      ("Alcanzable", "Se apoya en el modelo académico existente y en el mismo método de "
                     "trabajo aplicado en el Sprint 1."),
      ("Relevante", "Sin este modelo ninguna funcionalidad de la app tiene dónde apoyarse."),
      ("Temporal", "Del %s al %s." % (C.dma(C.ETAPAS_CALC[2].inicio),
                                      C.dma(C.ETAPAS_CALC[2].fin)))]),
    ("OE-2", "Poner en funcionamiento la aplicación móvil",
     "Desarrollar una aplicación móvil que permita a un padre iniciar sesión, consultar sus "
     "cuotas, pagar los ítems seleccionados y cargar el comprobante, en funcionamiento para "
     "el %s." % C.largo_sin_anio(C.SPRINT_2.fin),
     [("Específico", "Cubre los módulos 1 y 2 del enunciado: autenticación y gestión de cuotas."),
      ("Medible", "Cuatro Historias de Usuario con sus criterios de aceptación verificados."),
      ("Alcanzable", "Dos sprints de una semana con la capacidad completa del equipo, una vez "
                     "entregada la Parte 2."),
      ("Relevante", "Es el corazón del enunciado de la Parte 3."),
      ("Temporal", "Del %s al %s." % (C.dma(C.SPRINT_1.inicio), C.dma(C.SPRINT_2.fin)))]),
    ("OE-3", "Integrar la app con el sistema existente sin duplicar datos",
     "Lograr que la aplicación móvil opere sobre la misma base y el mismo esquema de permisos "
     "que la web, sin crear tablas de usuarios ni de alumnos paralelas, verificado antes del "
     "%s." % C.largo_sin_anio(C.ETAPAS_CALC[6].fin),
     [("Específico", "Un solo backend, un solo padrón, un solo juego de políticas."),
      ("Medible", "Cero tablas duplicadas y sesión iniciada en la app con el mismo usuario de "
                  "la web."),
      ("Alcanzable", "La capa de servicios y las políticas RLS ya existen y se reutilizan."),
      ("Relevante", "El enunciado lo pide expresamente: evitar duplicación e inconsistencias."),
      ("Temporal", "Del %s al %s." % (C.dma(C.ETAPAS_CALC[6].inicio),
                                      C.dma(C.ETAPAS_CALC[6].fin)))]),
    ("OE-4", "Automatizar los avisos de pago",
     "Implementar el envío automático del detalle a abonar el último día hábil de cada mes y "
     "del saldo pendiente el día 20, con la factura adjunta, antes del %s."
     % C.largo_sin_anio(C.ETAPAS_CALC[7].fin),
     [("Específico", "Dos envíos automáticos, con su contenido definido por el enunciado."),
      ("Medible", "Ambos envíos probados con datos de prueba y su resultado registrado."),
      ("Alcanzable", "Se resuelven con funciones programadas en el backend actual."),
      ("Relevante", "Es lo que convierte al sistema en una herramienta de cobranza y no solo "
                    "de consulta."),
      ("Temporal", "Del %s al %s." % (C.dma(C.SPRINT_2.inicio), C.dma(C.ETAPAS_CALC[7].fin)))]),
    ("OE-5", "Documentar y justificar el uso de Inteligencia Artificial",
     "Llevar la bitácora de IA durante todo el desarrollo y entregar el informe con la "
     "comparación y la reflexión crítica el %s." % C.largo(C.FECHA_INFORME_IA),
     [("Específico", "Registro por intervención: problema, prompt, herramienta, respuesta, "
                     "modificaciones y resultado."),
      ("Medible", "Bitácora completa, tabla comparativa de los diez aspectos y respuesta a "
                  "las diez preguntas de la reflexión."),
      ("Alcanzable", "Se completa a medida que se trabaja, no al final."),
      ("Relevante", "Es uno de los tres entregables de la Parte 3."),
      ("Temporal", "Del %s al %s." % (C.dma(C.ETAPAS_CALC[8].inicio),
                                      C.dma(C.FECHA_INFORME_IA)))]),
]

for cod, titulo, enunciado, desglose in objetivos:
    h2("%s — %s" % (cod, titulo))
    par(enunciado, align="j", after=4)
    tabla([["Criterio", "Cómo se cumple"]] + [[k, v] for k, v in desglose],
          anchos=[2.6, 13.9], size=9, after=6)

# ================================================================= 3. CRONOGRAMA
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h1("3. Cronograma de actividades", before=0)
rico([("La Parte 3 se desarrolla entre el ", False, False),
      (C.largo(C.FECHA_INICIO), True, False), (" y el ", False, False),
      (C.largo(C.FECHA_FIN), True, False),
      (", en %d días hábiles. El plazo lo fija el enunciado: la aplicación debe estar "
       "terminada para la actividad de testing. El feriado del %s está descontado del "
       "calendario." % (C.TOTAL_DIAS_HABILES, C.largo_sin_anio(C.FERIADOS[0])), False, False)])

rico([("Hay una restricción que condiciona todo el plan: hasta el ", False, False),
      (C.largo(C.FECHA_ENTREGA_PARTE_2), True, False),
      (" el equipo está terminando la Parte 2, que se entrega ese día. Por eso, en ese tramo "
       "la Parte 3 avanza solo con análisis, modelado y diseño —la mitad de la capacidad "
       "semanal— y la codificación arranca recién al día siguiente, con las 12 horas "
       "semanales completas. De las %d horas de capacidad teórica del período se planifican "
       "%d." % (C.CAPACIDAD_TEORICA, C.TOTAL_HORAS), False, False)])

filas = [["N°", "Etapa", "Inicio", "Fin", "Días hábiles", "Horas"]]
for e in C.ETAPAS_CALC:
    filas.append([str(e.numero), e.nombre, C.corto(e.inicio), C.corto(e.fin),
                  str(e.duracion), str(e.horas)])
filas.append(["", "TOTAL", C.dma(C.FECHA_INICIO), C.dma(C.FECHA_FIN),
              str(C.TOTAL_DIAS_HABILES), str(C.TOTAL_HORAS)])
tabla(filas, anchos=[1.0, 7.0, 2.4, 2.4, 2.0, 1.7], size=9.5,
      aligns=["c", None, "c", "c", "c", "c"], total_row=True)

par("Las etapas se solapan a propósito: el modelado empieza mientras todavía se relevan "
    "requerimientos, y las pruebas se inician antes de que termine el segundo sprint. Ese "
    "solapamiento es lo que permite sostener el plan dentro del plazo disponible.", align="j")

doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h1("4. Descripción de las actividades", before=0)
tabla([
    ["Etapa", "Qué comprende", "Horas", "Entregable", "Responsable"],
    ["Planificación de la Parte 3",
     "Análisis del enunciado, definición del alcance, armado de este plan, del backlog y de "
     "los sprints.", "4",
     "Plan de trabajo aprobado", "Ambos"],
    ["Estudio de requerimientos de la app",
     "Relevamiento de los requerimientos de cobranza, servicios y notificaciones; criterios "
     "de aceptación de cada Historia de Usuario.", "6",
     "Requerimientos REQ-23 a REQ-32 con sus criterios", "Ambos"],
    ["Modelado de cuotas, pagos y servicios",
     "Modelo relacional de conceptos, servicios contratados, facturas, ítems y comprobantes. "
     "Restricciones del enunciado traducidas a claves y disparadores. Script SQL con RLS.",
     "8", "DER y script SQL versionado", "Gonzalo (lidera)"],
    ["Diseño de la aplicación móvil",
     "Flujo de navegación, pantallas y estados de la app; reutilización de la identidad "
     "visual del sitio.", "6", "Prototipo navegable validado", "Lautaro (lidera)"],
    ["Codificación — Sprint móvil 1",
     "Autenticación en la app y consulta de cuotas y vencimientos (módulos 1 y 2 del "
     "enunciado).", "12", "Incremento funcional del sprint", "Ambos"],
    ["Codificación — Sprint móvil 2",
     "Selección de ítems a pagar, emisión del comprobante y carga del comprobante de "
     "transferencia.", "12", "Incremento funcional del sprint", "Ambos"],
    ["Integración con la web y el backend",
     "Envíos automáticos por correo, reportes de cobranza en la web y verificación de que "
     "ambos clientes operan sobre los mismos datos.", "6",
     "Integración verificada", "Ambos"],
    ["Pruebas y validación",
     "Pruebas funcionales sobre los criterios de aceptación, pruebas de permisos por rol en "
     "las dos capas y regresión sobre la web ya entregada.", "6",
     "Casos de prueba documentados", "Ambos"],
    ["Bitácora de IA y documentación",
     "Registro de cada intervención de IA y redacción del informe: comparación, reflexión "
     "crítica y relación entre la web y la app.", "4",
     "Informe de uso de IA", "Ambos"],
], anchos=[3.4, 6.6, 1.2, 3.0, 2.3], size=8.8, aligns=[None, None, "c", None, "c"])

# ================================================================= 5. GANTT
gsec = doc.add_section(WD_SECTION.NEW_PAGE)
gsec.orientation = WD_ORIENT.LANDSCAPE
gsec.page_width, gsec.page_height = Cm(29.7), Cm(21.0)
gsec.top_margin, gsec.bottom_margin = Cm(2.0), Cm(2.0)
gsec.left_margin, gsec.right_margin = Cm(1.5), Cm(1.5)
encabezado_pie(gsec)

h1("5. Gráfico del diagrama de Gantt", before=0)

SEMANAS = C.semanas_gantt()
DIAS = [d for _, ds in SEMANAS for d in ds]
NDIAS = len(DIAS)

COLOR_ETAPA = ["BDD7EE", "BDD7EE", "C6E0B4", "C6E0B4",
               "F8CBAD", "F8CBAD", "D9C2E9", "FFE699", "E2E2E2"]

ETAPAS_G = [("%d. %s" % (e.numero, e.nombre), str(e.horas), set(e.dias),
             COLOR_ETAPA[e.indice % len(COLOR_ETAPA)])
            for e in C.ETAPAS_CALC]

HITOS = C.hitos()

W_ETAPA, W_HS = 5.6, 0.9
usable_g = Emu(gsec.page_width - gsec.left_margin - gsec.right_margin)
w_dia = (usable_g.cm - W_ETAPA - W_HS) / NDIAS

gt = doc.add_table(rows=2 + len(ETAPAS_G) + 1, cols=2 + NDIAS)
gt.style = "Table Grid"
gt.autofit = False
gt.alignment = WD_TABLE_ALIGNMENT.CENTER

c = gt.cell(0, 0).merge(gt.cell(1, 0))
cell_text(c, "ETAPA", 8.5, True, RGBColor(0xFF, 0xFF, 0xFF), "c")
shade(c, HDR_FILL)
c = gt.cell(0, 1).merge(gt.cell(1, 1))
cell_text(c, "HS", 8.5, True, RGBColor(0xFF, 0xFF, 0xFF), "c")
shade(c, HDR_FILL)

col = 2
for si, (nombre, ds) in enumerate(SEMANAS):
    ini, fin = col, col + len(ds) - 1
    m = gt.cell(0, ini) if ini == fin else gt.cell(0, ini).merge(gt.cell(0, fin))
    cell_text(m, nombre, 7.5, True, RGBColor(0xFF, 0xFF, 0xFF), "c")
    shade(m, "2E5C8A")
    for k, d in enumerate(ds):
        cd = gt.cell(1, col + k)
        cell_text(cd, str(d.day), 6, True, RGBColor(0xFF, 0xFF, 0xFF), "c")
        shade(cd, HDR_FILL)
    col = fin + 1

for i, (nombre, hs, dias_marcados, color) in enumerate(ETAPAS_G):
    r = 2 + i
    cell_text(gt.cell(r, 0), nombre, 7.5, align=None)
    cell_text(gt.cell(r, 1), hs, 8, True, align="c")
    for j, dk in enumerate(DIAS):
        cd = gt.cell(r, 2 + j)
        cell_text(cd, "", 7, align="c")
        if dk in dias_marcados:
            shade(cd, color)

rh = 2 + len(ETAPAS_G)
cell_text(gt.cell(rh, 0), "Hitos de Scrum y entrega", 8, True, AZUL)
cell_text(gt.cell(rh, 1), "", 8, align="c")
for j, dk in enumerate(DIAS):
    cd = gt.cell(rh, 2 + j)
    if dk in HITOS:
        cell_text(cd, "◆", 9, True, RGBColor(0xB0, 0x3A, 0x2E), "c")
        shade(cd, "F6DDD9")
    else:
        cell_text(cd, "", 7, align="c")

for row in gt.rows:
    row.cells[0].width = Cm(W_ETAPA)
    row.cells[1].width = Cm(W_HS)
    for j in range(NDIAS):
        row.cells[2 + j].width = Cm(w_dia)
_repetir_encabezado(gt)

doc.add_paragraph().paragraph_format.space_after = Pt(2)

h3("Referencias", before=4, after=3)
refs = [("Planificación y análisis", "BDD7EE"), ("Modelado y diseño", "C6E0B4"),
        ("Codificación", "F8CBAD"), ("Integración", "D9C2E9"), ("Pruebas", "FFE699"),
        ("Documentación y bitácora de IA", "E2E2E2")]
ref = doc.add_table(rows=1, cols=len(refs))
ref.style = "Table Grid"
ref.autofit = False
for j, (txt, col_) in enumerate(refs):
    cd = ref.cell(0, j)
    cell_text(cd, txt, 8, True, align="c")
    shade(cd, col_)
    cd.width = Cm(4.3)
doc.add_paragraph().paragraph_format.space_after = Pt(4)

par("Hitos (◆):  " + "  ·  ".join("%s %s" % (f, t) for f, t in C.hitos_descriptos())
    + ".", 9, italic=True, color=GRIS)

# ================================================================= 6. PERT
psec = doc.add_section(WD_SECTION.NEW_PAGE)
psec.orientation = WD_ORIENT.PORTRAIT
psec.page_width, psec.page_height = Cm(21.0), Cm(29.7)
psec.top_margin, psec.bottom_margin = Cm(2.5), Cm(2.0)
psec.left_margin, psec.right_margin = Cm(2.5), Cm(2.0)
encabezado_pie(psec)

h1("6. Diagrama de PERT", before=0)
rico([("La duración esperada de cada actividad se calcula con la fórmula de PERT ", False, False),
      ("te = (to + 4·tm + tp) / 6", True, False),
      (", donde ", False, False), ("to", True, False), (" es la estimación optimista, ", False, False),
      ("tm", True, False), (" la más probable y ", False, False), ("tp", True, False),
      (" la pesimista. La varianza de cada actividad es ", False, False),
      ("σ² = ((tp − to) / 6)²", True, False),
      (". Todas las duraciones están expresadas en horas de equipo.", False, False)])

h2("6.1. Tabla de actividades y cálculo")
filas = [["Act.", "Actividad", "Prec.", "to", "tm", "tp", "te", "σ²",
          "ES", "EF", "LS", "LF", "Holg.", "Crít."]]
for a in C.PERT:
    filas.append([a.codigo, a.nombre, a.precedentes_txt,
                  str(a.to), str(a.tm), str(a.tp), C.horas(a.te), C.horas(a.varianza),
                  C.horas(a.es), C.horas(a.ef), C.horas(a.ls), C.horas(a.lf),
                  C.horas(a.holgura), "Sí" if a.critica else "No"])
tabla(filas, anchos=[1.0, 3.9, 1.0, 0.8, 0.8, 0.8, 1.0, 0.9, 1.1, 1.1, 1.1, 1.1, 1.0, 0.9],
      size=7.6, aligns=["c", None, "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c"])

h2("6.2. Red de actividades")
imagen(os.path.join(DIAG, "pert-movil.png"), 16.0,
       "Figura 2. Red de PERT con la ruta crítica destacada.")

h2("6.3. Ruta crítica y análisis")
rico([("La ruta crítica es ", False, False), (C.RUTA_CRITICA_TXT, True, False),
      (", con una duración esperada de ", False, False),
      ("%s horas" % C.horas(C.DURACION_PERT), True, False),
      (" y un desvío estándar de ", False, False),
      ("%s horas" % C.horas(C.DESVIO_CRITICO), True, False),
      (". Ninguna de esas actividades admite atraso: un día perdido en el modelado se "
       "traslada íntegro a la fecha de entrega.", False, False)])
par("Las dos actividades con holgura son el diseño de la aplicación (%s horas) y la bitácora "
    "de IA (%s horas). La holgura del diseño es real pero corta; la de la bitácora es alta "
    "solo porque no bloquea a ninguna otra actividad, lo que no la vuelve postergable: es "
    "entregable el %s y se completa a medida que se trabaja."
    % (C.horas(C.PERT[3].holgura), C.horas(C.PERT[8].holgura),
       C.largo(C.FECHA_INFORME_IA)), align="j")
par("La diferencia entre las %s horas de la ruta crítica y las %d horas planificadas "
    "corresponde a las actividades que corren en paralelo. El margen es acotado, y por eso "
    "el plan concentra el trabajo de análisis y modelado antes de la entrega de la Parte 2: "
    "cuando empieza la codificación, la incertidumbre ya tiene que estar resuelta."
    % (C.horas(C.DURACION_PERT), C.TOTAL_HORAS), align="j")

# ================================================================= 7. BACKLOG
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
h1("7. Backlog de la Parte 3", before=0)
par("Seis Historias de Usuario, tres por integrante, ordenadas por dependencia. La velocidad "
    "medida en el Sprint 1 de la Parte 2 fue de 13 puntos en dos semanas, de modo que la "
    "capacidad realista de cada sprint móvil —de una semana— es de 6 a 8 puntos.", align="j")

HU = [
    ("HU-M6", "Autenticarse en la aplicación móvil", "Padre", "REQ-23",
     "L. Fernández", "Alta", 3, 1,
     ["Iniciar sesión con el mismo usuario y contraseña de la web.",
      "Cerrar sesión desde la aplicación.",
      "Ver únicamente las funciones que su rol habilita."],
     ["Credenciales válidas → ingresa y ve a sus hijos asociados.",
      "Credenciales inválidas → mensaje claro, sin detalles técnicos.",
      "Un usuario sin hijos asociados no accede a datos de otros alumnos."]),
    ("HU-M1", "Consultar las cuotas de mis hijos", "Padre", "REQ-24",
     "G. Cerqueiro", "Alta", 5, 1,
     ["Listar las cuotas del alumno con vencimiento, importe y estado.",
      "Separar pendientes de pagadas.",
      "Mostrar el detalle de la factura por concepto."],
     ["Un padre ve solo las cuotas de sus hijos.",
      "Cada cuota muestra vencimiento, importe, estado y detalle por ítem.",
      "Sin cuotas emitidas, la pantalla lo explica en lugar de quedar vacía."]),
    ("HU-M2", "Seleccionar los ítems a pagar y obtener el comprobante", "Padre", "REQ-25",
     "G. Cerqueiro", "Alta", 5, 2,
     ["Elegir qué ítems de la factura se abonan.",
      "Calcular el total de lo seleccionado.",
      "Emitir el comprobante de pago."],
     ["El total se corresponde con los ítems marcados.",
      "Emitido el comprobante, la factura cambia de estado.",
      "Una factura pagada no puede volver a cobrarse."]),
    ("HU-M4", "Cargar el comprobante de la transferencia", "Padre", "REQ-26",
     "L. Fernández", "Alta", 3, 2,
     ["Adjuntar el archivo del comprobante a una factura.",
      "Admitir más de un comprobante por factura.",
      "Registrar fecha e importe informado."],
     ["El comprobante queda asociado a la factura correcta.",
      "Una factura admite varios comprobantes sin sobrescribir el anterior.",
      "Solo el tutor del alumno y la administración acceden al archivo."]),
    ("HU-M3", "Consultar el historial de facturas y deuda", "Padre", "REQ-27 · REQ-28",
     "G. Cerqueiro", "Media", 3, 2,
     ["Filtrar facturas y comprobantes por período de fechas.",
      "Mostrar la deuda discriminada por ítem."],
     ["El listado respeta el período elegido.",
      "La deuda se muestra por concepto y no solo como total."]),
    ("HU-M5", "Inscribir a mi hijo a deportes, transporte y comedor", "Padre", "REQ-29",
     "L. Fernández", "Media", 5, 2,
     ["Listar los servicios disponibles con su importe.",
      "Inscribir y dar de baja por período.",
      "Controlar el máximo de dos deportes y los conflictos de horario."],
     ["No permite un tercer deporte simultáneo.",
      "No permite dos actividades que se superpongan en horario.",
      "La inscripción se refleja en la factura del mes siguiente."]),
]

filas = [["ID", "Historia de Usuario", "Rol", "Req.", "Responsable", "Prior.", "Pts", "Sprint"]]
for hid, titulo, rol, req, resp, prio, pts, spr, _, _ in HU:
    filas.append([hid, titulo, rol, req, resp, prio, str(pts), "Sprint móvil %d" % spr])
tabla(filas, anchos=[1.6, 5.3, 1.3, 2.2, 2.3, 1.3, 0.8, 2.3], size=9,
      aligns=["c", None, "c", "c", "c", "c", "c", "c"])

h2("7.1. Detalle de las Historias de Usuario")
for hid, titulo, rol, req, resp, prio, pts, spr, tareas, criterios in HU:
    h3("%s — %s (%s)" % (hid, titulo, req))
    par("Como %s, necesito %s." % (rol.lower(), titulo[0].lower() + titulo[1:]),
        10, italic=True, after=4)
    par("Tareas técnicas", 10, bold=True, after=2)
    for t in tareas:
        vin(t, size=9.5, after=2)
    par("Criterios de aceptación", 10, bold=True, after=2, before=4)
    for t in criterios:
        vin(t, size=9.5, after=2)

h2("7.2. Requerimientos extra comprometidos")
par("Como en las partes anteriores, además de las Historias de Usuario el equipo se "
    "compromete con requerimientos que consumen capacidad del sprint y que responden al "
    "desafío del enunciado.", align="j")
tabla([
    ["Req.", "Descripción", "Sprint", "Responsable"],
    ["REQ-30 · REQ-31", "Envíos automáticos por correo: detalle a abonar el último día hábil "
                        "del mes y saldo pendiente el día 20.", "Sprint móvil 2", "Compartido"],
    ["REQ-32", "Reportes de cobranza en la aplicación web: ingresos por período, pagos "
               "completos e incompletos, por deporte y por recorrido.", "Sprint móvil 2",
     "Gonzalo"],
], anchos=[2.8, 9.0, 2.6, 2.1], size=9, aligns=["c", None, "c", "c"])

# ================================================================= 8. PLAN DE SPRINT
h1("8. Plan de sprints")
par("Dos sprints de una semana, de miércoles a martes, para que la Sprint Review coincida "
    "con la clase siguiente. El primero cierra el %s, día de la tercera tutoría con la "
    "cátedra." % C.dma(C.FECHA_TUTORIA_3), align="j")

DETALLE = {
    1: ("Autenticación y consulta de cuotas",
        "Dejar a un padre viendo en su teléfono lo que debe, con la sesión de siempre. "
        "Sin esto no hay nada que pagar ni que mostrar.",
        ["HU-M6", "HU-M1"],
        "Sprint Planning. Ejecución del script del modelo económico en Supabase y carga de "
        "conceptos e importes. Proyecto móvil creado con Expo y conectado a Supabase. "
        "HU-M6: inicio y cierre de sesión con acceso por rol. HU-M1: listado de cuotas del "
        "alumno con su detalle. Sprint Review y Retrospectiva."),
    2: ("Pagos, comprobantes y avisos",
        "Cerrar el circuito de cobranza: pagar, respaldar el pago y avisar automáticamente.",
        ["HU-M2", "HU-M4", "HU-M3", "HU-M5"],
        "Sprint Planning. HU-M2: selección de ítems y emisión del comprobante con la máquina "
        "de estados de la factura. HU-M4: carga del comprobante de transferencia en Storage. "
        "REQ-30 y REQ-31: envíos automáticos por correo. REQ-32: reportes de cobranza en la "
        "web. HU-M3 y HU-M5 si la capacidad lo permite. Pruebas de integración, Sprint Review "
        "y Retrospectiva."),
}

for s in C.SPRINTS:
    n = s.numero_sprint
    titulo, objetivo, hus, actividades = DETALLE[n]
    h2("8.%d. Sprint móvil %d — %s (%s al %s)"
       % (n, n, titulo, C.dma(s.inicio), C.dma(s.fin)))
    rico([("Objetivo del sprint: ", True, False), (objetivo, False, False)], after=4)
    filas = [["ID", "Historia de Usuario", "Puntos", "Responsable"]]
    total = 0
    for hid in hus:
        item = next(h for h in HU if h[0] == hid)
        comprometida = item[7] == n
        filas.append([hid, item[1] + ("" if comprometida else "  (si la capacidad lo permite)"),
                      str(item[6]), item[4]])
        if comprometida and item[7] == n:
            total += item[6]
    filas.append(["", "Puntos comprometidos", str(total), ""])
    tabla(filas, anchos=[1.6, 9.0, 1.8, 3.0], size=9,
          aligns=["c", None, "c", "c"], total_row=True)
    par("Actividades: " + actividades, 10, align="j")
    par("Capacidad: %d horas de equipo en %d días hábiles."
        % (s.horas, s.duracion), 10, italic=True, color=GRIS)

h2("8.3. Eventos de Scrum")
tabla([
    ["Evento", "Duración", "Cuándo", "Propósito"],
    ["Sprint Planning", "1 hora", "Primer día del sprint (miércoles)",
     "Seleccionar las Historias de Usuario y desglosarlas en tareas."],
    ["Daily Scrum", "10 minutos", "Diaria, por mensajería",
     "Qué hice, qué voy a hacer y qué me está bloqueando."],
    ["Sprint Review", "1 hora", "Último día del sprint (martes)",
     "Mostrar el incremento funcionando en un teléfono real y ajustar el backlog."],
    ["Sprint Retrospective", "1 hora", "Último día del sprint",
     "Revisar el proceso, incluido el uso de IA, y acordar mejoras."],
], anchos=[3.3, 2.6, 4.6, 6.0], size=9, aligns=[None, "c", None, None])

h2("8.4. Definition of Done")
par("Una Historia de Usuario de la Parte 3 está terminada cuando cumple los siete puntos:",
    align="j")
for txt in [
    "Todos los criterios de aceptación se cumplen.",
    "Las pruebas funcionales y de integración fueron superadas.",
    "Los permisos por rol están verificados con políticas Row Level Security, probados "
    "también contra la API y no solo en pantalla.",
    "El código está subido al repositorio y fue revisado por el otro integrante mediante "
    "Pull Request.",
    "La funcionalidad corre en un dispositivo real, no solo en el emulador.",
    "La documentación de la Historia de Usuario está actualizada en el portafolio digital.",
    "Las intervenciones de IA que participaron del desarrollo están registradas en la bitácora.",
]:
    vin(txt, size=10, after=3)

# ================================================================= 9. RIESGOS
h1("9. Riesgos del proyecto")
par("El plazo es corto y el trabajo se superpone con el cierre de la Parte 2. Los riesgos se "
    "declaran desde el plan, con su mitigación.", align="j")
tabla([
    ["Riesgo", "Impacto", "Mitigación"],
    ["La entrega de la Parte 2 se atrasa y come los días del desarrollo móvil.", "Alto",
     "El análisis, el modelado y el diseño se hacen antes del 27/10, de modo que la "
     "codificación arranque sin trabajo previo pendiente."],
    ["El equipo no conoce React Native y la curva de aprendizaje retrasa el primer sprint.",
     "Alto",
     "Se eligió Expo con el mismo lenguaje y la misma librería de datos que la web, y el "
     "Sprint 1 arranca por la funcionalidad más simple: iniciar sesión."],
    ["La IA propone soluciones correctas en general pero incompatibles con el modelo y los "
     "permisos del proyecto.", "Medio",
     "Toda propuesta se revisa contra las reglas del enunciado y las políticas RLS antes de "
     "integrarse, y queda registrada en la bitácora."],
    ["El alcance del enunciado excede la capacidad de dos sprints de una semana.", "Alto",
     "Se priorizan los módulos 1 y 2, que son el núcleo. HU-M3 y HU-M5 están declaradas como "
     "alcance condicionado y se resignan primero si hace falta."],
    ["Los envíos automáticos de correo dependen de un servicio externo.", "Bajo",
     "Se implementan con funciones programadas del backend actual y se prueban con datos de "
     "prueba antes de la fecha de entrega."],
], anchos=[6.0, 1.8, 8.7], size=9, aligns=[None, "c", None])

# ================================================================= 10. ENTREGABLES
h1("10. Entregables y fechas")
tabla([
    ["Entregable", "Fecha", "Contenido"],
    ["Plan de trabajo", C.dma(C.FECHA_INICIO),
     "Este documento: alcance, objetivos, cronograma, Gantt, PERT, backlog y plan de sprints."],
    ["Tercera tutoría", C.dma(C.FECHA_TUTORIA_3),
     "Avance del Sprint móvil 1: autenticación y consulta de cuotas."],
    ["Aplicación móvil", C.dma(C.FECHA_FIN),
     "Aplicación funcionando e integrada con la web y la base existentes. Actividad de testing."],
    ["Informe de uso de IA", C.dma(C.FECHA_INFORME_IA),
     "Bitácora de IA, relación entre web y app, comparación de desarrollo tradicional y "
     "asistido, y reflexión crítica."],
], anchos=[4.0, 2.6, 9.9], size=9, aligns=[None, "c", None])

par("La fecha de la actividad de testing se toma del enunciado del trabajo práctico "
    "(11 de noviembre). Si la cátedra confirma el 10 de noviembre, el cronograma se corrige "
    "moviendo un único parámetro: todas las etapas, el Gantt y el PERT se recalculan solos.",
    9.5, italic=True, color=GRIS, align="j")

doc.save(DEST)
print("OK - documento generado:", DEST)
