/**
 * @file Modal.jsx
 * @description Modal accesible con overlay, animación y cierre por Escape/click afuera.
 *
 * @param {boolean} open - Si el modal está visible
 * @param {Function} onClose - Callback al cerrar
 * @param {string} title - Título del modal
 * @param {'sm'|'md'|'lg'} size
 */

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeclaEscape, useBloqueoDeScroll } from '@/hooks/useUI'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, size = 'md', children }) {
  useTeclaEscape(open, onClose)
  useBloqueoDeScroll(open)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${SIZES[size] ?? SIZES.md} max-h-[90vh] flex flex-col`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-display font-semibold text-gray-800 text-lg">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Contenido */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
