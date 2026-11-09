# Unidad 5 — Parte 1: aseguramiento de la calidad, CMMI y Competisoft

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Entrega | 27/10/2026, en equipo |
| Volver | [Unidad 5 — Parte 2](README.md) |

---

Las respuestas se basan en el texto «Aseguramiento de la calidad del software», en el material de la Unidad 5 y en la presentación «Calidad de Software» de la cátedra. Cuando ayuda a fijar la idea, se agrega un ejemplo del Sistema de Gestión que desarrolla el equipo.

## 1. Aseguramiento de la calidad del software

### 1.1. ¿Por qué la calidad del software es medible y varía de un sistema a otro?

En general, la calidad es el conjunto de propiedades de una entidad que permiten juzgar su valor. Por eso es **subjetiva** (depende de qué atributos se elijan para medirla) y **circunstancial** (el conjunto de atributos importantes cambia según la situación).

Aplicada al software deja de ser subjetiva, porque se definen de antemano los **atributos de calidad** (confiabilidad, usabilidad, rendimiento, mantenibilidad, etc.) y cada uno se puede medir. Pero sigue siendo circunstancial: en un sistema pesan unos atributos y en otro, otros. Por eso es **medible** y a la vez **varía de un sistema a otro**. Como dice Tom De Marco, «no se puede controlar lo que no se puede medir».

**Ejemplo:** en el Sistema de Gestión del centro educativo el atributo más importante es la seguridad (que cada rol vea solo lo suyo y que un padre consulte únicamente a sus hijos); en un videojuego, en cambio, lo prioritario sería el rendimiento.

### 1.2. Aspectos de las definiciones de calidad y definición propia

| Autor o fuente | Definición (síntesis) | Aspecto que destaca |
|---|---|---|
| Roger Pressman | Cumplimiento de los requerimientos funcionales y de performance explícitos, de los estándares de desarrollo documentados y de las características implícitas del software profesional. | Conformidad con requisitos explícitos e implícitos y con estándares |
| Watts Humphrey | El foco debe estar en las necesidades del cliente: quiénes son los usuarios y qué es importante para ellos. | Perspectiva del usuario |
| Philip Crosby | Conformidad con los requerimientos. | Cumplimiento de lo especificado |
| Al Davis | No es tener cero defectos ni requisitos documentados: es satisfacer las necesidades del cliente, estén o no documentadas. | Satisfacción real del cliente |
| IEEE | Grado con el que un sistema, componente o proceso cumple los requerimientos y las necesidades y expectativas del usuario. | Integra requisitos y expectativas; habla de «grado» (medible) |
| Presentación de la cátedra | Cliente: grado en que percibe que el producto satisface sus necesidades. Industria: grado en que satisface su especificación. | Dos puntos de vista complementarios |

Los aspectos que se repiten son: el cumplimiento de los **requisitos** y de los **estándares**, la satisfacción de las **necesidades del usuario**, la idea de **grado** (la calidad se mide) y la relación con el **proceso** con que se construye el producto.

**Definición propia:** la calidad del software es el grado, medible a través de atributos definidos de antemano, en que un producto cumple sus requerimientos explícitos e implícitos y los estándares con que se construye, y satisface las necesidades reales de sus usuarios en su contexto de uso, como resultado de un proceso de desarrollo planificado y controlado.

### 1.3. ¿Cómo se puede aplicar la calidad del software?

* **Definiendo qué se va a medir:** atributos de calidad clasificados con un modelo (FURPS+, McCall, ISO/IEC 25010) y sus métricas.
* **Usando metodologías y procedimientos estándar** en el análisis, el diseño, la programación y la prueba, para uniformar la forma de trabajo.
* **Controlándola durante todo el ciclo de vida** y no solo al final: un error es mucho más barato de corregir en requisitos que en producción.
* **Separando aseguramiento y control:** el aseguramiento (SQA) vigila que se cumpla el proceso; el control (SQC) verifica el producto con pruebas y revisiones.
* **Priorizando la prevención de defectos** y su detección temprana, con la participación de todo el equipo y de la dirección.

En el proyecto se aplica con la Definition of Done, la revisión por Pull Request, el pipeline de integración continua (lint, pruebas y build en cada cambio) y las reglas de negocio validadas en dos capas: pantalla y base de datos.

### 1.4. Clasificación de los atributos de calidad con FURPS+

FURPS+ fue desarrollado por Robert Grady y Deborah Caswell (Hewlett-Packard). El «+» agrega restricciones de diseño, implementación e interfaces.

