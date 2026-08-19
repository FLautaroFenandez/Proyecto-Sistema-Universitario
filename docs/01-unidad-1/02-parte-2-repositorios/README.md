# Trabajo Práctico Unidad 1 — Parte 2

**Repositorios de Software**

Metodología de Sistemas II · UTN FRRe · TUP 2026
Integrantes: Cerqueiro, Gonzalo — Fernández, Lautaro

---

## 1. Significado de los conceptos

| Concepto | Significado |
|---|---|
| **Branch (Rama)** | Permite desarrollar una funcionalidad o corregir un error sin tocar el proyecto principal, trabajando sobre una línea de trabajo paralela. |
| **Commit** | Un cambio guardado en el repositorio, acompañado normalmente de un mensaje corto que describe qué se hizo. |
| **Pull** | Trae al equipo local los últimos cambios que están en el repositorio remoto. |
| **Pull Request** | Solicitud al equipo para que revise los cambios realizados y los incorpore al proyecto principal. |
| **Push** | Envía los cambios hechos en el repositorio local al repositorio remoto, para que el resto del equipo pueda usarlos. |
| **Merge (Fusión)** | Combina los cambios de una rama dentro de otra, generalmente hacia la rama principal. |
| **Clone (Clonar)** | Hace una copia completa de un repositorio en la computadora propia para poder trabajar localmente. |
| **Fork (Bifurcación)** | Copia personal del repositorio de otra persona, que permite experimentar sin afectar el original. |
| **Tag (Etiqueta)** | Marca un punto determinado del historial con un nombre fijo; se usa para señalar versiones o entregas (por ejemplo, `v1.0`). |
| **Pipeline** | Secuencia automatizada de etapas (compilación, pruebas y despliegue) que se ejecuta cada vez que se registran cambios en el repositorio. |
| **CI/CD** | Integración Continua y Entrega/Despliegue Continuo: prácticas que automatizan la integración del código de todo el equipo, su prueba y su publicación en el entorno correspondiente. |

> **Aclaración.** En la tabla de la guía el último concepto aparece como "CI/DI"; la sigla
> correcta es **CI/CD** (*Continuous Integration / Continuous Delivery o Deployment*).

---

## 2. Verdadero o falso

Se analizó cada afirmación. Las cinco resultaron **verdaderas**, por lo que no corresponden
correcciones; en los dos últimos casos se agregan precisiones que completan la descripción de
cada arquitectura.

### 1. Plataformas colaborativas sobre Git — **V**

> *En la actualidad, plataformas como GitHub, GitLab y Bitbucket permiten utilizar repositorios
> Git en entornos colaborativos, incorporando funcionalidades adicionales como revisión de
> código, gestión de incidencias, administración de proyectos, automatización, integración
> continua y entrega continua.*

La afirmación es correcta: las tres plataformas se apoyan en Git y suman servicios propios
(pull requests, issues, tableros de proyecto y pipelines de CI/CD) que Git por sí solo no ofrece.

### 2. Git ≠ GitHub — **V**

> *Git y GitHub no son exactamente lo mismo: Git es el sistema de control de versiones
> distribuido, mientras que GitHub es una plataforma que utiliza Git y agrega servicios de
> colaboración y gestión.*

Git es el software de control de versiones que se ejecuta localmente; GitHub es un servicio en
la nube que aloja repositorios Git y agrega la capa de colaboración. Se puede usar Git sin
GitHub, pero no GitHub sin Git.

### 3. Cada clon es una copia completa — **V**

> *Git señala que, en un sistema distribuido, cada clon constituye una copia completa del
> repositorio y su historial. Esto aporta también una importante capacidad de recuperación ante
> fallos.*

Al clonar se descarga el proyecto junto con todo su historial de versiones, por lo que cada
copia local funciona como respaldo completo: si el servidor remoto falla, el repositorio puede
restaurarse desde cualquier clon.

### 4. Arquitectura centralizada — **V**

> *En un repositorio con arquitectura centralizada, se indica que un servidor central está
> directamente conectado al puesto de trabajo de cada programador. Todos los programadores
> pueden actualizar (update) sus puestos de trabajo con los datos presentes en el repositorio o
> pueden hacer cambios (commit) en los mismos. Cada operación se realiza directamente en el
> repositorio.*

Describe correctamente el modelo centralizado. **Precisión que conviene agregar:** en el puesto
de trabajo solo hay una copia de trabajo, no un repositorio, por lo que sin conexión al
servidor no es posible registrar cambios ni consultar el historial.

### 5. Arquitectura distribuida — **V**

> *En un repositorio con arquitectura distribuida, todos los programadores pueden actualizar sus
> repositorios locales con nuevos datos del servidor central con una operación llamada 'pull' y
> persistir cambios en el repositorio principal con una operación llamada 'push' desde su
> repositorio local.*

Es correcta. **Precisión que conviene agregar:** en este modelo el commit se realiza contra el
repositorio local, y recién con el push esos cambios se publican en el repositorio remoto; por
eso se puede trabajar y versionar sin conexión.

---

## 3. Interpretación de gráficos de arquitectura

### Gráfico 1 — Un repositorio en el servidor y tres copias de trabajo (update / commit)

