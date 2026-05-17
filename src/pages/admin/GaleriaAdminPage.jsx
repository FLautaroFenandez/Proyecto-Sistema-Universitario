/**
 * @file GaleriaAdminPage.jsx
 * @description Gestión de galería: tabs por categoría, grid con eliminar en hover,
 * zona de upload drag & drop con preview múltiple y barra de progreso por imagen.
 */

import { useState, useEffect, useContext, useRef } from 'react'
import { Image, Upload, Trash2, X, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const MAX_MB = 5

export default function GaleriaAdminPage() {
  const { profile } = useContext(AuthContext)
  const [categorias,   setCategorias]   = useState([])
  const [catActiva,    setCatActiva]     = useState(null)
  const [imagenes,     setImagenes]      = useState([])
  const [cargando,     setCargando]      = useState(true)
  const [archivos,     setArchivos]      = useState([])   // { file, preview, progreso, ok, error }
  const [catUpload,    setCatUpload]     = useState('')
  const [eliminando,   setEliminando]    = useState(null)
  const [subiendo,     setSubiendo]      = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    supabase.from('galeria_categorias').select('*').order('orden').then(({ data }) => {
      setCategorias(data ?? [])
      if (data?.[0]) setCatActiva(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!catActiva) return
    setCargando(true)
    supabase.from('galeria').select('id,imagen_url,titulo').eq('categoria_id', catActiva).eq('activa', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setImagenes(data ?? []); setCargando(false) })
  }, [catActiva])

  const handleFiles = (files) => {
    const validos = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) return false
      if (f.size > MAX_MB * 1024 * 1024) return false
      return true
    })
    setArchivos(prev => [
      ...prev,
      ...validos.map(f => ({ file: f, preview: URL.createObjectURL(f), progreso: 0, ok: false, error: null })),
    ])
    if (!catUpload && categorias[0]) setCatUpload(String(categorias[0].id))
  }

  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }
  const quitarArchivo = (i) => setArchivos(prev => prev.filter((_, idx) => idx !== i))

  const subirTodo = async () => {
    if (!catUpload || archivos.length === 0) return
    setSubiendo(true)

    for (let i = 0; i < archivos.length; i++) {
      const item = archivos[i]
      if (item.ok) continue
      try {
        const ts = Date.now()
        const path = `${catUpload}/${ts}_${item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { data: upData, error: upErr } = await supabase.storage.from('galeria').upload(path, item.file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('galeria').getPublicUrl(upData.path)
        await supabase.from('galeria').insert({
          imagen_url:  urlData.publicUrl,
          categoria_id: Number(catUpload),
          subido_por:  profile?.id,
          titulo:      item.file.name.replace(/\.[^.]+$/, ''),
        })
        setArchivos(prev => prev.map((a, idx) => idx === i ? { ...a, progreso: 100, ok: true } : a))
      } catch {
        setArchivos(prev => prev.map((a, idx) => idx === i ? { ...a, error: 'Error al subir' } : a))
      }
    }

    setSubiendo(false)
    // Refrescar galería de la categoría activa
    if (Number(catUpload) === catActiva) {
      supabase.from('galeria').select('id,imagen_url,titulo').eq('categoria_id', catActiva).eq('activa', true)
        .order('created_at', { ascending: false }).then(({ data }) => setImagenes(data ?? []))
    }
    setTimeout(() => setArchivos([]), 2000)
  }

  const eliminarImagen = async () => {
    if (!eliminando) return
    await supabase.from('galeria').update({ activa: false }).eq('id', eliminando.id)
    setEliminando(null)
    setImagenes(prev => prev.filter(i => i.id !== eliminando.id))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Image size={22} className="text-brand-azul"/> Gestión de Galería
        </h1>
        <p className="text-gray-400 text-sm mt-1">Subí, organizá y eliminá imágenes por categoría.</p>
      </div>

      {/* Tabs categorías */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => setCatActiva(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${catActiva===cat.id?'bg-white shadow-sm text-gray-800':'text-gray-500 hover:text-gray-700'}`}>
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid de imágenes */}
      {cargando ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
          {Array.from({length:8}).map((_,i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl"/>)}
        </div>
      ) : imagenes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <Image size={36} className="mx-auto mb-2 opacity-30"/>
          <p>No hay imágenes en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {imagenes.map(img => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={img.imagen_url} alt={img.titulo ?? ''} loading="lazy" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button onClick={() => setEliminando(img)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zona de upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-display font-bold text-gray-700 text-lg flex items-center gap-2">
          <Upload size={18} className="text-brand-naranja"/> Subir imágenes
        </h2>

        {/* Drop zone */}
        <div
          onDrop={onDrop} onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-azul hover:bg-blue-50 transition-all"
        >
          <Upload size={32} className="text-gray-300 mx-auto mb-2"/>
          <p className="text-sm font-medium text-gray-600">Arrastrá imágenes aquí o hacé click para seleccionar</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP · Máx {MAX_MB}MB por imagen</p>
          <input ref={inputRef} type="file" multiple accept="image/*" className="sr-only" onChange={e => handleFiles(e.target.files)}/>
        </div>

        {/* Preview de archivos seleccionados */}
        {archivos.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {archivos.map((a, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img src={a.preview} alt="" className="w-full h-full object-cover"/>
                  {a.ok && <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center"><CheckCircle size={20} className="text-white"/></div>}
                  {!a.ok && !subiendo && (
                    <button onClick={() => quitarArchivo(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                      <X size={10}/>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Categoría y botón */}
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de las imágenes</label>
                <select value={catUpload} onChange={e => setCatUpload(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20">
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <Button variant="primary" onClick={subirTodo} loading={subiendo} disabled={!catUpload}>
                <Upload size={15}/> Subir {archivos.filter(a=>!a.ok).length} imagen(es)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmar eliminar */}
      <Modal open={!!eliminando} onClose={() => setEliminando(null)} title="¿Eliminar imagen?" size="sm">
        {eliminando && (
          <div>
            <img src={eliminando.imagen_url} alt="" className="w-full h-40 object-cover rounded-xl mb-4"/>
            <p className="text-gray-600 text-sm mb-6">La imagen se ocultará de la galería pública. Esta acción se puede revertir desde la base de datos.</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setEliminando(null)}>Cancelar</Button>
              <Button variant="danger" fullWidth onClick={eliminarImagen}><Trash2 size={14}/> Eliminar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
