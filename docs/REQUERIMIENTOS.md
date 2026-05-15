# 📋 Especificación de Requerimientos
## Centro Educativo "Educar para Transformar" — Página Web Institucional

**Versión**: 1.0  
**Fecha**: Abril 2026  
**Proyecto**: TP2 — Metodología de Sistemas I · UTN FRRe TUP  
**Grupo**: 8 — Zonura  

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requerimientos funcionales y no funcionales del sistema de información web para el Centro Educativo "Educar para Transformar". Sirve como contrato entre el equipo de desarrollo y la dirección de la institución.

### 1.2 Alcance
El sistema cubre la **Etapa 1**: página web institucional con sistema de autenticación por roles. Las etapas de sistema de gestión y app móvil corresponden a Metodología de Sistemas II.

### 1.3 Definiciones y abreviaturas

| Término | Definición |
|---|---|
| Usuario público | Visitante sin login |
| Usuario registrado | Padre o estudiante con cuenta activa |
| Personal | Docentes, autoridades y personal administrativo |
| Admin | Administrador del sistema con acceso total |
| RLS | Row Level Security — seguridad a nivel de fila en PostgreSQL |
| SPA | Single Page Application |

---

## 2. Requerimientos Funcionales

---

### REQ-01 · Información Corporativa y Contacto

**Prioridad**: Alta  
**Actor**: Usuario público  

El sistema deberá mostrar la información institucional del centro educativo en todo momento, sin requerir autenticación. Esta información incluirá:

- Nombre, misión y visión institucional
- Ubicación física con mapa interactivo (Google Maps embed)
- Horarios de atención al público
- Niveles educativos ofrecidos (Inicial, Primario, Secundario)
- Medios de contacto oficiales:
  - Formulario de contacto web (campos: nombre completo, email, asunto, mensaje)
  - Enlace directo a WhatsApp institucional
  - Links a redes sociales oficiales (Instagram, Facebook)
- Al enviar el formulario de contacto, el sistema deberá registrar el mensaje en la base de datos.

**Restricciones**: Los datos de contacto (teléfono, email institucional, redes) deben ser administrables desde el panel de administración.

---

### REQ-02 · Sistema de Opiniones Públicas

**Prioridad**: Media  
**Actor**: Usuario público (sin login requerido)  

El sistema deberá permitir que cualquier visitante deje una opinión visible en la página pública sin necesidad de estar autenticado. Las reglas son:

- Campos del formulario de opinión: nombre del autor, texto de la opinión
- El texto de la opinión tendrá un límite de **300 caracteres**
- Las opiniones NO se publicarán automáticamente; deberán pasar por moderación
- Un administrador podrá: **aprobar**, **rechazar** o **eliminar** cada opinión desde el panel administrativo
- Solo las opiniones aprobadas serán visibles para el público en la página
- Cada opinión aprobada mostrará: nombre del autor, texto y fecha de publicación

---

### REQ-03 · Galería de Imágenes

**Prioridad**: Media  
**Actor**: Usuario público (visualización) · Personal autorizado (gestión)  

El sistema deberá incluir una galería de imágenes de las instalaciones del centro educativo con las siguientes características:

- Las imágenes estarán organizadas en **categorías**: Instalaciones, Aulas, Deportes, Eventos, Idiomas
- Cualquier visitante podrá visualizar la galería sin necesidad de autenticarse
- Las imágenes deberán cargarse de manera optimizada (lazy loading)
- Solo usuarios con rol **Admin** o **Autoridad** podrán:
  - Subir nuevas imágenes
  - Asignar imágenes a categorías
  - Eliminar imágenes existentes
- Las imágenes se almacenarán en **Supabase Storage**

---

### REQ-04 · Registro y Acceso a Información Específica

**Prioridad**: Alta  
**Actor**: Padre · Estudiante  

El sistema deberá requerir registro y autenticación para que padres y estudiantes accedan a información exclusiva. Especificaciones del registro:

**Formulario de registro** (campos obligatorios):
- Nombre completo
- DNI
- Email (único, usado como identificador)
- Contraseña (mínimo 8 caracteres)
- Rol (Padre / Estudiante)
- Teléfono de contacto

**Información exclusiva accesible post-login** según rol:
- **Padre**: noticias internas, estado de solicitudes de inscripción de sus hijos, comunicaciones institucionales dirigidas a padres
- **Estudiante**: noticias internas, comunicaciones estudiantiles, información académica general

El sistema deberá validar todos los campos antes del envío y mostrar errores descriptivos ante datos inválidos.

---

### REQ-05 · Sistema de Autenticación con Roles Diferenciados

**Prioridad**: Alta (crítico)  
**Actor**: Todos los usuarios registrados  

El sistema deberá contar con autenticación segura y control de acceso basado en roles. Los roles definidos son:

