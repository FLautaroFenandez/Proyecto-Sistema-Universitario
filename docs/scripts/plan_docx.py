# -*- coding: utf-8 -*-
"""
Genera el Plan de Trabajo del Proyecto - Metodologia de Sistemas II (UTN FRRe, TUP 2026)
Formato exigido por la catedra: A4, margenes 2,5 sup / 2 inf / 2,5 izq / 2 der,
Calibri 11, interlineado simple.
"""
import sys, os
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION, WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

import cronograma as C

DIAG = sys.argv[1]   # carpeta de diagramas
DEST = sys.argv[2]   # ruta del .docx de salida

AZUL = RGBColor(0x1F, 0x4E, 0x79)
NEGRO = RGBColor(0x1A, 0x1A, 0x1A)
GRIS = RGBColor(0x59, 0x59, 0x59)

HDR_FILL = "1F4E79"      # encabezado de tabla
SUB_FILL = "DCE7F2"      # subtotal / destaque
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
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)   # A4 vertical
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
    """partes: lista de (texto, bold, italic)."""
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


def tabla(filas, anchos=None, size=9.5, header=True, aligns=None,
          total_row=False, after=8):
    """filas: lista de listas. anchos en cm."""
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


def mantener_junto(t, incluir_ultima=True):
    """Evita que Word parta la tabla entre paginas."""
    filas = t.rows if incluir_ultima else t.rows[:-1]
    for row in filas:
        trPr = row._tr.get_or_add_trPr()
        el = OxmlElement("w:cantSplit")
        trPr.append(el)
        for cell in row.cells:
            for pp in cell.paragraphs:
                pp.paragraph_format.keep_with_next = True


