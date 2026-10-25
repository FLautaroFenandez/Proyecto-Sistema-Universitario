# Unidad 4 — Técnicas de optimización del ciclo de desarrollo

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
| Parte 1 (individual) | [Entregada el 06/10/2026](parte-1-individual.md) |
| Parte 2 — puntos 3.a y 4.a | Entregados el 06/10/2026 |
| Parte 2 — puntos 3.b, 4.b, 4.c y 4.d | Entrega y coevaluación el 27/10/2026 |
| Funcionalidad analizada | HU1 — Matricular alumno desde solicitud aprobada (con REQ-14) |

---

## 1. Diagnóstico (06/10)

El análisis de los contenidos de la unidad mostró un cuello de botella: **el trabajo
terminado no llegaba a producción**. `main` no recibía cambios desde el 01/09, HU1 estaba
completa desde el 29/09 y no se había publicado, y nada verificaba automáticamente lo que
se integraba. No había integración continua, Pull Requests, issues ni tablero.

## 2. Opciones elegidas (3.a) y su aplicación (3.b)

### Opción 1 — Integración continua con GitHub Actions ✅

| Pieza | Qué hace |
|---|---|
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | Corre en cada push a `main` o `feature/**` y en cada PR hacia `main` |
| `npm ci` | Instala las versiones exactas del `package-lock.json` |
| `npm run lint` | ESLint con [`.eslintrc.cjs`](../../.eslintrc.cjs); cualquier aviso falla el pipeline |
| `npm test` | 23 pruebas unitarias con Vitest sobre las reglas de negocio |
| `npm run build` | Compila el sitio con Vite |

Flujo: push a la rama → el pipeline verifica → PR a `main` → el pipeline verifica de
nuevo → si pasa, merge → Netlify publica. El estado de cada ejecución queda visible en la
pestaña **Actions** y en el propio PR.

Para poder aplicarla hubo que configurar ESLint, que existía como script pero fallaba por
falta de configuración, y corregir los 11 problemas que encontró en el código de la
Parte 1 (importaciones sin usar, comillas sin escapar y dependencias de efectos).

**Primer error detectado por el pipeline (24/10).** Al sumar las pruebas, la ejecución
falló en 19 segundos: el pipeline usaba Node 20, que no trae WebSocket nativo, y el cliente
de Supabase lo necesita al crearse. En la máquina de desarrollo (Node 24) las pruebas
pasaban, así que el error no se veía en local. Se corrigió el mismo día: las pruebas de
funciones puras ya no crean el cliente real y el pipeline pasó a Node 22. Es el beneficio
de *detección temprana* de la integración continua: el problema apareció antes de
integrarse a `main`, no en producción.

### Opción 2 — Tablero Kanban en GitHub Projects ✅

