/**
 * @file EmpleosAdminPage.jsx
 * @description CRUD de avisos de empleo. Tabla con días restantes y estado,
 * modal de formulario para crear/editar, toggle activo/inactivo.
 */

import { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Plus, Pencil, Trash2, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDateShort } from '@/utils/formatDate'

const empleoSchema = z.object({
  titulo:         z.string().min(3,'Requerido').max(200),
  descripcion:    z.string().min(10,'Requerido'),
  requisitos:     z.string().optional(),
  contacto_email: z.string().email('Email inválido'),
  fecha_limite:   z.string().min(1,'Fecha requerida'),
  activo:         z.boolean().default(true),
})

function diasRestantes(fecha) {
  const diff = new Date(fecha) - new Date()
  return Math.max(0, Math.ceil(diff / (1000*60*60*24)))
}

const input = (err) => `w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul ${err?'border-red-400':'border-gray-300'}`

export default function EmpleosAdminPage() {
  const { profile } = useContext(AuthContext)
  const [empleos,   setEmpleos]   = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando,  setEditando]  = useState(null)
  const [eliminar,  setEliminar]  = useState(null)

  const { register, handleSubmit, reset, watch, setValue, formState:{ errors, isSubmitting } } = useForm({
    resolver: zodResolver(empleoSchema),
    defaultValues: { activo: true },
  })

  const activoVal = watch('activo')

  const fetchEmpleos = async () => {
    setCargando(true)
    const { data } = await supabase.from('empleos').select('*').order('created_at',{ascending:false})
    setEmpleos(data??[])
    setCargando(false)
  }

  useEffect(() => { fetchEmpleos() }, [])

  const abrirNuevo = () => {
    reset({ activo: true })
    setEditando(null)
    setModalOpen(true)
  }

  const abrirEditar = (emp) => {
    reset({
      titulo: emp.titulo, descripcion: emp.descripcion, requisitos: emp.requisitos??'',
      contacto_email: emp.contacto_email,
      fecha_limite: emp.fecha_limite?.split('T')[0] ?? emp.fecha_limite,
      activo: emp.activo,
    })
    setEditando(emp)
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    if (editando) {
      await supabase.from('empleos').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editando.id)
    } else {
      await supabase.from('empleos').insert({ ...data, publicado_por: profile?.id })
    }
    setModalOpen(false)
    fetchEmpleos()
  }

  const confirmarEliminar = async () => {
    if (!eliminar) return
    await supabase.from('empleos').delete().eq('id', eliminar.id)
    setEliminar(null)
    fetchEmpleos()
  }

  const COLS = [
    { key:'titulo', label:'Puesto', render: r => <span className="font-medium text-gray-800 text-sm">{r.titulo}</span> },
    { key:'fecha_limite', label:'Fecha límite', render: r => (
      <div>
        <p className="text-sm text-gray-600">{formatDateShort(r.fecha_limite)}</p>
        <p className={`text-xs ${diasRestantes(r.fecha_limite)<=7?'text-red-500':'text-gray-400'}`}>
          {diasRestantes(r.fecha_limite)===0 ? 'Vence hoy' : `${diasRestantes(r.fecha_limite)} días restantes`}
        </p>
      </div>
    )},
    { key:'activo', label:'Estado', render: r => (
      <Badge color={r.activo && new Date(r.fecha_limite)>=new Date() ? 'green' : 'red'}>
        {r.activo && new Date(r.fecha_limite)>=new Date() ? 'Activo' : 'Inactivo'}
      </Badge>
    )},
    { key:'acciones', label:'', render: r => (
      <div className="flex gap-2 justify-end">
        <button onClick={e=>{e.stopPropagation();abrirEditar(r)}} className="p-1.5 text-gray-400 hover:text-brand-azul hover:bg-blue-50 rounded-lg transition-all"><Pencil size={14}/></button>
        <button onClick={e=>{e.stopPropagation();setEliminar(r)}} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
      </div>
    )},
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <Briefcase size={22} className="text-brand-azul"/> Gestión de Empleos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Publicá y gestioná los avisos laborales activos.</p>
        </div>
        <Button variant="primary" onClick={abrirNuevo}><Plus size={16}/> Nuevo aviso</Button>
      </div>

      <DataTable columns={COLS} data={empleos} loading={cargando} emptyMessage="No hay avisos de empleo." onRowClick={abrirEditar}/>

      {/* Modal formulario */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editando?'Editar aviso':'Nuevo aviso de empleo'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del puesto <span className="text-red-500">*</span></label>
            <input type="text" {...register('titulo')} className={input(errors.titulo)}/>
            {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <textarea rows={3} {...register('descripcion')} className={`${input(errors.descripcion)} resize-none`}/>
            {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos <span className="text-gray-400 font-normal">(uno por línea)</span></label>
            <textarea rows={3} placeholder="Título docente habilitante&#10;Experiencia mínima 2 años" {...register('requisitos')} className={`${input(false)} resize-none`}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de postulaciones <span className="text-red-500">*</span></label>
              <input type="email" {...register('contacto_email')} className={input(errors.contacto_email)}/>
              {errors.contacto_email && <p className="text-xs text-red-500 mt-1">{errors.contacto_email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite <span className="text-red-500">*</span></label>
              <input type="date" min={new Date().toISOString().split('T')[0]} {...register('fecha_limite')} className={input(errors.fecha_limite)}/>
              {errors.fecha_limite && <p className="text-xs text-red-500 mt-1">{errors.fecha_limite.message}</p>}
            </div>
          </div>
          <button type="button" onClick={()=>setValue('activo',!activoVal)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${activoVal?'border-green-400 bg-green-50':'border-gray-200'}`}>
            {activoVal ? <ToggleRight size={22} className="text-green-500"/> : <ToggleLeft size={22} className="text-gray-400"/>}
            <div className="text-left">
              <p className={`text-sm font-semibold ${activoVal?'text-green-700':'text-gray-500'}`}>{activoVal ? 'Activo' : 'Inactivo'}</p>
              <p className="text-xs text-gray-400">El aviso aparece en el sitio público si está activo</p>
            </div>
          </button>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={()=>setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>{editando?'Guardar cambios':'Publicar aviso'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal eliminar */}
      <Modal open={!!eliminar} onClose={()=>setEliminar(null)} title="¿Eliminar aviso?" size="sm">
        <p className="text-gray-600 text-sm mb-6">Vas a eliminar <strong>&ldquo;{eliminar?.titulo}&rdquo;</strong>. Esta acción es irreversible.</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={()=>setEliminar(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={confirmarEliminar}><Trash2 size={14}/> Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
