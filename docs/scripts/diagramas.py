# -*- coding: utf-8 -*-
"""Genera los diagramas del Plan de Trabajo - Metodologia de Sistemas II."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os, sys

OUT = sys.argv[1]
plt.rcParams["font.family"] = "DejaVu Sans"

AZUL = "#2E5C8A"
GRIS = "#5A5A5A"
GRIS_C = "#EDEDED"
ROJO = "#B03A2E"
ROJO_C = "#F6DDD9"
VERDE = "#1E7A5A"


def caja(ax, x, y, w, h, texto, fc, ec, fs=8.5, weight="normal", tc="#1A1A1A"):
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                boxstyle="round,pad=0.012,rounding_size=0.02",
                                facecolor=fc, edgecolor=ec, linewidth=1.4))
    ax.text(x + w / 2, y + h / 2, texto, ha="center", va="center",
            fontsize=fs, color=tc, fontweight=weight, linespacing=1.45)


# ------------------------------------------------- 1. ARQUITECTURA DE LA INFORMACIÓN
fig, ax = plt.subplots(figsize=(8.2, 5.4))
ax.set_xlim(0, 10)
ax.set_ylim(0, 7.2)
ax.axis("off")

capas = [
    (5.85, 1.05, 3.10, "SISTEMAS ESTRATÉGICOS  (ESS)",
     "Reportes institucionales para la Autoridad",
     "REQ-21", "#1F4E79", "#D4E3F0"),
    (4.65, 1.10, 4.60, "SISTEMAS ADMINISTRATIVOS  (MIS)",
     "Gestión de personal y postulaciones laborales",
     "REQ-19  -  REQ-20", "#2E5C8A", "#DCE7F2"),
    (3.40, 1.15, 6.20, "SISTEMAS DE CONOCIMIENTO  (KWS / OAS)",
     "Boletines, constancias y comunicaciones internas",
     "REQ-17  -  REQ-18", "#3D7AB8", "#E4EEF7"),
    (2.05, 1.25, 7.90, "SISTEMAS OPERATIVOS  (TPS)",
     "Matrícula, cursos y materias, calificaciones,\nasistencia y auditoría",
     "REQ-13  -  REQ-14  -  REQ-15  -  REQ-16  -  REQ-22", "#5B9BD5", "#EDF3FA"),
]
for y, h, w, titulo, desc, reqs, ec, fc in capas:
    x = (10 - w) / 2
    ax.add_patch(FancyBboxPatch((x, y), w, h,
                                boxstyle="round,pad=0.02,rounding_size=0.04",
                                facecolor=fc, edgecolor=ec, linewidth=1.6))
    ax.text(5, y + h - 0.26, titulo, ha="center", va="center", fontsize=8.6,
            fontweight="bold", color=ec)
    ax.text(5, y + h / 2 - 0.06, desc, ha="center", va="center", fontsize=7.6,
            color="#1A1A1A", linespacing=1.35)
    ax.text(5, y + 0.19, reqs, ha="center", va="center", fontsize=7.0,
            color=ec, fontweight="bold", style="italic")

ax.annotate("", xy=(0.62, 6.55), xytext=(0.62, 2.15),
            arrowprops=dict(arrowstyle="-|>", color=GRIS, lw=1.5))
ax.text(0.34, 4.35, "Nivel de decisión", rotation=90, ha="center", va="center",
        fontsize=7.4, color=GRIS, fontweight="bold")
ax.annotate("", xy=(9.38, 2.15), xytext=(9.38, 6.55),
            arrowprops=dict(arrowstyle="-|>", color=VERDE, lw=1.5))
ax.text(9.66, 4.35, "Volumen de datos", rotation=270, ha="center", va="center",
        fontsize=7.4, color=VERDE, fontweight="bold")

ax.text(5, 1.55,
        "La información se genera una sola vez en el nivel operativo y se reutiliza\n"
        "—filtrada, condensada y analizada— en los niveles superiores.",
        ha="center", va="top", fontsize=7.2, color=GRIS, style="italic",
        linespacing=1.4)
ax.text(5, 6.95, "ARQUITECTURA DE LA INFORMACIÓN", ha="center", va="center",
        fontsize=10.5, fontweight="bold", color="#1A1A1A")
plt.tight_layout()
fig.savefig(os.path.join(OUT, "arq-informacion.png"), dpi=200,
            bbox_inches="tight", facecolor="white")
plt.close(fig)

# ------------------------------------------------- 2. ARQUITECTURA DE SOFTWARE
fig, ax = plt.subplots(figsize=(8.6, 6.4))
ax.set_xlim(0, 10)
ax.set_ylim(0, 8.4)
ax.axis("off")
ax.text(5, 8.15,
        "ARQUITECTURA DE SOFTWARE - CLIENTE-SERVIDOR EN CAPAS (THREE-TIER)",
        ha="center", va="center", fontsize=9.6, fontweight="bold", color="#1A1A1A")

caja(ax, 0.55, 6.20, 8.90, 1.42, "", "#EDF3FA", AZUL)
ax.text(0.80, 7.42, "CAPA DE PRESENTACIÓN", fontsize=8.4, fontweight="bold",
        color=AZUL, va="center")
ax.text(9.20, 7.42, "React 18 + Vite  -  Tailwind  -  Netlify", fontsize=7.2,
        color=GRIS, va="center", ha="right", style="italic")
roles = ["Administrador", "Autoridad", "Docente", "Personal", "Padre", "Estudiante"]
for i, r in enumerate(roles):
    caja(ax, 0.80 + i * 1.44, 6.42, 1.30, 0.72, r, "white", AZUL, fs=6.9)

ax.annotate("", xy=(5, 5.62), xytext=(5, 6.18),
            arrowprops=dict(arrowstyle="<|-|>", color=GRIS, lw=1.5))
ax.text(5.18, 5.90, "HTTPS   -   JSON   -   JWT", fontsize=7.0, color=GRIS,
        va="center", fontweight="bold")

caja(ax, 0.55, 3.85, 8.90, 1.70, "", "#E8F1EB", VERDE)
ax.text(0.80, 5.34, "CAPA DE APLICACIÓN / LÓGICA DE NEGOCIO", fontsize=8.4,
        fontweight="bold", color=VERDE, va="center")
ax.text(9.20, 5.34, "Supabase (BaaS)", fontsize=7.2, color=GRIS, va="center",
        ha="right", style="italic")
comps = ["Autenticación\ny sesión", "Autorización\npor rol", "Reglas de\nnegocio",
         "API REST\nautomática", "Storage de\narchivos", "Registro de\nauditoría"]
for i, c in enumerate(comps):
    caja(ax, 0.80 + i * 1.44, 4.05, 1.30, 1.02, c, "white", VERDE, fs=6.6)

ax.annotate("", xy=(5, 3.27), xytext=(5, 3.83),
            arrowprops=dict(arrowstyle="<|-|>", color=GRIS, lw=1.5))
ax.text(5.18, 3.55, "SQL   -   Row Level Security", fontsize=7.0, color=GRIS,
        va="center", fontweight="bold")

caja(ax, 0.55, 1.50, 8.90, 1.70, "", "#F6EFE4", "#A6741F")
ax.text(0.80, 2.99, "CAPA DE DATOS", fontsize=8.4, fontweight="bold",
        color="#A6741F", va="center")
ax.text(9.20, 2.99, "PostgreSQL con RLS", fontsize=7.2, color=GRIS, va="center",
        ha="right", style="italic")
datos = ["Matrícula y\nlegajos", "Cursos y\nmaterias", "Calificaciones",
         "Asistencia", "Personal y\npostulaciones", "Auditoría"]
for i, d in enumerate(datos):
    caja(ax, 0.80 + i * 1.44, 1.70, 1.30, 1.02, d, "white", "#A6741F", fs=6.6)

caja(ax, 0.55, 0.42, 8.90, 0.82,
     "CAPA DE INFRAESTRUCTURA        Hosting, red y seguridad de transporte (HTTPS)"
     "        Servicios cloud: Netlify + Supabase",
     GRIS_C, GRIS, fs=7.2, weight="bold", tc=GRIS)
plt.tight_layout()
fig.savefig(os.path.join(OUT, "arq-software.png"), dpi=200,
            bbox_inches="tight", facecolor="white")
plt.close(fig)

# ------------------------------------------------- 3. RED PERT
fig, ax = plt.subplots(figsize=(10.4, 4.6))
ax.set_xlim(0, 13.2)
ax.set_ylim(0, 5.8)
ax.axis("off")
ax.text(6.6, 5.55,
        "DIAGRAMA DE PERT - RED DE ACTIVIDADES (ruta crítica en rojo)",
        ha="center", va="center", fontsize=10, fontweight="bold", color="#1A1A1A")

nodos = {
    "A": ("Planificación",   6.00,  0.00,  6.00,  0.20, 2.55, True),
    "B": ("Requerimientos", 12.00,  6.00, 18.00,  1.80, 2.55, True),
    "C": ("Modelado",       10.00, 18.00, 28.00,  3.40, 3.72, True),
    "D": ("Diseño",          8.00, 18.00, 26.00,  3.40, 1.38, False),
    "E": ("Codif. Sprint 1",16.00, 28.00, 44.00,  5.00, 2.55, True),
    "F": ("Codif. Sprint 2",16.00, 44.00, 60.00,  6.60, 2.55, True),
    "G": ("Codif. Sprint 3",14.00, 60.00, 74.00,  8.20, 2.55, True),
    "H": ("Pruebas",         8.00, 74.00, 82.00,  9.80, 2.55, True),
    "I": ("Despliegue",      6.00, 82.00, 88.00, 11.40, 2.55, True),
}
W, H = 1.52, 1.16
for k, (lbl, te, es, ef, x, y, crit) in nodos.items():
    fc, ec = (ROJO_C, ROJO) if crit else (GRIS_C, GRIS)
    ax.add_patch(FancyBboxPatch((x, y), W, H,
                                boxstyle="round,pad=0.01,rounding_size=0.05",
                                facecolor=fc, edgecolor=ec, linewidth=1.8))
    ax.plot([x, x + W], [y + H - 0.30, y + H - 0.30], color=ec, lw=0.9)
    ax.plot([x, x + W], [y + 0.30, y + 0.30], color=ec, lw=0.9)
    ax.text(x + 0.16, y + H - 0.15, "ES %.2f" % es, fontsize=6.1, color=ec,
            va="center")
    ax.text(x + W - 0.16, y + H - 0.15, "EF %.2f" % ef, fontsize=6.1, color=ec,
            va="center", ha="right")
    ax.text(x + W / 2, y + H / 2 + 0.10, k, fontsize=10.5, fontweight="bold",
            color="#1A1A1A", ha="center", va="center")
    ax.text(x + W / 2, y + H / 2 - 0.19, lbl, fontsize=6.3, color="#1A1A1A",
            ha="center", va="center")
    ax.text(x + W / 2, y + 0.15, "te = %.2f hs" % te, fontsize=6.4,
            fontweight="bold", color=ec, ha="center", va="center")


def flecha(a, b, crit):
    xa, ya = nodos[a][4] + W, nodos[a][5] + H / 2
    xb, yb = nodos[b][4], nodos[b][5] + H / 2
    col = ROJO if crit else GRIS
    rad = 0 if abs(ya - yb) < 0.05 else 0.16
    ax.add_patch(FancyArrowPatch((xa, ya), (xb, yb), arrowstyle="-|>",
                                 mutation_scale=13, color=col,
                                 lw=2.0 if crit else 1.3,
                                 connectionstyle="arc3,rad=%s" % rad))


for a, b, c in [("A", "B", True), ("B", "C", True), ("B", "D", False),
                ("C", "E", True), ("D", "E", False), ("E", "F", True),
                ("F", "G", True), ("G", "H", True), ("H", "I", True)]:
    flecha(a, b, c)

ax.text(4.15, 0.98, "holgura 2,00 hs", fontsize=6.6, color=GRIS, style="italic",
        ha="center", fontweight="bold")
ax.text(0.35, 0.52,
        "Ruta crítica:  A - B - C - E - F - G - H - I  =  88,00 hs          "
        "Desvío estándar = 2,75 hs          Esfuerzo total estimado: 96,00 hs",
        fontsize=7.8, color="#1A1A1A", va="center", fontweight="bold")
ax.text(0.35, 0.14,
        "ES = inicio temprano    EF = fin temprano    "
        "te = duración esperada = (to + 4.tm + tp) / 6",
        fontsize=6.6, color=GRIS, va="center", style="italic")
plt.tight_layout()
fig.savefig(os.path.join(OUT, "pert-red.png"), dpi=200, bbox_inches="tight",
            facecolor="white")
plt.close(fig)

print("OK - 3 diagramas generados en", OUT)