Tablero público: **[Sistema de Gestión — Sprints](https://github.com/users/Gonzac96/projects/1)**.

| Pieza | Cómo quedó |
|---|---|
| Columnas | *Por hacer*, *En curso*, *En revisión* y *Terminado* |
| Tarjetas | Un issue por historia y requerimiento extra (#3 a #12) y uno para la Unidad 4 (#13) |
| Vínculo con el código | Los issues de HU1, REQ-14 y HU2 citan los PR #1 y #2; el PR #14 del Sprint 3 los cierra con `Closes #6` … `Closes #12` |
| Automatización | Workflows del tablero: un issue cerrado o un PR integrado pasa la tarjeta a *Terminado* |

Flujo real del 24/10: los siete issues del Sprint 3 estaban en *En revisión*; al integrar
el PR #14, GitHub los cerró y el tablero los movió a *Terminado* sin intervención manual.

El tablero pertenece a la cuenta de G. Cerqueiro porque GitHub solo permite vincular a un
repositorio los tableros de su mismo dueño; los issues sí viven en el repositorio oficial.

## 3. Métricas de productividad

### 3.1. Herramientas (4.a)

| Qué se mide | Métrica | Herramienta |
|---|---|---|
| Velocidad de entrega | Lead time: desde que empieza una HU hasta que está en producción | Historial de Git, PR y despliegues de Netlify |
| Velocidad de entrega | Frecuencia de despliegue a producción | Historial de `main` y despliegues de Netlify |
| Cuellos de botella | Tiempo de espera: HU terminada sin integrar | Historial de Git y tablero Kanban |
| Cuellos de botella | Duración y resultado del pipeline | GitHub Actions |
| Oportunidades de mejora | Rendimiento de carga | Lighthouse (móvil) sobre el sitio publicado |
| Oportunidades de mejora | Peso del código que descarga el usuario | Reporte de build de Vite |
| Oportunidades de mejora | Calidad del código | ESLint y Vitest |

### 3.2. Resultados iniciales (4.b)

| Métrica | Medición inicial | Fuente |
|---|---|---|
| Lead time de HU1 | 37 días (15/09 → 22/10) | Git |
| Lead time de HU2 | 17 días (05/10 → 22/10) | Git |
| Tiempo de espera de HU1 | 23 días terminada sin integrar (29/09 → 22/10) | Git |
| Tiempo de espera de HU2 | 17 días (05/10 → 22/10) | Git |
| Despliegues a producción | 0 entre el 01/09 y el 21/10 (7 semanas) | `main` / Netlify |
| Pipeline | No existía: ningún cambio se verificaba antes de integrarse | — |
| Lint | No se podía ejecutar; al configurarlo, 11 problemas (7 errores y 4 avisos) | ESLint |
| Pruebas automatizadas | 0 | — |
| Paquete JavaScript principal | 550,7 KB (161,9 KB comprimido), un solo archivo, con aviso de Vite por superar 500 KB | Build de Vite |
| Lighthouse — rendimiento (móvil) | **76 / 100** · FCP 2,3 s · LCP 4,6 s · TBT 190 ms · 831 KiB transferidos | Lighthouse 12, 24/10 |
| Imágenes más pesadas | Fondo de portada 198 KB y logo 106 KB (se muestra a 80 px) | Lighthouse |

### 3.3. Estrategias de mejora (4.c)

| Problema que mostraron las métricas | Estrategia |
|---|---|
| Lo terminado esperaba semanas para integrarse | Integrar por PR en cuanto el pipeline pasa; lotes chicos por historia |
| Nada verificaba los cambios | Pipeline de CI con lint, pruebas y build como condición para integrar |
| El código de la Parte 1 tenía errores sin detectar | ESLint configurado y corregido a cero avisos |
| Un solo archivo de 550 KB que se vuelve a descargar entero en cada despliegue | Separar las librerías (React, Supabase, Framer Motion) en archivos propios que el navegador conserva en caché |
| Imágenes sobredimensionadas | Pasar a WebP y ajustar el logo a su tamaño real de uso |

### 3.4. Comparación antes y después (4.d)

| Métrica | Antes | Después | Mejora |
|---|---|---|---|
| Pipeline | No existía | Lint + 23 pruebas + build en cada push, ~30 s | Verificación automática |
| Errores detectados antes de integrar | Ninguno (no había control) | 1: incompatibilidad con Node 20, detectada en 19 s y corregida el mismo día | — |
| Problemas de lint | 11 | 0 | −100 % |
| Pruebas automatizadas | 0 | 23 aprobadas | — |
| Código propio que se descarga tras un despliegue | 161,9 KB comprimido | 17,6 KB comprimido | −89 % |
| Aviso de Vite por paquete mayor a 500 KB | Sí | No | — |
| Fondo de portada | 198 KB (JPG) | 87 KB (WebP) | −56 % |
| Logo | 106 KB (PNG 512 px) | 11 KB (WebP 160 px) | −90 % |
| Tiempo de espera (terminado → producción) | 23 días (HU1) y 17 días (HU2) | 1 h 05 min (Sprint 3: commits 18:51, merge 19:56 del 24/10) | De semanas a horas |
| Lead time (inicio → producción) | 37 días (HU1) y 17 días (HU2) | Mismo día (Sprint 3, 24/10) | — |
| Despliegues a producción | 0 en 7 semanas (01/09 → 21/10) | 3 en 3 días (PR #1 y #2 el 22/10, PR #14 el 24/10) | — |
| Ejecuciones del pipeline | — | 5: 4 exitosas y 1 fallida (la de Node 20), entre 22 y 30 s cada una | — |
| Lighthouse — rendimiento (móvil) | 76 | 88 | +12 puntos |
| Lighthouse — LCP | 4,6 s | 3,4 s | −26 % |
| Lighthouse — tiempo de bloqueo (TBT) | 190 ms | 96 ms | −49 % |
| Lighthouse — Speed Index | 4,4 s | 3,5 s | −19 % |
| Lighthouse — bytes transferidos | 831 KiB | 628 KiB | −24 % |
| Lighthouse — imágenes | 575 KiB | 370 KiB | −36 % |

Las dos mediciones de Lighthouse se hicieron sobre el sitio publicado, con la misma
configuración (versión 12, perfil móvil): antes, el 24/10 a las 19:01; después, el 24/10 a
las 19:57, ya desplegado el PR #14. Lighthouse varía algunos puntos entre corridas, así que
el número fino importa menos que la tendencia, que se repite en todas las métricas.

### 3.5. Conclusiones

- **El cuello de botella era la integración, no el desarrollo.** Con el pipeline como red de
  seguridad, el Sprint 3 llegó a producción una hora después de terminado; HU1 había
  esperado 23 días.
- **La integración continua detectó un error real** (Node 20) antes de que llegara a `main`.
- **Las mejoras de rendimiento más rentables fueron las imágenes:** explican la mayor parte de
  la baja de bytes y de LCP. Separar las librerías no cambia la primera visita, pero reduce
  un 89 % lo que se vuelve a descargar después de cada despliegue.
- **Pendiente:** usar el tablero durante todo un sprint (no solo al cierre) para medir el
  trabajo en curso y el tiempo en cada columna.
