/**
 * @file GaleriaPage.jsx
 * @description Galería de imágenes organizadas por categoría con filtro de pills.
 * Grid 3 columnas con overlay oscuro en hover. Lazy loading en todas las imágenes.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { useGaleria } from '@/hooks/useGaleria'

export default function GaleriaPage() {
  const [categoriaId, setCategoriaId] = useState(null)
  const { imagenes, categorias, cargando } = useGaleria(categoriaId)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <PageHero
        titulo="Galería"
        subtitulo="Imágenes de nuestras instalaciones, aulas, deportes y eventos institucionales."
        breadcrumb={[{ label: 'Galería' }]}
      />

      <section className="py-12 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">

          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button onClick={() => setCategoriaId(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                categoriaId === null ? 'bg-brand-azul text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setCategoriaId(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  categoriaId === cat.id ? 'bg-brand-azul text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Skeleton */}
          {cargando && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl" />
              ))}
            </div>
          )}

          {/* Grid de imágenes */}
          {!cargando && (
            <AnimatePresence mode="wait">
              <motion.div key={categoriaId ?? 'all'}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {imagenes.map((img, i) => (
                  <motion.div key={img.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
                  >
                    <img src={img.imagen_url} alt={img.titulo || 'Imagen galería'}
                      loading="lazy" width={400} height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <Search size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {/* Título si tiene */}
                    {img.titulo && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium truncate">{img.titulo}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Vacío */}
          {!cargando && imagenes.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <span className="text-6xl block mb-4">🖼️</span>
              <p className="text-lg font-medium">No hay imágenes en esta categoría aún.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
