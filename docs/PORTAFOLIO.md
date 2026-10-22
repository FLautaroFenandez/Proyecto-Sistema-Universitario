# Portafolio Digital — Metodología de Sistemas II

**Proyecto:** Automatización de la gestión del Centro Educativo *"Educar para Transformar"*
**Materia:** Metodología de Sistemas II — UTN FRRe · TUP 2026
**Equipo:** Cerqueiro, Gonzalo · Fernández, Lautaro

Este documento describe cómo está organizado el portafolio digital del equipo dentro de este
repositorio. La documentación se ordena por **etapas** (unidad y parte), de modo que recorriendo
las carpetas se pueda seguir la evolución del proyecto a lo largo del cuatrimestre.

---

## Estructura del repositorio

```text
Proyecto-Sistema-Universitario/
│
├── README.md                  <- Presentación del proyecto e índice general
│
├── docs/                      <- PORTAFOLIO DIGITAL (documentación de todas las etapas)
│   ├── PORTAFOLIO.md          <- Este archivo
│   │
│   ├── 00-equipo/
│   │   ├── integrantes.md
│   │   └── plan-de-trabajo.md
│   │
│   ├── 01-unidad-1/
│   │   ├── README.md          <- Objetivos y resumen de la unidad
│   │   ├── 01-parte-1-requerimientos/   (requerimientos, HU, casos de uso, diagramas)
│   │   ├── 02-parte-2-repositorios/     (conceptos, arquitecturas, portafolio)
│   │   └── 03-backlog-y-sprints/        (backlog del producto y planificación)
│   │
│   ├── 02-unidad-2/           <- Misma estructura por partes
│   ├── 03-unidad-3/
│   │
│   ├── entregas/              <- Documentos finales presentados a la cátedra
│   └── recursos/
│       ├── diagramas/         <- Diagramas de secuencia, casos de uso, DER
│       └── imagenes/          <- Capturas de pantalla y bocetos
│
├── src/                       <- Código fuente del proyecto
│   ├── web/                   <- Parte 1: página web institucional
│   ├── gestion/               <- Parte 2: sistema de gestión
│   └── app/                   <- Parte 3: aplicación móvil
│
├── database/                  <- Scripts de base de datos y políticas de seguridad
│
└── .github/
    └── workflows/             <- Pipelines de automatización (CI/CD)
```

> **Estado actual del código.** La división `src/web`, `src/gestion` y `src/app` es el estado
> objetivo del repositorio al completar las tres partes del proyecto. Hoy el código de la
> Parte 1 vive directamente en `src/` (sin el prefijo `web/`) y los scripts de base de datos
> en `docs/*.sql`. La migración a esa estructura se hará en un commit propio de `refactor:`
> cuando arranque la Parte 3, para no romper el build de Vite en medio de un sprint.

---

## Criterio de organización

| Carpeta | Qué contiene |
|---|---|
| `README.md` (raíz) | Puerta de entrada del repositorio: descripción del proyecto, integrantes, tecnologías y enlaces al portafolio. |
| `docs/` | Portafolio digital. GitHub renderiza el Markdown, por lo que todo se lee desde el navegador sin descargar archivos. |
| `docs/00-equipo/` | Información transversal al cuatrimestre: integrantes, roles y plan de trabajo. |
| `docs/0X-unidad-X/` | Una carpeta por unidad y una subcarpeta numerada por cada parte o entrega. La numeración con ceros mantiene el orden cronológico. |
| `docs/entregas/` | Versión final de cada trabajo presentado, separada de los documentos de trabajo. |
| `docs/recursos/` | Imágenes y diagramas centralizados, referenciados desde cualquier documento sin duplicar archivos. |
| `src/` | Código fuente dividido según las tres partes del proyecto. |
| `database/` | Scripts de tablas y políticas de seguridad por rol. |
| `.github/workflows/` | Definición de los pipelines de automatización. |

### Por qué el portafolio está en Markdown y no en `.docx`

Los documentos se redactan en Word para entregarlos a la cátedra, pero al repositorio sube su
**conversión a Markdown**. Los `.docx`, `.pdf` y `.html` de trabajo están en `.gitignore` por
tres razones:

1. **Se leen desde el navegador.** GitHub renderiza Markdown; un `.docx` hay que descargarlo.
2. **Se versionan línea por línea.** Un `.docx` es un binario: `git diff` no muestra qué
   cambió entre dos versiones de un documento; el Markdown sí.
3. **No inflan el repositorio.** Cada guardado de un binario suma una copia completa al
   historial.

Los archivos originales quedan en la carpeta local de la cursada, fuera del control de versiones.

