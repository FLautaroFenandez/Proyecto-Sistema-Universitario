/**
 * @file NoticiasSection.jsx
 * @description Grid de noticias con aparición escalonada, hover flotante y
 * transiciones de imagen con zoom.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, Newspaper } from 'lucide-react'
import { useNoticias } from '@/hooks/useNoticias'
import { formatDateShort } from '@/utils/formatDate'
import { truncateText } from '@/utils/truncateText'
import { SkeletonCard } from '@/components/ui/Skeleton'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const cardVariants = {
  hidden:   { opacity: 0, y: 50, scale: 0.96 },
  visible:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function NoticiasSection() {
  const { noticias, cargando, error } = useNoticias({ limite: 3, soloPublicas: true })

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Encabezado animado */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12 flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-brand-naranja rounded-full" />
            <div>
              <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl leading-none">
                Últimas Noticias
              </h2>
              <p className="text-gray-400 text-sm mt-1">Novedades de nuestra institución</p>
            </div>
          </div>
          <motion.div whileHover={{ x: 4 }}>
            <Link to="/noticias"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-brand-naranja border border-brand-naranja/30 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">
              Ver todas <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
            <Newspaper size={32} className="opacity-30" />
            <p>No pudimos cargar las noticias.</p>
          </div>
        )}

        {/* Grid con stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {cargando
            ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
            : noticias.map(noticia => (
                <motion.article
                  key={noticia.id}
                  variants={cardVariants}
                  whileHover={{ y: -10, boxShadow: '0 24px 48px rgba(0,0,0,0.13)' }}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  {/* Imagen con zoom en hover */}
                  <Link to={`/noticias/${noticia.id}`} className="block relative h-48 overflow-hidden bg-gray-100">
                    {noticia.imagen_url ? (
                      <img src={noticia.imagen_url} alt={noticia.titulo} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                        <Newspaper size={40} className="text-gray-300" />
                      </div>
                    )}
                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-brand-azul/0 group-hover:bg-brand-azul/10 transition-all duration-300" />
                  </Link>

                  {/* Contenido */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Clock size={11} />
                      <time dateTime={noticia.created_at}>{formatDateShort(noticia.created_at)}</time>
                    </div>
                    <Link to={`/noticias/${noticia.id}`}>
                      <h3 className="font-display font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-brand-azul transition-colors line-clamp-2">
                        {noticia.titulo}
                      </h3>
                    </Link>
                    {noticia.resumen && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                        {truncateText(noticia.resumen, 100)}
                      </p>
                    )}
                    <motion.div whileHover={{ x: 4 }} className="mt-4">
                      <Link to={`/noticias/${noticia.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-naranja hover:text-orange-700 transition-colors">
                        Leer más <ArrowRight size={12} />
                      </Link>
                    </motion.div>
                  </div>
                </motion.article>
              ))
          }

          {!cargando && !error && noticias.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
              <p>Próximamente publicaremos novedades.</p>
            </div>
          )}
        </motion.div>

        {/* Botón mobile */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} className="mt-8 text-center md:hidden"
        >
          <Link to="/noticias"
            className="inline-flex items-center gap-2 border border-brand-naranja text-brand-naranja px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors">
            Ver todas las noticias <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
