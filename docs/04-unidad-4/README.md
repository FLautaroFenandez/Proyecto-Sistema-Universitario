# Unidad 4 — Técnicas de optimización del ciclo de desarrollo

Metodología de Sistemas II · UTN FRRe · TUP 2026
Centro Educativo *"Educar para Transformar"* — **Grupo 4**

| Dato | Valor |
|---|---|
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

### Opción 2 — Tablero Kanban en GitHub Projects

Un tablero con las columnas *Por hacer*, *En curso*, *En revisión* y *Terminado*, una
tarjeta por historia de usuario vinculada a su issue y a su Pull Request. Al integrar el
PR, la tarjeta pasa sola a *Terminado* (cierre automático con `Closes #N`).

> ⏳ Se completa con el enlace y la captura del tablero una vez armado.

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
| Problemas de lint | 11 | 0 | −100 % |
| Pruebas automatizadas | 0 | 23 aprobadas | — |
| Código propio que se descarga tras un despliegue | 161,9 KB comprimido | 17,6 KB comprimido | −89 % |
| Aviso de Vite por paquete mayor a 500 KB | Sí | No | — |
| Fondo de portada | 198 KB (JPG) | 87 KB (WebP) | −56 % |
| Logo | 106 KB (PNG 512 px) | 11 KB (WebP 160 px) | −90 % |
| Tiempo de espera del Sprint 3 | — | ⏳ | — |
| Despliegues a producción | 0 en 7 semanas | ⏳ | — |
| Lighthouse — rendimiento (móvil) | 76 | ⏳ | — |
| Lighthouse — LCP | 4,6 s | ⏳ | — |
| Lighthouse — bytes transferidos | 831 KiB | ⏳ | — |

> ⏳ Se mide sobre el sitio publicado después de integrar el Sprint 3 a `main`.
