# Diagramas

## Diagramas de secuencia — TP1 Parte 1

Interacción entre el actor, el Sistema (Backend) y la Base de Datos para cada Caso de Uso.
Flechas continuas: solicitudes. Flechas punteadas: respuestas.

| Archivo | Caso de Uso | Req. | Responsable |
|---|---|---|---|
| `DS-1.png` | CU-1 · Matricular alumno | REQ-13 | Gonzalo Cerqueiro |
| `DS-2.png` | CU-2 · Cargar calificaciones | REQ-15 | Gonzalo Cerqueiro |
| `DS-3.png` | CU-3 · Consultar indicadores institucionales | REQ-21 | Gonzalo Cerqueiro |
| `DS-4.png` | CU-4 · Registrar asistencia diaria | REQ-16 | Lautaro Fernández |
| `DS-5.png` | CU-5 · Enviar comunicado a padres | REQ-18 | Lautaro Fernández |
| `DS-6.png` | CU-6 · Gestionar legajo de personal | REQ-19 | Lautaro Fernández |

Se referencian desde
[01-unidad-1/01-parte-1-requerimientos](../../01-unidad-1/01-parte-1-requerimientos/README.md#7-diagramas-de-secuencia).

## Arquitecturas y planificación — Plan de Trabajo

| Archivo | Diagrama | Dónde se usa |
|---|---|---|
| `arq-informacion.png` | Arquitectura de la información: pirámide de sistemas (ESS / MIS / KWS-OAS / TPS) con los requerimientos de cada capa | Plan de trabajo §1.4 · TP1-P1 §4 |
| `arq-software.png` | Arquitectura de software cliente-servidor en capas (*three-tier*), con componentes y conectores | Plan de trabajo §1.7 · TP1-P1 §5 |
| `pert-red.png` | Red PERT del proyecto con ES/EF por actividad y ruta crítica destacada | Plan de trabajo §6.2 |

Generados con `matplotlib`. El diagrama de Gantt no se exporta como imagen: vive como bloque
`mermaid` en el [plan de trabajo](../../00-equipo/plan-de-trabajo.md#diagrama-de-gantt), que
GitHub renderiza, y como tabla de celdas coloreadas en el `.docx` entregado a la cátedra.

## Pendientes

- DER del Sistema de Gestión (matrícula, cursos, materias, notas, asistencia, personal,
  deportes, transporte y comedor).
