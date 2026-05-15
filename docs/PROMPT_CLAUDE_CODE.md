# 🤖 PROMPT MAESTRO — Claude Code
## Centro Educativo "Educar para Transformar"
## Para usar con: Claude Code (claude-code en terminal)

---

Usá este prompt al iniciar Claude Code en la raíz del proyecto.  
Pegalo completo como primer mensaje.

---

```
Sos el desarrollador principal de la página web institucional del Centro Educativo 
"Educar para Transformar". Antes de escribir cualquier línea de código, leé 
completamente todos los archivos de la carpeta /docs/ para entender el proyecto, 
los requerimientos y las decisiones de arquitectura ya tomadas.

═══════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO
═══════════════════════════════════════════════════════════

Institución: Centro Educativo "Educar para Transformar"
Tipo: Institución privada de nivel Inicial, Primario y Secundario
Ubicación: Resistencia, Chaco, Argentina
Inicio de actividades: Marzo 2027

Identidad visual:
- Logo: circular con figuras humanas de colores (verde, naranja, rosa, celeste, azul)
- Slogan: "Inspiramos, desafiamos y empoderamos a todos nuestros alumnos a ser 
  miembros comprometidos y éticos de una comunidad global, para que se conviertan en 
  agentes de cambio conscientes de sí mismos, seguros, innovadores y colaborativos"
- Colores principales: Azul institucional #1B3A6B, Naranja vibrante #E8612C
- Colores secundarios: Verde #4CAF50, Rosa/fucsia #D63384, Celeste #29ABE2
- Tipografía display: Nunito (headings, hero, títulos)
- Tipografía cuerpo: Source Sans 3 (párrafos, textos, UI)
- Estilo: Moderno, dinámico, institucional pero accesible y colorido

═══════════════════════════════════════════════════════════
STACK TECNOLÓGICO (NO CAMBIAR)
═══════════════════════════════════════════════════════════

- Frontend: React 18 + Vite
- Estilos: Tailwind CSS v3
- Auth + BD + API: Supabase (@supabase/supabase-js)
- Routing: React Router v6
- Animaciones: Framer Motion
- Formularios: React Hook Form + Zod
- Íconos: Lucide React
- Deploy: Vercel

═══════════════════════════════════════════════════════════
PRINCIPIOS DE CÓDIGO (OBLIGATORIO SEGUIR)
═══════════════════════════════════════════════════════════

1. ESTRUCTURA DE ARCHIVOS
   - Seguir EXACTAMENTE la estructura definida en README.md
   - Un componente por archivo, nombre en PascalCase
   - Hooks propios en /src/hooks/ con prefijo "use"
   - Lógica de Supabase SOLO en hooks o en /src/lib/, nunca en componentes de UI
   - Constantes y tipos en /src/types/

2. COMENTARIOS Y DOCUMENTACIÓN
   - Cada archivo debe tener un comentario en la primera línea explicando qué hace
   - Cada función/componente debe tener un JSDoc mínimo con @description y @param
   - Los bloques complejos deben tener comentarios inline explicativos
   - En español cuando sea posible

3. COMPONENTES
   - Funcionales con hooks, nunca clases
   - Props destructuradas con valores por defecto cuando aplique
   - PropTypes o JSDoc para documentar las props
   - Máximo ~150 líneas por componente; si es más, dividir

4. PERFORMANCE
   - Lazy loading de páginas con React.lazy() + Suspense
   - Imágenes con loading="lazy" y dimensiones definidas
   - Listas con key única (nunca el índice del array)
   - Evitar re-renders innecesarios con useMemo/useCallback cuando tenga sentido
   - Code splitting automático por ruta (Vite lo hace solo si usás React.lazy)

5. SEGURIDAD
   - NUNCA hardcodear credenciales de Supabase en el código
   - Siempre usar import.meta.env para variables de entorno
   - Las rutas privadas DEBEN verificar autenticación y rol antes de renderizar
   - Validar inputs con Zod en todos los formularios

6. ESTILOS
   - Tailwind para estilos, CSS modules solo si Tailwind no alcanza
   - Variables CSS en globals.css para colores y fuentes del proyecto
   - Mobile-first: escribir los estilos base para mobile, luego md:, lg:
   - Transiciones suaves: transition-all duration-300

7. MANEJO DE ERRORES
   - Todo llamado a Supabase debe tener manejo de error
   - Mostrar estados de carga (loading skeleton, spinner)
   - Mensajes de error en español, descriptivos

═══════════════════════════════════════════════════════════
DISEÑO Y UI (MUY IMPORTANTE)
═══════════════════════════════════════════════════════════

Inspiración visual: uncaus.edu.ar — tomar la estructura general:
  - Topbar de accesos rápidos (scroll horizontal en mobile)
  - Navbar principal con logo izquierda, links centrados, botón login derecha
  - Hero con imagen de fondo y cards de categorías principales superpuestas
  - Sección de noticias en grid de 3 columnas (1 en mobile)
  - Footer con 3 columnas: logo+descripción, links rápidos, contacto+redes

PERO hacerlo MUCHO más moderno y con la identidad propia de "Educar para Transformar":
  - Gradientes sutiles con los colores del logo
  - Cards con hover effects (elevación, color de borde)
  - Animaciones de entrada con Framer Motion (fade-in-up al hacer scroll)
  - Hero con imagen de alta calidad y overlay gradiente
  - Sección de estadísticas animadas (números que "cuentan" al aparecer)
  - Testimonios/opiniones en carousel suave
  - Galería en masonry grid
  - Menú mobile con slide-in animation

═══════════════════════════════════════════════════════════
SECCIONES DE LA PÁGINA (estructura de rutas)
═══════════════════════════════════════════════════════════

RUTAS PÚBLICAS (sin login):
  /                     → HomePage
  /quienes-somos        → QuienesSomosPage  
  /niveles-educativos   → NivelesEducativosPage
  /bienestar            → BienestarPage
  /noticias             → NoticiasPage
  /noticias/:id         → NoticiaDetallePage
  /galeria              → GaleriaPage
  /inscripcion          → InscripcionPage
  /empleo               → EmpleoPage
  /contacto             → ContactoPage
  /login                → LoginPage
  /registro             → RegistroPage

RUTAS PRIVADAS (requieren login, redirigen a /login si no hay sesión):
  /dashboard            → DashboardPage (contenido según rol)
  /admin                → AdminPage (solo admin y autoridad)
  /admin/opiniones      → ModerarOpinionesPage
  /admin/noticias       → GestionNoticiasPage
  /admin/galeria        → GestionGaleriaPage
  /admin/inscripciones  → GestionInscripcionesPage
  /admin/empleos        → GestionEmpleosPage
  /admin/usuarios       → GestionUsuariosPage (solo admin)

═══════════════════════════════════════════════════════════
VARIABLES DE ENTORNO NECESARIAS
═══════════════════════════════════════════════════════════

Crear .env.local con:
  VITE_SUPABASE_URL=https://[proyecto].supabase.co
  VITE_SUPABASE_ANON_KEY=[anon-key]

═══════════════════════════════════════════════════════════
ORDEN DE IMPLEMENTACIÓN SUGERIDO
═══════════════════════════════════════════════════════════

Seguir este orden para tener algo funcionando rápido:

FASE 1 — Setup y estructura (Día 1)
  1. Inicializar proyecto Vite + React
  2. Instalar dependencias
  3. Configurar Tailwind, fuentes, variables CSS
  4. Crear estructura de carpetas completa
  5. Configurar React Router con todas las rutas
  6. Conectar Supabase (lib/supabase.js)

FASE 2 — Layout y componentes base (Día 2)
  1. Topbar
  2. Navbar responsive con menú hamburguesa
  3. Footer
  4. Layout wrapper
  5. Componentes UI base: Button, Card, Input, Badge, Spinner
  6. ProtectedRoute (verifica auth y rol)

FASE 3 — Páginas públicas (Días 3-5)
  1. HomePage (hero + cards + noticias preview + opiniones)
  2. QuienesSomosPage
  3. NivelesEducativosPage
  4. BienestarPage
  5. GaleriaPage (con filtro por categoría)
  6. NoticiasPage + NoticiaDetallePage
  7. InscripcionPage (formulario completo con validación)
  8. EmpleoPage
  9. ContactoPage

FASE 4 — Auth y páginas privadas (Días 6-8)
  1. LoginPage
  2. RegistroPage (solo padre/estudiante)
  3. Hook useAuth
  4. Hook useRole
  5. DashboardPage (contenido dinámico por rol)

FASE 5 — Panel Admin (Días 9-12)
  1. AdminPage (overview con stats)
  2. Moderación de opiniones
  3. Gestión de noticias (crear/editar/eliminar)
  4. Gestión de galería (subir/eliminar con Supabase Storage)
  5. Revisión de inscripciones
  6. Gestión de empleos
  7. Gestión de usuarios (solo admin)

FASE 6 — Pulido y testing (Días 13-15)
  1. Animaciones con Framer Motion
  2. Loading skeletons
  3. Manejo de errores
  4. Responsive testing
  5. Performance (lazy loading imágenes, code splitting)

═══════════════════════════════════════════════════════════
EJEMPLO DE COMPONENTE BIEN ESTRUCTURADO
═══════════════════════════════════════════════════════════

/**
 * @file NoticiaCard.jsx
 * @description Card de previsualización de una noticia para el listado público.
 * Muestra imagen, título, resumen y fecha. Al hacer click navega al detalle.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'

/**
 * Card de noticia para el listado
 * @param {Object} props
 * @param {string} props.id - ID de la noticia
 * @param {string} props.titulo - Título de la noticia
 * @param {string} props.resumen - Resumen corto (max 150 chars)
 * @param {string} props.imagen_url - URL de la imagen de portada
 * @param {string} props.created_at - Fecha ISO de publicación
 */
export function NoticiaCard({ id, titulo, resumen, imagen_url, created_at }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm 
                 hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      {/* Imagen de portada */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {imagen_url ? (
          <img
            src={imagen_url}
            alt={titulo}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 
                       transition-transform duration-500"
          />
        ) : (
          // Placeholder cuando no hay imagen
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-orange-50 
                          flex items-center justify-center">
            <span className="text-4xl">📰</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Fecha */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
          <Calendar size={14} />
          <time dateTime={created_at}>{formatDate(created_at)}</time>
        </div>

        {/* Título */}
        <h3 className="font-display font-bold text-gray-800 text-lg leading-tight mb-2 
                       group-hover:text-blue-700 transition-colors line-clamp-2">
          {titulo}
        </h3>

        {/* Resumen */}
        {resumen && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
            {resumen}
          </p>
        )}

        {/* CTA */}
        <Link
          to={`/noticias/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold 
                     text-orange-500 hover:text-orange-600 transition-colors"
        >
          Leer más
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  )
}

