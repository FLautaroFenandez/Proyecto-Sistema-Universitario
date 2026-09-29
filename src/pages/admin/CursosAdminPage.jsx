/**
 * @file CursosAdminPage.jsx
 * @description REQ-14 — Cursos, materias y asignación de docentes.
 *
 * Es la precondición de HU1 (matricular en un curso), HU2 (cargar notas de una
 * materia) y HU4 (tomar asistencia de un curso).
 *
 * Regla del enunciado que se ve acá: una materia puede dictarse en varios
 * cursos y tener distinto profesor según el curso, así que el docente se asigna
 * en el curso y no en la materia.
 */

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Plus, Users, Trash2, AlertTriangle, GraduationCap } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { Campo, Entrada, Seleccion } from '@/components/admin/CampoFormulario'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { academico, nombreDeCurso, mensajeDeError } from '@/services'

const TURNOS = [
  { valor: 'manana', etiqueta: 'Mañana' },
  { valor: 'tarde',  etiqueta: 'Tarde' },
]

const CURSO_VACIO = { nivel_id: '', anio: 1, division: 'A', turno: 'manana', cupo: 30 }
const MATERIA_VACIA = { nombre: '', codigo: '', activa: true }

/** Color del badge de ocupación: verde con lugar, naranja casi lleno, rojo completo. */
function colorDeOcupacion({ ocupadas, cupo, completo }) {
  if (completo) return 'red'
  return ocupadas / cupo >= 0.8 ? 'orange' : 'green'
}

function Aviso({ children }) {
  return (
    <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  )
}

/**
 * Materias dictadas en un curso, con su docente. Se carga aparte del curso
 * porque solo hace falta cuando se abre el detalle.
 */
function MateriasDelCurso({ curso, materias, docentes, alCambiar }) {
  const [dictados, setDictados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)
  const [nueva,    setNueva]    = useState({ materiaId: '', docenteId: '' })
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      setDictados(await academico.listarDictados(curso.id))
      setError(null)
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar las materias del curso.'))
    } finally {
      setCargando(false)
    }
  }, [curso.id])

  useEffect(() => { cargar() }, [cargar])

  const asignar = async () => {
    if (!nueva.materiaId) return setError('Elegí la materia que se va a dictar.')
    setGuardando(true)
    setError(null)
    try {
      await academico.asignarMateria({
        cursoId:   curso.id,
        materiaId: nueva.materiaId,
        docenteId: nueva.docenteId,
      })
      setNueva({ materiaId: '', docenteId: '' })
      await cargar()
      alCambiar?.()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo asignar la materia.'))
    } finally {
      setGuardando(false)
    }
  }

  const cambiarDocente = async (dictadoId, docenteId) => {
    setError(null)
    try {
      await academico.cambiarDocente(dictadoId, docenteId)
      await cargar()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cambiar el docente.'))
    }
  }

  const quitar = async (dictadoId) => {
    setError(null)
    try {
      await academico.quitarMateria(dictadoId)
      await cargar()
      alCambiar?.()
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo quitar la materia.'))
    }
  }

  const yaAsignadas = dictados.map(d => d.materia?.id)
  const disponibles = materias.filter(m => m.activa && !yaAsignadas.includes(m.id))

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
        <BookOpen size={15} /> Materias del curso
      </h3>

      {error && <Aviso>{error}</Aviso>}

      {cargando ? (
        <div className="py-6 flex justify-center"><Spinner /></div>
      ) : dictados.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">Este curso todavía no tiene materias asignadas.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {dictados.map(dictado => (
            <li key={dictado.id} className="flex items-center gap-3 px-4 py-3 bg-white">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{dictado.materia?.nombre}</p>
                <p className="text-xs text-gray-400">{dictado.materia?.codigo}</p>
              </div>
              <div className="w-56">
                <Seleccion
                  aria-label={`Docente de ${dictado.materia?.nombre}`}
                  value={dictado.docente?.id ?? ''}
                  onChange={e => cambiarDocente(dictado.id, e.target.value)}
                >
                  <option value="">Sin docente asignado</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </Seleccion>
              </div>
              <button
                onClick={() => quitar(dictado.id)}
                aria-label={`Quitar ${dictado.materia?.nombre} del curso`}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Asignar una materia más */}
      <div className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 rounded-xl p-4">
        <div className="flex-1 w-full">
          <Campo etiqueta="Agregar materia" htmlFor="nueva-materia">
            <Seleccion id="nueva-materia" value={nueva.materiaId}
              onChange={e => setNueva(n => ({ ...n, materiaId: e.target.value }))}>
              <option value="">Elegí una materia…</option>
              {disponibles.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </Seleccion>
          </Campo>
        </div>
        <div className="flex-1 w-full">
          <Campo etiqueta="Docente" htmlFor="nuevo-docente">
            <Seleccion id="nuevo-docente" value={nueva.docenteId}
              onChange={e => setNueva(n => ({ ...n, docenteId: e.target.value }))}>
              <option value="">Asignar después</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </Seleccion>
          </Campo>
        </div>
        <Button variant="secondary" loading={guardando} onClick={asignar}>
          <Plus size={14} /> Asignar
        </Button>
      </div>
    </div>
  )
}

