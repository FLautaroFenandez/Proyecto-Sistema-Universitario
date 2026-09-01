# -*- coding: utf-8 -*-
"""
Cronograma del Plan de Trabajo — Metodología de Sistemas II (UTN FRRe, TUP 2026)

ESTE ES EL UNICO ARCHIVO QUE HAY QUE TOCAR SI CAMBIAN LAS FECHAS DE ENTREGA.

Todo el resto (tabla de cronograma, diagrama de Gantt, plan de sprint, fechas de
los objetivos SMART, hitos de Scrum) se deriva de las constantes de abajo.
Despues de editar, regenerar el documento con:

    python plan_docx.py <carpeta_diagramas> <salida.docx>

El calculo trabaja siempre en DIAS HABILES: las etapas se ubican por su posicion
en la lista de dias habiles, no por fecha absoluta. Por eso, al mover FECHA_INICIO
o al agregar feriados, todo el cronograma se recalcula solo y sigue siendo coherente.
"""

from datetime import date, timedelta

# ═══════════════════════════════════════════════════════════════════════════
#  1. PARAMETROS EDITABLES
# ═══════════════════════════════════════════════════════════════════════════

# Primer dia habil del proyecto.
FECHA_INICIO = date(2026, 9, 1)           # martes 1 de septiembre de 2026

# Capacidad del equipo.
INTEGRANTES = 2
HORAS_SEMANA_POR_INTEGRANTE = 6

# Feriados que caen en dias habiles y NO se trabajan.
FERIADOS = [
    date(2026, 10, 12),   # Dia del Respeto a la Diversidad Cultural (lunes)
]

# Etapas del proyecto.
#   (nombre, offset en dias habiles desde el inicio, duracion en dias habiles, horas de equipo)
# El offset 0 es FECHA_INICIO. Las etapas pueden solaparse: es intencional
# (marco de trabajo iterativo).
ETAPAS = [
    ("Planificación del proyecto",    0,  4,  6),
    ("Estudio de requerimientos",     1,  8, 12),
    ("Modelado",                      5,  8, 10),
    ("Diseño",                        7,  8,  8),
    ("Codificación — Sprint 1",      10, 10, 16),
    ("Codificación — Sprint 2",      20, 10, 16),
    ("Codificación — Sprint 3",      30, 10, 14),
    ("Pruebas",                      32,  6,  8),
    ("Implementación o despliegue",  36,  4,  6),
]

# Indices (dentro de ETAPAS) de las etapas que son sprints de Scrum.
IDX_SPRINTS = [4, 5, 6]

# Dias de gracia entre el fin del proyecto y la tutoria/presentacion.
DIAS_HASTA_TUTORIA = 1

# ═══════════════════════════════════════════════════════════════════════════
#  2. CALENDARIO DE DIAS HABILES
# ═══════════════════════════════════════════════════════════════════════════

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
DIA_SEM = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]


def _es_habil(d):
    return d.weekday() < 5 and d not in FERIADOS


