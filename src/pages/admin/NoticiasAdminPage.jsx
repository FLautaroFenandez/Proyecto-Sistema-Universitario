/**
 * @file NoticiasAdminPage.jsx
 * @description CRUD completo de noticias. Listado con filtros, formulario en modal,
 * upload de imagen a Supabase Storage con preview, toggles pública/publicada.
 */

import { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Eye, EyeOff, Globe, Lock, Newspaper, ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { uploadImage } from '@/utils/uploadImage'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/admin/DataTable'
import { formatDateShort } from '@/utils/formatDate'

const noticiaSchema = z.object({
  titulo:    z.string().min(3, 'Título requerido').max(200),
  resumen:   z.string().max(500).optional(),
  contenido: z.string().min(10, 'El contenido es requerido'),
  publica:   z.boolean().default(true),
  publicada: z.boolean().default(false),
})

const FILTROS = [
  { key: null,        label: 'Todas' },
  { key: 'borrador',  label: 'Borradores' },
  { key: 'publicada', label: 'Publicadas' },
]

export default function NoticiasAdminPage() {
  const { profile } = useContext(AuthContext)
  const [noticias,   setNoticias]   = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [filtro,     setFiltro]     = useState(null)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editando,   setEditando]   = useState(null)
  const [eliminar,   setEliminar]   = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [subiendo,   setSubiendo]   = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(noticiaSchema),
    defaultValues: { publica: true, publicada: false },
  })

  const fetchNoticias = async () => {
    setCargando(true)
    let q = supabase.from('noticias').select('id,titulo,publica,publicada,created_at,imagen_url').order('created_at', { ascending: false })
    if (filtro === 'borrador')  q = q.eq('publicada', false)
    if (filtro === 'publicada') q = q.eq('publicada', true)
    const { data } = await q
    setNoticias(data ?? [])
    setCargando(false)
  }

  useEffect(() => { fetchNoticias() }, [filtro])

  const abrirNuevo = () => { reset({ publica: true, publicada: false }); setEditando(null); setImagenFile(null); setImagenPreview(null); setModalOpen(true) }
  const abrirEditar = (n) => {
    setEditando(n)
    reset({ titulo: n.titulo, resumen: n.resumen??'', contenido: n.contenido??'', publica: n.publica, publicada: n.publicada })
    setImagenPreview(n.imagen_url ?? null)
    setImagenFile(null)
    setModalOpen(true)
  }

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data) => {
    let imagen_url = editando?.imagen_url ?? null
    if (imagenFile) {
      setSubiendo(true)
      try { imagen_url = await uploadImage(imagenFile, 'noticias') } catch { /* continúa sin imagen */ }
      setSubiendo(false)
    }

    if (editando) {
      await supabase.from('noticias').update({ ...data, imagen_url, updated_at: new Date().toISOString() }).eq('id', editando.id)
    } else {
      await supabase.from('noticias').insert({ ...data, imagen_url, autor_id: profile?.id })
    }
    setModalOpen(false)
    fetchNoticias()
  }

  const confirmarEliminar = async () => {
    if (!eliminar) return
    await supabase.from('noticias').delete().eq('id', eliminar.id)
    setEliminar(null)
    fetchNoticias()
  }

  const COLS = [
    { key:'titulo', label:'Título', render: r => (
      <div className="max-w-xs">
        <p className="font-medium text-gray-800 text-sm truncate">{r.titulo}</p>
        <p className="text-gray-400 text-xs">{formatDateShort(r.created_at)}</p>
      </div>
    )},
    { key:'publica', label:'Visibilidad', render: r => (
      <Badge color={r.publica ? 'green' : 'blue'}>{r.publica ? <><Globe size={10} className="inline mr-1"/>Pública</> : <><Lock size={10} className="inline mr-1"/>Interna</>}</Badge>
    )},
    { key:'publicada', label:'Estado', render: r => (
      <Badge color={r.publicada ? 'green' : 'orange'}>{r.publicada ? 'Publicada' : 'Borrador'}</Badge>
    )},
    { key:'acciones', label:'', render: r => (
      <div className="flex gap-2 justify-end">
        <button onClick={(e) => { e.stopPropagation(); abrirEditar(r) }}
          className="p-1.5 text-gray-400 hover:text-brand-azul hover:bg-blue-50 rounded-lg transition-all" title="Editar">
          <Pencil size={14}/>
        </button>
        <button onClick={(e) => { e.stopPropagation(); setEliminar(r) }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
          <Trash2 size={14}/>
        </button>
      </div>
    )},
  ]

  const publicaVal   = watch('publica')
  const publicadaVal = watch('publicada')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <Newspaper size={22} className="text-brand-azul" /> Gestión de Noticias
          </h1>
          <p className="text-gray-400 text-sm mt-1">Creá, editá y publicá noticias institucionales.</p>
        </div>
        <Button variant="primary" onClick={abrirNuevo}><Plus size={16}/> Nueva noticia</Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTROS.map(f => (
          <button key={String(f.key)} onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtro===f.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable columns={COLS} data={noticias} loading={cargando} emptyMessage="No hay noticias." onRowClick={abrirEditar} />

      {/* Modal formulario */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar noticia' : 'Nueva noticia'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título <span className="text-red-500">*</span></label>
            <input type="text" {...register('titulo')} className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${errors.titulo?'border-red-400':'border-gray-300'}`}/>
            {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen <span className="text-gray-400 font-normal">(para listados)</span></label>
            <textarea rows={2} {...register('resumen')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul resize-none"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido <span className="text-red-500">*</span></label>
            <textarea rows={6} {...register('contenido')} className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul resize-none ${errors.contenido?'border-red-400':'border-gray-300'}`}/>
            {errors.contenido && <p className="text-xs text-red-500 mt-1">{errors.contenido.message}</p>}
          </div>

          {/* Upload de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de portada</label>
            <div className="flex gap-4 items-start">
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-brand-azul transition-colors w-32 flex-shrink-0">
                <ImagePlus size={20} className="text-gray-400"/>
                <span className="text-xs text-gray-400 text-center">Seleccionar imagen</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImagenChange}/>
              </label>
              {imagenPreview && (
                <div className="flex-1 h-28 rounded-xl overflow-hidden bg-gray-100">
                  <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover"/>
                </div>
              )}
            </div>
            {subiendo && <p className="text-xs text-brand-azul mt-1 animate-pulse">Subiendo imagen...</p>}
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { field:'publica',   label:'¿Es pública?',    desc:'Visible para todos los visitantes', val:publicaVal,   icon:publicaVal?Globe:Lock },
              { field:'publicada', label:'¿Publicar ahora?', desc:'Borrador si está desactivado',      val:publicadaVal, icon:publicadaVal?Eye:EyeOff },
            ].map(({ field, label, desc, val, icon:Icon }) => (
              <button type="button" key={field}
                onClick={() => setValue(field, !val)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${val?'border-brand-azul bg-blue-50':'border-gray-200'}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${val?'bg-brand-azul text-white':'bg-gray-100 text-gray-400'}`}>
                  <Icon size={15}/>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${val?'text-brand-azul':'text-gray-600'}`}>{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" fullWidth loading={isSubmitting || subiendo}>
              {editando ? 'Guardar cambios' : 'Publicar noticia'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal eliminar */}
      <Modal open={!!eliminar} onClose={() => setEliminar(null)} title="¿Eliminar noticia?" size="sm">
        <p className="text-gray-600 text-sm mb-6">
          Vas a eliminar <strong>&ldquo;{eliminar?.titulo}&rdquo;</strong>. Esta acción es irreversible.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setEliminar(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={confirmarEliminar}><Trash2 size={14}/> Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
