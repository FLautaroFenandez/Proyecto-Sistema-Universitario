# 🏗️ Arquitectura del Sistema
## Centro Educativo "Educar para Transformar"

---

## 1. Tipo de Sistema de Información

El sistema implementado corresponde a un **Sistema de Información Web Transaccional con Control de Acceso por Roles (RBAC)**, clasificado como:

- **Por su función**: Sistema de Información Gerencial (MIS) en el nivel táctico + Sistema de Procesamiento de Transacciones (TPS) para inscripciones y contacto
- **Por su alcance**: Sistema de información organizacional interno + portal público externo
- **Por su arquitectura**: Aplicación web de tres capas (presentación, servicios, datos)

---

## 2. Arquitectura de Tres Capas

```
╔═══════════════════════════════════════════════════════════════╗
║                    CAPA DE PRESENTACIÓN                       ║
║                   React SPA · Vite · Vercel                   ║
║                                                               ║
║  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐  ║
║  │   Páginas   │  │   Componentes    │  │    Contexto     │  ║
║  │  públicas   │  │  reutilizables   │  │  (Auth, Roles)  │  ║
║  └─────────────┘  └──────────────────┘  └─────────────────┘  ║
║                                                               ║
║  React Router v6 · Framer Motion · Tailwind CSS              ║
╚═══════════════════════════════════════════════════════════════╝
                              │
                    HTTPS · REST API
                              │
╔═══════════════════════════════════════════════════════════════╗
║                    CAPA DE SERVICIOS                          ║
║                   Supabase (BaaS)                             ║
║                                                               ║
║  ┌──────────────┐  ┌────────────────┐  ┌─────────────────┐   ║
║  │ Supabase     │  │  PostgREST     │  │  Supabase       │   ║
║  │ Auth (JWT)   │  │  (API REST     │  │  Storage        │   ║
║  │ + Roles      │  │  automática)   │  │  (Imágenes)     │   ║
║  └──────────────┘  └────────────────┘  └─────────────────┘   ║
║                                                               ║
║  Row Level Security (RLS) · Realtime (WebSocket)             ║
╚═══════════════════════════════════════════════════════════════╝
                              │
                           SQL
                              │
╔═══════════════════════════════════════════════════════════════╗
║                    CAPA DE DATOS                              ║
║               PostgreSQL (Supabase Cloud)                     ║
║                                                               ║
║  profiles · noticias · opiniones · inscripciones             ║
║  galeria · galeria_categorias · empleos · contacto_mensajes  ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 3. Flujo de Autenticación y Autorización

```
Usuario ingresa email+contraseña
          │
          ▼
┌─────────────────────┐
│   Supabase Auth     │
│  valida credenciales│
└────────┬────────────┘
         │ OK → devuelve JWT con user.id
         │
         ▼
┌─────────────────────┐
│  React (useAuth)    │
│  lee el JWT         │
│  obtiene profile    │──→ consulta: profiles WHERE id = user.id
│  (rol del usuario)  │◄── recibe: { rol: 'padre' }
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  React Router       │
│  ProtectedRoute     │──→ rol === 'admin' ? <AdminPage/> : <Forbidden/>
│  verifica el rol    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Supabase API       │
│  (PostgREST)        │──→ SELECT * FROM noticias WHERE publica = false
│  aplica RLS         │    [RLS verifica que auth.uid() tenga rol permitido]
└─────────────────────┘
```

La seguridad tiene **doble capa**:
1. **Frontend**: el componente `ProtectedRoute` verifica rol antes de renderizar
2. **Backend (RLS)**: PostgreSQL verifica permisos en cada query, independientemente del frontend

---

## 4. Estructura de Componentes React

```
App.jsx
├── AuthProvider (Context — estado de sesión global)
│   └── RouterProvider
│       ├── Layout (Topbar + Navbar + Footer)
│       │   ├── [Rutas públicas]
│       │   │   ├── HomePage
│       │   │   │   ├── HeroSection
│       │   │   │   ├── CategoriasSection
│       │   │   │   ├── NoticiasPreviewSection
│       │   │   │   ├── EstadisticasSection
│       │   │   │   └── OpinionesSection
│       │   │   ├── QuienesSomosPage
│       │   │   ├── NivelesEducativosPage
│       │   │   ├── BienestarPage
│       │   │   ├── NoticiasPage
│       │   │   │   └── NoticiaCard (×N)
│       │   │   ├── GaleriaPage
│       │   │   │   ├── FiltrosCategorias
│       │   │   │   └── GaleriaGrid
│       │   │   ├── InscripcionPage
│       │   │   │   └── InscripcionForm
│       │   │   ├── EmpleoPage
│       │   │   └── ContactoPage
│       │   │       ├── ContactoForm
│       │   │       └── MapaEmbed
│       │   │
│       │   └── [Rutas privadas — ProtectedRoute]
│       │       ├── LoginPage
│       │       ├── RegistroPage
│       │       ├── DashboardPage (contenido según rol)
│       │       └── AdminLayout
│       │           ├── AdminPage (overview)
│       │           ├── ModerarOpinionesPage
│       │           ├── GestionNoticiasPage
│       │           ├── GestionGaleriaPage
│       │           ├── GestionInscripcionesPage
│       │           ├── GestionEmpleosPage
│       │           └── GestionUsuariosPage (solo admin)
│       │
│       └── NotFoundPage (404)
```

---

## 5. Gestión del Estado

El proyecto NO usa Redux ni Zustand. El estado se maneja con:

| Tipo de estado | Solución |
|---|---|
| Sesión del usuario (global) | React Context (`AuthContext`) + `useAuth` hook |
| Datos del servidor | Custom hooks con `useState` + `useEffect` + Supabase |
| Estado de formularios | React Hook Form + Zod |
| UI local (modales, tabs) | `useState` en el componente |

---

## 6. Manejo de Roles en el Frontend

```javascript
// src/types/roles.js
export const ROLES = {
  ADMIN:      'admin',
  AUTORIDAD:  'autoridad',
  DOCENTE:    'docente',
  PERSONAL:   'personal',
  PADRE:      'padre',
  ESTUDIANTE: 'estudiante',
}

