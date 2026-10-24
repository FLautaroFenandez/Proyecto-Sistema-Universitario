/**
 * @file estadoPostulacion.js
 * @description Ciclo de vida de una postulación laboral (REQ-20), con el mismo
 * patrón **State** que la solicitud de inscripción (estadoSolicitud.js).
 *
 * Cada estado sabe a cuáles puede pasar; la pantalla le pregunta al estado
 * actual qué opciones ofrecer, en lugar de mostrar todas.
 *
 *   recibida    → en_revision · descartado
 *   en_revision → entrevista · descartado
 *   entrevista  → contratado · descartado
 *   descartado  → en_revision (reconsiderar)
 *   contratado  → (estado final)
 *
 * Las mismas reglas están en la base, en el disparador trg_transicion_postulacion
 * de docs/supabase-sprint3.sql. Si se cambia una, hay que cambiar la otra.
 */

import { ErrorDeServicio } from '@/services/base'

class EstadoPostulacion {
  clave = ''
  etiqueta = ''
  /** @type {'orange'|'blue'|'green'|'red'|'purple'|'gray'} */
  color = 'gray'
  siguientes = []

  get esFinal() {
    return this.siguientes.length === 0
  }

  puedePasarA(destino) {
    return this.siguientes.includes(destino)
  }

  pasarA(destino) {
    if (destino === this.clave) return this
    if (!this.puedePasarA(destino)) {
      throw new ErrorDeServicio(
        `Una postulación ${this.etiqueta.toLowerCase()} no puede pasar a ${estadoPostulacionDe(destino).etiqueta.toLowerCase()}.`,
      )
    }
    return estadoPostulacionDe(destino)
  }
}

class Recibida extends EstadoPostulacion {
  clave = 'recibida'
  etiqueta = 'Recibida'
  color = 'orange'
  siguientes = ['en_revision', 'descartado']
}

class EnRevision extends EstadoPostulacion {
  clave = 'en_revision'
  etiqueta = 'En revisión'
  color = 'blue'
  siguientes = ['entrevista', 'descartado']
}

class Entrevista extends EstadoPostulacion {
  clave = 'entrevista'
  etiqueta = 'Entrevista'
  color = 'purple'
  siguientes = ['contratado', 'descartado']
}

class Contratado extends EstadoPostulacion {
  clave = 'contratado'
  etiqueta = 'Contratado'
  color = 'green'
  siguientes = []

  pasarA(destino) {
    if (destino === this.clave) return this
    throw new ErrorDeServicio(
      'La postulación ya terminó en una contratación. El alta de la persona se gestiona desde Personal.',
    )
  }
}

class Descartado extends EstadoPostulacion {
  clave = 'descartado'
  etiqueta = 'Descartado'
  color = 'red'
  siguientes = ['en_revision']
}

const ESTADOS = Object.freeze({
  recibida:    new Recibida(),
  en_revision: new EnRevision(),
  entrevista:  new Entrevista(),
  contratado:  new Contratado(),
  descartado:  new Descartado(),
})

/** Todos los estados, en el orden en que avanza una postulación. */
export const ESTADOS_DE_POSTULACION = Object.values(ESTADOS)

/** @param {string} clave @returns {EstadoPostulacion} */
export function estadoPostulacionDe(clave) {
  const estado = ESTADOS[clave]
  if (!estado) throw new ErrorDeServicio(`Estado de postulación desconocido: ${clave}.`)
  return estado
}
