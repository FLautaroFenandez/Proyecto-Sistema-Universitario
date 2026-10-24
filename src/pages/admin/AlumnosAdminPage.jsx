/**
 * @file AlumnosAdminPage.jsx
 * @description Legajo digital de los alumnos matriculados (HU1 · REQ-13).
 *
 * Es la contracara de Matriculación: acá se consulta el resultado. Muestra el
 * legajo generado por la base, el curso del ciclo activo y los tutores
 * vinculados, que son los que después podrán ver a ese alumno desde su cuenta.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, IdCard, AlertTriangle, UserMinus, FileText, ScrollText, Link2, CheckCircle2 } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { Entrada, Seleccion } from '@/components/admin/CampoFormulario'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { academico, matricula, nombreCompletoDeCurso, mensajeDeError } from '@/services'
import { formatDateShort } from '@/utils/formatDate'
import { ROUTES } from '@/types/routes'

const COLOR_ESTADO = { activo: 'green', egresado: 'blue', baja: 'gray' }

/**
 * Vincula una cuenta ya registrada con el legajo: la del padre (para que vea a
 * su hijo) o la del propio alumno. Cubre el caso en que la persona se registró
 * después de la matriculación.
 */
function VincularCuenta({ alumnoId, alVincular }) {
  const [tipo,     setTipo]     = useState('tutor')
  const [relacion, setRelacion] = useState('padre')
  const [dni,      setDni]      = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error,    setError]    = useState(null)
  const [aviso,    setAviso]    = useState(null)

  const vincular = async () => {
    setEnviando(true)
    setError(null)
    setAviso(null)
    try {
      const cuenta = await matricula.vincularCuenta({ alumnoId, dni, tipo, relacion })
      setAviso(`${cuenta.nombre} quedó vinculado ${tipo === 'tutor' ? 'como tutor' : 'como cuenta del alumno'}.`)
      setDni('')
      alVincular()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo vincular la cuenta.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="w-44">
          <Seleccion aria-label="Tipo de cuenta" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="tutor">Tutor (padre)</option>
            <option value="alumno">Cuenta del alumno</option>
          </Seleccion>
        </div>
        {tipo === 'tutor' && (
          <div className="w-32">
            <Seleccion aria-label="Relación" value={relacion} onChange={e => setRelacion(e.target.value)}>
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="tutor">Tutor</option>
            </Seleccion>
          </div>
        )}
        <div className="flex-1 min-w-[9rem]">
          <Entrada aria-label="DNI de la cuenta" placeholder="DNI de la cuenta" inputMode="numeric"
            value={dni} onChange={e => setDni(e.target.value)} />
        </div>
        <Button type="button" variant="outline" loading={enviando} disabled={!dni.trim()} onClick={vincular}>
          <Link2 size={15} /> Vincular
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {aviso && <p className="text-xs text-green-700 flex items-center gap-1"><CheckCircle2 size={13} /> {aviso}</p>}
    </div>
  )
}