| Rol | Descripción |
|---|---|
| `admin` | Acceso total al sistema. Puede gestionar usuarios, moderar contenido, publicar noticias, administrar galería y revisar inscripciones. |
| `autoridad` | Puede publicar y editar noticias, gestionar galería, revisar inscripciones. No gestiona usuarios. |
| `docente` | Acceso al área de docentes: comunicados internos y recursos institucionales. |
| `personal` | Acceso a información operativa interna del centro. |
| `padre` | Acceso a noticias internas, estado de inscripciones de sus hijos y comunicaciones para padres. |
| `estudiante` | Acceso a noticias estudiantiles y comunicaciones institucionales. |

**Especificaciones técnicas**:
- La autenticación se implementará con **Supabase Auth** (email + contraseña)
- Las sesiones se manejarán con **JWT**
- Los permisos se reforzarán a nivel de base de datos con **Row Level Security (RLS)**, garantizando que incluso si alguien manipula el frontend, no podrá acceder a datos que no le corresponden
- El sistema deberá permitir cerrar sesión desde cualquier pantalla
- Los usuarios del personal (docente, autoridad, admin) serán creados por el administrador, no podrán auto-registrarse

---

### REQ-06 · Secciones Obligatorias de la Página Web

**Prioridad**: Alta  
**Actor**: Usuario público / registrado según sección  

La página deberá contener las siguientes secciones navegables desde el menú principal:

#### 6.1 Quiénes Somos
- Misión, visión y valores institucionales
- Reseña histórica del centro educativo
- Organigrama institucional básico
- Fotografía del equipo directivo

#### 6.2 Niveles Educativos
- Descripción de cada nivel: Inicial, Primario y Secundario
- Modalidad jornada extendida
- Idiomas disponibles: Inglés, Portugués, Francés
- Actividades extracurriculares por nivel

#### 6.3 Bienestar Estudiantil
- Servicio de Apoyo Estudiantil
- Deportes disponibles: Atletismo, Natación, Fútbol, Artes Marciales, Vóleibol, Danza, Básquet, Ajedrez
- Instalaciones: Pileta de Natación, Canchas de Fútbol, Pista de Atletismo, Gimnasio Cubierto
- Servicio de Comedor
- Enfermería
- Servicio de Micros de Traslado
- Laboratorios: Computación, Física, Química

#### 6.4 Noticias
- **Noticias públicas**: visibles para todos los visitantes, con título, fecha, imagen opcional y cuerpo
- **Noticias internas**: visibles solo para usuarios autenticados (según su rol)
- Paginación de noticias (máximo 9 por página)
- Admin y Autoridad pueden crear, editar y eliminar noticias

#### 6.5 Solicitud de Inscripción (Formulario)
Ver REQ-07

#### 6.6 Empleo
Ver REQ-08

#### 6.7 Accesos (Login)
Ver REQ-05

---

### REQ-07 · Formulario de Solicitud de Inscripción

**Prioridad**: Alta  
**Actor**: Usuario público  

El formulario de inscripción deberá estar accesible sin necesidad de login y recopilará la siguiente información:

**Datos del estudiante**:
- Nombre completo (obligatorio)
- Fecha de nacimiento (obligatorio)
- DNI (obligatorio, solo números)
- Nivel educativo al que se inscribe: Inicial / Primario / Secundario (obligatorio)
- Turno preferido: Mañana / Tarde (obligatorio)

**Datos del padre/tutor**:
- Nombre completo (obligatorio)
- DNI (obligatorio)
- Teléfono de contacto (obligatorio)
- Email (obligatorio, válido)
- Relación con el estudiante: Padre / Madre / Tutor

**Comportamiento del sistema**:
- Validar todos los campos en el cliente antes del envío
- Registrar la solicitud en la base de datos al enviar
- Mostrar confirmación visual al solicitante ("Tu solicitud fue recibida. Te contactaremos pronto.")
- Notificar al administrador de la nueva solicitud
- El administrador podrá revisar el estado de cada solicitud (Pendiente / En revisión / Aceptada / Rechazada) desde el panel

---

### REQ-08 · Sección de Empleo

**Prioridad**: Baja-Media  
**Actor**: Usuario público (lectura) · Admin/Autoridad (gestión)  

La sección de empleo deberá listar las búsquedas laborales activas del centro educativo:

**Información por aviso**:
- Título del puesto
- Descripción del cargo y requisitos
- Fecha de publicación
- Fecha límite de postulación
- Forma de contacto para postularse (email o formulario)

**Gestión**:
- Admin y Autoridad podrán publicar, editar y dar de baja avisos desde el panel administrativo
- Los avisos vencidos (pasada la fecha límite) se ocultarán automáticamente del listado público

---

### REQ-09 · Panel de Administración

**Prioridad**: Alta  
**Actor**: Admin · Autoridad  

