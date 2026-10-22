/**
 * @file MisCursosPage.jsx
 * @description Inicio del módulo Profesores: las materias que el docente tiene
 * a cargo en el ciclo activo, con acceso a la carga de calificaciones (HU2).
 *
 * La lista sale de curso_materia.docente_id, que asigna Administración desde
 * "Cursos y materias" (REQ-14). Es la misma asignación que después habilita al
 * docente, en la base, a cargar notas solo en sus materias.
 */

import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, ArrowRight, GraduationCap, AlertTriangle } from 'lucide-react'
import { AuthContext } from '@/components/auth/AuthContext'
import { Spinner } from '@/components/ui/Spinner'
import { calificaciones, nombreCompletoDeCurso, mensajeDeError } from '@/services'
import { ROUTES } from '@/types/routes'

export default function MisCursosPage() {
  const { profile } = useContext(AuthContext)
  const [dictados, setDictados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!profile?.id) return
    let cancelado = false
    calificaciones.misDictados(profile.id)
      .then(lista => { if (!cancelado) setDictados(lista) })
      .catch(err  => { if (!cancelado) setError(mensajeDeError(err, 'No pudimos cargar tus materias.')) })
      .finally(()  => { if (!cancelado) setCargando(false) })
    return () => { cancelado = true }
  }, [profile?.id])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-gray-400 text-sm">Módulo Profesores</p>
        <h1 className="font-display font-bold text-gray-800 text-2xl flex items-center gap-2">
          <GraduationCap size={24} className="text-brand-azul" /> Mis cursos
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Las materias que tenés a cargo en el ciclo lectivo. Elegí una para cargar las notas.
        </p>
      </div>

      {cargando ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="flex-shrink-0" /> {error}
        </div>
      ) : dictados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">Todavía no tenés materias asignadas</p>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            La administración asigna los docentes a cada materia desde «Cursos y materias».
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {dictados.map(dictado => (
            <Link
              key={dictado.id}
              to={ROUTES.DOCENTE_CALIFICACIONES(dictado.id)}
              className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-azul/10 text-brand-azul flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 group-hover:text-brand-azul transition-colors">
                    {dictado.materia.nombre}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{nombreCompletoDeCurso(dictado.curso)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Users size={14} /> {dictado.alumnos} alumno{dictado.alumnos === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-1 font-medium text-brand-naranja">
                  Cargar calificaciones <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
