/**
 * @file PersonalAdminPage.jsx
 * @description Legajo del personal docente y no docente (HU6 · REQ-19).
 *
 * Criterios de HU6: crear, editar y dar de baja legajos; el estado se refleja
 * en los accesos (un disparador desactiva la cuenta vinculada) y el DNI no se
 * puede repetir. Para los docentes muestra además las materias y cursos a
 * cargo, que es lo que pide el "Módulo Profesores" del enunciado.
 */

import { useState, useEffect, useCallback } from 'react'
import { IdCard, Search, Plus, AlertTriangle, UserMinus, UserCheck, BookOpen } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { Campo, Entrada, Seleccion } from '@/components/admin/CampoFormulario'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  personal, FUNCIONES, etiquetaDeFuncion, nombreCompletoDeCurso, mensajeDeError,
} from '@/services'
import { formatDateShort } from '@/utils/formatDate'

const FILTROS = [
  { clave: null,       etiqueta: 'Todos' },
  { clave: 'activo',   etiqueta: 'Activos' },
  { clave: 'inactivo', etiqueta: 'Inactivos' },
]

const VACIO = {
  dni: '', apellido: '', nombre: '', email: '', telefono: '',
  funcion: 'docente', especialidad: '', area: '', fecha_ingreso: '', profile_id: '',
}

function validar(datos) {
  const errores = {}
  if (!/^\d{7,9}$/.test(datos.dni.trim())) errores.dni = 'DNI de 7 a 9 dígitos, sin puntos.'
  if (!datos.apellido.trim()) errores.apellido = 'Obligatorio.'
  if (!datos.nombre.trim()) errores.nombre = 'Obligatorio.'
  if (datos.email.trim() && !/^\S+@\S+\.\S+$/.test(datos.email.trim())) errores.email = 'Email inválido.'
  return errores
}

