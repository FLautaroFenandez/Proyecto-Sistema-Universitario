/**
 * @file MatriculacionAdminPage.jsx
 * @description HU1 — Matricular un alumno desde una solicitud aprobada (REQ-13).
 *
 * Circuito: la familia envía la solicitud desde la web pública → Administración
 * la acepta en "Inscripciones" → acá se la convierte en alumno con legajo y se
 * lo ubica en un curso. La solicitud queda en estado "matriculada" y no puede
 * procesarse de nuevo.
 *
 * Toda la persistencia pasa por la capa de servicios (patrón Facade).
 */

import { useState, useEffect, useCallback, useContext } from 'react'
import { UserPlus, CheckCircle2, AlertTriangle, IdCard } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { DataTable } from '@/components/admin/DataTable'
import { Campo, Entrada, Seleccion } from '@/components/admin/CampoFormulario'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { academico, matricula, separarNombre, nombreCompletoDeCurso, mensajeDeError } from '@/services'
import { formatDateShort } from '@/utils/formatDate'

const FILTROS = [
  { key: 'aceptada',    label: 'Para matricular' },
  { key: 'matriculada', label: 'Matriculadas' },
]

/** Datos del alumno precargados desde la solicitud, para que el admin solo confirme. */
function formularioDesdeSolicitud(solicitud) {
  const { nombre, apellido } = separarNombre(solicitud.estudiante_nombre)
  return {
    nombre,
    apellido,
    dni:              solicitud.estudiante_dni ?? '',
    fecha_nacimiento: solicitud.estudiante_nacimiento ?? '',
    domicilio:        '',
    telefono:         solicitud.tutor_telefono ?? '',
    email:            solicitud.tutor_email ?? '',
    cursoId:          '',
  }
}

/** Primer curso libre que coincida con el nivel y el turno pedidos en la solicitud. */
function cursoSugerido(cursos, solicitud) {
  const coincide = cursos.find(c =>
    c.nivel?.nombre === solicitud.nivel && c.turno === solicitud.turno && !c.completo)
  return coincide?.id ?? ''
}