| Sigla | Atributo | Qué incluye | Ejemplo en el Sistema de Gestión |
|---|---|---|---|
| F | Funcionalidad | Características, capacidades y aspectos de seguridad | Matrícula, calificaciones, asistencia; permisos por rol con RLS |
| U | Usabilidad (facilidad de uso) | Factores humanos, ayuda, documentación | Mensajes de corrección claros («Entre 1 y 10.»); menú según el rol |
| R | Fiabilidad | Frecuencia de fallos, recuperación, previsión | La base rechaza datos inválidos aunque falle la pantalla |
| P | Rendimiento | Tiempos de respuesta, productividad, precisión, disponibilidad, uso de recursos | Lighthouse móvil 88/100; carga del elemento principal en 3,4 s |
| S | Soporte | Adaptabilidad, mantenibilidad, internacionalización, configuración | Capa de servicios, ESLint y pruebas automáticas |
| + | Implementación | Limitación de recursos, lenguajes, herramientas, hardware | React 18 + Vite; Supabase (PostgreSQL) |
| + | Interfaz | Restricciones para interactuar con sistemas externos (no la GUI) | API REST de Supabase (PostgREST) |
| + | Operaciones | Gestión del sistema, pautas administrativas, puesta en marcha | Despliegue automático en Netlify; scripts SQL versionados |
| + | Empaquetamiento | Forma de distribución | Aplicación web publicada (SPA) |
| + | Legales | Licencias, derechos de autor, etc. | Licencias de las librerías de código abierto; datos personales de alumnos (Ley 25.326) |

### 1.5. ¿Qué implica obtener un software de calidad?

Implica utilizar metodologías o procedimientos estándar para el análisis, el diseño, la programación y la prueba del software, que uniformen la filosofía de trabajo para lograr mayor **confiabilidad, mantenibilidad y facilidad de prueba**, y que a la vez eleven la **productividad**, tanto del desarrollo como del control de la calidad. La calidad no se agrega al final: se planifica y se construye durante todo el proceso.

### 1.6. ¿Qué ocurre cuando no se cumplen los estándares? Relación con el costo de la calidad

Cuando no se cumplen los estándares o procesos de la organización o del proyecto hay una **no conformidad**. Lo esperable es la conformidad, es decir, la ausencia de no conformidades.

El **costo de la calidad** es la suma de dos costos:

* **Costo de conformidad:** prevención y evaluación (capacitación, estándares, revisiones, pruebas). No es despreciable, pero es menor que su alternativa.
* **Costo de no conformidad:** fallos internos (defectos que se detectan antes de entregar) y externos (los que encuentra el usuario). Crosby lo define como el costo de no hacer las cosas bien la primera vez.

Según Pressman, corregir un error cuesta 1 en requisitos, de 3 a 6 en diseño, 10 en código, de 15 a 40 en la prueba de desarrollo, de 30 a 70 en la prueba de sistema y de 40 a 1000 en producción. Además, el 50 % del costo de corregir defectos en las últimas fases se debe a defectos introducidos en las primeras. Por eso no cumplir los estándares encarece el producto: los defectos aparecen tarde, cuando son más caros.

### 1.7. Principios básicos del concepto de calidad del software

1. La calidad no se piensa solo al revisar y probar: es una preocupación durante todo el ciclo de vida.

2. Solo se alcanza con la contribución de todas las personas involucradas.

3. Debe planificarse y gestionarse con eficacia.

4. Los esfuerzos se dirigen a la prevención de defectos.

5. Se refuerzan la detección y eliminación de defectos en las primeras fases.

6. Es un parámetro del proyecto al mismo nivel que los plazos, el costo y la productividad.

7. Es esencial la participación de la dirección, que debe propiciarla.

### 1.8. ¿Por qué se usa la Verificación y Validación Independientes (IV&V)?

En los años 50, los proyectos de software del Departamento de Defensa de EE. UU. se excedían en plazos y presupuesto, tenían problemas técnicos y muchas veces se cancelaban. Los contratistas informaban un avance optimista y los problemas se conocían cuando ya no se podía entenderlos ni evaluar su impacto.

La IV&V es un proceso de ingeniería con metodologías rigurosas para evaluar la **correctitud y la calidad del software a lo largo de todo su ciclo de vida**, realizado por alguien **independiente** de quien desarrolla. Esa independencia da **objetividad** y **visibilidad temprana** de los problemas. El primer uso fue en el programa del misil Atlas, y la experiencia mostró que los proyectos con IV&V funcionan mucho mejor que los que no la tienen. El aseguramiento de la calidad (SQA) evolucionó directamente de la IV&V: muchas de sus tareas vienen de ahí.