/** Detalle del alumno: datos personales, matrícula del ciclo y tutores. */
function DetalleAlumno({ alumno, alDarDeBaja }) {
  const [tutores,  setTutores]  = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)
  const [dandoBaja, setDandoBaja] = useState(false)
  const [confirmandoBaja, setConfirmandoBaja] = useState(false)
  const [version,  setVersion]  = useState(0)

  useEffect(() => {
    let cancelado = false
    matricula.listarTutores(alumno.id)
      .then(lista => { if (!cancelado) setTutores(lista) })
      .catch(err  => { if (!cancelado) setError(mensajeDeError(err, 'No pudimos cargar los tutores.')) })
      .finally(()  => { if (!cancelado) setCargando(false) })
    return () => { cancelado = true }
  }, [alumno.id, version])

  const darDeBaja = async () => {
    setDandoBaja(true)
    setError(null)
    try {
      await matricula.darDeBaja(alumno.matriculaActual.id, 'Baja registrada desde el panel.')
      alDarDeBaja()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo dar de baja la matrícula.'))
      setDandoBaja(false)
    }
  }

  const datos = [
    ['DNI', alumno.dni],
    ['Nacimiento', formatDateShort(alumno.fecha_nacimiento)],
    ['Domicilio', alumno.domicilio || '—'],
    ['Teléfono', alumno.telefono || '—'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
        <IdCard size={22} className="text-brand-azul flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Legajo</p>
          <p className="font-mono font-bold text-gray-800">{alumno.legajo}</p>
        </div>
        <Badge color={COLOR_ESTADO[alumno.estado] ?? 'gray'} className="ml-auto">{alumno.estado}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Datos personales</h3>
          {datos.map(([clave, valor]) => (
            <div key={clave} className="flex justify-between text-sm">
              <span className="text-gray-400">{clave}</span>
              <span className="font-medium text-gray-700">{valor}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Matrícula</h3>
          {alumno.matriculaActual ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Curso</span>
                <span className="font-medium text-gray-700">
                  {nombreCompletoDeCurso(alumno.matriculaActual.curso)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Desde</span>
                <span className="font-medium text-gray-700">
                  {formatDateShort(alumno.matriculaActual.fecha_matriculacion)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estado</span>
                <Badge color={alumno.matriculaActual.estado === 'activa' ? 'green' : 'gray'}>
                  {alumno.matriculaActual.estado}
                </Badge>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Sin matrícula en el ciclo activo.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">
          Tutores vinculados
        </h3>
        {cargando ? (
          <div className="py-4 flex justify-center"><Spinner /></div>
        ) : tutores.length === 0 ? (
          <p className="text-sm text-gray-400">
            Todavía no hay tutores con cuenta vinculados a este alumno.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {tutores.map(vinculo => (
              <li key={vinculo.tutor_id} className="flex items-center justify-between px-4 py-3 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-800">{vinculo.tutor?.nombre}</p>
                  <p className="text-xs text-gray-400">
                    DNI {vinculo.tutor?.dni}{vinculo.tutor?.telefono ? ` · ${vinculo.tutor.telefono}` : ''}
                  </p>
                </div>
                <Badge color="blue">{vinculo.relacion}</Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <VincularCuenta alumnoId={alumno.id} alVincular={() => setVersion(v => v + 1)} />
        </div>
      </div>

      {alumno.matriculaActual && (
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.BOLETIN(alumno.matriculaActual.id)} target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-azul border border-brand-azul/30 px-3 py-2 rounded-lg hover:bg-blue-50">
            <FileText size={14} /> Boletín
          </Link>
          {alumno.matriculaActual.estado === 'activa' && (
            <Link to={ROUTES.CONSTANCIA(alumno.matriculaActual.id)} target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-azul border border-brand-azul/30 px-3 py-2 rounded-lg hover:bg-blue-50">
              <ScrollText size={14} /> Constancia de alumno regular
            </Link>
          )}
        </div>
      )}

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Observación de las pruebas del 21/10: la baja se hacía con un solo clic. */}
      {alumno.matriculaActual?.estado === 'activa' && (confirmandoBaja ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-red-700">
            ¿Confirmás la baja? El alumno deja el curso y se libera su lugar. El legajo y su historia se conservan.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setConfirmandoBaja(false)}>Cancelar</Button>
            <Button variant="danger" fullWidth loading={dandoBaja} onClick={darDeBaja}>Confirmar la baja</Button>
          </div>
        </div>
      ) : (
        <Button variant="danger" fullWidth onClick={() => setConfirmandoBaja(true)}>
          <UserMinus size={15} /> Dar de baja la matrícula
        </Button>
      ))}
    </div>
  )
}

export default function AlumnosAdminPage() {
  const [busqueda,     setBusqueda]     = useState('')
  const [consulta,     setConsulta]     = useState('')
  const [alumnos,      setAlumnos]      = useState([])
  const [ciclo,        setCiclo]        = useState(null)
  const [cargando,     setCargando]     = useState(true)
  const [error,        setError]        = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)

  // El buscador espera a que el usuario deje de escribir, para no disparar una
  // consulta por cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setConsulta(busqueda), 350)
    return () => clearTimeout(id)
  }, [busqueda])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const cicloActivo = await academico.cicloActivo()
      setCiclo(cicloActivo)
      setAlumnos(await matricula.listarAlumnos({ cicloId: cicloActivo?.id, busqueda: consulta }))
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar los alumnos.'))
    } finally {
      setCargando(false)
    }
  }, [consulta])

  useEffect(() => { cargar() }, [cargar])

  const COLUMNAS = [
    { key: 'legajo', label: 'Legajo', render: fila => (
      <span className="font-mono text-xs font-semibold text-gray-700">{fila.legajo}</span>
    )},
    { key: 'alumno', label: 'Alumno', render: fila => (
      <div>
        <p className="font-medium text-gray-800 text-sm">{fila.apellido}, {fila.nombre}</p>
        <p className="text-xs text-gray-400">DNI {fila.dni}</p>
      </div>
    )},
    // Si la matrícula se dio de baja, se dice: antes la lista seguía mostrando el curso como vigente.
    { key: 'curso', label: 'Curso', render: fila => fila.matriculaActual
      ? <span className={`text-sm ${fila.matriculaActual.estado === 'activa' ? 'text-gray-600' : 'text-gray-400 line-through'}`}>
          {nombreCompletoDeCurso(fila.matriculaActual.curso)}
        </span>
      : <span className="text-xs text-gray-400">Sin matrícula</span>
    },
    { key: 'matricula', label: 'Matrícula', render: fila => fila.matriculaActual
      ? <Badge color={fila.matriculaActual.estado === 'activa' ? 'green' : 'gray'}>{fila.matriculaActual.estado}</Badge>
      : <span className="text-xs text-gray-400">—</span>
    },
    { key: 'estado', label: 'Estado', render: fila => (
      <Badge color={COLOR_ESTADO[fila.estado] ?? 'gray'}>{fila.estado}</Badge>
    )},
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <Users size={22} className="text-brand-azul" /> Alumnos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Legajos del ciclo {ciclo?.anio ?? 'activo'}: {alumnos.length} alumno{alumnos.length === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por apellido, DNI o legajo"
            aria-label="Buscar alumnos"
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none
                       focus:ring-2 focus:ring-brand-azul/20 focus:border-brand-azul"
          />
        </div>
      </div>

      {error
        ? <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-red-600">{error}</div>
        : <DataTable columns={COLUMNAS} data={alumnos} loading={cargando}
            emptyMessage={consulta
              ? 'Ningún alumno coincide con la búsqueda.'
              : 'Todavía no hay alumnos matriculados.'}
            onRowClick={setSeleccionado} />
      }

      <Modal
        open={!!seleccionado}
        onClose={() => setSeleccionado(null)}
        title={seleccionado ? `${seleccionado.apellido}, ${seleccionado.nombre}` : ''}
        size="lg"
      >
        {seleccionado && (
          <DetalleAlumno
            alumno={seleccionado}
            alDarDeBaja={() => { setSeleccionado(null); cargar() }}
          />
        )}
      </Modal>
    </div>
  )
}