export default function CursosAdminPage() {
  const [pestana,  setPestana]  = useState('cursos')
  const [ciclo,    setCiclo]    = useState(null)
  const [niveles,  setNiveles]  = useState([])
  const [cursos,   setCursos]   = useState([])
  const [materias, setMaterias] = useState([])
  const [docentes, setDocentes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  const [cursoEnDetalle, setCursoEnDetalle] = useState(null)
  const [formCurso,      setFormCurso]      = useState(null)
  const [formMateria,    setFormMateria]    = useState(null)
  const [guardando,      setGuardando]      = useState(false)
  const [errorForm,      setErrorForm]      = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const cicloActivo = await academico.cicloActivo()
      const [listaNiveles, listaCursos, listaMaterias, listaDocentes] = await Promise.all([
        academico.listarNiveles(),
        academico.listarCursosConOcupacion(cicloActivo?.id),
        academico.listarMaterias(),
        academico.listarDocentes(),
      ])
      setCiclo(cicloActivo)
      setNiveles(listaNiveles)
      setCursos(listaCursos)
      setMaterias(listaMaterias)
      setDocentes(listaDocentes)
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos cargar la estructura académica.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ── Cursos ────────────────────────────────────────────────────────────────

  const abrirNuevoCurso = () => {
    setFormCurso({ ...CURSO_VACIO, nivel_id: niveles[0]?.id ?? '' })
    setErrorForm(null)
  }

  const abrirDetalle = (curso) => {
    setCursoEnDetalle(curso)
    setFormCurso({
      nivel_id: curso.nivel_id, anio: curso.anio, division: curso.division,
      turno: curso.turno, cupo: curso.cupo,
    })
    setErrorForm(null)
  }

  const cerrarCurso = () => {
    setCursoEnDetalle(null)
    setFormCurso(null)
    setErrorForm(null)
  }

  const guardarCurso = async () => {
    if (!formCurso.nivel_id) return setErrorForm('Elegí el nivel educativo del curso.')
    if (!String(formCurso.division).trim()) return setErrorForm('Indicá la división (A, B, C…).')

    const datos = {
      nivel_id: Number(formCurso.nivel_id),
      anio:     Number(formCurso.anio),
      division: String(formCurso.division).trim().toUpperCase(),
      turno:    formCurso.turno,
      cupo:     Number(formCurso.cupo),
      ciclo_id: ciclo.id,
    }

    setGuardando(true)
    setErrorForm(null)
    try {
      if (cursoEnDetalle) await academico.actualizarCurso(cursoEnDetalle.id, datos)
      else                await academico.crearCurso(datos)
      cerrarCurso()
      cargar()
    } catch (err) {
      setErrorForm(mensajeDeError(err, 'No se pudo guardar el curso.'))
    } finally {
      setGuardando(false)
    }
  }

  // ── Materias ──────────────────────────────────────────────────────────────

  const guardarMateria = async () => {
    if (!formMateria.nombre.trim()) return setErrorForm('El nombre de la materia es obligatorio.')
    if (!formMateria.codigo.trim()) return setErrorForm('Asignale un código corto, por ejemplo MAT-1.')

    const datos = {
      nombre: formMateria.nombre.trim(),
      codigo: formMateria.codigo.trim().toUpperCase(),
      activa: formMateria.activa,
    }

    setGuardando(true)
    setErrorForm(null)
    try {
      if (formMateria.id) await academico.actualizarMateria(formMateria.id, datos)
      else                await academico.crearMateria(datos)
      setFormMateria(null)
      cargar()
    } catch (err) {
      setErrorForm(mensajeDeError(err, 'No se pudo guardar la materia.'))
    } finally {
      setGuardando(false)
    }
  }

  const COLUMNAS_CURSOS = [
    { key: 'curso', label: 'Curso', render: fila => (
      <div>
        <p className="font-medium text-gray-800 text-sm">{nombreDeCurso(fila)}</p>
        <p className="text-xs text-gray-400 capitalize">{fila.nivel?.nombre}</p>
      </div>
    )},
    { key: 'ocupacion', label: 'Matriculados', render: fila => (
      <Badge color={colorDeOcupacion(fila)}>{fila.ocupadas}/{fila.cupo}</Badge>
    )},
    { key: 'libres', label: 'Lugares libres', render: fila => (
      <span className="text-sm text-gray-600">{fila.libres}</span>
    )},
    { key: 'materias', label: 'Materias', render: fila => (
      <span className="text-sm text-gray-600 flex items-center gap-1.5">
        <BookOpen size={13} className="text-gray-400" /> {fila.materias}
      </span>
    )},
  ]

  const COLUMNAS_MATERIAS = [
    { key: 'nombre', label: 'Materia', render: fila => (
      <p className="font-medium text-gray-800 text-sm">{fila.nombre}</p>
    )},
    { key: 'codigo', label: 'Código', render: fila => (
      <span className="font-mono text-xs text-gray-500">{fila.codigo}</span>
    )},
    { key: 'activa', label: 'Estado', render: fila => (
      <Badge color={fila.activa ? 'green' : 'gray'}>{fila.activa ? 'activa' : 'inactiva'}</Badge>
    )},
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
            <GraduationCap size={22} className="text-brand-azul" /> Cursos y materias
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Estructura académica del ciclo: cursos, materias y quién dicta cada una.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {ciclo && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Ciclo lectivo</p>
              <p className="font-display font-bold text-gray-800 text-lg leading-tight">{ciclo.anio}</p>
            </div>
          )}
          {pestana === 'cursos'
            ? <Button variant="primary" onClick={abrirNuevoCurso} disabled={!ciclo}>
                <Plus size={15} /> Nuevo curso
              </Button>
            : <Button variant="primary" onClick={() => { setFormMateria({ ...MATERIA_VACIA }); setErrorForm(null) }}>
                <Plus size={15} /> Nueva materia
              </Button>
          }
        </div>
      </div>

      {error && <Aviso>{error}</Aviso>}

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[['cursos', 'Cursos'], ['materias', 'Materias']].map(([clave, etiqueta]) => (
          <button key={clave} onClick={() => setPestana(clave)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pestana === clave ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {etiqueta}
          </button>
        ))}
      </div>

      {pestana === 'cursos' ? (
        <DataTable columns={COLUMNAS_CURSOS} data={cursos} loading={cargando}
          emptyMessage="Todavía no hay cursos en este ciclo lectivo."
          onRowClick={abrirDetalle} />
      ) : (
        <DataTable columns={COLUMNAS_MATERIAS} data={materias} loading={cargando}
          emptyMessage="Todavía no se cargaron materias."
          onRowClick={materia => { setFormMateria({ ...materia }); setErrorForm(null) }} />
      )}

      {/* ── Curso: alta y detalle ── */}
      <Modal
        open={!!formCurso}
        onClose={cerrarCurso}
        title={cursoEnDetalle ? `Curso ${nombreDeCurso(cursoEnDetalle)}` : 'Nuevo curso'}
        size="lg"
      >
        {formCurso && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo etiqueta="Nivel educativo" htmlFor="nivel" requerido>
                <Seleccion id="nivel" value={formCurso.nivel_id}
                  onChange={e => setFormCurso(f => ({ ...f, nivel_id: e.target.value }))}>
                  {niveles.map(n => (
                    <option key={n.id} value={n.id} className="capitalize">{n.nombre}</option>
                  ))}
                </Seleccion>
              </Campo>
              <Campo etiqueta="Año" htmlFor="anio" requerido ayuda="De 1 a 7.">
                <Entrada id="anio" type="number" min="1" max="7" value={formCurso.anio}
                  onChange={e => setFormCurso(f => ({ ...f, anio: e.target.value }))} />
              </Campo>
              <Campo etiqueta="División" htmlFor="division" requerido>
                <Entrada id="division" maxLength={5} value={formCurso.division}
                  onChange={e => setFormCurso(f => ({ ...f, division: e.target.value }))} />
              </Campo>
              <Campo etiqueta="Turno" htmlFor="turno" requerido>
                <Seleccion id="turno" value={formCurso.turno}
                  onChange={e => setFormCurso(f => ({ ...f, turno: e.target.value }))}>
                  {TURNOS.map(t => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                </Seleccion>
              </Campo>
              <Campo etiqueta="Cupo" htmlFor="cupo" requerido
                ayuda="La base rechaza matricular más alumnos que el cupo.">
                <Entrada id="cupo" type="number" min="1" value={formCurso.cupo}
                  onChange={e => setFormCurso(f => ({ ...f, cupo: e.target.value }))} />
              </Campo>
              {cursoEnDetalle && (
                <div className="flex items-end">
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 w-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Matriculados</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {cursoEnDetalle.ocupadas} de {cursoEnDetalle.cupo}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {errorForm && <Aviso>{errorForm}</Aviso>}

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={cerrarCurso}>Cancelar</Button>
              <Button variant="primary" fullWidth loading={guardando} onClick={guardarCurso}>
                {cursoEnDetalle ? 'Guardar cambios' : 'Crear curso'}
              </Button>
            </div>

            {cursoEnDetalle && (
              <div className="pt-4 border-t border-gray-100">
                <MateriasDelCurso
                  curso={cursoEnDetalle}
                  materias={materias}
                  docentes={docentes}
                  alCambiar={cargar}
                />
                {docentes.length === 0 && (
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                    <Users size={13} /> No hay usuarios con rol docente activos todavía.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Materia: alta y edición ── */}
      <Modal open={!!formMateria} onClose={() => setFormMateria(null)}
        title={formMateria?.id ? 'Editar materia' : 'Nueva materia'}>
        {formMateria && (
          <div className="space-y-5">
            <Campo etiqueta="Nombre" htmlFor="materia-nombre" requerido>
              <Entrada id="materia-nombre" value={formMateria.nombre}
                onChange={e => setFormMateria(m => ({ ...m, nombre: e.target.value }))} />
            </Campo>
            <Campo etiqueta="Código" htmlFor="materia-codigo" requerido
              ayuda="Identificador corto y único, por ejemplo MAT-1.">
              <Entrada id="materia-codigo" value={formMateria.codigo}
                onChange={e => setFormMateria(m => ({ ...m, codigo: e.target.value }))} />
            </Campo>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={formMateria.activa}
                onChange={e => setFormMateria(m => ({ ...m, activa: e.target.checked }))}
                className="rounded border-gray-300 text-brand-azul focus:ring-brand-azul/30" />
              Materia activa (se puede asignar a cursos)
            </label>

            {errorForm && <Aviso>{errorForm}</Aviso>}

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setFormMateria(null)}>Cancelar</Button>
              <Button variant="primary" fullWidth loading={guardando} onClick={guardarMateria}>
                Guardar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
