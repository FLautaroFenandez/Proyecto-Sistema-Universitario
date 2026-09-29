# 🏫 Educar para Transformar — Sistema Institucional

> Centro Educativo Privado · Resistencia, Chaco · Argentina  
> Proyecto académico — UTN FRRe · TUP 2026  
> Metodología de Sistemas I (Parte 1) → **Metodología de Sistemas II (Parte 2, en curso)**

---

## 📋 Descripción del Proyecto

Automatización de la gestión del Centro Educativo **"Educar para Transformar"**, una institución privada de alta calidad educativa ubicada en las afueras de Resistencia que iniciará actividades en marzo de 2027.

El proyecto integrador se desarrolla en tres partes:

| Parte | Qué es | Materia | Estado |
|---|---|---|---|
| **Parte 1** — Página Web | Sitio institucional público, autenticación por roles y panel de administración de contenido | Metodología I | ✅ Terminada |
| **Parte 2** — Sistema de Gestión | Matrícula, cursos y materias, calificaciones, asistencia, legajos de personal, comunicados y reportes | Metodología II | 🔨 En desarrollo |
| **Parte 3** — App móvil | — | Metodología II | ⏳ No iniciada |

---

## 📚 Portafolio digital

La documentación de la cursada, ordenada por unidad y parte, está en **[`docs/PORTAFOLIO.md`](docs/PORTAFOLIO.md)**.

| Etapa | Documento |
|---|---|
| Equipo | [Integrantes y roles](docs/00-equipo/integrantes.md) · [Plan de trabajo](docs/00-equipo/plan-de-trabajo.md) |
| Unidad 1 — Parte 1 | [Requerimientos, arquitecturas, HU, casos de uso y diagramas](docs/01-unidad-1/01-parte-1-requerimientos/README.md) |
| Unidad 1 — Parte 2 | [Repositorios de software](docs/01-unidad-1/02-parte-2-repositorios/README.md) |
| Unidad 1 — Backlog | [Backlog del producto y sprints](docs/01-unidad-1/03-backlog-y-sprints/README.md) |
| Unidad 2 — Modelado | [Modelado del Sistema de Gestión (DER, reglas y RLS)](docs/02-unidad-2/01-modelado/README.md) |
| Unidad 2 — Sprint 1 | [Módulo Administrador: matrícula, cursos y materias](docs/02-unidad-2/02-modulo-administrador/README.md) |

---

## 👥 Equipo

**Metodología de Sistemas II** — equipo de dos integrantes, con el trabajo repartido por Historia de Usuario:

| Nombre | Historias de Usuario |
|---|---|
| Gonzalo Cerqueiro | HU1 · Matrícula — HU2 · Calificaciones — HU3 · Reportes institucionales |
| Lautaro Fernández | HU4 · Asistencia — HU5 · Comunicados — HU6 · Legajos de personal |