El sistema deberá contar con un panel administrativo seguro con las siguientes funcionalidades:

| Funcionalidad | Admin | Autoridad |
|---|---|---|
| Gestionar usuarios (crear, desactivar) | ✅ | ❌ |
| Moderar opiniones (aprobar/rechazar) | ✅ | ✅ |
| Administrar galería (subir/eliminar) | ✅ | ✅ |
| Publicar/editar/eliminar noticias | ✅ | ✅ |
| Revisar solicitudes de inscripción | ✅ | ✅ |
| Publicar/editar avisos de empleo | ✅ | ✅ |
| Ver mensajes de contacto | ✅ | ✅ |
| Gestionar datos institucionales | ✅ | ❌ |

---

### REQ-10 · Diseño Responsive

**Prioridad**: Alta  
**Actor**: Todos los usuarios  

El sitio deberá adaptarse correctamente a los siguientes breakpoints:

| Dispositivo | Ancho |
|---|---|
| Mobile | < 768px |
| Tablet | 768px – 1024px |
| Desktop | > 1024px |

El navbar deberá colapsar en un menú hamburguesa en mobile. Las grillas de contenido se adaptarán de múltiples columnas a una sola columna en dispositivos pequeños.

---

### REQ-11 · Seguridad de Acceso por Roles (RLS)

**Prioridad**: Alta (crítico)  
**Actor**: Sistema  

El sistema deberá garantizar que ningún usuario pueda acceder a datos fuera de su rol, tanto en la interfaz como en la base de datos:

- Las políticas RLS de Supabase protegen cada tabla según el rol del usuario autenticado
- Las rutas del frontend redirigen al login si el usuario no tiene sesión activa
- Las rutas privadas verifican el rol antes de renderizar el contenido
- Un padre no puede ver datos de otro padre ni del personal
- Un estudiante no puede ver datos de inscripciones de otros estudiantes

---

## 3. Requerimientos No Funcionales

### RNF-01 · Rendimiento
- La página principal deberá cargar en menos de **3 segundos** en conexiones de 10 Mbps
- Las imágenes deberán servirse con lazy loading y en formato optimizado (WebP cuando sea posible)
- El código JavaScript se dividirá en chunks por ruta (code splitting con Vite) para minimizar el bundle inicial

### RNF-02 · Disponibilidad
- El sistema deberá estar disponible **24/7** (garantizado por Vercel y Supabase en sus planes gratuitos)
- El hosting deberá ser accesible desde cualquier navegador moderno (Chrome, Firefox, Edge, Safari)

### RNF-03 · Seguridad
- Todas las comunicaciones deberán realizarse sobre **HTTPS**
- Las contraseñas se almacenarán hasheadas (gestionado automáticamente por Supabase Auth)
- Las variables de entorno (claves de Supabase) no deberán subirse al repositorio

### RNF-04 · Mantenibilidad
- El código deberá estar comentado en las partes complejas
- Los componentes deberán ser reutilizables y tener responsabilidad única
- El proyecto deberá seguir la estructura de carpetas definida en el README

### RNF-05 · Usabilidad
- La interfaz deberá ser intuitiva para usuarios con conocimiento básico de navegación web
- Los mensajes de error deberán ser descriptivos y en español
- El diseño deberá seguir la identidad visual del centro educativo

### RNF-06 · Compatibilidad
- Compatible con los últimos 2 años de versiones de: Chrome, Firefox, Edge y Safari
- Compatible con Android 10+ y iOS 14+

---

## 4. Restricciones del Proyecto

- **Tiempo**: Página web funcionando para el 8 de mayo de 2026
- **Presupuesto**: Stack gratuito (Supabase free tier + Vercel free tier)
- **Equipo**: 3 personas con conocimientos variables de React y Supabase
- **Alcance**: Esta etapa NO incluye sistema de gestión académica ni app móvil

---

## 5. Casos de Uso Principales

```
[Usuario Público]
  → Ver información institucional
  → Ver galería de imágenes
  → Dejar opinión
  → Completar formulario de inscripción
  → Completar formulario de contacto
  → Ver noticias públicas
  → Ver avisos de empleo

[Padre / Estudiante]
  → Registrarse en el sistema
  → Iniciar sesión
  → Ver noticias internas
  → Ver estado de inscripción (Padre)
  → Cerrar sesión

[Docente / Personal]
  → Iniciar sesión (cuenta creada por Admin)
  → Ver comunicaciones internas
  → Acceder a recursos institucionales

[Administrador / Autoridad]
  → Iniciar sesión
  → Moderar opiniones
  → Publicar noticias (pública/interna)
  → Gestionar galería
  → Revisar solicitudes de inscripción
  → Publicar avisos de empleo

[Administrador]
  → Crear cuentas de personal
  → Desactivar usuarios
  → Gestionar datos institucionales
```
