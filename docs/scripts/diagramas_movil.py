# -*- coding: utf-8 -*-
"""
Diagramas del Plan de Trabajo — PARTE 3 (aplicacion movil).
Genera dos PNG: la arquitectura de integracion web/movil y la red de PERT.

    python diagramas_movil.py ../recursos/diagramas

Los valores del PERT se leen de cronograma_movil.py: no hay numeros a mano.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os, sys

import cronograma_movil as C

OUT = sys.argv[1]
plt.rcParams["font.family"] = "DejaVu Sans"

AZUL = "#2E5C8A"
AZUL_O = "#1F4E79"
GRIS = "#5A5A5A"
GRIS_C = "#EDEDED"
ROJO = "#B03A2E"
ROJO_C = "#F6DDD9"
VERDE = "#1E7A5A"
NARANJA = "#C2551F"
NARANJA_C = "#FBE7DC"


# ══════════════════════════════════════════ 1. ARQUITECTURA DE INTEGRACIÓN
fig, ax = plt.subplots(figsize=(9.0, 5.8))
ax.set_xlim(0, 10)
ax.set_ylim(0, 7.6)
ax.axis("off")

ax.text(5, 7.35, "INTEGRACIÓN DE LA APLICACIÓN MÓVIL CON EL SISTEMA EXISTENTE",
        ha="center", va="center", fontsize=10, fontweight="bold", color="#1A1A1A")


def bloque(x, y, w, h, titulo, detalle, ec, fc, nota=None):
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                boxstyle="round,pad=0.02,rounding_size=0.05",
                                facecolor=fc, edgecolor=ec, linewidth=1.7))
    ax.text(x + w / 2, y + h - 0.30, titulo, ha="center", va="center",
            fontsize=8.6, fontweight="bold", color=ec)
    ax.text(x + w / 2, y + h / 2 - 0.16, detalle, ha="center", va="center",
            fontsize=7.3, color="#1A1A1A", linespacing=1.45)
    if nota:
        ax.text(x + w / 2, y + 0.20, nota, ha="center", va="center",
                fontsize=6.8, color=ec, fontweight="bold", style="italic")


# Capa de clientes
bloque(0.25, 5.45, 4.55, 1.55, "APLICACIÓN WEB  ·  ya desplegada",
       "React 18 + Vite  ·  Netlify\nSitio institucional, panel de administración\n"
       "y Sistema de Gestión (Partes 1 y 2)",
       AZUL_O, "#DCE7F2", "Se amplía: reportes de ingresos y cobranzas")

bloque(5.20, 5.45, 4.55, 1.55, "APLICACIÓN MÓVIL  ·  nueva",
       "React Native + Expo\nCuotas, comprobantes, deportes,\ntransporte y comedor",
       NARANJA, NARANJA_C, "Parte 3 — desarrollo asistido por IA")

# Capa de servicios
bloque(0.25, 3.15, 9.50, 1.85, "SUPABASE  ·  capa de servicios compartida",
       "Auth con JWT y roles      ·      API REST generada automáticamente\n"
       "Storage (comprobantes de pago)      ·      Edge Function de envío de correos",
       AZUL, "#E4EEF7",
       "La app móvil consume los MISMOS servicios: no se crea un backend paralelo")

# Capa de datos
bloque(0.25, 0.85, 9.50, 1.85, "POSTGRESQL CON ROW LEVEL SECURITY  ·  base única",
       "Existentes:  profiles · alumnos · alumno_tutor · matrículas · cursos · materias\n"
       "Nuevas (Parte 3):  cuotas · facturas · comprobantes · inscripciones a servicios",
       VERDE, "#E3F0EA",
       "Las políticas RLS ya escritas valen para los dos clientes")

# Flechas
for x0 in (2.5, 7.5):
    ax.add_patch(FancyArrowPatch((x0, 5.40), (x0, 5.05), arrowstyle="<|-|>",
                                 mutation_scale=12, color=GRIS, lw=1.6))
ax.add_patch(FancyArrowPatch((5.0, 3.10), (5.0, 2.75), arrowstyle="<|-|>",
                             mutation_scale=12, color=GRIS, lw=1.6))

ax.text(2.32, 5.22, "HTTPS", fontsize=6.6, color=GRIS, ha="right", va="center",
        style="italic")
ax.text(7.68, 5.22, "HTTPS", fontsize=6.6, color=GRIS, ha="left", va="center",
        style="italic")
ax.text(5.20, 2.92, "SQL", fontsize=6.6, color=GRIS, ha="left", va="center",
        style="italic")

ax.text(5, 0.42,
        "Un solo origen de datos y un solo juego de permisos: la información no se "
        "duplica y no puede quedar inconsistente entre la web y el teléfono.",
        ha="center", va="center", fontsize=7.2, color=GRIS, style="italic")

plt.tight_layout()
fig.savefig(os.path.join(OUT, "arq-movil.png"), dpi=200, bbox_inches="tight",
            facecolor="white")
plt.close(fig)


# ══════════════════════════════════════════ 2. RED DE PERT
fig, ax = plt.subplots(figsize=(10.4, 4.9))
ax.set_xlim(0, 11.6)
ax.set_ylim(0, 5.6)
ax.axis("off")
ax.text(5.8, 5.38, "DIAGRAMA DE PERT — RED DE ACTIVIDADES (ruta crítica en rojo)",
        ha="center", va="center", fontsize=10, fontweight="bold", color="#1A1A1A")

ETIQUETAS = {
    "A": "Planificación", "B": "Requerimientos", "C": "Modelado",
    "D": "Diseño",        "E": "Sprint móvil 1", "F": "Sprint móvil 2",
    "G": "Integración",   "H": "Pruebas",        "I": "Bitácora de IA",
}
POS = {
    "A": (0.20, 3.45), "B": (1.80, 3.45), "C": (3.40, 3.45),
    "E": (5.00, 3.45), "F": (6.60, 3.45), "G": (8.20, 3.45), "H": (9.80, 3.45),
    "D": (3.40, 1.95), "I": (1.80, 1.95),
}
W, H = 1.52, 1.16
ACT = {a.codigo: a for a in C.PERT}

for cod, (x, y) in POS.items():
    a = ACT[cod]
    fc, ec = (ROJO_C, ROJO) if a.critica else (GRIS_C, GRIS)
    ax.add_patch(FancyBboxPatch((x, y), W, H,
                                boxstyle="round,pad=0.01,rounding_size=0.05",
                                facecolor=fc, edgecolor=ec, linewidth=1.8))
    ax.plot([x, x + W], [y + H - 0.30, y + H - 0.30], color=ec, lw=0.9)
    ax.plot([x, x + W], [y + 0.30, y + 0.30], color=ec, lw=0.9)
    ax.text(x + 0.16, y + H - 0.15, "ES %.2f" % a.es, fontsize=6.1, color=ec, va="center")
    ax.text(x + W - 0.16, y + H - 0.15, "EF %.2f" % a.ef, fontsize=6.1, color=ec,
            va="center", ha="right")
    ax.text(x + W / 2, y + H / 2 + 0.10, cod, fontsize=10.5, fontweight="bold",
            color="#1A1A1A", ha="center", va="center")
    ax.text(x + W / 2, y + H / 2 - 0.19, ETIQUETAS[cod], fontsize=6.3,
            color="#1A1A1A", ha="center", va="center")
    ax.text(x + W / 2, y + 0.15, "te = %.2f hs" % a.te, fontsize=6.4,
            fontweight="bold", color=ec, ha="center", va="center")


def flecha(a, b):
    crit = ACT[a].critica and ACT[b].critica
    xa, ya = POS[a][0] + W, POS[a][1] + H / 2
    xb, yb = POS[b][0], POS[b][1] + H / 2
    col = ROJO if crit else GRIS
    rad = 0 if abs(ya - yb) < 0.05 else 0.18
    ax.add_patch(FancyArrowPatch((xa, ya), (xb, yb), arrowstyle="-|>",
                                 mutation_scale=13, color=col,
                                 lw=2.0 if crit else 1.3,
                                 connectionstyle="arc3,rad=%s" % rad))


for destino, act in ACT.items():
    for origen in act.precedentes:
        flecha(origen, destino)

for cod in ("I", "D"):
    x, y = POS[cod]
    ax.text(x + W / 2, y - 0.22, "holgura %s hs" % C.horas(ACT[cod].holgura),
            fontsize=6.6, color=GRIS, style="italic", ha="center",
            va="center", fontweight="bold")

ax.text(0.25, 1.15,
        "Ruta crítica:  %s  =  %s hs          Desvío estándar = %s hs          "
        "Esfuerzo total planificado: %d hs"
        % (C.RUTA_CRITICA_TXT.replace("→", "-"), C.horas(C.DURACION_PERT),
           C.horas(C.DESVIO_CRITICO), C.TOTAL_HORAS),
        fontsize=7.8, color="#1A1A1A", va="center", fontweight="bold")
ax.text(0.25, 0.72,
        "ES = inicio temprano    EF = fin temprano    "
        "te = duración esperada = (to + 4·tm + tp) / 6",
        fontsize=6.6, color=GRIS, va="center", style="italic")
ax.text(0.25, 0.32,
        "La bitácora de IA (I) acompaña todo el proyecto: su holgura es alta porque "
        "no bloquea a ninguna otra actividad, pero sí es entregable el 17/11.",
        fontsize=6.6, color=GRIS, va="center", style="italic")

plt.tight_layout()
fig.savefig(os.path.join(OUT, "pert-movil.png"), dpi=200, bbox_inches="tight",
            facecolor="white")
plt.close(fig)

print("OK - 2 diagramas generados en", OUT)