def _repetir_encabezado(t):
    tr = t.rows[0]._tr
    trPr = tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    trPr.append(el)


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
    _runfont(fp.add_run("Plan de Trabajo — Sistema de Gestión   |   Grupo 4   |   "),
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

# ================================================================= PORTADA / TITULO
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
_runfont(tp.add_run("Parte 2 — Sistema de Gestión"), 12, False, True, GRIS)

h1("Nombre del equipo de trabajo", before=6)
par("Grupo 4", 12, bold=True)

h1("Apellido y nombre del equipo de trabajo")
tabla([
    ["Apellido y nombre", "Correo institucional", "Rol en Scrum", "Historias de Usuario"],
    ["Cerqueiro, Gonzalo", "gonzalo.cerqueiro@frre.utn.edu.ar", "Development Team",
     "HU1 · HU2 · HU3\n(+ REQ-17)"],
    ["Fernández, Lautaro", "lautaro.fernandez@frre.utn.edu.ar", "Development Team",
     "HU4 · HU5 · HU6\n(+ REQ-20)"],
], anchos=[4.2, 6.0, 3.0, 3.3], aligns=[None, None, "c", "c"])

rico([("Equipo de dos integrantes. ", False, False),
      ("En Metodología de Sistemas I el equipo era de tres personas; en esta segunda etapa "
       "continúa con dos, por lo que el trabajo se reparte ", False, False),
      ("por Historia de Usuario", True, False),
      (" y no por archivo o capa técnica: cada integrante es responsable de sus HU de punta a "
       "punta —modelo de datos, políticas de seguridad, lógica, interfaz y pruebas—. "
       "El equipo no cuenta con Scrum Master ni Product Owner externos: ambas "
       "responsabilidades se asumen de forma compartida.", False, False)])

# ================================================================= 1. DESCRIPCION
h1("1. Descripción del proyecto")

h2("1.1. Enunciado del problema")
par("El Centro Educativo “Educar para Transformar” es una institución de gestión privada "
    "ubicada en las afueras de la ciudad de Resistencia, con inicio de actividades previsto "
    "para marzo de 2027. Ofrece jornada extendida en los niveles inicial, primario y "
    "secundario, apoyo estudiantil, idiomas, ocho disciplinas deportivas, comedor, enfermería, "
    "laboratorios y servicio de transporte con cuatro recorridos.", align="j")
rico([("La ", False, False), ("Parte 1 (página web institucional)", True, False),
      (" se desarrolló y entregó en Metodología de Sistemas I: resolvió el canal de "
       "comunicación externo —información corporativa, contacto, opiniones, solicitudes de "
       "inscripción y búsquedas laborales—. Resuelto ese canal, ", False, False),
      ("persiste el problema interno: la información académica, deportiva y de servicios no "
       "está centralizada.", True, False)])
par("Sin un sistema de gestión, la matrícula, las calificaciones, la asistencia, los legajos "
    "del personal y las inscripciones a deportes, transporte y comedor se administran de forma "
    "dispersa, en planillas y registros independientes. Esto provoca cuatro consecuencias "
    "concretas:", align="j")
vin("Datos duplicados e inconsistentes entre áreas, porque el mismo dato se carga más de una vez.")
vin("Imposibilidad de dar seguimiento académico oportuno: las inasistencias reiteradas y el "
    "bajo rendimiento se detectan tarde.")
vin("Comunicación con las familias sin trazabilidad: no queda registro de qué se informó, "
    "cuándo ni a quién.")
vin("Ausencia de información consolidada para la Dirección, que necesita indicadores de "
    "matrícula, asistencia y rendimiento para decidir.", after=8)
rico([("Objetivo general. ", True, False),
      ("Desarrollar un sistema que permita gestionar de manera integrada la información "
       "académica, deportiva y de servicios de los alumnos, facilitando el trabajo de docentes, "
       "padres y personal administrativo, garantizando que la información esté actualizada, sea "
       "consistente y pueda consultarse de acuerdo con los permisos correspondientes a cada rol.",
       False, False)])

h2("1.2. Requerimientos y su clasificación")
par("Los requerimientos se redactaron aplicando las siete propiedades de la teoría de "
    "requerimientos —necesario, verificable, consistente, trazable, no ambiguo, conciso y "
    "completo—. La numeración continúa la de la Parte 1 (REQ-01 a REQ-12, página web).",
    align="j")

h3("a) Requerimientos funcionales")
tabla([
    ["ID", "Requerimiento funcional", "Módulo / Funcionalidad", "Objetivo institucional que apoya"],
    ["REQ-13", "Gestión de matrícula y legajo del estudiante: convertir una solicitud de "
     "inscripción aprobada en matrícula oficial, generando el legajo digital.",
     "Gestión de matrículas\nMódulo Administrador",
     "Agilizar el trámite de inscripción y mantener actualizada la trayectoria escolar."],
    ["REQ-14", "Gestión de cursos, materias y asignación docente por nivel educativo.",
     "Gestión de cursos\nMódulo Administrador",
     "Organizar la oferta académica y la asignación de responsabilidades docentes."],
    ["REQ-15", "Carga de calificaciones por materia y período, con cálculo automático del promedio.",
     "Calificaciones\nMódulo Docente",
     "Garantizar el seguimiento académico y la comunicación del rendimiento."],
    ["REQ-16", "Registro de asistencia diaria, visible para Padre y Estudiante.",
     "Asistencia\nMódulo Docente",
     "Detectar tempranamente situaciones de riesgo escolar por inasistencias."],
    ["REQ-17", "Generación de boletines de calificaciones y constancias de alumno regular en PDF.",
     "Trámites\nMódulo Alumno",
     "Reducir los tiempos administrativos en la emisión de documentación oficial."],
    ["REQ-18", "Comunicaciones internas entre roles, registradas con fecha y remitente.",
     "Foro\nTodos los módulos",
     "Fortalecer el vínculo institución-familia con comunicación directa y trazable."],
    ["REQ-19", "Gestión de legajos del personal docente y no docente, con estado activo/inactivo.",
     "Gestión de personal\nMódulo Administrador",
     "Profesionalizar la gestión del personal docente y no docente."],
    ["REQ-20", "Gestión de postulaciones laborales recibidas desde la web y su cambio de estado.",
     "Postulaciones laborales\nMódulo Administrador",
     "Optimizar el proceso de selección de personal."],
    ["REQ-21", "Reportes de matrícula, asistencia y rendimiento académico filtrables por período.",
     "Reportes gerenciales\nMódulo Autoridad",
     "Brindar información oportuna para la toma de decisiones estratégicas."],
    ["REQ-22", "Auditoría y trazabilidad de las acciones críticas de Administrador y Autoridad.",
     "Auditoría\nTransversal",
     "Garantizar la seguridad, la trazabilidad y la transparencia administrativa."],
], anchos=[1.5, 5.6, 3.4, 6.0], size=8.5, aligns=["c", None, None, None])

h3("b) Requerimientos no funcionales")
tabla([
    ["ID", "Tipo", "Requerimiento no funcional"],
    ["RNF-01", "Rendimiento", "Toda pantalla del sistema de gestión debe responder en menos de "
     "3 segundos con conexión de 10 Mbps. Los listados extensos (alumnos, personal) se "
     "paginan del lado del servidor."],
    ["RNF-02", "Disponibilidad", "El sistema debe estar disponible 24/7, sostenido por los "
     "servicios de Netlify (frontend) y Supabase (backend y base de datos)."],
    ["RNF-03", "Seguridad", "Comunicaciones sobre HTTPS; contraseñas almacenadas con hash; "
     "control de acceso por rol implementado en dos capas —políticas Row Level Security en la "
     "base de datos y verificación en la interfaz—; claves de servicio fuera del repositorio."],
    ["RNF-04", "Integridad de datos", "La base de datos debe garantizar por diseño las "
     "restricciones del enunciado: un alumno pertenece a un único curso; un curso a un único "
     "nivel; máximo dos deportes simultáneos por alumno; sin inscripciones duplicadas; sin "
     "conflictos de horario entre actividades deportivas."],
    ["RNF-05", "Mantenibilidad", "Componentes reutilizables con responsabilidad única; rutas y "
     "roles declarados por constante y no por cadena literal; todo cambio de esquema en un "
     "archivo SQL versionado e idempotente, con sus políticas de seguridad incluidas."],
    ["RNF-06", "Usabilidad", "Interfaz intuitiva para usuarios con conocimiento básico de "
     "navegación web; mensajes de error descriptivos y en español; identidad visual heredada "
     "de la Parte 1."],
    ["RNF-07", "Compatibilidad", "Compatible con las versiones de los últimos dos años de "
     "Chrome, Firefox, Edge y Safari, y con Android 10+ e iOS 14+. Diseño responsive."],
    ["RNF-08", "Trazabilidad", "Toda acción crítica debe quedar registrada con usuario, fecha "
     "y acción, de modo que sea posible reconstruir quién hizo qué y cuándo."],
], anchos=[1.6, 2.7, 12.2], size=8.5, aligns=["c", None, None])

h2("1.3. Clasificación del tipo de Sistema de Información")
par("Aplicando la clasificación de Sistemas de Información —SI de Apoyo a las Operaciones y "
    "SI de Apoyo Gerencial— a cada requerimiento:", align="j")
tabla([
    ["Requerimiento", "Grupo", "Tipo específico"],
    ["REQ-13 — Matrícula", "SI de Apoyo a las Operaciones", "Procesamiento de transacciones (TPS)"],
    ["REQ-14 — Cursos y docentes", "SI de Apoyo a las Operaciones", "Control de procesos"],
    ["REQ-15 — Calificaciones", "SI de Apoyo a las Operaciones", "Procesamiento de transacciones (TPS)"],
    ["REQ-16 — Asistencia", "SI de Apoyo a las Operaciones", "Procesamiento de transacciones (TPS)"],
    ["REQ-17 — Boletines y constancias", "SI de Apoyo a las Operaciones", "Colaboración empresarial (KWS/OAS)"],
    ["REQ-18 — Comunicaciones", "SI de Apoyo a las Operaciones", "Colaboración empresarial (OAS)"],
    ["REQ-19 — Personal (RRHH)", "SI de Apoyo a las Operaciones", "Procesamiento de transacciones (TPS)"],
    ["REQ-20 — Postulaciones", "SI de Apoyo a las Operaciones", "Procesamiento de transacciones (TPS)"],
    ["REQ-21 — Reportes para la Autoridad", "SI de Apoyo Gerencial", "SI gerencial / apoyo a las decisiones (MIS/DSS)"],
    ["REQ-22 — Auditoría", "SI de Apoyo a las Operaciones", "Control de procesos (seguridad transversal)"],
], anchos=[5.2, 5.4, 5.9], size=9, aligns=[None, None, None])

rico([("Clasificación general. ", True, False),
      ("El Sistema de Gestión es, en su mayor parte, un ", False, False),
      ("SI de Apoyo a las Operaciones", True, False),
      (": nueve de los diez requerimientos son transacciones cotidianas de nivel operativo "
       "(TPS) o sistemas de colaboración y oficina (KWS/OAS). A la vez incorpora un componente "
       "de ", False, False),
      ("SI de Apoyo Gerencial", True, False),
      (" a través de REQ-21, que consolida los datos operativos en información de nivel de "
       "gestión y estratégico (MIS/DSS) para la toma de decisiones de la Dirección.",
       False, False)])

h2("1.4. Arquitectura de la Información")
par("La arquitectura de la información organiza las funcionalidades según el nivel de la "
    "organización al que sirven, siguiendo la pirámide de sistemas. La información se genera "
    "una sola vez en el nivel operativo y se reutiliza —filtrada, condensada y analizada— en "
    "los niveles superiores, evitando la doble carga de datos.", align="j")
imagen(os.path.join(DIAG, "arq-informacion.png"), 15.0,
       "Figura 1. Arquitectura de la información del Sistema de Gestión.")

h2("1.5. Arquitectura de la aplicación de software")

h3("a) Principios aplicados")
tabla([
    ["Principio", "Cómo se aplica en el proyecto"],
    ["Separación de responsabilidades",
     "Cada capa resuelve una única preocupación: la presentación no consulta la base de datos "
     "directamente ni la base de datos genera interfaz."],
    ["Seguridad en profundidad",
     "El control de acceso por rol no se delega a una sola capa: se verifica en la interfaz y "
     "se impone en la base de datos con políticas Row Level Security. Si la interfaz falla, la "
     "base de datos igualmente rechaza la consulta."],
    ["Reutilización antes que duplicación",
     "Los componentes de interfaz, el sistema de autenticación y el enumerado de roles "
     "construidos en la Parte 1 se extienden; no se reescriben."],
    ["Única fuente de verdad",
     "Rutas y roles se declaran por constante en un único archivo; el dato operativo se carga "
     "una sola vez y los reportes lo agregan, sin recargarlo."],
    ["Bajo acoplamiento",
     "La comunicación entre capas ocurre por interfaces estables (HTTP/JSON y SQL), de modo "
     "que la Parte 3 (app móvil) podrá consumir la misma API sin modificar el backend."],
], anchos=[4.4, 12.1], size=9)

h3("b) Componentes funcionales")
tabla([
    ["Capa", "Componentes funcionales"],
    ["Presentación", "Portales diferenciados por rol (Administrador, Autoridad, Docente, "
     "Personal, Padre, Estudiante); formularios de carga con validación; paneles de listado y "
     "búsqueda; visor de reportes."],
    ["Aplicación / lógica de negocio", "Autenticación y gestión de sesión; autorización por "
     "rol; reglas de negocio (validación de rango de notas, unicidad de asistencia por fecha, "
     "límite de dos deportes por alumno, control de conflictos de horario); API REST; storage "
     "de archivos; registro de auditoría."],
    ["Datos", "Matrícula y legajos; cursos y materias; calificaciones; asistencia; personal y "
     "postulaciones; deportes, transporte y comedor; auditoría."],
], anchos=[4.4, 12.1], size=9)

h3("c) Restricciones")
tabla([
    ["Restricción", "Detalle"],
    ["Tecnológica", "El stack de la Parte 1 no se cambia: React 18 + Vite en el frontend y "
     "Supabase (PostgreSQL) en el backend. El sistema de gestión se construye encima sin "
     "romper la web pública ya desplegada."],
    ["De seguridad", "Ningún rol accede a datos que no le corresponden. Un padre consulta y "
     "gestiona únicamente lo de sus hijos; un docente, solo los cursos que tiene asignados."],
    ["De negocio (del enunciado)", "Un alumno pertenece a un único curso y un curso a un único "
     "nivel; máximo dos deportes simultáneos por alumno; cada deporte tiene un profesor "
     "responsable; cuatro recorridos de transporte; sin inscripciones duplicadas ni conflictos "
     "de horario."],
    ["De presupuesto", "Se utilizan exclusivamente los planes gratuitos de Netlify y Supabase, "
     "lo que limita el almacenamiento y el número de conexiones concurrentes."],
    ["De equipo y tiempo", f"Dos integrantes con {C.HORAS_SEMANA_POR_INTEGRANTE} horas semanales "
     f"cada uno; {C.en_palabras(C.CANT_SPRINTS)} sprints de dos semanas. La capacidad total es "
     f"de {C.TOTAL_HORAS} horas "
     f"de equipo."],
], anchos=[4.4, 12.1], size=9)

h3("d) Conectores")
tabla([
    ["Conector", "Entre qué capas", "Protocolo / mecanismo"],
    ["HTTPS + JSON", "Presentación ↔ Aplicación",
     "Llamadas a la API REST generada por Supabase, cifradas en tránsito."],
    ["JWT (JSON Web Token)", "Presentación ↔ Aplicación",
     "El token de sesión transporta la identidad y el rol del usuario en cada petición."],
    ["SQL + Row Level Security", "Aplicación ↔ Datos",
     "Cada consulta se evalúa contra las políticas de seguridad de la fila antes de devolver "
     "resultados."],
    ["Supabase Storage", "Aplicación ↔ Datos",
     "Carga y descarga de documentación adjunta del legajo, con permisos por bucket."],
], anchos=[3.6, 4.2, 8.7], size=9)

h3("e) Tipo de arquitectura de software")
rico([("Se adopta una arquitectura ", False, False),
      ("cliente-servidor en capas (three-tier)", True, False),
      (", con una capa adicional de infraestructura. Se eligió por tres motivos: (1) es "
       "coherente con el requerimiento de seguridad por roles, que necesita un punto único "
       "donde imponer los permisos; (2) permite que la Parte 3 —la aplicación móvil— consuma "
       "la misma capa de aplicación sin duplicar lógica de negocio; y (3) es la que ya está en "
       "producción desde la Parte 1, por lo que no exige migrar lo entregado.", False, False)])

h2("1.6. Patrones de diseño aplicados")
par("Se seleccionó un patrón de diseño de cada tipo —creacional, estructural y de "
    "comportamiento—. El criterio no fue elegir los más conocidos, sino aquellos que resuelven "
    "un problema concreto y verificable del proyecto: dos de ellos ya están en uso desde la "
    "Parte 1 y el tercero corrige una debilidad detectada al revisar el código existente.",
    align="j")

tabla([
    ["Tipo", "Patrón", "Dónde se aplica", "Estado"],
    ["Creacional", "Singleton", "Cliente de acceso a la base de datos y a la autenticación",
     "En uso desde\nla Parte 1"],
    ["Estructural", "Facade", "Capa de servicios por módulo del Sistema de Gestión",
     "Parcial: se completa\nen el Sprint 1"],
    ["Comportamiento", "State", "Ciclo de vida de la matrícula y de las postulaciones laborales",
     "A implementar\nen el Sprint 2"],
], anchos=[3.0, 2.6, 7.6, 3.3], size=9, aligns=[None, None, None, "c"])

h3("a) Creacional — Singleton")
rico([("Intención. ", True, False),
      ("Garantizar que una clase tenga una única instancia y proveer un punto de acceso global "
       "a ella.", False, False)])
rico([("Problema que resuelve en el proyecto. ", True, False),
      ("El acceso a la base de datos, a la autenticación y al almacenamiento de archivos se "
       "hace a través de un único cliente. Si cada módulo creara el suyo, cada instancia "
       "mantendría su propia sesión y su propio token: el usuario aparecería autenticado en una "
       "parte de la aplicación y anónimo en otra, y las políticas de seguridad a nivel de fila "
       "se evaluarían contra identidades distintas. Además, cada instancia abriría su propia "
       "conexión, desperdiciando el cupo del plan gratuito.", False, False)])
rico([("Implementación. ", True, False),
      ("El cliente se crea una sola vez en el módulo ", False, False),
      ("src/lib/supabase.js", False, True),
      (" y se exporta esa instancia; todo el sistema la importa. En JavaScript los módulos se "
       "evalúan una única vez, por lo que el propio sistema de módulos garantiza la instancia "
       "única sin necesidad de un constructor privado ni de un método de acceso. Es la forma "
       "idiomática del patrón en este lenguaje.", False, False)])
rico([("Aplicación en esta etapa. ", True, False),
      ("Se mantiene sin cambios. Todas las Historias de Usuario del Sistema de Gestión acceden "
       "a los datos a través de esa única instancia.", False, False)])

h3("b) Estructural — Facade")
rico([("Intención. ", True, False),
      ("Proveer una interfaz unificada y simple a un conjunto de interfaces de un subsistema, "
       "reduciendo el acoplamiento entre el cliente y sus componentes internos.", False, False)])
rico([("Problema que resuelve en el proyecto. ", True, False),
      ("Al revisar el código de la Parte 1 se detectó que, si bien existen hooks que encapsulan "
       "el acceso a los datos, ", False, False),
      ("catorce archivos de páginas y componentes importan el cliente de base de datos "
       "directamente", True, False),
      (" y arman sus propias consultas. La consecuencia es que la lógica de acceso a datos y "
       "las reglas de negocio quedan repartidas por la capa de presentación: una misma regla "
       "puede estar escrita de forma distinta en dos pantallas, y cambiar una consulta obliga a "
       "buscarla en varios archivos.", False, False)])
rico([("Por qué se agrava en esta etapa. ", True, False),
      ("El Sistema de Gestión incorpora reglas de negocio reales que no existían en la web "
       "institucional: validar el rango de una calificación, impedir que se cargue dos veces la "
       "asistencia de la misma fecha, limitar a dos los deportes simultáneos por alumno y "
       "controlar los conflictos de horario. Ninguna de esas reglas puede vivir en un "
       "componente de interfaz.", False, False)])
rico([("Implementación. ", True, False),
      ("Se construye una capa de servicios con una fachada por módulo —matrícula, "
       "calificaciones, asistencia, personal, comunicados y reportes—. Cada fachada expone "
       "operaciones del dominio y esconde las consultas, el manejo de errores y las reglas de "
       "negocio. La regla que se impone es que ", False, False),
      ("ningún componente de la capa de presentación vuelve a importar el cliente de base de "
       "datos", True, False),
      (": habla siempre con la fachada de su módulo.", False, False)])
rico([("Beneficio adicional. ", True, False),
      ("La Parte 3 (aplicación móvil) podrá consumir las mismas fachadas sin duplicar la lógica "
       "de negocio.", False, False)])

h3("c) Comportamiento — State")
rico([("Intención. ", True, False),
      ("Permitir que un objeto modifique su comportamiento cuando cambia su estado interno, "
       "de modo que las transiciones válidas queden definidas en un solo lugar.", False, False)])
rico([("Problema que resuelve en el proyecto. ", True, False),
      ("Las solicitudes de inscripción tienen un ciclo de vida —pendiente, en revisión, "
       "aceptada, rechazada— y las postulaciones laborales otro —recibida, en revisión, "
       "entrevista, contratada, descartada—. Al revisar el panel de inscripciones se comprobó "
       "que el cambio de estado ", False, False),
      ("se guarda sin validar la transición", True, False),
      (": una solicitud rechazada puede volver a pendiente, y una pendiente puede pasar "
       "directamente a aceptada sin haber sido revisada. La base de datos solo verifica que el "
       "valor pertenezca al conjunto permitido, no que la transición tenga sentido.",
       False, False)])
rico([("Por qué es necesario en esta etapa. ", True, False),
      ("El requerimiento REQ-13 exige que una solicitud aprobada se convierta en matrícula y "
       "que ese cambio no pueda repetirse; el criterio de aceptación de HU1 dice explícitamente "
       "que la solicitud queda en estado “matriculado” y no puede volver a matricularse. Sin "
       "control de transiciones ese criterio no se puede cumplir. REQ-20 plantea el mismo "
       "problema para las postulaciones.", False, False)])
rico([("Implementación. ", True, False),
      ("Cada estado se modela como un objeto que declara a qué estados puede pasar y qué "
       "acciones habilita para cada rol. El cambio de estado deja de ser una escritura directa "
       "y pasa por la máquina de estados, que rechaza las transiciones no contempladas. La "
       "misma definición alimenta la interfaz: el desplegable de cambio de estado solo ofrece "
       "las transiciones válidas desde el estado actual, en lugar de listarlas todas.",
       False, False)])

rico([("Los tres patrones se refuerzan entre sí: ", True, False),
      ("el ", False, False), ("Singleton", True, False),
      (" garantiza un único punto de acceso a los datos, la ", False, False),
      ("Facade", True, False),
      (" concentra en un solo lugar las operaciones de cada módulo, y ", False, False),
      ("State", True, False),
      (" define dentro de esas fachadas las transiciones que el negocio admite. La verificación "
       "de que se aplicaron correctamente forma parte de la Definition of Done.", False, False)])

h2("1.7. Tecnologías")
tabla([
    ["Categoría", "Herramienta", "Justificación"],
    ["Gestión del proyecto", "GitHub Projects (tablero Kanban) + Issues",
     "Vive en el mismo repositorio que el código y el portafolio: una Historia de Usuario es un "
     "issue. Permite registrar la bitácora del equipo y la de cada integrante, como exige la "
     "cátedra para la presentación final."],
    ["Repositorio de software", "Git + GitHub",
     "Sistema de control de versiones distribuido. Flujo con rama de integración, una rama por "
     "Historia de Usuario e integración por Pull Request revisado por el otro integrante."],
    ["Frontend", "React 18 + Vite + React Router v6",
     "Aplicación de página única con recarga en caliente y rutas protegidas por rol. Continuidad "
     "con la Parte 1."],
    ["Estilos", "Tailwind CSS v3",
     "Utilidades de estilo y diseño responsive, consistente con la identidad visual ya definida."],
    ["Formularios", "React Hook Form + Zod",
     "Validación declarativa en el cliente, que se replica como restricción en la base de datos."],
    ["Backend", "Supabase (Backend as a Service)",
     "Aporta autenticación con JWT, API REST automática y almacenamiento de archivos sin "
     "necesidad de mantener un servidor propio, lo que se ajusta a la capacidad del equipo."],
    ["Gestor de base de datos", "PostgreSQL (sobre Supabase)",
     "Motor relacional, necesario para sostener las restricciones de integridad del enunciado, "
     "con Row Level Security para los permisos por rol."],
    ["Maquetación", "Figma — wireframe, mockup y prototipo",
     "Wireframe de baja fidelidad para acordar la estructura de cada pantalla; mockup con la "
     "identidad visual aplicada; prototipo navegable para validar el flujo antes de codificar."],
    ["Despliegue", "Netlify (frontend) + Supabase (backend y base de datos)",
     "Gratuito y con despliegue continuo desde la rama principal del repositorio."],
    ["Íconos y animación", "Lucide React · Framer Motion",
     "Ya incorporados en la Parte 1; se reutilizan para mantener la coherencia visual."],
], anchos=[3.3, 4.3, 8.9], size=9)

h2("1.8. Gráfico de la arquitectura de software")
imagen(os.path.join(DIAG, "arq-software.png"), 16.0,
       "Figura 2. Arquitectura de software cliente-servidor en capas (three-tier).")

# ================================================================= 2. OBJETIVOS SMART
doc.add_page_break()
h1("2. Objetivos del proyecto", before=0)
par("Los objetivos se enuncian en formato SMART: específico, medible, alcanzable, relevante y "
    "acotado en el tiempo.", align="j", italic=True, color=GRIS)

objetivos = [
    ("OE-1", "Entrega funcional del Sistema de Gestión",
     "Desarrollar y desplegar en el entorno de pruebas las seis Historias de Usuario del "
     "backlog del producto (HU1 a HU6), equivalentes a 31 puntos de historia, distribuidas en "
     f"{C.en_palabras(C.CANT_SPRINTS)} sprints de dos semanas, cumpliendo el 100 % de sus "
     f"criterios de aceptación, antes del "
     f"{C.largo(C.FECHA_FIN)}.",
     [("Específico", "Seis Historias de Usuario identificadas y acotadas (HU1 a HU6), con sus "
       "tareas técnicas y criterios de aceptación ya redactados en el backlog."),
      ("Medible", "6 HU cerradas sobre 6 comprometidas; 31 puntos de historia completados; "
       "porcentaje de criterios de aceptación cumplidos sobre el total."),
      ("Alcanzable", f"{C.TOTAL_HORAS} horas de equipo disponibles ({C.INTEGRANTES} integrantes × "
       f"{C.HORAS_SEMANA_POR_INTEGRANTE} h semanales × {C.SEMANAS_PROYECTO} semanas) "
       "frente a una ruta crítica estimada por PERT en 54,16 horas."),
      ("Relevante", "Es el entregable central de la Parte 2 y la base técnica sobre la que se "
       "construirá la Parte 3 (aplicación móvil)."),
      ("Temporal", f"{C.largo(C.FECHA_FIN)}, un día antes de la tutoría "
       f"del {C.largo_sin_anio(C.FECHA_TUTORIA)}.")]),

    ("OE-2", "Seguridad y control de acceso por rol",
     "Implementar y verificar el control de acceso de los seis roles del sistema —Administrador, "
     "Autoridad, Docente, Personal, Padre y Estudiante— en las dos capas exigidas (políticas Row "
     "Level Security en PostgreSQL y verificación en la interfaz), alcanzando cero accesos "
     "indebidos sobre el total de casos de prueba de permisos ejecutados, al cierre del Sprint 2 "
     f"el {C.largo(C.SPRINT_2.fin)}.",
     [("Específico", "Seis roles concretos y dos capas de verificación determinadas: base de "
       "datos e interfaz."),
      ("Medible", "0 accesos indebidos sobre el total de casos de prueba de permisos; una "
       "política RLS activa por cada tabla nueva del sistema de gestión."),
      ("Alcanzable", "El enumerado de roles, el contexto de autenticación y las rutas protegidas "
       "ya existen desde la Parte 1: solo se extienden las políticas a las tablas nuevas."),
      ("Relevante", "La cátedra evalúa explícitamente que cada rol acceda únicamente a lo suyo, "
       "y el enunciado exige que un padre gestione solo los datos de sus hijos."),
      ("Temporal", f"{C.largo(C.SPRINT_2.fin)}, cierre del Sprint 2.")]),

    ("OE-3", "Respuesta al desafío del enunciado",
     "Incorporar los cuatro requerimientos extra que responden al desafío del enunciado "
     "(REQ-14, REQ-17, REQ-20 y REQ-22), consumiendo como máximo el 25 % de la capacidad de "
     "cada sprint —entre 5 y 6 puntos— sin desplazar ninguna Historia de Usuario comprometida, "
     f"antes del {C.largo(C.SPRINT_2.fin)}.",
     [("Específico", "Cuatro requerimientos identificados que exceden las seis HU seleccionadas "
       "y no formaban parte del alcance original."),
      ("Medible", "4 requerimientos extra implementados; consumo ≤ 25 % de la capacidad del "
       "sprint; 0 Historias de Usuario desplazadas a un sprint posterior."),
      ("Alcanzable", "Los cuatro se apoyan en módulos que ya se construyen para las HU: REQ-14 "
       "es precondición de HU2 y HU4, REQ-17 se apoya en las notas de HU2 y REQ-20 comparte "
       "módulo con HU6."),
      ("Relevante", "El enunciado pide agregar al menos una funcionalidad de valor no "
       "contemplada inicialmente; estos cuatro requerimientos son esa respuesta."),
      ("Temporal", f"{C.largo(C.SPRINT_2.fin)}, cierre del Sprint 2.")]),

    ("OE-4", "Trazabilidad del trabajo del equipo y de cada integrante",
     "Registrar el 100 % de las Historias de Usuario como issues en el tablero Kanban de GitHub "
     "Projects y mantener la bitácora del equipo y la de cada integrante, con al menos un commit "
     f"identificado por Historia de Usuario en el scope del mensaje, durante las "
     f"{C.en_palabras(C.SEMANAS_PROYECTO)} semanas del "
     f"proyecto ({C.largo_sin_anio(C.FECHA_INICIO)} al {C.largo(C.FECHA_FIN)}).",
     [("Específico", "Seis issues en el tablero Kanban, dos bitácoras individuales y una del "
       "equipo, y convención de mensajes de commit con la HU en el scope."),
      ("Medible", "6 de 6 HU cargadas como issue; porcentaje de commits con scope válido; "
       "2 bitácoras individuales sostenidas."),
      ("Alcanzable", "GitHub Projects e Issues están disponibles en el mismo repositorio; la "
       "convención de commits ya está acordada y documentada."),
      ("Relevante", "La cátedra pide mostrar en la presentación final la bitácora del tablero "
       "del equipo y la de cada integrante."),
      ("Temporal", f"Del {C.largo_sin_anio(C.FECHA_INICIO)} al {C.largo(C.FECHA_FIN)}, "
       f"en forma continua.")]),

    ("OE-5", "Calidad del incremento entregado",
     "Cumplir los seis puntos de la Definition of Done en el 100 % de las Historias de Usuario "
     "cerradas, incluyendo la revisión cruzada por Pull Request del otro integrante, antes de la "
     f"entrega final del {C.largo(C.FECHA_FIN)}.",
     [("Específico", "Seis condiciones de la Definition of Done, entre ellas el code review "
       "cruzado y la verificación de permisos por rol."),
      ("Medible", "6 de 6 puntos de la Definition of Done por cada HU cerrada; 100 % de los "
       "Pull Requests con revisión aprobada por el otro integrante."),
      ("Alcanzable", "En un equipo de dos integrantes cada Pull Request tiene un revisor "
       "natural, sin necesidad de coordinación adicional."),
      ("Relevante", "Sin revisión cruzada una HU no se considera terminada: es la política de "
       "calidad acordada por el equipo y parte de la evaluación."),
      ("Temporal", f"{C.largo(C.FECHA_FIN)}, entrega final de la etapa.")]),

    ("OE-6", "Aplicación de patrones de diseño",
     f"Aplicar los tres patrones de diseño seleccionados —Singleton, Facade y State, uno por "
     f"cada tipo— en los módulos del Sistema de Gestión, dejando cero accesos directos a la "
     f"base de datos desde la capa de presentación y cero transiciones de estado sin validar, "
     f"antes del cierre del Sprint {C.CANT_SPRINTS} el {C.largo(C.SPRINTS[-1].fin)}.",
     [("Específico", "Tres patrones concretos, uno de cada tipo, con su ubicación definida: "
       "Singleton en el cliente de datos, Facade en la capa de servicios y State en el ciclo "
       "de vida de matrículas y postulaciones."),
      ("Medible", "0 archivos de la capa de presentación que importen el cliente de base de "
       "datos (hoy son 14); 0 transiciones de estado que se guarden sin validación; 3 de 3 "
       "patrones documentados con su justificación."),
      ("Alcanzable", "El Singleton ya está en uso desde la Parte 1 y la Facade existe de forma "
       "parcial en los hooks actuales: se trata de completarlos, no de construirlos de cero."),
      ("Relevante", "Corresponde a la Unidad 2 de la asignatura y resuelve dos debilidades "
       "reales detectadas al revisar el código: la lógica de datos dispersa en la interfaz y "
       "los cambios de estado sin control."),
      ("Temporal", f"Facade en el Sprint 1 ({C.largo_sin_anio(C.SPRINTS[0].fin)}) y State en "
       f"el Sprint 2 ({C.largo_sin_anio(C.SPRINTS[1].fin)}); verificación final en el "
       f"Sprint {C.CANT_SPRINTS}.")]),
]

for cod, titulo, enunciado, desglose in objetivos:
    h2("%s — %s" % (cod, titulo))
    rico([(enunciado, False, False)], after=4)
    filas = [["Criterio", "Justificación"]] + [[k, v] for k, v in desglose]
    tabla(filas, anchos=[2.6, 13.9], size=9, aligns=[None, None], after=6)

# ================================================================= 3. CRONOGRAMA
doc.add_page_break()
h1("3. Cronograma de actividades — Parte Sistema de Gestión", before=0)
rico([("El proyecto se desarrolla entre el ", False, False),
      (f"{C.largo_sin_anio(C.FECHA_INICIO)} y el {C.largo(C.FECHA_FIN)}", True, False),
      (f", en {C.TOTAL_DIAS_HABILES} días hábiles. La capacidad del equipo es de ", False, False),
      (f"{C.HORAS_SEMANA_POR_INTEGRANTE} horas semanales por integrante", True, False),
      (f", es decir {C.HORAS_SEMANA_EQUIPO} horas de equipo por semana y ", False, False),
      (f"{C.TOTAL_HORAS} horas en total", True, False),
      (f". Los {C.en_palabras(C.CANT_SPRINTS)} sprints son de diez días hábiles y corren de "
       f"martes a lunes, de modo que el Sprint Planning se realiza después de la clase del "
       f"martes y la Sprint Review el lunes previo a la clase siguiente. La entrega del "
       f"{C.largo(C.FECHA_FIN)} comprende el proyecto completo: la página web institucional "
       f"ya desplegada y el Sistema de Gestión desarrollado en esta etapa.", False, False)])

_crono = [["N°", "Etapa", "Inicio", "Fin", "Días\nhábiles", "Horas de\nequipo"]]
for _e in C.ETAPAS_CALC:
    _crono.append([str(_e.numero), _e.nombre, C.corto(_e.inicio), C.corto(_e.fin),
                   str(_e.duracion), str(_e.horas)])
_crono.append(["", "TOTAL DEL PROYECTO", C.dma(C.FECHA_INICIO), C.dma(C.FECHA_FIN),
               str(C.TOTAL_DIAS_HABILES), str(C.TOTAL_HORAS)])
tabla(_crono, anchos=[1.0, 6.4, 2.5, 2.5, 2.0, 2.1], size=9.5,
      aligns=["c", None, "c", "c", "c", "c"], total_row=True)

par("Las etapas se solapan deliberadamente: el modelado de datos comienza durante el estudio de "
    "requerimientos y continúa en el primer día del Sprint 1, y las pruebas se inician antes de "
    "que termine la codificación del Sprint 2. Este solapamiento es propio de un marco de "
    f"trabajo iterativo y es lo que permite sostener el plan dentro de las {C.TOTAL_HORAS} horas disponibles.",
    align="j")

h1("4. Descripción de las actividades")
tabla([
    ["ETAPA", "TAREAS", "DURACIÓN\nen HS", "RESULTADOS ESPERADOS", "ALUMNO RESPONSABLE"],
    ["Planificación del Proyecto",
     "Formación del equipo de dos integrantes y reparto del trabajo por Historia de Usuario. "
     "Adopción de Scrum y creación del tablero Kanban. Redacción del plan de trabajo y de los "
     "objetivos SMART.",
     "6",
     "Plan de trabajo aprobado; equipo y responsabilidades definidos; tablero Kanban operativo.",
     "Ambos"],
    ["Estudio de Requerimientos",
     "Relevamiento y redacción de REQ-13 a REQ-22 aplicando las siete propiedades de la teoría "
     "de requerimientos. Clasificación en funcionales y no funcionales. Clasificación del "
     "Sistema de Información. Arquitectura de la información y de software. Seis Historias de "
     "Usuario con sus casos de uso y diagramas de secuencia.",
     "12",
     "TP1 – Parte 1 entregado; backlog del producto priorizado y estimado en puntos de historia.",
     "Ambos"],
    ["Modelado",
     "Modelo relacional del sistema: matrícula, legajos, cursos, materias, calificaciones, "
     "asistencia, personal, deportes, transporte y comedor. Traducción de las restricciones del "
     "enunciado a claves, restricciones de unicidad y disparadores. Scripts SQL idempotentes con "
     "sus políticas de seguridad.",
     "10",
     "Diagrama entidad-relación del Sistema de Gestión y scripts SQL versionados con Row Level "
     "Security.",
     "Gonzalo (lidera)\nRevisión de Lautaro"],
    ["Diseño",
     "Wireframes de los módulos Alumnos, Profesores y Administración. Mockups con la identidad "
     "visual del centro educativo. Prototipo navegable reutilizando los componentes de interfaz "
     "de la Parte 1.",
     "8",
     "Wireframe, mockup y prototipo navegable validados por el equipo antes de codificar.",
     "Lautaro (lidera)\nRevisión de Gonzalo"],
    ["Codificación",
     "Sprint 1: HU1 y HU4, más REQ-14 como precondición técnica. Se construye la capa de "
     "servicios (patrón Facade).\n"
     "Sprint 2: HU2 y HU6, más REQ-20 y REQ-22. Se implementa la máquina de estados "
     "(patrón State).\n"
     "Sprint 3: HU3 y HU5, más REQ-17.\n"
     "Cada integrante desarrolla sus Historias de Usuario de punta a punta: base de datos, "
     "lógica, interfaz y pruebas.",
     "46",
     "Un incremento funcional al cierre de cada sprint, integrado a la rama principal por Pull "
     "Request revisado.",
     "Ambos\n(por Historia de Usuario)"],
    ["Pruebas",
     "Pruebas funcionales sobre los criterios de aceptación de cada HU. Pruebas de integración "
     "entre matrícula, calificaciones, asistencia y reportes. Verificación de los permisos de los "
     "seis roles en las dos capas. Pruebas de regresión sobre la página web de la Parte 1, para "
     "confirmar que el Sistema de Gestión no altera su funcionamiento.",
     "8",
     "Casos de prueba documentados y superados; cero accesos indebidos en las pruebas de "
     "permisos; web institucional sin regresiones.",
     "Ambos"],
    ["Implementación o Despliegue",
     "Despliegue conjunto de la página web y del Sistema de Gestión en Netlify y Supabase. "
     "Carga de datos de prueba. Actualización del portafolio digital y cierre de la bitácora "
     "del tablero Kanban.",
     "6",
     "Sistema desplegado y accesible en el entorno de pruebas, con la documentación de cada HU "
     "actualizada.",
     "Ambos"],
    ["", "TOTAL", "96", "", ""],
], anchos=[2.9, 5.7, 2.1, 3.3, 2.5], size=8.5,
   aligns=[None, None, "c", None, "c"], total_row=True)

# ================================================================= 5. GANTT (apaisado)
gsec = doc.add_section(WD_SECTION.NEW_PAGE)
gsec.orientation = WD_ORIENT.LANDSCAPE
gsec.page_width, gsec.page_height = Cm(29.7), Cm(21.0)   # A4 apaisado
gsec.top_margin, gsec.bottom_margin = Cm(2.0), Cm(2.0)
gsec.left_margin, gsec.right_margin = Cm(1.5), Cm(1.5)
encabezado_pie(gsec)

h1("5. Gráfico del diagrama de Gantt", before=0)

SEMANAS = C.semanas_gantt()
DIAS = [d for _, ds in SEMANAS for d in ds]
NDIAS = len(DIAS)

COLOR_ETAPA = ["BDD7EE", "BDD7EE", "C6E0B4", "C6E0B4",
               "F8CBAD", "F8CBAD", "F8CBAD", "FFE699", "D9C2E9"]

ETAPAS_G = [("%d. %s" % (e.numero, e.nombre), str(e.horas), set(e.dias),
             COLOR_ETAPA[e.indice % len(COLOR_ETAPA)])
            for e in C.ETAPAS_CALC]

HITOS = C.hitos()

W_ETAPA, W_HS = 5.0, 0.9
usable_g = Emu(gsec.page_width - gsec.left_margin - gsec.right_margin)
w_dia = (usable_g.cm - W_ETAPA - W_HS) / NDIAS

gt = doc.add_table(rows=2 + len(ETAPAS_G) + 1, cols=2 + NDIAS)
gt.style = "Table Grid"
gt.autofit = False
gt.alignment = WD_TABLE_ALIGNMENT.CENTER

# fila 0: semanas (celdas combinadas)
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
    cell_text(m, nombre, 7.5, True,
              RGBColor(0xFF, 0xFF, 0xFF), "c")
    shade(m, "2E5C8A")
    for k, d in enumerate(ds):
        cd = gt.cell(1, col + k)
        cell_text(cd, str(d.day), 6, True, RGBColor(0xFF, 0xFF, 0xFF), "c")
        shade(cd, HDR_FILL)
    col = fin + 1

# filas de etapas
for i, (nombre, hs, dias_marcados, color) in enumerate(ETAPAS_G):
    r = 2 + i
    cell_text(gt.cell(r, 0), nombre, 7.5, align=None)
    cell_text(gt.cell(r, 1), hs, 8, True, align="c")
    for j, dk in enumerate(DIAS):
        cd = gt.cell(r, 2 + j)
        cell_text(cd, "", 7, align="c")
        if dk in dias_marcados:
            shade(cd, color)

# fila de hitos
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

# referencias
h3("Referencias", before=4, after=3)
ref = doc.add_table(rows=1, cols=5)
ref.style = "Table Grid"
ref.autofit = False
refs = [("Planificación y análisis", "BDD7EE"), ("Modelado y diseño", "C6E0B4"),
        ("Codificación", "F8CBAD"), ("Pruebas", "FFE699"), ("Despliegue", "D9C2E9")]
for j, (txt, col_) in enumerate(refs):
    cd = ref.cell(0, j)
    cell_text(cd, txt, 8, True, align="c")
    shade(cd, col_)
    cd.width = Cm(4.6)
doc.add_paragraph().paragraph_format.space_after = Pt(4)

par("Hitos (◆):  " + "  ·  ".join("%s %s" % (f, t) for f, t in C.hitos_descriptos())
    + ".", 9, italic=True, color=GRIS)

# ================================================================= 6. PERT (vertical)
psec = doc.add_section(WD_SECTION.NEW_PAGE)
psec.orientation = WD_ORIENT.PORTRAIT
psec.page_width, psec.page_height = Cm(21.0), Cm(29.7)   # A4 vertical
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
tabla([
    ["Act.", "Actividad", "Prec.", "to", "tm", "tp", "te", "σ²",
     "ES", "EF", "LS", "LF", "Holg.", "Crít."],
    ["A", "Planificación del proyecto", "—", "4", "6", "8", "6,00", "0,44",
     "0,00", "6,00", "0,00", "6,00", "0,00", "Sí"],
    ["B", "Estudio de requerimientos", "A", "10", "12", "14", "12,00", "0,44",
     "6,00", "18,00", "6,00", "18,00", "0,00", "Sí"],
    ["C", "Modelado", "B", "8", "10", "12", "10,00", "0,44",
     "18,00", "28,00", "18,00", "28,00", "0,00", "Sí"],
    ["D", "Diseño", "B", "6", "8", "10", "8,00", "0,44",
     "18,00", "26,00", "20,00", "28,00", "2,00", "No"],
    ["E", "Codificación — Sprint 1", "C, D", "12", "16", "20", "16,00", "1,78",
     "28,00", "44,00", "28,00", "44,00", "0,00", "Sí"],
    ["F", "Codificación — Sprint 2", "E", "12", "16", "20", "16,00", "1,78",
     "44,00", "60,00", "44,00", "60,00", "0,00", "Sí"],
    ["G", "Codificación — Sprint 3", "F", "10", "14", "18", "14,00", "1,78",
     "60,00", "74,00", "60,00", "74,00", "0,00", "Sí"],
    ["H", "Pruebas", "G", "6", "8", "10", "8,00", "0,44",
     "74,00", "82,00", "74,00", "82,00", "0,00", "Sí"],
    ["I", "Implementación o despliegue", "H", "4", "6", "8", "6,00", "0,44",
     "82,00", "88,00", "82,00", "88,00", "0,00", "Sí"],
    ["", "Esfuerzo total estimado", "", "", "", "", "96,00", "", "", "", "", "", "", ""],
], anchos=[0.9, 3.9, 1.0, 0.75, 0.75, 0.75, 1.05, 0.85, 1.05, 1.05, 1.05, 1.05, 1.0, 0.85],
   size=7.5, aligns=["c", None, "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c", "c"],
   total_row=True)

par("ES = inicio temprano · EF = fin temprano · LS = inicio tardío · LF = fin tardío · "
    "Holg. = holgura total (LS − ES). Una actividad es crítica cuando su holgura es cero.",
    8.5, italic=True, color=GRIS)

h2("6.2. Red de actividades")
imagen(os.path.join(DIAG, "pert-red.png"), 16.2,
       "Figura 3. Red PERT del proyecto. En rojo, las actividades de la ruta crítica.")

h2("6.3. Ruta crítica y análisis")
tabla([
    ["Concepto", "Valor", "Interpretación"],
    ["Ruta crítica", "A → B → C → E → F → G → H → I",
     "Ocho de las nueve actividades son críticas: cualquier atraso en ellas desplaza la fecha de "
     "entrega."],
    ["Duración de la ruta crítica", "88,00 horas de equipo",
     f"Equivale a algo más de siete de las {C.en_palabras(C.SEMANAS_PROYECTO)} semanas "
     f"disponibles."],
    ["Esfuerzo total estimado", "96,00 horas de equipo",
     f"Coincide con la capacidad planificada de {C.TOTAL_HORAS} horas ({C.INTEGRANTES} "
     f"integrantes × {C.HORAS_SEMANA_POR_INTEGRANTE} h × {C.SEMANAS_PROYECTO} semanas)."],
    ["Margen sobre la ruta crítica", "8,00 horas (8,3 %)",
     "Diferencia entre la capacidad disponible y la ruta crítica. Es el colchón real ante "
     "desvíos."],
    ["Actividad con holgura", "D — Diseño: 2,00 horas",
     "Es la única actividad no crítica. Puede demorarse hasta 2 horas sin afectar la entrega, "
     "porque corre en paralelo con el Modelado, que es más largo."],
    ["Varianza de la ruta crítica", "σ² = 7,54   ·   σ = 2,75 horas",
     "Suma de las varianzas de las actividades críticas."],
    ["Intervalo de confianza (≈95 %)", "entre 82,5 y 93,5 horas",
     "Duración esperada ± 2σ. Incluso en el escenario pesimista el proyecto entra dentro de las "
     f"{C.TOTAL_HORAS} horas de capacidad."],
], anchos=[4.0, 4.6, 7.9], size=9)

rico([("Conclusión del análisis. ", True, False),
      ("El margen entre la ruta crítica (88 h) y la capacidad disponible (96 h) es de 8 horas, "
       "un 8,3 %. Las actividades E, F y G —la codificación de los tres sprints— concentran la "
       "incertidumbre: son las de mayor varianza (σ² = 1,78 cada una) y suman 46 de las 88 "
       "horas de la ruta crítica. Tres decisiones de planificación responden a ese riesgo: "
       "(1) las Historias de Usuario de riesgo medio se ubicaron en sprints distintos, para no "
       "concentrar la incertidumbre en una sola iteración; (2) se reservó alrededor del 25 % de "
       "la capacidad de cada sprint para los requerimientos extra, que son los que suelen "
       "desbordar; y (3) el Sprint 3 se estimó con menos carga que los anteriores porque "
       "coincide con las pruebas de integración y el despliegue, que compiten por las mismas "
       "horas.", False, False)])

# ================================================================= 7. BACKLOG DEL SPRINT
doc.add_page_break()
h1("7. Backlog del sprint", before=0)
par("Se presenta un backlog por cada Historia de Usuario, con sus tareas técnicas y sus "
    "criterios de aceptación. El estado corresponde al inicio del Sprint 1; su evolución se "
    "sigue en el tablero Kanban del repositorio.", align="j", italic=True, color=GRIS)

HUS = [
    ("HU1", "Matricular alumno desde solicitud aprobada", "REQ-13", "Administrador",
     "Alta", "8", "Sprint 1", "G. Cerqueiro", "To Do",
     ["Modelar las tablas de matrícula y legajo digital, con sus políticas de seguridad.",
      "Listar las solicitudes de inscripción en estado “aprobada”.",
      "Construir el formulario de asignación de curso y división.",
      "Validar los datos obligatorios antes de confirmar la matrícula.",
      "Generar el legajo y cambiar el estado de la solicitud a “matriculado”."],
     ["Ante una solicitud aprobada y un curso asignado, la matrícula se confirma y el legajo se "
      "genera automáticamente.",
      "Si faltan datos obligatorios, el sistema los solicita y no confirma la matrícula.",
      "La solicitud queda en estado “matriculado” y no puede volver a matricularse.",
      "Solo el rol Administrador accede al panel de matriculación."]),

    ("HU2", "Cargar calificaciones de alumnos", "REQ-15", "Docente",
     "Alta", "5", "Sprint 2", "G. Cerqueiro", "To Do",
     ["Modelar las notas por alumno, materia y período.",
      "Construir la pantalla de carga de notas por curso y materia.",
      "Validar el rango válido de la nota.",
      "Calcular el promedio del período al guardar.",
      "Restringir el acceso al docente titular de la materia mediante políticas de seguridad."],
     ["El docente titular puede cargar y editar las notas de su materia.",
      "Una nota fuera de rango se rechaza con un mensaje que solicita su corrección.",
      "Al guardar, el promedio del período se recalcula automáticamente.",
      "Un docente no titular no puede editar notas ajenas."]),

    ("HU4", "Registrar asistencia diaria", "REQ-16", "Docente",
     "Alta", "3", "Sprint 1", "L. Fernández", "To Do",
     ["Modelar la asistencia por alumno, fecha y estado.",
      "Listar los alumnos del curso según la fecha seleccionada.",
      "Marcar presente o ausente y guardar el registro.",
      "Permitir la edición cuando ya existe carga para esa fecha.",
      "Construir la vista de consulta para los roles Padre y Estudiante."],
     ["La asistencia del día queda registrada por alumno.",
      "Si la fecha ya fue cargada, el registro se edita en lugar de duplicarse.",
      "Padre y Estudiante visualizan el registro de asistencia.",
      "Solo el docente asignado al curso puede cargarla."]),

    ("HU3", "Consultar indicadores institucionales", "REQ-21", "Autoridad",
     "Media", "8", "Sprint 3", "G. Cerqueiro", "To Do",
     ["Construir las consultas agregadas de matrícula, asistencia y rendimiento.",
      "Implementar el filtro por período y por tipo de indicador.",
      "Construir el panel de reportes con tabla y gráfico.",
      "Implementar la exportación del reporte a PDF.",
      "Restringir el acceso al rol Autoridad."],
     ["El reporte se actualiza según el período seleccionado.",
      "Los datos son consistentes con la matrícula, la asistencia y las notas cargadas.",
      "Si no hay datos en el período, se muestra el mensaje “sin datos disponibles”.",
      "El reporte visualizado puede exportarse a PDF."]),

    ("HU6", "Gestionar legajo de personal", "REQ-19", "Administrador",
     "Media", "5", "Sprint 2", "L. Fernández", "To Do",
     ["Modelar el legajo del personal docente y no docente.",
      "Implementar el alta, la edición y la baja de legajos.",
      "Validar DNI único para evitar duplicados.",
      "Vincular el estado activo/inactivo al acceso al sistema.",
      "Implementar la búsqueda y el filtro por función y estado."],
     ["El Administrador crea, edita y da de baja legajos de personal.",
      "Si el DNI ya existe, el sistema no permite duplicar el legajo.",
      "El personal en estado inactivo no puede ingresar al sistema.",
      "Los cambios se reflejan en el listado de personal."]),

    ("HU5", "Enviar comunicado a padres del curso", "REQ-18", "Docente",
     "Media", "2", "Sprint 3", "L. Fernández", "To Do",
     ["Modelar los comunicados con remitente, curso destino y fecha.",
      "Implementar la selección de curso y la redacción del mensaje.",
      "Validar que el mensaje no quede vacío.",
      "Mostrar el comunicado en la bandeja de los padres del curso."],
     ["El mensaje llega a todos los padres asociados al curso.",
      "El comunicado queda registrado con fecha y remitente.",
      "Un mensaje vacío no puede enviarse.",
      "El docente solo puede enviar comunicados a los cursos que tiene asignados."]),
]

for (hid, titulo, req, rol, prio, pts, sprint, resp, estado, tareas,
     criterios) in sorted(HUS, key=lambda x: (x[6], x[0])):
    h2("%s — %s" % (hid, titulo))
    t1 = tabla([
        ["ID", "Título / Historia de Usuario", "Prioridad", "Estado"],
        [hid, titulo, prio, estado],
    ], anchos=[1.4, 9.6, 2.6, 2.9], size=9, aligns=["c", None, "c", "c"], after=4)
    mantener_junto(t1)
    doc.paragraphs[-1].paragraph_format.keep_with_next = True
    t2 = tabla([
        ["Requerimiento", "Rol usuario", "Puntos estimados", "Iteración", "Responsable"],
        [req, rol, pts, sprint, resp],
    ], anchos=[3.0, 3.0, 3.4, 2.6, 4.5], size=9,
       aligns=["c", "c", "c", "c", "c"], after=4)
    mantener_junto(t2)
    doc.paragraphs[-1].paragraph_format.keep_with_next = True

    filas = [["#", "Tareas", "Criterios de aceptación"]]
    n = max(len(tareas), len(criterios))
    for k in range(n):
        filas.append([str(k + 1),
                      tareas[k] if k < len(tareas) else "",
                      criterios[k] if k < len(criterios) else ""])
    t3 = tabla(filas, anchos=[0.8, 7.6, 8.1], size=8.5, aligns=["c", None, None], after=10)
    for _r in t3.rows[:2]:
        for _c in _r.cells:
            for _p in _c.paragraphs:
                _p.paragraph_format.keep_with_next = True

# ================================================================= 8. PLAN DE SPRINT
doc.add_page_break()
h1("8. Plan de sprint", before=0)
rico([("El proyecto se organiza en ", False, False),
      (f"{C.en_palabras(C.CANT_SPRINTS)} sprints de dos semanas", True, False),
      (" (diez días hábiles cada uno). Los sprints corren de martes a lunes, de modo que el "
       "Sprint Planning se realiza después de la clase del martes y la Sprint Review el lunes "
       "previo a la clase siguiente. La velocidad estimada del equipo es de aproximadamente "
       "15 puntos por sprint, de los que se reserva alrededor del ", False, False),
      ("25 %", True, False),
      (" para los requerimientos extra, que no integran el cuadro del backlog pero sí consumen "
       "capacidad.", False, False)])

par("Cada sprint incorpora una Historia de Usuario de cada integrante, de modo que ambos "
    "entreguen valor en todas las iteraciones y que la revisión cruzada por Pull Request tenga "
    "siempre trabajo del otro para revisar.", align="j")

_sp = [
    ("HU1 · HU4", "11", "REQ-13, REQ-16\n+ REQ-14 (≈5 pts)", "Facade",
     "Dejar operativa la base académica: cursos y materias cargados, alumnos matriculados desde "
     "las solicitudes aprobadas y asistencia diaria registrada."),
    ("HU2 · HU6", "10", "REQ-15, REQ-19\n+ REQ-20 y REQ-22 (≈5 pts)", "State",
     "Incorporar la carga de calificaciones con cálculo de promedio y la gestión del legajo de "
     "personal, con trazabilidad de las acciones críticas."),
    ("HU3 · HU5", "10", "REQ-18, REQ-21\n+ REQ-17 (≈3 pts)", "—",
     "Cerrar la comunicación con las familias y los reportes institucionales, e integrar el "
     "sistema con la web ya desplegada para la entrega conjunta."),
]
_filas = [["Sprint", "Fechas", "Historias\nde Usuario", "Puntos\nde HU",
           "Requerimientos incluidos", "Patrón", "Objetivo del sprint"]]
for _s, (_hu, _pts, _req, _pat, _obj) in zip(C.SPRINTS, _sp):
    _filas.append(["Sprint %d" % _s.numero_sprint,
                   C.dm(_s.inicio) + " al\n" + C.dma(_s.fin),
                   _hu, _pts, _req, _pat, _obj])
tabla(_filas, anchos=[1.6, 2.2, 1.9, 1.3, 3.4, 1.5, 4.6], size=8,
      aligns=["c", "c", "c", "c", None, "c", None])

# ─────────────────────────────────────────────── detalle de cada sprint
DETALLE_SPRINTS = [
    {
        "titulo": "Base académica: matrícula, cursos y asistencia",
        "objetivo": "Dejar operativa la base del sistema: el Administrador matricula alumnos "
                    "desde las solicitudes aprobadas y el Docente registra la asistencia diaria "
                    "de su curso. Sin estos datos ninguna de las historias siguientes tiene "
                    "sobre qué trabajar.",
        "hus": [
            ("HU1", "Matricular alumno desde solicitud aprobada", "Alta", "8", "G. Cerqueiro",
             "Es la base del sistema: sin alumnos matriculados no existen datos para "
             "calificaciones, asistencia ni reportes."),
            ("HU4", "Registrar asistencia diaria", "Alta", "3", "L. Fernández",
             "Depende de HU1 y de REQ-14, que se cierran en la primera semana del sprint. Bajo "
             "riesgo y entrega valor visible a Padres y Estudiantes desde la primera iteración."),
        ],
        "patron": ("Facade",
                   "Se construye la capa de servicios sobre la que se apoyan todas las "
                   "historias siguientes. Se migran los catorce archivos que hoy consultan la "
                   "base directamente y se fija la regla de que ningún componente vuelve a "
                   "hacerlo."),
        "semanas": [
            "Sprint Planning. Modelado de matrícula, legajo, cursos y materias (REQ-14). "
            "Creación de la capa de servicios (patrón Facade) y migración de los accesos "
            "existentes. HU1: listado de solicitudes aprobadas y asignación de curso.",
            "HU1: validaciones, generación del legajo digital y cambio de estado a "
            "“matriculado”. HU4: carga y edición de asistencia, y vista de consulta para Padre "
            "y Estudiante. Pruebas de integración. Sprint Review y Retrospectiva.",
        ],
    },
    {
        "titulo": "Calificaciones, personal y trazabilidad",
        "objetivo": "Incorporar la carga de calificaciones con cálculo automático del promedio "
                    "y la gestión del legajo del personal, dejando registrada toda acción "
                    "crítica sobre los datos.",
        "hus": [
            ("HU2", "Cargar calificaciones de alumnos", "Alta", "5", "G. Cerqueiro",
             "Depende de HU1 (alumnos matriculados) y de REQ-14 (materia y docente asignados), "
             "ambos cerrados en el Sprint 1."),
            ("HU6", "Gestionar legajo de personal", "Media", "5", "L. Fernández",
             "Independiente de las historias anteriores. Se agrupa con REQ-20 (postulaciones "
             "laborales) por afinidad de módulo."),
        ],
        "patron": ("State",
                   "Se modela el ciclo de vida de la matrícula y el de las postulaciones "
                   "laborales como máquinas de estado. Cada estado declara a qué estados puede "
                   "pasar, lo que hace verificable el criterio de aceptación de HU1 —una "
                   "solicitud matriculada no puede volver a matricularse— y ordena el flujo de "
                   "REQ-20."),
        "semanas": [
            "Sprint Planning. HU2: modelo de notas por alumno, materia y período; pantalla de "
            "carga por curso. HU6: modelo y ABM de legajos con validación de DNI único. "
            "Implementación de la máquina de estados (patrón State).",
            "HU2: validación de rango y cálculo del promedio del período. HU6: estado "
            "activo/inactivo vinculado al acceso, búsqueda y filtros. REQ-20: postulaciones "
            "sobre la máquina de estados. REQ-22: registro de auditoría. Sprint Review y "
            "Retrospectiva.",
        ],
    },
    {
        "titulo": "Comunicación, reportes e integración final",
        "objetivo": "Cerrar la comunicación con las familias y los reportes institucionales, y "
                    "verificar que el Sistema de Gestión se integra con la página web ya "
                    "desplegada sin romper su funcionamiento, de cara a la entrega conjunta.",
        "hus": [
            ("HU3", "Consultar indicadores institucionales", "Media", "8", "G. Cerqueiro",
             "Depende de HU1, HU2 y HU4: sin matrícula, calificaciones y asistencia cargadas no "
             "hay datos que agregar. Por eso se ubica en la última iteración."),
            ("HU5", "Enviar comunicado a padres del curso", "Media", "2", "L. Fernández",
             "Requiere cursos con padres asociados (REQ-14 y HU1). Bajo esfuerzo, lo que libera "
             "capacidad para la integración y las pruebas de regresión."),
        ],
        "patron": ("—",
                   "No se incorporan patrones nuevos. Se verifica que los tres aplicados estén "
                   "efectivamente en uso en todos los módulos, como parte de la Definition of "
                   "Done."),
        "semanas": [
            "Sprint Planning. HU3: consultas agregadas de matrícula, asistencia y rendimiento; "
            "filtro por período. HU5: modelo de comunicados, envío por curso y bandeja de los "
            "padres. REQ-17: boletines y constancias en PDF.",
            "HU3: panel de reportes y exportación a PDF. Integración con la web institucional y "
            "pruebas de regresión sobre la Parte 1. Pruebas de permisos por rol. Despliegue "
            "final y entrega. Sprint Review y Retrospectiva.",
        ],
    },
]

for _s, _d in zip(C.SPRINTS, DETALLE_SPRINTS):
    h2("8.%d. Sprint %d — %s (%s al %s)"
       % (_s.numero_sprint, _s.numero_sprint, _d["titulo"],
          C.dm(_s.inicio), C.dm(_s.fin)))
    rico([("Objetivo. ", True, False), (_d["objetivo"], False, False)])

    _f = [["ID", "Historia de Usuario", "Prior.", "Pts", "Responsable",
           "Motivo de inclusión y dependencias"]]
    for _hu in _d["hus"]:
        _f.append(list(_hu))
    tabla(_f, anchos=[1.2, 5.0, 1.5, 1.0, 2.6, 5.2], size=8.5,
          aligns=["c", None, "c", "c", "c", None], after=4)

    _pat, _txt = _d["patron"]
    if _pat != "—":
        rico([("Patrón de diseño de este sprint: ", True, False),
              (_pat + ". ", True, True), (_txt, False, False)], after=4)
    else:
        rico([("Patrones de diseño. ", True, False), (_txt, False, False)], after=4)

    _sem = [["Semana", "Fechas", "Actividades planificadas"]]
    for _i, _bloque in enumerate(_s.semanas()):
        _sem.append(["Semana %d" % (_i + 1),
                     "%s al\n%s" % (C.dm(_bloque[0]), C.dm(_bloque[-1])),
                     _d["semanas"][_i] if _i < len(_d["semanas"]) else ""])
    tabla(_sem, anchos=[1.8, 2.2, 12.5], size=8.5, aligns=["c", "c", None])

h2("8.4. Requerimientos extra considerados en la capacidad")
par("Los siguientes requerimientos no integran el cuadro del backlog porque no corresponden a "
    "las seis Historias de Usuario seleccionadas, pero ocupan tiempo del equipo dentro de cada "
    "sprint y por eso se descuentan de la capacidad disponible. Son, además, la respuesta del "
    "equipo al desafío del enunciado.", align="j")
tabla([
    ["Requerimiento extra", "Sprint", "Motivo por el que consume capacidad del sprint"],
    ["REQ-14 — Cursos, materias y asignación docente", "Sprint 1\n(≈5 pts)",
     "Es precondición técnica de HU2 y HU4: sin cursos, materias y docente asignado no se "
     "pueden cargar notas ni asistencia."],
    ["REQ-17 — Boletines y constancias en PDF", "Sprint 3\n(≈3 pts)",
     "Se apoya en las calificaciones de HU2. Se avanza en paralelo, sin comprometerse como "
     "entregable del sprint."],
    ["REQ-20 — Postulaciones laborales", "Sprint 2\n(≈2 pts)",
     "Comparte el módulo de personal con HU6, por lo que se aprovecha el mismo contexto de "
     "desarrollo."],
    ["REQ-22 — Auditoría y trazabilidad", "Sprint 2\n(≈3 pts)",
     "Requerimiento transversal: cada acción crítica de Administrador y Autoridad debe quedar "
     "registrada con usuario, fecha y acción."],
], anchos=[5.4, 2.2, 8.9], size=8.5, aligns=[None, "c", None])

h2("8.5. Eventos de Scrum")
tabla([
    ["Evento", "Duración máxima", "Cuándo", "Objetivo"],
    ["Sprint Planning", "3 horas", "Primer día del sprint (martes)",
     "Seleccionar las Historias de Usuario del sprint y definir el Sprint Backlog."],
    ["Daily Scrum", "15 minutos", "Todos los días",
     "Sincronizar a los dos integrantes y detectar impedimentos."],
    ["Sprint Review", "1,5 horas", "Último día del sprint (lunes)",
     "Presentar el incremento y ajustar el backlog del producto."],
    ["Sprint Retrospective", "1 hora", "Último día del sprint (lunes)",
     "Analizar el proceso y definir mejoras para el sprint siguiente."],
], anchos=[3.3, 2.6, 4.0, 6.6], size=9, aligns=[None, "c", None, None])

h2("8.6. Definition of Done")
par("Una Historia de Usuario se considera terminada únicamente cuando cumple los seis puntos:",
    align="j")
for txt in [
    "Todos los criterios de aceptación de la Historia de Usuario se cumplen.",
    "Las pruebas funcionales y de integración fueron superadas.",
    "Los permisos por rol están verificados con políticas Row Level Security en la base de datos.",
    "El código está subido al repositorio y fue revisado por el otro integrante mediante Pull Request.",
    "La funcionalidad está desplegada en el entorno de pruebas (Netlify y Supabase).",
    "La documentación de la Historia de Usuario está actualizada en el portafolio digital.",
]:
    vin(txt, size=10, after=3)

doc.save(DEST)
print("OK - documento generado:", DEST)
