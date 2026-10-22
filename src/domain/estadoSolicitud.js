/**
 * @file estadoSolicitud.js
 * @description Ciclo de vida de una solicitud de inscripción — patrón **State**,
 * el comprometido para el Sprint 2.
 *
 * Problema que resuelve: la pantalla de Inscripciones permitía elegir cualquier
 * estado desde cualquier otro. Una solicitud ya matriculada podía volver a
 * "pendiente" y procesarse de nuevo, lo que rompía el criterio de aceptación de
 * HU1 ("la solicitud queda matriculada y no puede duplicarse").
 *
 * Con el patrón State, cada estado es un objeto que sabe a qué estados puede
 * pasar. La pantalla deja de decidir: le pregunta al estado actual.
 *
 *   pendiente   → en_revision · aceptada · rechazada
 *   en_revision → aceptada · rechazada
 *   aceptada    → matriculada · en_revision
 *   rechazada   → en_revision
 *   matriculada → (estado final)
 *
 * Las mismas reglas están en la base, en el disparador trg_transicion_solicitud
 * de docs/supabase-sprint2.sql. Si se cambia una, hay que cambiar la otra.
 */

import { ErrorDeServicio } from '@/services/base'

/** Estado genérico: lo que comparten todos. */
class EstadoSolicitud {
  /** @type {string} valor guardado en la base */
  clave = ''
  /** @type {string} cómo se muestra */
  etiqueta = ''
  /** @type {'orange'|'blue'|'green'|'red'|'purple'|'gray'} color del Badge */
  color = 'gray'
  /** @type {string[]} estados a los que puede pasar */
  siguientes = []

  /** Si no tiene a dónde ir, es un estado final. */
  get esFinal() {
    return this.siguientes.length === 0
  }

  puedePasarA(destino) {
    return this.siguientes.includes(destino)
  }

  /**
   * Devuelve el estado destino o lanza un error que explica por qué no se puede.
   * @param {string} destino
   * @returns {EstadoSolicitud}
   */
  pasarA(destino) {
    if (destino === this.clave) return this
    if (!this.puedePasarA(destino)) {
      throw new ErrorDeServicio(
        `Una solicitud ${this.etiqueta.toLowerCase()} no puede pasar a ${estadoDe(destino).etiqueta.toLowerCase()}.`,
      )
    }
    return estadoDe(destino)
  }

  /**
   * Transiciones que la persona puede elegir a mano. "Matriculada" no está:
   * ese estado solo lo produce el circuito de matriculación (HU1).
   */
  get transicionesManuales() {
    return this.siguientes.filter(clave => clave !== 'matriculada')
  }
}

class Pendiente extends EstadoSolicitud {
  clave = 'pendiente'
  etiqueta = 'Pendiente'
  color = 'orange'
  siguientes = ['en_revision', 'aceptada', 'rechazada']
}

class EnRevision extends EstadoSolicitud {
  clave = 'en_revision'
  etiqueta = 'En revisión'
  color = 'blue'
  siguientes = ['aceptada', 'rechazada']
}

class Aceptada extends EstadoSolicitud {
  clave = 'aceptada'
  etiqueta = 'Aceptada'
  color = 'green'
  // Se puede reabrir si se aceptó por error, mientras no esté matriculada.
  siguientes = ['matriculada', 'en_revision']
}

class Rechazada extends EstadoSolicitud {
  clave = 'rechazada'
  etiqueta = 'Rechazada'
  color = 'red'
  siguientes = ['en_revision']
}

class Matriculada extends EstadoSolicitud {
  clave = 'matriculada'
  etiqueta = 'Matriculada'
  color = 'purple'
  siguientes = []

  // Se redefine para dar un mensaje que diga qué hacer en lugar de solo prohibir.
  pasarA(destino) {
    if (destino === this.clave) return this
    throw new ErrorDeServicio(
      'La solicitud ya generó un alumno matriculado y no puede cambiar de estado. ' +
      'Si hubo un error, se da de baja la matrícula desde Alumnos.',
    )
  }
}

/** Una instancia por estado: los estados no guardan datos propios, así que se comparten. */
const ESTADOS = Object.freeze({
  pendiente:   new Pendiente(),
  en_revision: new EnRevision(),
  aceptada:    new Aceptada(),
  rechazada:   new Rechazada(),
  matriculada: new Matriculada(),
})

/** Todos los estados, en el orden en que avanza una solicitud. */
export const LISTA_DE_ESTADOS = Object.values(ESTADOS)

/**
 * Objeto de estado a partir del valor guardado en la base.
 * @param {string} clave
 * @returns {EstadoSolicitud}
 */
export function estadoDe(clave) {
  const estado = ESTADOS[clave]
  if (!estado) throw new ErrorDeServicio(`Estado de solicitud desconocido: ${clave}.`)
  return estado
}
