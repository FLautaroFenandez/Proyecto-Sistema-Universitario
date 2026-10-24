/**
 * @file partes.jsx
 * @description Piezas comunes del boletín y la constancia (REQ-17).
 */

import { Link } from 'react-router-dom'
import { FileX } from 'lucide-react'

export function EncabezadoInstitucional({ titulo, subtitulo }) {
  return (
    <header className="flex items-center gap-4 border-b border-gray-300 pb-4">
      <img src="/assets/logo-ept.png" alt="" className="w-14 h-14 object-contain" />
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Centro Educativo «Educar para Transformar» · Resistencia, Chaco</p>
        <h1 className="font-display font-bold text-xl">{titulo}</h1>
        {subtitulo && <p className="text-sm text-gray-500">{subtitulo}</p>}
      </div>
    </header>
  )
}

export function DocumentoNoDisponible({ mensaje }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-3 max-w-md">
        <FileX size={30} className="text-gray-300 mx-auto" />
        <p className="font-semibold text-gray-700">{mensaje ?? 'No encontramos esa matrícula o no tenés permiso para verla.'}</p>
        <Link to="/dashboard" className="inline-block text-sm text-brand-azul hover:underline">Volver a mi panel</Link>
      </div>
    </div>
  )
}