/** Formulario de alta y edición, con las materias a cargo si es docente. */
function FormularioLegajo({ legajo, alGuardar, alCancelar }) {
  const [datos,    setDatos]    = useState(() => legajo
    ? Object.fromEntries(Object.keys(VACIO).map(k => [k, legajo[k] ?? '']))
    : VACIO)
  const [errores,  setErrores]  = useState({})
  const [cuentas,  setCuentas]  = useState([])
  const [materias, setMaterias] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    personal.cuentasDisponibles(legajo?.profile_id).then(setCuentas).catch(() => setCuentas([]))
    if (legajo?.profile_id) personal.materiasACargo(legajo.profile_id).then(setMaterias).catch(() => setMaterias([]))
  }, [legajo])

  const cambiar = campo => e => setDatos(prev => ({ ...prev, [campo]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    const encontrados = validar(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    setGuardando(true)
    setError(null)
    try {
      const guardado = legajo ? await personal.actualizar(legajo.id, datos) : await personal.crear(datos)
      alGuardar(guardado)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el legajo.'))
      setGuardando(false)
    }
  }

  const cambiarEstado = async () => {
    setCambiandoEstado(true)
    setError(null)
    try {
      alGuardar(await personal.cambiarEstado(legajo.id, legajo.estado === 'activo' ? 'inactivo' : 'activo'))
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cambiar el estado.'))
      setCambiandoEstado(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="space-y-5">
      {legajo && (
        <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
          <IdCard size={22} className="text-brand-azul flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Legajo</p>
            <p className="font-mono font-bold text-gray-800">{legajo.legajo}</p>
          </div>
          <Badge color={legajo.estado === 'activo' ? 'green' : 'gray'} className="ml-auto">{legajo.estado}</Badge>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Campo etiqueta="Apellido" htmlFor="apellido" requerido error={errores.apellido}>
          <Entrada id="apellido" value={datos.apellido} onChange={cambiar('apellido')} />
        </Campo>
        <Campo etiqueta="Nombre" htmlFor="nombre" requerido error={errores.nombre}>
          <Entrada id="nombre" value={datos.nombre} onChange={cambiar('nombre')} />
        </Campo>
        <Campo etiqueta="DNI" htmlFor="dni" requerido error={errores.dni}>
          <Entrada id="dni" inputMode="numeric" value={datos.dni} onChange={cambiar('dni')} />
        </Campo>
        <Campo etiqueta="Función" htmlFor="funcion" requerido>
          <Seleccion id="funcion" value={datos.funcion} onChange={cambiar('funcion')}>
            {FUNCIONES.map(f => <option key={f.clave} value={f.clave}>{f.etiqueta}</option>)}
          </Seleccion>
        </Campo>
        <Campo etiqueta="Especialidad" htmlFor="especialidad" ayuda="Para docentes: área disciplinar.">
          <Entrada id="especialidad" value={datos.especialidad} onChange={cambiar('especialidad')} />
        </Campo>
        <Campo etiqueta="Área o curso asignado" htmlFor="area">
          <Entrada id="area" value={datos.area} onChange={cambiar('area')} />
        </Campo>
        <Campo etiqueta="Email" htmlFor="email" error={errores.email}>
          <Entrada id="email" type="email" value={datos.email} onChange={cambiar('email')} />
        </Campo>
        <Campo etiqueta="Teléfono" htmlFor="telefono">
          <Entrada id="telefono" value={datos.telefono} onChange={cambiar('telefono')} />
        </Campo>
        <Campo etiqueta="Fecha de ingreso" htmlFor="fecha_ingreso" ayuda={legajo ? null : 'Si queda vacía, se usa la de hoy.'}>
          <Entrada id="fecha_ingreso" type="date" value={datos.fecha_ingreso} onChange={cambiar('fecha_ingreso')} />
        </Campo>
        <Campo etiqueta="Cuenta en el sistema" htmlFor="profile_id"
          ayuda="Al dar de baja el legajo, esta cuenta pierde el acceso.">
          <Seleccion id="profile_id" value={datos.profile_id} onChange={cambiar('profile_id')}>
            <option value="">Sin cuenta vinculada</option>
            {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.rol})</option>)}
          </Seleccion>
        </Campo>
      </div>

      {legajo?.profile_id && (
        <div>
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
            <BookOpen size={15} /> Materias a cargo
          </h3>
          {materias.length === 0 ? (
            <p className="text-sm text-gray-400">Sin materias asignadas en el ciclo activo.</p>
          ) : (
            <ul className="text-sm text-gray-600 space-y-1">
              {materias.map(m => (
                <li key={m.id}>{m.materia?.nombre} — <span className="capitalize">{nombreCompletoDeCurso(m.curso)}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="ghost" onClick={alCancelar}>Cancelar</Button>
        {legajo && (
          <Button type="button" variant={legajo.estado === 'activo' ? 'danger' : 'outline'}
            loading={cambiandoEstado} onClick={cambiarEstado}>
            {legajo.estado === 'activo'
              ? <><UserMinus size={15} /> Dar de baja</>
              : <><UserCheck size={15} /> Reactivar</>}
          </Button>
        )}
        <Button type="submit" variant="primary" loading={guardando} className="ml-auto">
          {legajo ? 'Guardar cambios' : 'Crear legajo'}
        </Button>
      </div>
    </form>
  )
}

export default function PersonalAdminPage() {
  const [lista,     setLista]     = useState([])
  const [filtro,    setFiltro]    = useState(null)
  const [busqueda,  setBusqueda]  = useState('')
  const [consulta,  setConsulta]  = useState('')
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const [editando,  setEditando]  = useState(null)   // null cerrado · 'nuevo' · legajo

  useEffect(() => {
    const id = setTimeout(() => setConsulta(busqueda), 350)
    return () => clearTimeout(id)
  }, [busqueda])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setLista(await personal.listar({ busqueda: consulta, estado: filtro }))
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar el personal.'))
    } finally {
      setCargando(false)
    }
  }, [consulta, filtro])

  useEffect(() => { cargar() }, [cargar])

  const COLUMNAS = [
    { key: 'legajo', label: 'Legajo', render: f => <span className="font-mono text-xs font-semibold text-gray-700">{f.legajo}</span> },
    { key: 'persona', label: 'Persona', render: f => (
      <div>
        <p className="font-medium text-gray-800 text-sm">{f.apellido}, {f.nombre}</p>
        <p className="text-xs text-gray-400">DNI {f.dni}</p>
      </div>
    )},
    { key: 'funcion', label: 'Función', render: f => (
      <div>
        <p className="text-sm text-gray-600">{etiquetaDeFuncion(f.funcion)}</p>
        {f.especialidad && <p className="text-xs text-gray-400">{f.especialidad}</p>}
      </div>
    )},
    { key: 'cuenta', label: 'Cuenta', render: f => f.cuenta
      ? <span className="text-xs text-gray-500">{f.cuenta.nombre} · {f.cuenta.rol}</span>
      : <span className="text-xs text-gray-300">Sin cuenta</span> },
    { key: 'ingreso', label: 'Ingreso', render: f => <span className="text-xs text-gray-400">{formatDateShort(f.fecha_ingreso)}</span> },
    { key: 'estado', label: 'Estado', render: f => <Badge color={f.estado === 'activo' ? 'green' : 'gray'}>{f.estado}</Badge> },
  ]

  const alGuardar = () => { setEditando(null); cargar() }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <IdCard size={22} className="text-brand-azul" /> Personal
          </h1>
          <p className="text-gray-400 text-sm mt-1">Legajos del personal docente y no docente.</p>
        </div>
        <Button variant="primary" onClick={() => setEditando('nuevo')}><Plus size={15} /> Nuevo legajo</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {FILTROS.map(f => (
            <button key={String(f.clave)} onClick={() => setFiltro(f.clave)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filtro === f.clave ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              {f.etiqueta}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por apellido, DNI o legajo" aria-label="Buscar personal"
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul" />
        </div>
      </div>

      {error
        ? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-red-600">{error}</div>
        : <DataTable columns={COLUMNAS} data={lista} loading={cargando}
            emptyMessage={consulta ? 'Ningún legajo coincide con la búsqueda.' : 'Todavía no hay legajos de personal.'}
            onRowClick={setEditando} />}

      <Modal open={!!editando} onClose={() => setEditando(null)} size="lg"
        title={editando === 'nuevo' ? 'Nuevo legajo de personal' : editando ? `${editando.apellido}, ${editando.nombre}` : ''}>
        {editando && (
          <FormularioLegajo
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            legajo={editando === 'nuevo' ? null : editando}
            alGuardar={alGuardar}
            alCancelar={() => setEditando(null)} />
        )}
      </Modal>
    </div>
  )
}