export const PERMISOS = {
  MODERAR_OPINIONES:    [ROLES.ADMIN, ROLES.AUTORIDAD],
  PUBLICAR_NOTICIAS:    [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_GALERIA:    [ROLES.ADMIN, ROLES.AUTORIDAD],
  VER_INSCRIPCIONES:    [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_EMPLEOS:    [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_USUARIOS:   [ROLES.ADMIN],
  VER_NOTICIAS_INTERNAS:[ROLES.ADMIN, ROLES.AUTORIDAD, ROLES.DOCENTE, ROLES.PERSONAL, ROLES.PADRE, ROLES.ESTUDIANTE],
}
```

---

## 7. Decisiones de Arquitectura

### ¿Por qué Supabase en lugar de un backend propio?

Para esta etapa del proyecto (página web + auth + CRUD básico), Supabase provee exactamente lo necesario sin la complejidad de mantener un servidor:

- **Tiempo**: sin configurar servidores, el equipo se enfoca en el producto
- **Costo**: tier gratuito suficiente para el alcance del TP
- **Seguridad**: RLS garantiza seguridad a nivel de datos, más robusto que middleware propio
- **Escalabilidad**: en Metodología de Sistemas II, si se necesita lógica compleja, se puede agregar Edge Functions de Supabase (serverless en Deno/TypeScript)

### ¿Por qué React + Vite en lugar de Next.js?

- El equipo tiene más familiaridad con React puro
- Vite es extremadamente rápido en desarrollo
- No se necesita SSR/SSG para este proyecto (el SEO no es prioritario en una intranet educativa)
- Menor complejidad de configuración

### ¿Por qué Vercel para el deploy?

- Integración nativa con GitHub: cada push a `main` hace deploy automático
- HTTPS automático
- CDN global (la página carga rápido desde cualquier lugar)
- Preview deployments en cada PR para revisar cambios antes de mergear
- Plan gratuito más que suficiente

---

## 8. Clasificación del Sistema de Información

Según las teorías de sistemas vistas en la Unidad 1:

| Criterio | Clasificación |
|---|---|
| Por su naturaleza | Sistema artificial (creado por el hombre) |
| Por su interacción | Sistema abierto (interactúa con el entorno: usuarios, internet) |
| Por su estructura | Sistema determinístico (reglas de acceso definidas) |
| Por su propósito | Sistema de información organizacional |
| Por su nivel organizacional | Operativo (TPS) + Táctico (MIS) |
| Por su tecnología | Sistema basado en web, en la nube |

El sistema actúa como:
- **TPS** (Transaction Processing System): procesa inscripciones, mensajes de contacto, registros de usuarios
- **MIS** (Management Information System): el panel admin provee información consolidada para la toma de decisiones de la dirección
- **Portal institucional**: interfaz pública para la comunidad educativa y visitantes
