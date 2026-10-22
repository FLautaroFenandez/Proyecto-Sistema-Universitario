# -*- coding: utf-8 -*-
"""
Cronograma del Plan de Trabajo — PARTE 3: Aplicacion movil integrada con IA
Metodologia de Sistemas II (UTN FRRe, TUP 2026)

ESTE ES EL UNICO ARCHIVO QUE HAY QUE TOCAR SI CAMBIAN LAS FECHAS.

Mismo criterio que cronograma.py (Parte 2): las etapas se ubican por su posicion
en la lista de DIAS HABILES, no por fecha absoluta, asi que mover FECHA_INICIO o
agregar un feriado recalcula todo el cronograma, el Gantt y el PERT.

Regenerar el documento con:

    python diagramas_movil.py ../recursos/diagramas
    python plan_movil_docx.py ../recursos/diagramas <salida.docx>
"""

from datetime import date, timedelta

# ═══════════════════════════════════════════════════════════════════════════
#  1. PARAMETROS EDITABLES
# ═══════════════════════════════════════════════════════════════════════════

# Primer dia habil de la Parte 3: entrega de este plan y arranque del analisis.
FECHA_INICIO = date(2026, 9, 29)          # martes 29 de septiembre de 2026

# Capacidad del equipo.
INTEGRANTES = 2
HORAS_SEMANA_POR_INTEGRANTE = 6

# Feriados que caen en dias habiles y NO se trabajan.
FERIADOS = [
    date(2026, 10, 12),   # Dia del Respeto a la Diversidad Cultural (lunes)
]

# Hitos externos fijados por la catedra.
FECHA_ENTREGA_PARTE_2 = date(2026, 10, 27)   # 2do parcial y entrega de la web
FECHA_TUTORIA_3       = date(2026, 11, 3)    # 3ra tutoria de la parte movil
FECHA_INFORME_IA      = date(2026, 11, 17)   # bitacora de IA y reflexion final

# Etapas del proyecto.
#   (nombre, offset en dias habiles desde el inicio, duracion en dias habiles, horas de equipo)
# Las etapas se solapan a proposito: hasta el 27/10 la capacidad esta compartida
# con la Parte 2, asi que el trabajo movil de ese tramo es de analisis y diseño.
ETAPAS = [
    ("Planificación de la Parte 3",              0,  4,  4),
    ("Estudio de requerimientos de la app",      2,  8,  6),
    ("Modelado de cuotas, pagos y servicios",    7,  8,  8),
    ("Diseño de la aplicación móvil",           11,  8,  6),
    ("Codificación — Sprint móvil 1",           20,  5, 12),
    ("Codificación — Sprint móvil 2",           25,  5, 12),
    ("Integración con la web y el backend",     22,  6,  6),
    ("Pruebas y validación",                    26,  5,  6),
    ("Bitácora de IA y documentación",           4, 27,  4),
]

# Indices (dentro de ETAPAS) de las etapas que son sprints de Scrum.
IDX_SPRINTS = [4, 5]

# Actividades del PERT: (codigo, etapa asociada, precedentes, to, tm, tp)
# Las duraciones estan en HORAS DE EQUIPO.
ACTIVIDADES_PERT = [
    ("A", 0, [],            3,  4,  6),
    ("B", 1, ["A"],         4,  6,  9),
    ("C", 2, ["B"],         6,  8, 11),
    ("D", 3, ["B"],         4,  6,  9),
    ("E", 4, ["C", "D"],    9, 12, 16),
    ("F", 5, ["E"],         9, 12, 16),
    ("G", 6, ["F"],         4,  6, 10),
    ("H", 7, ["G"],         4,  6,  9),
    ("I", 8, ["A"],         3,  4,  6),
]

# ═══════════════════════════════════════════════════════════════════════════
#  2. CALENDARIO DE DIAS HABILES
# ═══════════════════════════════════════════════════════════════════════════

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
DIA_SEM = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]