En Metodología de Sistemas I el equipo fue el **Grupo 8 — Zonura**, de tres integrantes: Gonzalo Cerqueiro (base de datos, backend y testing), Lautaro Fernández (UI/UX, maquetado y frontend) e Ian Hakanson (arquitectura, autenticación y Supabase), que no continúa en esta etapa.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite | SPA moderna, rápida, con HMR |
| Estilos | Tailwind CSS v3 | Utilidades, responsive, consistente |
| Auth + BD + API | Supabase | PostgreSQL gestionado + Auth con roles + Storage + API REST automática |
| Deploy | Netlify | Gratis, despliegue continuo desde `main`, redirects para SPA |
| Control de versiones | Git + GitHub | Estándar de la industria |
| Gestión de proyecto | Trello | Kanban colaborativo |
| Routing | React Router v6 | SPA con rutas protegidas por rol |
| Animaciones | Framer Motion | Micro-interacciones fluidas |
| Íconos | Lucide React | Consistente, ligero, tree-shakeable |
| Formularios | React Hook Form + Zod | Validación robusta en cliente |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   USUARIO FINAL                     │
│         (Navegador · Chrome / Firefox / Safari)     │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│              CAPA DE PRESENTACIÓN                   │
│                  React SPA (Netlify)                │
│                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Páginas   │  │  Componentes │  │   Rutas     │ │
│  │  públicas  │  │  reutiliz.   │  │ protegidas  │ │
│  └────────────┘  └──────────────┘  └─────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS / REST / WebSocket
┌───────────────────────▼─────────────────────────────┐
│            CAPA DE SERVICIOS (Supabase)             │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Auth +     │  │   API REST   │  │  Storage  │  │
│  │  JWT + Roles│  │  automática  │  │ (imágenes)│  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ SQL
┌───────────────────────▼─────────────────────────────┐
│              CAPA DE DATOS                          │
│           PostgreSQL (Supabase Cloud)               │
│                                                     │
│  usuarios · noticias · opiniones · inscripciones   │
│  galeria · empleos · contacto                      │
└─────────────────────────────────────────────────────┘
```

### ¿Por qué Supabase reemplaza un backend propio?

Supabase provee automáticamente:
- **Auth**: registro, login, JWT, sesiones, recupero de contraseña
- **Roles (RLS)**: Row Level Security — cada usuario solo ve lo que le corresponde según su rol, a nivel de base de datos
- **API REST**: generada automáticamente desde las tablas de PostgreSQL
- **Storage**: bucket para imágenes de la galería con permisos por rol
- **Realtime**: actualizaciones en vivo (útil para noticias y notificaciones)

Esto elimina la necesidad de un servidor propio para esta etapa del proyecto.

---

## 📁 Estructura del Proyecto

```
educar-para-transformar/
│
├── docs/                          # Documentación del proyecto
│   ├── README.md                  # Este archivo
│   ├── REQUERIMIENTOS.md          # Requerimientos funcionales y no funcionales
│   ├── BASE_DE_DATOS.md           # Diseño del modelo relacional
│   ├── ARQUITECTURA.md            # Arquitectura detallada
│   ├── ROLES_Y_PERMISOS.md        # Matriz de roles y accesos
│   ├── GUIA_SUPABASE.md           # Cómo configurar Supabase paso a paso
│   ├── GUIA_DEPLOY.md             # Cómo hacer deploy en Vercel
│   └── TESTING.md                 # Casos de prueba
│
├── src/
│   ├── components/                # Componentes React reutilizables
│   │   ├── ui/                    # Componentes base (Button, Input, Card, Modal)
│   │   ├── layout/                # Navbar, Footer, Topbar, Layout wrapper
│   │   ├── sections/              # Secciones de página (Hero, Noticias, Galería...)
│   │   ├── auth/                  # Login, Register, ProtectedRoute
│   │   └── admin/                 # Panel administrativo, moderación
│   │
│   ├── pages/                     # Páginas (una por ruta)
│   │   ├── HomePage.jsx
│   │   ├── QuienesSomosPage.jsx
│   │   ├── NivelesEducativosPage.jsx
│   │   ├── BienestarPage.jsx
│   │   ├── NoticiasPage.jsx
│   │   ├── InscripcionPage.jsx
│   │   ├── EmpleoPage.jsx
│   │   ├── ContactoPage.jsx
│   │   ├── GaleriaPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx      # Dashboard por rol (post-login)
│   │   └── AdminPage.jsx          # Panel de administración
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.js             # Hook de autenticación y sesión
│   │   ├── useRole.js             # Hook para verificar rol del usuario
│   │   ├── useUI.js               # Efectos de UI reutilizables (scroll, Escape, click afuera)
│   │   ├── useNoticias.js         # Hook para fetch de noticias
│   │   ├── useGaleria.js          # Hook para galería de imágenes
│   │   └── useOpiniones.js        # Hook para opiniones moderadas
│   │
│   ├── services/                  # Capa de servicios del Sistema de Gestión (patrón Facade)
│   │   ├── base.js                # Ejecución de consultas y traducción de errores
│   │   ├── academico.js           # Ciclos, niveles, cursos, materias y docentes
│   │   ├── matricula.js           # Solicitudes, alumnos, tutores y matriculación
│   │   └── index.js               # Punto de entrada: import { academico } from '@/services'
│   │
│   ├── lib/                       # Configuración de librerías externas
│   │   ├── supabase.js            # Cliente Supabase (inicialización)
│   │   └── validations.js         # Schemas Zod compartidos
│   │
│   ├── styles/                    # Estilos globales
│   │   ├── globals.css            # Variables CSS, reset, fuentes
│   │   └── animations.css         # Animaciones personalizadas
│   │
│   ├── types/                     # Tipos y constantes compartidas
│   │   ├── roles.js               # Enum de roles: ADMIN, DOCENTE, PADRE, ALUMNO...
│   │   └── routes.js              # Definición de rutas protegidas
│   │
│   ├── utils/                     # Funciones utilitarias puras
│   │   ├── formatDate.js          # Formateo de fechas en español
│   │   ├── truncateText.js        # Truncado de texto para previews
│   │   └── uploadImage.js         # Helper para subir imágenes a Supabase Storage
│   │
│   ├── App.jsx                    # Componente raíz con Router y providers
│   └── main.jsx                   # Entry point — monta App en el DOM
│
├── public/
│   └── assets/                    # Imágenes estáticas, favicon, logo
│
├── .env.local                     # Variables de entorno (NO subir a GitHub)
├── .env.example                   # Plantilla de variables de entorno (SÍ subir)
├── .gitignore
├── index.html                     # HTML base (Vite)
├── vite.config.js                 # Configuración de Vite
├── tailwind.config.js             # Configuración de Tailwind
└── package.json
```

---

## 🚀 Cómo correr el proyecto localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/[usuario]/educar-para-transformar.git
cd educar-para-transformar

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Completar con las credenciales de Supabase (ver GUIA_SUPABASE.md)

# 4. Correr en modo desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:5173
```

---

## 📅 Fechas clave del proyecto

| Hito | Fecha |
|---|---|
| Entrega planificación (revisión inicial) | 27 de marzo de 2026 |
| Entrega planificación (revisión final) + Maqueta | 10 de abril de 2026 |
| Diseño de BD + Maquetado completo | 11–23 de abril de 2026 |
| Revisión de avances con cliente | 24 de abril de 2026 |
| **Entrega: Diseño de Aplicación** | **8 de mayo de 2026** |
| Desarrollo de la aplicación | 25 de abril – 21 de mayo de 2026 |
| Revisión de avances | 22 de mayo de 2026 |
| **Entrega: Desarrollo de Aplicación** | **5 de junio de 2026** |
| Testing | 29 de mayo – 12 de junio de 2026 |
| **Entrega: Documentación final** | **19 de junio de 2026** |

---

## 🎨 Identidad Visual

- **Colores primarios**: Azul institucional `#1B3A6B`, Naranja vibrante `#E8612C`  
- **Colores secundarios**: Verde `#4CAF50`, Rosa/fucsia `#D63384`  
- **Tipografía display**: Nunito (titles, hero)  
- **Tipografía cuerpo**: Source Sans 3 (body, párrafos)  
- **Estilo**: Moderno, dinámico, institucional pero accesible — inspirado en la identidad multicolor del logo

---

## 📄 Documentación adicional

Toda la documentación técnica y académica del proyecto se encuentra en la carpeta `/docs/`.
