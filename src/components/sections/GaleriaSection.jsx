import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Trophy, Globe, Music, FlaskConical, Camera, ArrowRight, Images } from 'lucide-react'

const CATEGORIAS = [
  {
    titulo: 'Instalaciones',
    desc: 'Edificio, aulas y espacios comunes',
    Icon: Building2,
    gradient: 'from-blue-700 to-blue-900',
    accent: '#1B3A6B',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    titulo: 'Deportes',
    desc: 'Canchas, pileta y gimnasio',
    Icon: Trophy,
    gradient: 'from-green-600 to-green-800',
    accent: '#4CAF50',
    span: '',
  },
  {
    titulo: 'Idiomas',
    desc: 'Clases y talleres',
    Icon: Globe,
    gradient: 'from-sky-500 to-sky-700',
    accent: '#29ABE2',
    span: '',
  },
  {
    titulo: 'Arte y Música',
    desc: 'Talleres de expresión',
    Icon: Music,
    gradient: 'from-pink-500 to-pink-700',
    accent: '#D63384',
    span: '',
  },
  {
    titulo: 'Laboratorios',
    desc: 'Ciencia y tecnología',
    Icon: FlaskConical,
    gradient: 'from-violet-600 to-violet-800',
    accent: '#8B5CF6',
    span: '',
  },
  {
    titulo: 'Eventos',
    desc: 'Actos y celebraciones',
    Icon: Camera,
    gradient: 'from-orange-500 to-orange-700',
    accent: '#E8612C',
    span: '',
  },
]

export function GaleriaSection() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

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

        {/* Grid tipo Pinterest */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: '160px' }}>
          {CATEGORIAS.map(({ titulo, desc, Icon, gradient, span }, i) => (
            <motion.div
              key={titulo}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group ${span}`}
            >
              <Link to="/galeria" className="block w-full h-full">
                {/* Fondo gradiente */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-500 group-hover:scale-105`} />

                {/* Patrón decorativo */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />

                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300" />

                {/* Contenido */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-10">
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/30"
                    whileHover={{ rotate: 10, scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display font-bold text-sm md:text-base text-center leading-tight drop-shadow">
                    {titulo}
                  </h3>
                  <p className="text-white/75 text-xs mt-1 text-center hidden md:block">{desc}</p>
                </div>

                {/* Ícono de cámara en esquina */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Images size={13} className="text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

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
