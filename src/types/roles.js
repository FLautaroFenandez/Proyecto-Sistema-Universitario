/**
 * @file roles.js
 * @description Enum de roles del sistema y matriz de permisos.
 * Importar desde cualquier componente que necesite verificar permisos.
 */

export const ROLES = {
  ADMIN:      'admin',
  AUTORIDAD:  'autoridad',
  DOCENTE:    'docente',
  PERSONAL:   'personal',
  PADRE:      'padre',
  ESTUDIANTE: 'estudiante',
}

/** Roles que se auto-registran (público puede crear cuenta) */
export const ROLES_PUBLICOS = [ROLES.PADRE, ROLES.ESTUDIANTE]

/** Roles del personal (solo Admin puede crear estas cuentas) */
export const ROLES_PERSONAL = [ROLES.ADMIN, ROLES.AUTORIDAD, ROLES.DOCENTE, ROLES.PERSONAL]

/** Permisos por funcionalidad */
export const PERMISOS = {
  MODERAR_OPINIONES:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  PUBLICAR_NOTICIAS:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_GALERIA:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  VER_INSCRIPCIONES:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_EMPLEOS:     [ROLES.ADMIN, ROLES.AUTORIDAD],
  GESTIONAR_USUARIOS:    [ROLES.ADMIN],
  VER_NOTICIAS_INTERNAS: [ROLES.ADMIN, ROLES.AUTORIDAD, ROLES.DOCENTE, ROLES.PERSONAL, ROLES.PADRE, ROLES.ESTUDIANTE],
  VER_PANEL_ADMIN:       [ROLES.ADMIN, ROLES.AUTORIDAD],
}

/**
 * Verifica si un rol tiene permiso para una acción
 * @param {string} rol - Rol del usuario actual
 * @param {string[]} permiso - Array de roles permitidos
 * @returns {boolean}
 */
export function tienePermiso(rol, permiso) {
  return permiso.includes(rol)
}