---

## Índice de etapas

| Etapa | Contenido | Estado |
|---|---|---|
| [Unidad 1 — Parte 1](01-unidad-1/01-parte-1-requerimientos/README.md) | Requerimientos, clasificación del SI, arquitecturas, Historias de Usuario, Casos de Uso y Diagramas de Secuencia | ✅ Entregado |
| [Unidad 1 — Parte 2](01-unidad-1/02-parte-2-repositorios/README.md) | Repositorios de software: conceptos, arquitecturas y portafolio digital | ✅ Entregado |
| [Unidad 1 — Backlog](01-unidad-1/03-backlog-y-sprints/README.md) | Backlog del producto y planificación de los Sprints 1 y 2 | ✅ Entregado |
| [Unidad 2 — Modelado](02-unidad-2/01-modelado/README.md) | Modelo de datos del Sistema de Gestión: DER, reglas del enunciado y políticas RLS | ✅ Entregado |
| [Unidad 2 — Sprint 1](02-unidad-2/02-modulo-administrador/README.md) | Módulo Administrador: matrícula y legajo (HU1), cursos y materias (REQ-14), patrón Facade | ✅ Entregado |
| [Unidad 2 — Cierre Sprint 1](02-unidad-2/03-cierre-sprint-1/README.md) | Sprint Review, Retrospectiva y deuda técnica registrada | ✅ Entregado |
| Unidad 2 — Sprint 2 | Calificaciones, legajo de personal y patrón State | ⏳ En curso |
| Unidad 3 | Buenas prácticas en el proceso de implementación | ⏳ Pendiente |
| Unidad 4 | Técnicas de optimización del ciclo de desarrollo | ⏳ Pendiente |
| Unidad 5 | Validación, verificación y aseguramiento de la calidad | ⏳ Pendiente |

---

## Documentación técnica del proyecto

Producida durante Metodología de Sistemas I (Parte 1 — Página Web) y vigente para esta etapa:

| Documento | Contenido |
|---|---|
| [ARQUITECTURA.md](ARQUITECTURA.md) | Arquitectura en capas de la aplicación web |
| [BASE_DE_DATOS.md](BASE_DE_DATOS.md) | Modelo relacional, RLS y triggers |
| [REQUERIMIENTOS.md](REQUERIMIENTOS.md) | REQ-01 a REQ-12 — requerimientos de la página web |
| [TESTING.md](TESTING.md) | Casos de prueba y resultados |
| [GUIA_SUPABASE.md](GUIA_SUPABASE.md) | Configuración de Supabase paso a paso |
| [GUIA_DEPLOY.md](GUIA_DEPLOY.md) | Despliegue en Netlify |
| [GUIA_DISENO_UX.md](GUIA_DISENO_UX.md) | Identidad visual y criterios de UI |
| `supabase-schema.sql`, `supabase-grants.sql`, `seed-data.sql` | Scripts de base de datos |

---

## Convenciones de trabajo

### Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable, correspondiente a lo entregado. |
| `develop` | Rama de integración del equipo. |
| `feature/HU1-matricula` | Una rama por Historia de Usuario del backlog. |
| `docs/unidad-1-parte-2` | Ramas destinadas a documentación. |

### Commits

Mensaje breve, en presente, con el identificador de la HU o de la parte:

```text
feat(HU2): calcular promedio del período
fix(HU4): evitar duplicado de asistencia en la misma fecha
docs(U1-P2): agregar cuadro de conceptos de repositorios
```

### Pull Requests

Toda rama se integra mediante un Pull Request revisado por el otro integrante. Es el
*code review* cruzado incluido en la **Definition of Done** de los sprints.

### Tags

Se etiqueta el cierre de cada sprint y de cada entrega: `sprint-1`, `sprint-2`, `entrega-u1-p2`.
Permiten volver al estado exacto del proyecto en cada etapa.

### Issues y Projects

Cada Historia de Usuario del backlog se carga como *issue* y se sigue en un tablero Kanban
(To Do / In Progress / Done), reflejando el Sprint Backlog de Scrum.

---

## Por qué GitHub

- **Distribuido:** cada integrante conserva una copia completa del proyecto y su historial; sirve además como respaldo ante fallos.
- **Colaborativo:** Pull Requests, issues y tableros permiten sostener el trabajo con Scrum y dejan trazabilidad del aporte de cada integrante.
- **Automatizable:** GitHub Actions permite definir pipelines de integración y entrega continua.
- **Accesible:** gratuito para uso académico y con renderizado de Markdown, lo que lo vuelve apto como portafolio público.
