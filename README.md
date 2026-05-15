# 🏫 Educar para Transformar — Sitio Web Institucional

> Centro Educativo Privado · Resistencia, Chaco · Argentina  
> Proyecto académico — Metodología de Sistemas I · UTN FRRe TUP 2026  
> Grupo 8: Zonura

---

## 📋 Descripción del Proyecto

Diseño e implementación de la página web institucional del Centro Educativo **"Educar para Transformar"**, una institución privada de alta calidad educativa ubicada en las afueras de Resistencia que iniciará actividades en marzo de 2027.

Esta es la **Etapa 1 / Parte 1** del proyecto integrador que continuará en Metodología de Sistemas II con el sistema de gestión y la app móvil.

---

## 👥 Equipo

| Nombre | Rol principal |
|---|---|
| Ian Hakanson | Frontend · Arquitectura · Supabase |
| Gonzalo Cerqueiro | Base de datos · Backend (Supabase) · Testing |
| Lautaro Fernández | UI/UX · Maquetado · Frontend |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite | SPA moderna, rápida, con HMR |
| Estilos | Tailwind CSS v3 | Utilidades, responsive, consistente |
| Auth + BD + API | Supabase | PostgreSQL gestionado + Auth con roles + Storage + API REST automática |
| Deploy | Vercel | Gratis, un comando, preview por PR |
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
│                  React SPA (Vercel)                 │
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
│   │   ├── useNoticias.js         # Hook para fetch de noticias
│   │   ├── useGaleria.js          # Hook para galería de imágenes
│   │   └── useOpiniones.js        # Hook para opiniones moderadas
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