def _es_habil(d):
    return d.weekday() < 5 and d not in FERIADOS


def _construir_calendario():
    necesarios = max(off + dur for _, off, dur, _ in ETAPAS)
    dias, cursor = [], FECHA_INICIO
    while len(dias) < necesarios:
        if _es_habil(cursor):
            dias.append(cursor)
        cursor += timedelta(days=1)
    return dias


DIAS_HABILES = _construir_calendario()
TOTAL_DIAS_HABILES = len(DIAS_HABILES)
FECHA_FIN = DIAS_HABILES[-1]

HORAS_SEMANA_EQUIPO = INTEGRANTES * HORAS_SEMANA_POR_INTEGRANTE
TOTAL_HORAS = sum(h for _, _, _, h in ETAPAS)
SEMANAS_PROYECTO = -(-TOTAL_DIAS_HABILES // 5)
CAPACIDAD_TEORICA = HORAS_SEMANA_EQUIPO * SEMANAS_PROYECTO

# ═══════════════════════════════════════════════════════════════════════════
#  3. FORMATEO
# ═══════════════════════════════════════════════════════════════════════════

_PALABRAS = {1: "una", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
             6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez"}


def en_palabras(n):
    return _PALABRAS.get(n, str(n))


def dm(d):
    return "%02d/%02d" % (d.day, d.month)


def dma(d):
    return "%02d/%02d/%d" % (d.day, d.month, d.year)


def corto(d):
    return "%s %s" % (DIA_SEM[d.weekday()], dm(d))


def largo(d):
    return "%d de %s de %d" % (d.day, MESES[d.month - 1], d.year)


def largo_sin_anio(d):
    return "%d de %s" % (d.day, MESES[d.month - 1])


def horas(x):
    """12.0 -> '12,00'  (coma decimal, como en el plan de la Parte 2)."""
    return ("%.2f" % x).replace(".", ",")


# ═══════════════════════════════════════════════════════════════════════════
#  4. API DE CONSULTA
# ═══════════════════════════════════════════════════════════════════════════

class Etapa:
    def __init__(self, indice, nombre, offset, duracion, horas_):
        self.indice = indice
        self.nombre = nombre
        self.offset = offset
        self.duracion = duracion
        self.horas = horas_
        self.dias = DIAS_HABILES[offset:offset + duracion]
        self.inicio = self.dias[0]
        self.fin = self.dias[-1]

    @property
    def numero(self):
        return self.indice + 1

    @property
    def es_sprint(self):
        return self.indice in IDX_SPRINTS

    @property
    def numero_sprint(self):
        return IDX_SPRINTS.index(self.indice) + 1 if self.es_sprint else None

    def semanas(self):
        return [self.dias[i:i + 5] for i in range(0, len(self.dias), 5)]

    def __repr__(self):
        return "<Etapa %d %s %s→%s %dh>" % (
            self.numero, self.nombre, dm(self.inicio), dm(self.fin), self.horas)


ETAPAS_CALC = [Etapa(i, n, o, d, h) for i, (n, o, d, h) in enumerate(ETAPAS)]
SPRINTS = [ETAPAS_CALC[i] for i in IDX_SPRINTS]
CANT_SPRINTS = len(SPRINTS)
SPRINT_1 = SPRINTS[0]
SPRINT_2 = SPRINTS[1] if CANT_SPRINTS > 1 else SPRINTS[0]


def hitos():
    h = {}
    for s in SPRINTS:
        h[s.inicio] = "Planning S%d" % s.numero_sprint
        h[s.fin] = "Review S%d" % s.numero_sprint
    h[FECHA_ENTREGA_PARTE_2] = "Entrega Parte 2"
    h[FECHA_FIN] = "ENTREGA"
    return h


def hitos_descriptos():
    pares = [(FECHA_ENTREGA_PARTE_2,
              "Entrega de la Parte 2 y segundo parcial; a partir de acá la capacidad "
              "del equipo se dedica por completo a la aplicación móvil")]
    for s in SPRINTS:
        pares.append((s.inicio, "Sprint Planning %d" % s.numero_sprint))
        etiqueta = "Sprint Review y Retrospectiva %d" % s.numero_sprint
        if s.fin == FECHA_TUTORIA_3:
            etiqueta += ", y tercera tutoría con la cátedra"
        pares.append((s.fin, etiqueta))
    pares.append((FECHA_FIN, "Entrega de la aplicación móvil y actividad de testing"))
    pares.sort(key=lambda x: x[0])
    vistos, salida = set(), []
    for f, t in pares:
        if (f, t) in vistos:
            continue
        vistos.add((f, t))
        salida.append((dm(f), t))
    return salida


def semanas_gantt():
    grupos, actual, lunes_actual = [], [], None
    for d in DIAS_HABILES:
        lunes = d - timedelta(days=d.weekday())
        if lunes_actual is None:
            lunes_actual = lunes
        if lunes != lunes_actual:
            grupos.append((lunes_actual, actual))
            actual, lunes_actual = [], lunes
        actual.append(d)
    if actual:
        grupos.append((lunes_actual, actual))

    salida = []
    for i, (_, dias) in enumerate(grupos):
        ini, fin = dias[0], dias[-1]
        if len(dias) <= 2:
            etiqueta = "S%d" % (i + 1)
        elif ini.month == fin.month:
            etiqueta = "Sem %d · %d–%d %s" % (
                i + 1, ini.day, fin.day, MESES[ini.month - 1][:3])
        else:
            etiqueta = "Sem %d · %d %s–%d %s" % (
                i + 1, ini.day, MESES[ini.month - 1][:3],
                fin.day, MESES[fin.month - 1][:3])
        salida.append((etiqueta, dias))
    return salida


# ═══════════════════════════════════════════════════════════════════════════
#  5. PERT — se resuelve por codigo para que la tabla no tenga errores de cuenta
# ═══════════════════════════════════════════════════════════════════════════

class ActividadPert:
    def __init__(self, codigo, idx_etapa, precedentes, to, tm, tp):
        self.codigo = codigo
        self.etapa = ETAPAS_CALC[idx_etapa]
        self.nombre = self.etapa.nombre
        self.precedentes = precedentes
        self.to, self.tm, self.tp = to, tm, tp
        self.te = (to + 4 * tm + tp) / 6.0
        self.varianza = ((tp - to) / 6.0) ** 2
        self.desvio = self.varianza ** 0.5
        self.es = self.ef = self.ls = self.lf = 0.0

    @property
    def holgura(self):
        return self.lf - self.ef

    @property
    def critica(self):
        return abs(self.holgura) < 1e-9

    @property
    def precedentes_txt(self):
        return ", ".join(self.precedentes) if self.precedentes else "—"


def _resolver_pert():
    acts = {c: ActividadPert(c, i, p, to, tm, tp)
            for c, i, p, to, tm, tp in ACTIVIDADES_PERT}
    orden = [c for c, *_ in ACTIVIDADES_PERT]

    # Ida: ES = max(EF de los precedentes)
    for c in orden:
        a = acts[c]
        a.es = max([acts[p].ef for p in a.precedentes], default=0.0)
        a.ef = a.es + a.te

    duracion = max(a.ef for a in acts.values())

    # Vuelta: LF = min(LS de los sucesores); sin sucesores, LF = duracion total
    sucesores = {c: [] for c in orden}
    for c in orden:
        for p in acts[c].precedentes:
            sucesores[p].append(c)

    for c in reversed(orden):
        a = acts[c]
        a.lf = min([acts[s].ls for s in sucesores[c]], default=duracion)
        a.ls = a.lf - a.te

    return [acts[c] for c in orden], duracion


PERT, DURACION_PERT = _resolver_pert()
RUTA_CRITICA = [a for a in PERT if a.critica]
RUTA_CRITICA_TXT = " → ".join(a.codigo for a in RUTA_CRITICA)
VARIANZA_CRITICA = sum(a.varianza for a in RUTA_CRITICA)
DESVIO_CRITICO = VARIANZA_CRITICA ** 0.5


# ═══════════════════════════════════════════════════════════════════════════
#  6. AUTODIAGNOSTICO
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("CRONOGRAMA — PARTE 3: APLICACION MOVIL")
    print("=" * 84)
    print("Inicio ............ %s" % corto(FECHA_INICIO))
    print("Fin / entrega ..... %s" % corto(FECHA_FIN))
    print("Días hábiles ...... %d" % TOTAL_DIAS_HABILES)
    print("Semanas ........... %d" % SEMANAS_PROYECTO)
    print("Capacidad ......... %d x %d h/sem = %d h/sem de equipo"
          % (INTEGRANTES, HORAS_SEMANA_POR_INTEGRANTE, HORAS_SEMANA_EQUIPO))
    print("Horas planificadas  %d h  (capacidad teórica: %d h)"
          % (TOTAL_HORAS, CAPACIDAD_TEORICA))
    if FERIADOS:
        print("Feriados salteados  %s" % ", ".join(dma(f) for f in FERIADOS))
    print()
    print("%-38s %-12s %-12s %6s %6s" % ("ETAPA", "INICIO", "FIN", "DÍAS", "HORAS"))
    print("-" * 84)
    for e in ETAPAS_CALC:
        print("%-38s %-12s %-12s %6d %6d"
              % (e.nombre, corto(e.inicio), corto(e.fin), e.duracion, e.horas))
    print("-" * 84)
    print("%-38s %-12s %-12s %6d %6d"
          % ("TOTAL", dma(FECHA_INICIO), dma(FECHA_FIN),
             TOTAL_DIAS_HABILES, TOTAL_HORAS))
    print()
    for s in SPRINTS:
        print("Sprint móvil %d: %s al %s   (%d días hábiles, %d h)"
              % (s.numero_sprint, corto(s.inicio), corto(s.fin), s.duracion, s.horas))
    print()
    print("Hitos:")
    for f, etiqueta in sorted(hitos().items()):
        print("   %s  %s" % (corto(f), etiqueta))
    print()
    print("PERT")
    print("%-4s %-38s %-8s %6s %6s %6s %6s %6s %6s"
          % ("Act", "Actividad", "Prec.", "te", "ES", "EF", "LS", "LF", "Holg."))
    print("-" * 100)
    for a in PERT:
        print("%-4s %-38s %-8s %6s %6s %6s %6s %6s %6s %s"
              % (a.codigo, a.nombre, a.precedentes_txt, horas(a.te), horas(a.es),
                 horas(a.ef), horas(a.ls), horas(a.lf), horas(a.holgura),
                 "CRÍTICA" if a.critica else ""))
    print()
    print("Duración del proyecto por PERT: %s h" % horas(DURACION_PERT))
    print("Ruta crítica: %s" % RUTA_CRITICA_TXT)
    print("Varianza de la ruta crítica: %s   σ = %s h"
          % (horas(VARIANZA_CRITICA), horas(DESVIO_CRITICO)))
    print()
    ok = TOTAL_HORAS <= CAPACIDAD_TEORICA
    print("[%s] Horas planificadas (%d h) vs capacidad (%d h)."
          % ("OK " if ok else "!! ", TOTAL_HORAS, CAPACIDAD_TEORICA))
    fin_ok = max(off + dur for _, off, dur, _ in ETAPAS) == TOTAL_DIAS_HABILES
    print("[%s] La última etapa termina exactamente el día de la entrega (%s)."
          % ("OK " if fin_ok else "!! ", dma(FECHA_FIN)))
    print("[%s] La entrega cae el 11/11/2026, día de la actividad de testing."
          % ("OK " if FECHA_FIN == date(2026, 11, 11) else "!! "))