### 1.9. Roles del equipo de aseguramiento de la calidad

| Rol | En qué consiste |
|---|---|
| **Policía del proceso** | Asegura que el desarrollo siga el proceso establecido: audita los productos de trabajo, controla el cumplimiento del plan y juzga el proceso, no el producto. |
| **Abogado del cliente** | Representa al cliente: identifica la funcionalidad que le gustaría encontrar, sensibiliza a la organización con sus necesidades y actúa como cliente de prueba. |
| **Analista** | Reúne datos sobre el producto y el proceso y los usa para mejorarlos. |
| **Proveedor de información** | Informa qué objetivos técnicos están realmente cumplidos, con información objetiva para que la gerencia decida; se concentra en reducir riesgos. |
| **Responsable de la elaboración del proceso** | Participa en la definición de planes, procesos, estándares y procedimientos desde las fases tempranas. |

**¿Puede un programador cumplir algún rol en este equipo?** Sí, con condiciones. En organizaciones chicas el aseguramiento de la calidad puede estar embebido en el proceso, siempre que quien lo haga esté **capacitado en QA**, que sus actividades de calidad estén **separadas del desarrollo de ese mismo producto** (no audita su propio código) y que exista un **canal independiente** para escalar las no conformidades. Un programador puede, por ejemplo, revisar el código de otro integrante (revisión por pares), actuar como analista recolectando métricas o hacer de abogado del cliente probando el sistema como usuario.

En el proyecto, desde que el desarrollo lo continúa un solo integrante, esa independencia no existe. Se compensa en parte con verificaciones automáticas que no dependen de quien escribe el código: el pipeline de integración continua y el análisis estático con SonarCloud.

### 1.10. ¿Qué tipos de evaluaciones realiza este equipo?

* Auditorías formales, realizadas por un área de SQA independiente de la organización.
* Revisiones de a pares, con distintos niveles de formalidad.
* Revisiones rigurosas en el lugar de desarrollo.
* Revisiones distribuidas y comentarios sobre el producto.

A esto se suman las actividades de prueba que enumera la presentación: análisis del proyecto, identificación de escenarios, verificación de estándares y requerimientos, ejecución y documentación de casos de prueba, registro de defectos, revalidación de correcciones, pruebas de regresión y reportes estadísticos.

### 1.11. ¿Por qué el aseguramiento de la calidad (SQA) no es lo mismo que el control de calidad (SQC)?

Se suelen confundir porque al hablar de calidad se piensa en testing, que forma parte del **control** de calidad. Haciendo solo pruebas y revisiones se asegura el cumplimiento de las especificaciones, no la calidad del producto.

| Control de calidad (SQC) | Aseguramiento de la calidad (SQA) |
|---|---|
| Detecta problemas en los productos de trabajo. | Asegura la adherencia a los procesos, estándares y planes. |
| Verifica que los productos cumplan los estándares de calidad del plan del proyecto. | Evalúa que los procesos, planes y estándares del proyecto cumplan los estándares de la organización. |
| Revisa el contenido del producto. | Revisa los procesos. |

El rol de SQA es auditar que todos los equipos, incluido el de SQC, sigan los procedimientos y establecer métricas de la efectividad del proceso. SQC, como complemento, verifica y valida activamente el resultado de ese proceso.

### 1.12. Aseguramiento de la calidad de procesos y productos en CMMI (PPQA)

PPQA (Process and Product Quality Assurance) es el área de proceso de **soporte del nivel 2 de CMMI** y la principal para el aseguramiento de la calidad dentro del modelo. Su propósito es dar a los equipos y a la gerencia una **visión objetiva de los procesos y productos**, y su objetivo es garantizar que los procesos definidos se respeten y detectar deficiencias en la forma de trabajar. Sus metas son:

* Evaluar objetivamente la ejecución de los procesos, los productos de trabajo y los servicios contra los procesos, estándares y procedimientos definidos.
* Identificar y documentar las no conformidades.
* Informar los resultados a quienes usan los procesos y a la gerencia.
* Asegurar que las no conformidades se traten.

La relación con el aseguramiento de la calidad es directa: PPQA es la forma que toma SQA dentro de CMMI. Se complementa con el área de **Verificación**: PPQA asegura que los procesos se implementen, mientras que Verificación asegura que se cumplan los requisitos especificados. A veces trabajan sobre el mismo producto, desde perspectivas distintas. Cumplir sus metas es parte del camino para aumentar la madurez de la organización.