export default function MatriculacionAdminPage() {
  const { profile } = useContext(AuthContext)

  const [filtro,       setFiltro]       = useState('aceptada')
  const [solicitudes,  setSolicitudes]  = useState([])
  const [cursos,       setCursos]       = useState([])
  const [ciclo,        setCiclo]        = useState(null)
  const [cargando,     setCargando]     = useState(true)
  const [errorCarga,   setErrorCarga]   = useState(null)

  const [seleccionada, setSeleccionada] = useState(null)
  const [form,         setForm]         = useState(null)
  const [guardando,    setGuardando]    = useState(false)
  const [errorModal,   setErrorModal]   = useState(null)
  const [resultado,    setResultado]    = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const cicloActivo = await academico.cicloActivo()
      const [listaSolicitudes, listaCursos] = await Promise.all([
        matricula.listarSolicitudes(filtro),
        academico.listarCursosConOcupacion(cicloActivo?.id),
      ])
      setCiclo(cicloActivo)
      setSolicitudes(listaSolicitudes)
      setCursos(listaCursos)
    } catch (err) {
      setErrorCarga(mensajeDeError(err, 'No pudimos cargar las solicitudes.'))
    } finally {
      setCargando(false)
    }
  }, [filtro])

  useEffect(() => { cargar() }, [cargar])

  const abrirMatriculacion = (solicitud) => {
    if (solicitud.estado === 'matriculada') return
    setSeleccionada(solicitud)
    setForm({ ...formularioDesdeSolicitud(solicitud), cursoId: cursoSugerido(cursos, solicitud) })
    setErrorModal(null)
    setResultado(null)
  }

  const cerrarModal = () => {
    setSeleccionada(null)
    setForm(null)
    setResultado(null)
    setErrorModal(null)
  }

  const actualizar = (campo) => (evento) =>
    setForm(anterior => ({ ...anterior, [campo]: evento.target.value }))

  const confirmarMatricula = async () => {
    if (!form.apellido.trim() || !form.nombre.trim()) {
      return setErrorModal('Completá el nombre y el apellido del alumno.')
    }
    if (!form.dni.trim()) return setErrorModal('El DNI del alumno es obligatorio.')
    if (!form.fecha_nacimiento) return setErrorModal('Indicá la fecha de nacimiento.')
    if (!form.cursoId) return setErrorModal('Elegí el curso en el que se matricula.')

    setGuardando(true)
    setErrorModal(null)
    try {
      const { alumno, tutorVinculado } = await matricula.matricularDesdeSolicitud({
        solicitud:      seleccionada,
        cursoId:        form.cursoId,
        cicloId:        ciclo.id,
        datosAlumno:    form,
        matriculadoPor: profile?.id,
      })
      setResultado({
        legajo: alumno.legajo,
        curso:  nombreCompletoDeCurso(cursos.find(c => c.id === form.cursoId)),
        tutorVinculado,
      })
      cargar()
    } catch (err) {
      setErrorModal(mensajeDeError(err, 'No se pudo completar la matrícula.'))
    } finally {
      setGuardando(false)
    }
  }

  const COLUMNAS = [
    { key: 'estudiante_nombre', label: 'Estudiante', render: fila => (
      <div>
        <p className="font-medium text-gray-800 text-sm">{fila.estudiante_nombre}</p>
        <p className="text-xs text-gray-400">DNI {fila.estudiante_dni}</p>
      </div>
    )},
    { key: 'nivel', label: 'Nivel solicitado', render: fila => (
      <span className="capitalize text-sm text-gray-600">{fila.nivel}</span>
    )},
    { key: 'turno', label: 'Turno', render: fila => (
      <span className="text-sm text-gray-500">{fila.turno === 'manana' ? 'Mañana' : 'Tarde'}</span>
    )},
    { key: 'tutor_nombre', label: 'Tutor', render: fila => (
      <div>
        <p className="text-sm text-gray-700">{fila.tutor_nombre}</p>
        <p className="text-xs text-gray-400">{fila.tutor_telefono}</p>
      </div>
    )},
    { key: 'created_at', label: 'Solicitada', render: fila => (
      <span className="text-xs text-gray-400">{formatDateShort(fila.created_at)}</span>
    )},
    { key: 'accion', label: '', render: fila => fila.estado === 'matriculada'
      ? <Badge color="green">matriculada</Badge>
      : <Button size="sm" variant="primary" onClick={() => abrirMatriculacion(fila)}>
          <UserPlus size={13} /> Matricular
        </Button>
    },
  ]

  const sinCiclo   = !cargando && !ciclo
  const sinCursos  = !cargando && ciclo && cursos.length === 0
  const cursoElegido = cursos.find(c => c.id === form?.cursoId)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <UserPlus size={22} className="text-brand-azul" /> Matriculación
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Convertí una solicitud aprobada en un alumno con legajo y curso asignado.
          </p>
        </div>
        {ciclo && (
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Ciclo lectivo</p>
            <p className="font-display font-bold text-gray-800 text-lg leading-tight">{ciclo.anio}</p>
          </div>
        )}
      </div>

      {sinCiclo && (
        <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-brand-naranja flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold">No hay un ciclo lectivo activo.</p>
            <p className="text-gray-500 mt-0.5">
              La matrícula es anual, así que primero hay que abrir el ciclo en la base de datos.
            </p>
          </div>
        </div>
      )}

      {sinCursos && (
        <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <AlertTriangle size={18} className="text-brand-naranja flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Todavía no hay cursos en el ciclo {ciclo.anio}.</p>
            <p className="text-gray-500 mt-0.5">
              Creá los cursos en «Cursos y materias» antes de matricular.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTROS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filtro === f.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {errorCarga
        ? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-red-600">{errorCarga}</div>
        : <DataTable
            columns={COLUMNAS}
            data={solicitudes}
            loading={cargando}
            emptyMessage={filtro === 'aceptada'
              ? 'No hay solicitudes aprobadas esperando matrícula.'
              : 'Todavía no se matriculó ninguna solicitud.'}
          />
      }

      {/* ── Modal de matriculación ── */}
      <Modal open={!!seleccionada} onClose={cerrarModal} title="Matricular alumno" size="lg">
        {form && !resultado && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Campo etiqueta="Apellido" htmlFor="apellido" requerido>
                <Entrada id="apellido" value={form.apellido} onChange={actualizar('apellido')} />
              </Campo>
              <Campo etiqueta="Nombre" htmlFor="nombre" requerido>
                <Entrada id="nombre" value={form.nombre} onChange={actualizar('nombre')} />
              </Campo>
              <Campo etiqueta="DNI" htmlFor="dni" requerido>
                <Entrada id="dni" value={form.dni} onChange={actualizar('dni')} />
              </Campo>
              <Campo etiqueta="Fecha de nacimiento" htmlFor="nacimiento" requerido>
                <Entrada id="nacimiento" type="date" value={form.fecha_nacimiento}
                  onChange={actualizar('fecha_nacimiento')} />
              </Campo>
              <Campo etiqueta="Domicilio" htmlFor="domicilio">
                <Entrada id="domicilio" value={form.domicilio} onChange={actualizar('domicilio')} />
              </Campo>
              <Campo etiqueta="Teléfono de contacto" htmlFor="telefono">
                <Entrada id="telefono" value={form.telefono} onChange={actualizar('telefono')} />
              </Campo>
            </div>

            <Campo
              etiqueta="Curso"
              htmlFor="curso"
              requerido
              ayuda={`La solicitud pidió nivel ${seleccionada.nivel}, turno ${
                seleccionada.turno === 'manana' ? 'mañana' : 'tarde'}.`}
            >
              <Seleccion id="curso" value={form.cursoId} onChange={actualizar('cursoId')}>
                <option value="">Elegí un curso…</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id} disabled={curso.completo}>
                    {nombreCompletoDeCurso(curso)} — {curso.ocupadas}/{curso.cupo}
                    {curso.completo ? ' (completo)' : ''}
                  </option>
                ))}
              </Seleccion>
            </Campo>

            {cursoElegido && (
              <p className="text-xs text-gray-500">
                Quedan <b>{cursoElegido.libres}</b> lugares en {nombreCompletoDeCurso(cursoElegido)}.
              </p>
            )}

            {errorModal && (
              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorModal}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={cerrarModal}>Cancelar</Button>
              <Button variant="primary" fullWidth loading={guardando} onClick={confirmarMatricula}>
                Confirmar matrícula
              </Button>
            </div>
          </div>
        )}

        {resultado && (
          <div className="space-y-5 text-center py-2">
            <CheckCircle2 size={44} className="text-brand-verde mx-auto" />
            <div>
              <h3 className="font-display font-bold text-gray-800 text-lg">Alumno matriculado</h3>
              <p className="text-gray-500 text-sm mt-1">
                {form.apellido}, {form.nombre} quedó matriculado en {resultado.curso}.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 inline-flex items-center gap-3">
              <IdCard size={18} className="text-brand-azul" />
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Legajo asignado</p>
                <p className="font-mono font-bold text-gray-800">{resultado.legajo}</p>
              </div>
            </div>
            {!resultado.tutorVinculado && (
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                El tutor todavía no tiene cuenta en el sistema, así que el vínculo con el alumno
                queda pendiente hasta que se registre.
              </p>
            )}
            <Button variant="secondary" fullWidth onClick={cerrarModal}>Listo</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
