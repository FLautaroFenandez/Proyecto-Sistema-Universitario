/**
 * @file NoticiaDetallePage.jsx
 * @description Vista completa de una noticia con imagen de portada, contenido y sidebar
 * de noticias relacionadas. Obtiene el id de los params de React Router.
 */

import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, User } from 'lucide-react'
import { useNoticiaById, useNoticias } from '@/hooks/useNoticias'
import { formatDate, formatDateShort } from '@/utils/formatDate'
import { SkeletonLine } from '@/components/ui/Skeleton'

export default function NoticiaDetallePage() {
  const { id } = useParams()
  const { noticia, cargando, error } = useNoticiaById(id)
  const { noticias: relacionadas } = useNoticias({ limite: 3, soloPublicas: true })

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (cargando) return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
      {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded" />)}
    </div>
  )

  if (error || !noticia) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <span className="text-6xl block mb-4">😕</span>
      <h2 className="font-display font-bold text-gray-800 text-xl mb-2">Noticia no encontrada</h2>
      <Link to="/noticias" className="text-brand-naranja hover:underline text-sm">← Volver a noticias</Link>
    </div>
  )

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-brand-azul transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/noticias" className="hover:text-brand-azul transition-colors">Noticias</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{noticia.titulo}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── Contenido principal ── */}
          <motion.article className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            {/* Imagen de portada */}
            {noticia.imagen_url && (
              <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gray-100">
                <img src={noticia.imagen_url} alt={noticia.titulo} loading="lazy"
                  className="w-full h-full object-cover" />
              </div>
            )}

            {/* Título */}
            <h1 className="font-display font-bold text-gray-800 text-2xl md:text-3xl leading-tight mb-4">
              {noticia.titulo}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                <time dateTime={noticia.created_at}>{formatDate(noticia.created_at)}</time>
              </span>
              {!noticia.publica && (
                <span className="bg-brand-azul text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOTICIA INTERNA</span>
              )}
            </div>

            {/* Cuerpo */}
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
              {noticia.contenido?.split('\n').filter(Boolean).map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </div>

            {/* Botón volver */}
            <div className="mt-10">
              <Link to="/noticias"
                className="inline-flex items-center gap-2 text-sm text-brand-azul border border-brand-azul px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors font-medium">
                <ArrowLeft size={15} /> Volver a noticias
              </Link>
            </div>
          </motion.article>

          {/* ── Sidebar: otras noticias ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-display font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-brand-naranja rounded-sm inline-block" />
                Otras noticias
              </h3>
              <div className="space-y-4">
                {relacionadas.filter(n => n.id !== id).slice(0, 3).map(n => (
                  <Link key={n.id} to={`/noticias/${n.id}`}
                    className="flex gap-3 group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {n.imagen_url
                        ? <img src={n.imagen_url} alt={n.titulo} loading="lazy" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                        <Clock size={10} />{formatDateShort(n.created_at)}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-azul transition-colors line-clamp-2 leading-tight">
                        {n.titulo}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
