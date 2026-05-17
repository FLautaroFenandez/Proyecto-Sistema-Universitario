/**
 * @file routes.js
 * @description Constantes de rutas de la aplicación.
 * Usar estas constantes en vez de strings hardcodeados en los componentes.
 */

export const ROUTES = {
  HOME:          '/',
  QUIENES_SOMOS: '/quienes-somos',
  NIVELES:       '/niveles-educativos',
  BIENESTAR:     '/bienestar',
  NOTICIAS:      '/noticias',
  NOTICIA_DETALLE: (id) => `/noticias/${id}`,
  GALERIA:       '/galeria',
  INSCRIPCION:   '/inscripcion',
  EMPLEO:        '/empleo',
  CONTACTO:      '/contacto',
  LOGIN:         '/login',
  REGISTRO:      '/registro',
  DASHBOARD:     '/dashboard',
  ADMIN:         '/admin',
  ADMIN_OPINIONES:     '/admin/opiniones',
  ADMIN_NOTICIAS:      '/admin/noticias',
  ADMIN_GALERIA:       '/admin/galeria',
  ADMIN_INSCRIPCIONES: '/admin/inscripciones',
  ADMIN_EMPLEOS:       '/admin/empleos',
  ADMIN_USUARIOS:      '/admin/usuarios',
}
