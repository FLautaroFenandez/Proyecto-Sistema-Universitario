/**
 * @file UsuariosAdminPage.jsx
 * @description Gestión de usuarios del sistema — solo rol admin.
 * Si no es admin, muestra "Sin permiso". Tabla filtrable por rol con toggle activo.
 * El cambio de rol se hace directamente en la tabla profiles (el admin mismo
 * crea los usuarios desde Supabase Auth Dashboard y aquí les asigna el rol).
 */

import { useState, useEffect, useContext } from 'react'
import { Users, ShieldAlert, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/components/auth/AuthContext'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatDateShort } from '@/utils/formatDate'
import { ROLES } from '@/types/roles'

const ROL_COLOR = {
  admin:'red', autoridad:'purple', docente:'blue',
  personal:'teal', padre:'green', estudiante:'orange',
}

const FILTROS = [
  { key:null, label:'Todos' },
  ...Object.values(ROLES).map(r => ({ key:r, label:r.charAt(0).toUpperCase()+r.slice(1) })),
]

export default function UsuariosAdminPage() {
  const { profile } = useContext(AuthContext)
  const [usuarios,  setUsuarios]  = useState([])
  const [cargando,  setCargando]  = useState(true)
  const [filtro,    setFiltro]    = useState(null)
  const [editando,  setEditando]  = useState(null)
  const [nuevoRol,  setNuevoRol]  = useState('')
  const [guardando, setGuardando] = useState(false)

  // Verificar que sea admin
  const esAdmin = profile?.rol === ROLES.ADMIN

  const fetchUsuarios = async () => {
    setCargando(true)
    let q = supabase.from('profiles').select('id,nombre,dni,rol,activo,created_at').order('created_at',{ascending:false})
    if (filtro) q = q.eq('rol', filtro)
    const { data } = await q
    setUsuarios(data??[])
    setCargando(false)
  }

  useEffect(() => { if (esAdmin) fetchUsuarios() }, [filtro, esAdmin])

  const toggleActivo = async (usr) => {
    await supabase.from('profiles').update({ activo: !usr.activo }).eq('id', usr.id)
    fetchUsuarios()
  }

  const abrirEditar = (usr) => { setEditando(usr); setNuevoRol(usr.rol) }

  const guardarRol = async () => {
    if (!editando) return
    setGuardando(true)
    await supabase.from('profiles').update({ rol: nuevoRol }).eq('id', editando.id)
    setGuardando(false)
    setEditando(null)
    fetchUsuarios()
  }

  if (!esAdmin) return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <ShieldAlert size={48} className="text-gray-300 mb-4"/>
      <h2 className="font-display font-bold text-gray-700 text-xl mb-2">Sin permiso</h2>
      <p className="text-gray-400 text-sm max-w-xs">Esta sección es exclusiva para el rol <strong>Administrador</strong>.</p>
    </div>
  )

  const COLS = [
    { key:'nombre', label:'Usuario', render: r => (
      <div>
        <p className="font-medium text-gray-800 text-sm">{r.nombre}</p>
        <p className="text-xs text-gray-400">{r.dni}</p>
      </div>
    )},
    { key:'rol', label:'Rol', render: r => (
      <Badge color={ROL_COLOR[r.rol]??'gray'}>{r.rol}</Badge>
    )},
    { key:'activo', label:'Estado', render: r => (
      <button onClick={e=>{e.stopPropagation(); toggleActivo(r)}} className="flex items-center gap-1.5 text-sm">
        {r.activo
          ? <><ToggleRight size={18} className="text-green-500"/><span className="text-green-600">Activo</span></>
          : <><ToggleLeft size={18} className="text-gray-400"/><span className="text-gray-400">Inactivo</span></>
        }
      </button>
    )},
    { key:'created_at', label:'Registro', render: r => <span className="text-xs text-gray-400">{formatDateShort(r.created_at)}</span> },
    { key:'acciones', label:'', render: r => (
      <button onClick={e=>{e.stopPropagation();abrirEditar(r)}}
        className="text-xs text-brand-azul border border-brand-azul/30 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">
        Cambiar rol
      </button>
    )},
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <Users size={22} className="text-brand-azul"/> Gestión de Usuarios
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Administrá los roles y el acceso de todos los usuarios del sistema.
        </p>
      </div>

      {/* Nota instructiva */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>¿Cómo crear usuarios de personal?</strong> Creá la cuenta desde{' '}
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase → Authentication → Users</a>
        {' '}y luego cambiá su rol acá. Los padres y estudiantes se auto-registran desde /registro.
      </div>

      {/* Filtros */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {FILTROS.map(f => (
          <button key={String(f.key)} onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filtro===f.key?'bg-white shadow-sm text-gray-800':'text-gray-500 hover:text-gray-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <DataTable columns={COLS} data={usuarios} loading={cargando} emptyMessage="No hay usuarios con este filtro." onRowClick={abrirEditar}/>

      {/* Modal cambiar rol */}
      <Modal open={!!editando} onClose={()=>setEditando(null)} title="Cambiar rol del usuario" size="sm">
        {editando && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-800">{editando.nombre}</p>
              <p className="text-xs text-gray-400 mt-0.5">DNI {editando.dni}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo rol</label>
              <div className="relative">
                <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 appearance-none">
                  {Object.values(ROLES).map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={()=>setEditando(null)}>Cancelar</Button>
              <Button variant="primary" fullWidth loading={guardando} onClick={guardarRol}>Guardar rol</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