## 2. CMMI

| Pregunta | Respuesta |
|---|---|
| **¿Qué significa CMMI?** | **Capability Maturity Model Integration**: Modelo Integrado de Madurez de Capacidades. Lo creó el Software Engineering Institute (SEI) de la Universidad Carnegie Mellon; hoy lo administra el CMMI Institute, que forma parte de ISACA. |
| **¿Cuál es su objetivo?** | Mejorar los procesos con que una organización desarrolla y mantiene productos y servicios, a partir de un conjunto de buenas prácticas, para que entregue con calidad, en plazos y costos previsibles. Como todo modelo de calidad, dice **qué** hacer y no **cómo** hacerlo, porque eso depende de la metodología y de los objetivos de negocio. |
| **¿Qué acredita?** | El **nivel de madurez de los procesos** de una organización o de una unidad organizacional: su capacidad de gestionar los proyectos de forma repetible, medible y en mejora continua. No certifica productos ni personas. |
| **¿Qué son los niveles de madurez?** | Escalones evolutivos que indican cuán maduros son los procesos de una organización. Cada nivel se apoya en el anterior:  **1. Inicial:** procesos impredecibles; el éxito depende de personas puntuales.  **2. Gestionado:** los proyectos se planifican, se siguen y se controlan (incluye PPQA).  **3. Definido:** procesos estandarizados para toda la organización.  **4. Cuantitativamente gestionado:** los procesos se miden y controlan con datos estadísticos.  **5. En optimización:** mejora continua a partir de esas mediciones. |
| **¿Quién certifica CMMI?** | En sentido estricto, CMMI no emite un certificado: la organización se somete a una **evaluación (appraisal)** con el método oficial del CMMI Institute, conducida por un **Lead Appraiser** certificado por ese instituto. El resultado se publica en el registro del CMMI Institute y tiene una validez de tres años. |

## 3. Competisoft

| Pregunta | Respuesta |
|---|---|
| **¿En qué consiste el proyecto?** | Es el proyecto iberoamericano **«Mejora de Procesos para Fomentar la Competitividad de la Pequeña y Mediana Industria del Software de Iberoamérica»**, financiado por el programa CYTED (proyecto 506AC0287). Reunió a universidades y empresas de varios países de la región, entre ellos Argentina, para crear un modelo de procesos, un método de evaluación y un marco de mejora adaptados a las posibilidades de las pequeñas y medianas empresas. Partió del modelo mexicano MoProSoft, que organiza los procesos en tres categorías: Alta Dirección, Gerencia y Operación. |
| **¿Cómo se relaciona con la industria del software?** | La mayoría de las empresas de software de la región son pequeñas y no pueden afrontar el costo y la complejidad de modelos como CMMI. Competisoft les da un camino accesible para ordenar y mejorar sus procesos, ser más competitivas y producir software de calidad. Se implantó y probó en empresas reales, por ejemplo en Perú y en Costa Rica. |
| **¿Cómo se relaciona con CMMI y la certificación de calidad?** | Persigue el mismo objetivo que CMMI (procesos más maduros y medibles), pero en una versión liviana y escalonada, pensada para pymes. Se alinea con normas internacionales como ISO/IEC 15504 para la evaluación, de modo que una empresa que lo adopta queda mejor preparada para una evaluación CMMI o una certificación ISO. Sus ideas continúan en la norma ISO/IEC 29110, dirigida a entidades muy pequeñas. |

## Bibliografía

Cátedra Metodología de Sistemas II (2026). Unidad 5: Verificación, validación y aseguramiento de la calidad del software. UTN FRRe.

Cátedra Metodología de Sistemas II (2026). Calidad de Software [presentación]. UTN FRRe.

Aseguramiento de la calidad del software, capítulo 3 [material de la cátedra].

Pressman, R. S. y Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach. McGraw-Hill.

CMMI Institute (s. f.). CMMI. ISACA. https://cmmiinstitute.com/

Oktaba, H., Piattini, M., Pino, F., Orozco, M. J. y Alquicira, C. (2008). COMPETISOFT: Mejora de procesos software para pequeñas y medianas empresas y proyectos. Ra-Ma.

Instituto Tecnológico de Costa Rica (2012). Mejora de procesos para fomentar la competitividad de la pequeña y mediana industria de software de Iberoamérica. Informe final.
