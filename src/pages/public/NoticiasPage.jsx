/**
 * @file NoticiasPage.jsx
 * @description Listado paginado de noticias con filtros por categoría.
 * Muestra noticias públicas para todos; si hay sesión también muestra internas según rol.
 * 9 noticias por página con paginación Anterior/Siguiente.
 */

import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useNoticias } from '@/hooks/useNoticias'
import { AuthContext } from '@/components/auth/AuthContext'
import { formatDateShort } from '@/utils/formatDate'
import { truncateText } from '@/utils/truncateText'

const LIMITE = 9

export default function NoticiasPage() {
  const [pagina, setPagina] = useState(1)
  const { user } = useContext(AuthContext)
  const soloPublicas = !user

  const { noticias, total, cargando, error } = useNoticias({ pagina, limite: LIMITE, soloPublicas })
  const totalPaginas = Math.ceil(total / LIMITE)

  useEffect(() => { window.scrollTo(0, 0) }, [pagina])

  return (
    <>
      <PageHero
        titulo="Noticias"
        subtitulo="Novedades, comunicados y eventos de nuestra comunidad educativa."
        breadcrumb={[{ label: 'Noticias' }]}
      />

      <section className="py-12 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">

          {/* Error */}
          {error && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No pudimos cargar las noticias.</p>
              <button onClick={() => setPagina(1)} className="text-brand-naranja hover:underline text-sm">Intentar de nuevo</button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cargando
              ? Array.from({ length: LIMITE }).map((_, i) => <SkeletonCard key={i} />)
              : noticias.map((noticia, i) => (
                  <motion.article key={noticia.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <Link to={`/noticias/${noticia.id}`} className="block h-48 bg-gray-100 overflow-hidden relative">
                      {noticia.imagen_url
                        ? <img src={noticia.imagen_url} alt={noticia.titulo} loading="lazy" width={400} height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                            <span className="text-5xl">📰</span>
                          </div>
                      }
                      {!noticia.publica && (
                        <span className="absolute top-2 right-2 bg-brand-azul text-white text-[10px] font-bold px-2 py-0.5 rounded-full">INTERNO</span>
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Clock size={11} />
                        <time dateTime={noticia.created_at}>{formatDateShort(noticia.created_at)}</time>
                      </div>
                      <Link to={`/noticias/${noticia.id}`}>
                        <h2 className="font-display font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-brand-azul transition-colors line-clamp-2">
                          {noticia.titulo}
                        </h2>
                      </Link>
                      {noticia.resumen && (
                        <p className="text-gray-500 text-sm line-clamp-3 flex-1">{truncateText(noticia.resumen, 120)}</p>
                      )}
                      <Link to={`/noticias/${noticia.id}`}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-naranja hover:text-orange-700">
                        Leer más <ArrowRight size={11} />
                      </Link>
                    </div>
                  </motion.article>
                ))
            }
          </div>

          {/* Vacío */}
          {!cargando && !error && noticias.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <span className="text-6xl block mb-4">📰</span>
              <p className="text-lg font-medium">Próximamente publicaremos novedades.</p>
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} /> Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página <strong className="text-gray-800">{pagina}</strong> de <strong className="text-gray-800">{totalPaginas}</strong>
              </span>
              <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Siguiente <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
