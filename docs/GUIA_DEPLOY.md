# 🚀 Guía de despliegue — Netlify + Supabase
## Centro Educativo "Educar para Transformar"

> Esta guía reemplaza a la versión original, que describía un despliegue en Vercel.
> El proyecto se publica en **Netlify** desde la Parte 1.

Sitio publicado: **https://educar-para-transforma.netlify.app**

---

## 1. Cómo llega un cambio a producción

```
rama feature/*  ──push──▶  GitHub Actions (lint · pruebas · build)
       │
       └──Pull Request a main──▶  GitHub Actions otra vez
                                        │  si pasa
                                        ▼
                               merge a main ──▶ Netlify: npm run build ──▶ publica dist/
```

- **GitHub Actions** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) verifica
  cada push y cada PR: `npm ci`, `npm run lint`, `npm test` y `npm run build`. Si algo
  falla, el PR queda marcado en rojo antes de integrarse.
- **Netlify** está conectado al repositorio y despliega automáticamente cada cambio que
  llega a `main`. No hace falta ningún paso manual.

---

## 2. Configuración de Netlify

La define [`netlify.toml`](../netlify.toml), versionado en el repositorio:

| Clave | Valor | Para qué |
|---|---|---|
| `command` | `npm run build` | Compila el sitio con Vite |
| `publish` | `dist` | Carpeta que se publica |
| Redirección `/* → /index.html` (200) | — | React Router maneja las rutas: sin esto, recargar `/admin` daría 404 |

`public/_redirects` repite la misma regla por compatibilidad.

### Variables de entorno

En Netlify → **Site configuration → Environment variables**:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (*anon key*) del proyecto |

Son las mismas de `.env.local`, que **nunca se sube al repositorio** (`.env.example` es la
plantilla sin valores). La anon key no es secreta: Vite la incluye en el código que
descarga el navegador, y la seguridad la dan las políticas RLS de la base.

---

## 3. Base de datos (Supabase)

Los cambios de esquema **no** se despliegan solos: se ejecutan a mano en
Supabase → SQL Editor, en este orden, y todos son idempotentes:

| Script | Contenido |
|---|---|
| `docs/supabase-schema.sql`, `supabase-fix-admin.sql`, `supabase-grants.sql`, `seed-data.sql` | Parte 1 (web) |
| `docs/supabase-gestion.sql` + `supabase-gestion-datos.sql` | Sprint 1: modelo del Sistema de Gestión y datos iniciales |
| `docs/supabase-sprint2.sql` | Sprint 2: calificaciones y patrón State |
| `docs/supabase-sprint3.sql` | Sprint 3: personal, postulaciones, comunicados y auditoría |

Regla del equipo: **el SQL se ejecuta antes de integrar a `main`** el código que lo usa,
porque el sitio publicado y el entorno local comparten la misma base.

---

## 4. Verificar un despliegue

1. GitHub → pestaña **Actions**: la última ejecución en verde.
2. Netlify → **Deploys**: el último despliegue en estado *Published*.
3. Abrir el sitio y recargar una ruta interna (por ejemplo `/admin`): tiene que cargar,
   no dar 404.
4. Si algo salió mal, Netlify permite volver al despliegue anterior con **Publish deploy**.

---

## 5. Correr el proyecto localmente

```bash
npm install          # solo la primera vez
npm run dev          # http://localhost:5173
npm run lint         # mismo control que el pipeline
npm test             # pruebas unitarias (Vitest)
npm run build        # versión de producción en dist/
```
