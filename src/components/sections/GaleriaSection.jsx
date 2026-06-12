import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Trophy, Globe, Music, FlaskConical, Camera, ArrowRight, Images, BookOpen } from 'lucide-react'
import { useGaleria } from '@/hooks/useGaleria'

const ICON_MAP = {
  'Instalaciones': Building2,
  'Aulas':         BookOpen,
  'Deportes':      Trophy,
  'Eventos':       Camera,
  'Idiomas':       Globe,
  'Arte y Música': Music,
  'Laboratorios':  FlaskConical,
}

const GRADIENT_MAP = {
  'Instalaciones': 'from-blue-700 to-blue-900',
  'Aulas':         'from-indigo-600 to-indigo-800',
  'Deportes':      'from-green-600 to-green-800',
  'Eventos':       'from-orange-500 to-orange-700',
  'Idiomas':       'from-sky-500 to-sky-700',
  'Arte y Música': 'from-pink-500 to-pink-700',
  'Laboratorios':  'from-violet-600 to-violet-800',
}

const GRADIENTS_DEFAULT = [
  'from-blue-700 to-blue-900',
  'from-green-600 to-green-800',
  'from-sky-500 to-sky-700',
  'from-pink-500 to-pink-700',
  'from-violet-600 to-violet-800',
  'from-orange-500 to-orange-700',
]

export function GaleriaSection() {
  const { imagenes, categorias, cargando } = useGaleria()

  // Primera imagen disponible por categoría
  const imagenPorCat = {}
  imagenes.forEach(img => {
    if (!imagenPorCat[img.categoria_id]) imagenPorCat[img.categoria_id] = img.imagen_url
  })

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12 flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-brand-celeste rounded-full" />
            <div>
              <h2 className="font-display font-bold text-gray-800 text-2xl md:text-3xl leading-none">
                Nuestra Galería
              </h2>
              <p className="text-gray-400 text-sm mt-1">Conocé nuestros espacios e instalaciones</p>
            </div>
          </div>
          <motion.div whileHover={{ x: 4 }}>
            <Link to="/galeria"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-brand-celeste border border-brand-celeste/30 px-4 py-2 rounded-xl hover:bg-sky-50 transition-colors">
              Ver galería completa <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Skeleton mientras carga */}
        {cargando && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-pulse" style={{ gridAutoRows: '160px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`rounded-2xl bg-gray-200 ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`} />
            ))}
          </div>
        )}

        {/* Grid con imágenes reales */}
        {!cargando && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: '160px' }}>
            {categorias.map((cat, i) => {
              const Icon     = ICON_MAP[cat.nombre]     ?? Camera
              const gradient = GRADIENT_MAP[cat.nombre] ?? GRADIENTS_DEFAULT[i % GRADIENTS_DEFAULT.length]
              const imgUrl   = imagenPorCat[cat.id]     ?? null
              const span     = i === 0 ? 'md:col-span-2 md:row-span-2' : ''

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer group ${span}`}
                >
                  <Link to="/galeria" className="block w-full h-full">

                    {/* Fondo: imagen real o gradiente */}
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={cat.nombre}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`} />
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                          }}
                        />
                      </>
                    )}

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      imgUrl ? 'bg-black/40 group-hover:bg-black/55' : 'bg-black/0 group-hover:bg-black/25'
                    }`} />

                    {/* Texto e ícono */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-10">
                      <motion.div
                        className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/30"
                        whileHover={{ rotate: 10, scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon size={22} strokeWidth={1.5} />
                      </motion.div>
                      <h3 className="font-display font-bold text-sm md:text-base text-center leading-tight drop-shadow">
                        {cat.nombre}
                      </h3>
                      <p className="text-white/75 text-xs mt-1 text-center hidden md:block">{cat.descripcion}</p>
                    </div>

                    {/* Ícono cámara en hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Images size={13} className="text-white" />
                      </div>
                    </div>

                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Botón mobile */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} className="mt-8 text-center md:hidden"
        >
          <Link to="/galeria"
            className="inline-flex items-center gap-2 border border-brand-celeste text-brand-celeste px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors">
            Ver galería completa <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
