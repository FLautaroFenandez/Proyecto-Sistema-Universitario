/**
 * @file personal.js
 * @description Legajo del personal docente y no docente (HU6 · REQ-19).
 *
 * También resuelve el "Módulo Profesores" del enunciado: un legajo con función
 * docente y una cuenta vinculada muestra las materias y cursos que tiene a
 * cargo, que salen de la asignación de "Cursos y materias" (REQ-14).
 *
 * Dar de baja no borra el legajo: lo pasa a inactivo, y un disparador de la
 * base desactiva la cuenta vinculada. Así el estado "se refleja en los accesos".
 */

import { supabase } from '@/lib/supabase'
import { ejecutar } from './base'

export const FUNCIONES = [
  { clave: 'docente',        etiqueta: 'Docente' },
  { clave: 'directivo',      etiqueta: 'Directivo' },
  { clave: 'preceptor',      etiqueta: 'Preceptor' },
  { clave: 'administrativo', etiqueta: 'Administrativo' },
  { clave: 'maestranza',     etiqueta: 'Maestranza' },
  { clave: 'otro',           etiqueta: 'Otro' },
]

export function etiquetaDeFuncion(clave) {
  return FUNCIONES.find(f => f.clave === clave)?.etiqueta ?? clave
}

/** Roles del personal que pueden tener legajo vinculado. */
const ROLES_DEL_PERSONAL = ['admin', 'autoridad', 'docente', 'personal']

const CON_CUENTA = '*, cuenta:profiles(id, nombre, rol, activo)'

function limpiarBusqueda(texto) {
  return texto.trim().replace(/[,()%*]/g, '')
}

/** Normaliza lo que viene del formulario antes de guardarlo. */
function datosParaGuardar(datos) {
  const texto = valor => (valor ?? '').toString().trim() || null
  return {
    dni:           texto(datos.dni),
    apellido:      texto(datos.apellido),
    nombre:        texto(datos.nombre),
    email:         texto(datos.email),
    telefono:      texto(datos.telefono),
    funcion:       datos.funcion,
    especialidad:  texto(datos.especialidad),
    area:          texto(datos.area),
    fecha_ingreso: datos.fecha_ingreso || undefined,
    profile_id:    datos.profile_id || null,
  }
}

export const personal = {

  /** @param {{busqueda?:string, estado?:'activo'|'inactivo'|null}} opciones */
  async listar({ busqueda, estado } = {}) {
    let consulta = supabase.from('personal').select(CON_CUENTA).order('apellido').order('nombre')
    if (estado) consulta = consulta.eq('estado', estado)
    const texto = limpiarBusqueda(busqueda ?? '')
    if (texto) {
      consulta = consulta.or(
        `apellido.ilike.%${texto}%,nombre.ilike.%${texto}%,dni.ilike.%${texto}%,legajo.ilike.%${texto}%`,
      )
    }
    return ejecutar(consulta, 'cargar el personal')
  },

  async crear(datos) {
    const [creado] = await ejecutar(
      supabase.from('personal').insert(datosParaGuardar(datos)).select(CON_CUENTA),
      'crear el legajo',
    )
    return creado
  },

  async actualizar(id, datos) {
    const [actualizado] = await ejecutar(
      supabase.from('personal').update(datosParaGuardar(datos)).eq('id', id).select(CON_CUENTA),
      'guardar el legajo',
    )
    return actualizado
  },

  /** Baja o reactivación: el disparador sincroniza la cuenta vinculada. */
  async cambiarEstado(id, estado) {
    const [actualizado] = await ejecutar(
      supabase.from('personal').update({ estado }).eq('id', id).select(CON_CUENTA),
      estado === 'activo' ? 'reactivar el legajo' : 'dar de baja el legajo',
    )
    return actualizado
  },

  /**
   * Cuentas del personal que todavía no tienen legajo, más la del legajo que
   * se está editando, para el selector "Cuenta en el sistema".
   */
  async cuentasDisponibles(cuentaActualId) {
    const [cuentas, vinculadas] = await Promise.all([
      ejecutar(
        supabase.from('profiles').select('id, nombre, rol, dni').in('rol', ROLES_DEL_PERSONAL).order('nombre'),
        'cargar las cuentas del personal',
      ),
      ejecutar(
        supabase.from('personal').select('profile_id').not('profile_id', 'is', null),
        'cargar las cuentas ya vinculadas',
      ),
    ])
    const ocupadas = new Set(vinculadas.map(v => v.profile_id))
    return cuentas.filter(c => c.id === cuentaActualId || !ocupadas.has(c.id))
  },

  /** Materias y cursos a cargo de la cuenta vinculada (enunciado, Módulo Profesores). */
  async materiasACargo(profileId) {
    if (!profileId) return []
    const dictados = await ejecutar(
      supabase.from('curso_materia')
        .select('id, materia:materias(nombre), curso:cursos(anio, division, turno, nivel:niveles(nombre), ciclo:ciclos_lectivos(activo))')
        .eq('docente_id', profileId),
      'cargar las materias a cargo',
    )
    return dictados.filter(d => d.curso?.ciclo?.activo)
  },
}