**Arquitectura: centralizada.**

Existe un único repositorio, alojado en el servidor, al que se conectan directamente los tres
puestos de trabajo. En cada puesto solo hay una copia de trabajo, sin historial propio. Las
operaciones que aparecen en el gráfico son **update** (el programador baja al puesto de trabajo
la última versión que está en el repositorio del servidor) y **commit** (el programador registra
sus cambios directamente en ese repositorio central).

**Consecuencias:** toda operación de versionado exige conexión con el servidor, el historial
existe en un solo lugar y, si el servidor falla, no hay copias completas que permitan recuperarlo.

### Gráfico 2 — Un repositorio por puesto de trabajo más el repositorio del servidor (push / pull)

**Arquitectura: distribuida.**

Cada puesto de trabajo tiene su propio repositorio local además de la copia de trabajo, y existe
un repositorio en el servidor que funciona como punto común de sincronización. Dentro de cada
puesto se trabaja con **commit** (guardar cambios en el repositorio local) y **update** (llevar
esa versión a la copia de trabajo). Con el servidor se usan **push** (publicar en el repositorio
remoto los cambios locales) y **pull** (traer al repositorio local los cambios de los demás).

**Consecuencias:** se puede versionar sin conexión, cada clon es una copia completa del proyecto
y de su historial —lo que brinda respaldo ante fallos— y el trabajo en paralelo mediante ramas
resulta mucho más simple. Es el modelo que utiliza Git y, por lo tanto, el de nuestro proyecto
en GitHub.

### Diferencia central entre ambos

En el modelo **centralizado** el commit viaja directamente al servidor, mientras que en el
**distribuido** el commit es local y solo el push lo publica en el repositorio remoto. Por eso
el segundo gráfico muestra dos niveles de operaciones y el primero uno solo.

---

## 4. Portafolio digital

El portafolio digital del equipo se construye dentro del mismo repositorio de GitHub del proyecto:

**https://github.com/FLautaroFenandez/Proyecto-Sistema-Universitario**

La estructura propuesta ordena el trabajo por etapas (unidad y parte), de modo que al recorrer
las carpetas se observe la evolución del proyecto a lo largo del cuatrimestre. Esta estructura
se documenta en el archivo [`docs/PORTAFOLIO.md`](../../PORTAFOLIO.md) del repositorio.

### 4.1. Estructura de carpetas

```text
Proyecto-Sistema-Universitario/
│
├── README.md                  <- Presentación del proyecto e índice general
│
├── docs/
│   ├── PORTAFOLIO.md          <- PORTAFOLIO DIGITAL (documentación de todas las etapas)
│   ├── 00-equipo/
│   │   ├── integrantes.md
│   │   └── plan-de-trabajo.md
│   │
│   ├── 01-unidad-1/
│   │   ├── README.md          <- Objetivos y resumen de la unidad
│   │   ├── 01-parte-1-requerimientos/   (requerimientos, HU, casos de uso, diagramas)
│   │   ├── 02-parte-2-repositorios/     (este trabajo)
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

---

## 5. Justificación del repositorio de software seleccionado

La plataforma seleccionada es **GitHub**, decisión ya adoptada por el equipo al inicio del
proyecto y sostenida en esta etapa. Los criterios que respaldan esa elección son los siguientes:

| Criterio | Justificación |
|---|---|
| **Tipo de repositorio** | **Distribuido**: GitHub utiliza Git, por lo que cada integrante conserva una copia completa del proyecto y de su historial. Permite trabajar y registrar cambios sin conexión permanente y funciona como respaldo ante fallos. |
| **Clasificación** | Repositorio de software **remoto**, alojado en la nube y de acceso público, que actúa como punto único de sincronización (push / pull) entre los repositorios locales de los dos integrantes. |
| **Metodología de trabajo** | Acompaña el trabajo con **Scrum**: una rama por Historia de Usuario, issues y tablero Kanban para el backlog del producto y del sprint, y tags para marcar el cierre de cada sprint. |
| **Colaboración y trazabilidad** | Los Pull Requests permiten la revisión de código entre los integrantes y el historial deja registrado quién realizó cada cambio y cuándo, lo que documenta el aporte individual de cada uno. |
| **Automatización** | GitHub Actions permite definir pipelines de integración y entrega continua, e integrarse con los servicios de despliegue y base de datos utilizados en el proyecto. |
| **Costo y accesibilidad** | Es gratuito para proyectos académicos, no requiere instalar servidores propios y su interfaz web muestra la documentación en Markdown ya formateada. |
| **Portafolio digital** | El mismo repositorio aloja el portafolio en la carpeta `docs/`, de modo que documentación y código evolucionan juntos y quedan versionados en la misma línea de tiempo. |

**En síntesis:** GitHub aporta la arquitectura distribuida que necesita un equipo que trabaja en
paralelo sobre distintas Historias de Usuario, y suma sobre Git las funciones de colaboración
(Pull Requests, issues, tableros y pipelines) que permiten sostener la metodología Scrum adoptada
y, al mismo tiempo, publicar el portafolio digital de la cursada en un único lugar ordenado y
versionado.