def _construir_calendario():
    """Lista de dias habiles que cubre todas las etapas definidas."""
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
SEMANAS_PROYECTO = -(-TOTAL_DIAS_HABILES // 5)   # division entera hacia arriba
CAPACIDAD_TEORICA = HORAS_SEMANA_EQUIPO * SEMANAS_PROYECTO


def fecha_tutoria():
    """Primer dia habil despues del cierre del proyecto."""
    d = FECHA_FIN + timedelta(days=1)
    while not _es_habil(d):
        d += timedelta(days=1)
    for _ in range(DIAS_HASTA_TUTORIA - 1):
        d += timedelta(days=1)
        while not _es_habil(d):
            d += timedelta(days=1)
    return d


FECHA_TUTORIA = fecha_tutoria()

# ═══════════════════════════════════════════════════════════════════════════
#  3. FORMATEO
# ═══════════════════════════════════════════════════════════════════════════

_PALABRAS = {1: "una", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
             6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez"}


def en_palabras(n):
    """5 -> 'cinco'. Para que la prosa del documento no quede con numeros sueltos."""
    return _PALABRAS.get(n, str(n))


def dm(d):
    """01/09"""
    return "%02d/%02d" % (d.day, d.month)


def dma(d):
    """01/09/2026"""
    return "%02d/%02d/%d" % (d.day, d.month, d.year)


def corto(d):
    """mar 01/09"""
    return "%s %s" % (DIA_SEM[d.weekday()], dm(d))


def largo(d):
    """1 de septiembre de 2026"""
    return "%d de %s de %d" % (d.day, MESES[d.month - 1], d.year)


def largo_sin_anio(d):
    """1 de septiembre"""
    return "%d de %s" % (d.day, MESES[d.month - 1])


# ═══════════════════════════════════════════════════════════════════════════
#  4. API DE CONSULTA
# ═══════════════════════════════════════════════════════════════════════════

class Etapa:
    def __init__(self, indice, nombre, offset, duracion, horas):
        self.indice = indice
        self.nombre = nombre
        self.offset = offset
        self.duracion = duracion
        self.horas = horas
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
        """Parte los dias del sprint en bloques de 5 dias habiles."""
        return [self.dias[i:i + 5] for i in range(0, len(self.dias), 5)]

    def __repr__(self):
        return "<Etapa %d %s %s→%s %dh>" % (
            self.numero, self.nombre, dm(self.inicio), dm(self.fin), self.horas)


ETAPAS_CALC = [Etapa(i, n, o, d, h) for i, (n, o, d, h) in enumerate(ETAPAS)]
SPRINTS = [ETAPAS_CALC[i] for i in IDX_SPRINTS]
CANT_SPRINTS = len(SPRINTS)

# Compatibilidad con el codigo que referencia sprints por nombre
SPRINT_1 = SPRINTS[0]
SPRINT_2 = SPRINTS[1] if CANT_SPRINTS > 1 else SPRINTS[0]
SPRINT_3 = SPRINTS[2] if CANT_SPRINTS > 2 else SPRINTS[-1]


def hitos():
    """Hitos de Scrum y entrega: {fecha: etiqueta}."""
    h = {}
    for s in SPRINTS:
        h[s.inicio] = "Planning S%d" % s.numero_sprint
        h[s.fin] = "Review S%d" % s.numero_sprint
    h[FECHA_FIN] = "ENTREGA"
    return h


def hitos_descriptos():
    """Texto de la linea de referencias del Gantt, en orden cronologico."""
    pares = []
    for s in SPRINTS:
        pares.append((s.inicio, "Sprint Planning %d" % s.numero_sprint))
        etiqueta = "Sprint Review y Retrospectiva %d" % s.numero_sprint
        if s.fin == FECHA_FIN:
            etiqueta += ", y entrega final"
        pares.append((s.fin, etiqueta))
    if all(s.fin != FECHA_FIN for s in SPRINTS):
        pares.append((FECHA_FIN, "Entrega final"))
    pares.sort(key=lambda x: x[0])
    return [(dm(f), t) for f, t in pares]


def semanas_gantt():
    """
    Agrupa los dias habiles en semanas calendario para el encabezado del Gantt.
    Devuelve [(etiqueta_semana, [date, ...]), ...]
    """
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
#  5. AUTODIAGNOSTICO
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("CRONOGRAMA DEL PROYECTO")
    print("=" * 80)
    print("Inicio ............ %s" % corto(FECHA_INICIO))
    print("Fin / entrega ..... %s" % corto(FECHA_FIN))
    print("Días hábiles ...... %d" % TOTAL_DIAS_HABILES)
    print("Semanas ........... %d" % SEMANAS_PROYECTO)
    print("Capacidad ......... %d integrantes x %d h/sem = %d h/sem de equipo"
          % (INTEGRANTES, HORAS_SEMANA_POR_INTEGRANTE, HORAS_SEMANA_EQUIPO))
    print("Horas planificadas  %d h  (capacidad teórica: %d h)"
          % (TOTAL_HORAS, CAPACIDAD_TEORICA))
    if FERIADOS:
        print("Feriados salteados  %s" % ", ".join(dma(f) for f in FERIADOS))
    print()
    print("%-32s %-12s %-12s %6s %6s" % ("ETAPA", "INICIO", "FIN", "DÍAS", "HORAS"))
    print("-" * 80)
    for e in ETAPAS_CALC:
        print("%-32s %-12s %-12s %6d %6d"
              % (e.nombre, corto(e.inicio), corto(e.fin), e.duracion, e.horas))
    print("-" * 80)
    print("%-32s %-12s %-12s %6d %6d"
          % ("TOTAL", dma(FECHA_INICIO), dma(FECHA_FIN),
             TOTAL_DIAS_HABILES, TOTAL_HORAS))
    print()
    for s in SPRINTS:
        sem = s.semanas()
        print("Sprint %d: %s al %s   (%d días hábiles, %d semanas, %d h)"
              % (s.numero_sprint, corto(s.inicio), corto(s.fin),
                 s.duracion, len(sem), s.horas))
    print()
    print("Hitos:")
    for f, etiqueta in sorted(hitos().items()):
        print("   %s  %s" % (corto(f), etiqueta))
    print()
    print("Semanas del Gantt (%d columnas de día):" % TOTAL_DIAS_HABILES)
    for etiqueta, dias in semanas_gantt():
        print("   %-22s %s" % (etiqueta, " ".join(str(d.day) for d in dias)))

    print()
    ok = TOTAL_HORAS <= CAPACIDAD_TEORICA
    print("[%s] Horas planificadas (%d h) vs capacidad (%d h)."
          % ("OK " if ok else "!! ", TOTAL_HORAS, CAPACIDAD_TEORICA))
    fin_ok = max(off + dur for _, off, dur, _ in ETAPAS) == TOTAL_DIAS_HABILES
    print("[%s] La última etapa termina exactamente el día de la entrega."
          % ("OK " if fin_ok else "!! "))
