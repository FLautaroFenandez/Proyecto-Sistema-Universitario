/**
 * @file NoticiasSection.jsx
 * @description Grid de 3 columnas con las últimas noticias públicas.
 * Estructura idéntica a la sección "Últimas Noticias" de uncaus.edu.ar.
 * Usa useNoticias() con límite de 3 y solo noticias públicas.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import { useNoticias } from '@/hooks/useNoticias'
import { formatDateShort } from '@/utils/formatDate'
import { truncateText } from '@/utils/truncateText'
import { SkeletonCard } from '@/components/ui/Skeleton'

export function NoticiasSection() {
  const { noticias, cargando, error } = useNoticias({ limite: 3, soloPublicas: true })

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Encabezado estilo UNCAUS */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-0">
            <div className="w-1 h-8 bg-brand-naranja rounded-sm mr-3" />
            <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl">
              Últimas Noticias
            </h2>
          </div>
          <Link
            to="/noticias"
            className="hidden md:flex items-center gap-1.5 text-sm text-brand-naranja font-semibold hover:underline"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {/* Estado de error */}
        {error && (
          <div className="text-center py-12 text-gray-500">
            <p>No pudimos cargar las noticias. Intentá de nuevo.</p>
          </div>
        )}

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cargando
            ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
            : noticias.map((noticia, i) => (
                <NoticiaCard key={noticia.id} noticia={noticia} delay={i * 0.1} />
              ))
          }

          {/* Estado vacío */}
          {!cargando && !error && noticias.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <p className="text-lg">Próximamente publicaremos novedades de la institución.</p>
            </div>
          )}
        </div>

        {/* Botón mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 border border-brand-naranja text-brand-naranja px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            Ver todas las noticias <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/**
 * Card individual de noticia — estructura idéntica a UNCAUS
 * @param {{ noticia: object, delay: number }} props
 */
function NoticiaCard({ noticia, delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Imagen */}
      <Link to={`/noticias/${noticia.id}`} className="block relative h-48 overflow-hidden bg-gray-100">
        {noticia.imagen_url ? (
          <img
            src={noticia.imagen_url}
            alt={`Imagen de ${noticia.titulo}`}
            loading="lazy"
            width={400}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
            <span className="text-5xl select-none">📰</span>
          </div>
        )}
      </Link>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        {/* Fecha */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <Clock size={12} />
          <time dateTime={noticia.created_at}>{formatDateShort(noticia.created_at)}</time>
          <span className="ml-auto flex items-center gap-1">
            <Eye size={12} />
            <span>—</span>
          </span>
        </div>

        {/* Título */}
        <Link to={`/noticias/${noticia.id}`}>
          <h3 className="font-display font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-brand-azul transition-colors line-clamp-2">
            {noticia.titulo}
          </h3>
        </Link>

        {/* Extracto */}
        {noticia.resumen && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
            {truncateText(noticia.resumen, 100)}
          </p>
        )}

        {/* Link Leer más */}
        <Link
          to={`/noticias/${noticia.id}`}
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-naranja hover:text-orange-700 transition-colors"
        >
          Leer más <ArrowRight size={12} />
        </Link>
      </div>
    </motion.article>
  )
}