═══════════════════════════════════════════════════════════
EJEMPLO DE HOOK BIEN ESTRUCTURADO
═══════════════════════════════════════════════════════════

/**
 * @file useNoticias.js
 * @description Hook para obtener noticias desde Supabase.
 * Maneja estados de carga, error y paginación.
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook para obtener listado de noticias
 * @param {Object} options
 * @param {boolean} options.soloPublicas - Si true, solo trae noticias públicas
 * @param {number} options.limite - Cantidad de noticias por página
 * @param {number} options.pagina - Página actual (1-based)
 */
export function useNoticias({ soloPublicas = true, limite = 9, pagina = 1 } = {}) {
  const [noticias, setNoticias] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function fetchNoticias() {
      setCargando(true)
      setError(null)

      try {
        // Calcular offset para paginación
        const offset = (pagina - 1) * limite

        // Construir query base
        let query = supabase
          .from('noticias')
          .select('id, titulo, resumen, imagen_url, created_at', { count: 'exact' })
          .eq('publicada', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + limite - 1)

        // Filtrar solo públicas si es necesario
        if (soloPublicas) {
          query = query.eq('publica', true)
        }

        const { data, error: supabaseError, count } = await query

        if (supabaseError) throw supabaseError
        if (!cancelado) {
          setNoticias(data ?? [])
          setTotal(count ?? 0)
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error al cargar noticias:', err)
          setError('No pudimos cargar las noticias. Intentá de nuevo.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    fetchNoticias()

    // Cleanup: evitar setear estado en componente desmontado
    return () => { cancelado = true }
  }, [soloPublicas, limite, pagina])

  return { noticias, total, cargando, error }
}

═══════════════════════════════════════════════════════════
PALETA DE COLORES — variables CSS a definir en globals.css
═══════════════════════════════════════════════════════════

:root {
  /* Colores de la marca */
  --color-azul:     #1B3A6B;
  --color-naranja:  #E8612C;
  --color-verde:    #4CAF50;
  --color-rosa:     #D63384;
  --color-celeste:  #29ABE2;
  
  /* Variantes de azul */
  --color-azul-light:  #2B5298;
  --color-azul-dark:   #0F2040;
  
  /* Neutrales */
  --color-gris-50:   #F8FAFC;
  --color-gris-100:  #F1F5F9;
  --color-gris-500:  #64748B;
  --color-gris-800:  #1E293B;
  
  /* Tipografía */
  --font-display: 'Nunito', sans-serif;
  --font-body:    'Source Sans 3', sans-serif;
}

═══════════════════════════════════════════════════════════
COMANDOS PARA INICIALIZAR EL PROYECTO
═══════════════════════════════════════════════════════════

# Crear proyecto Vite + React
npm create vite@latest educar-para-transformar -- --template react

cd educar-para-transformar

# Instalar dependencias del proyecto
npm install \
  @supabase/supabase-js \
  react-router-dom \
  framer-motion \
  react-hook-form \
  @hookform/resolvers \
  zod \
  lucide-react

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar fuentes de Google (o usar @fontsource)
npm install @fontsource/nunito @fontsource/source-sans-3

═══════════════════════════════════════════════════════════
CONFIGURACIÓN DE TAILWIND (tailwind.config.js)
═══════════════════════════════════════════════════════════

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional
        brand: {
          azul:    '#1B3A6B',
          naranja: '#E8612C',
          verde:   '#4CAF50',
          rosa:    '#D63384',
          celeste: '#29ABE2',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body:    ['Source Sans 3', 'sans-serif'],
        sans:    ['Source Sans 3', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'count-up':   'countUp 1s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

═══════════════════════════════════════════════════════════
IMPORTANTE PARA CLAUDE CODE
═══════════════════════════════════════════════════════════

1. Antes de crear cualquier archivo, verificar si ya existe en la estructura
2. Cuando modifiques un archivo existente, mostrar solo el diff o el fragmento cambiado
3. Agrupar los cambios relacionados en un solo commit conceptual
4. Si hay una decisión de diseño importante, explicarla brevemente
5. Los imports relativos usar el alias @/ que apunta a /src/
   (configurar en vite.config.js: resolve.alias: { '@': '/src' })
6. Cuando generes un componente grande, dividirlo en sub-componentes si supera 150 líneas
7. Siempre generar el archivo completo con todos los imports necesarios

Empezá por leer los docs, luego inicializar el proyecto y crear la estructura base.
```
