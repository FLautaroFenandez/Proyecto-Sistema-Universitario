/**
 * Prueba de regresión de la Parte 1 (Unidad 5 · prueba dinámica).
 *
 * El Sistema de Gestión se construyó encima de la web institucional. Esta suite
 * comprueba, después de cada cambio, que lo que ya funcionaba siga funcionando:
 * las páginas públicas cargan, las rutas del sistema piden sesión y el login
 * rechaza credenciales inválidas. No necesita cuentas ni escribe en la base.
 */

const PAGINAS = [
  ['/quienes-somos', 'Quiénes Somos'],
  ['/niveles-educativos', 'Niveles Educativos'],
  ['/bienestar', 'Bienestar Estudiantil'],
  ['/noticias', 'Noticias'],
  ['/galeria', 'Galería'],
  ['/inscripcion', 'Solicitud de Inscripción'],
  ['/empleo', 'Oportunidades de Empleo'],
  ['/contacto', 'Contacto'],
]

describe('Regresión: la web pública sigue funcionando', () => {
  it('la portada carga con el menú institucional', () => {
    cy.visit('/')
    cy.get('nav').first().should('contain', 'Educar para Transformar').and('contain', 'Noticias')
  })

  PAGINAS.forEach(([ruta, titulo]) => {
    it(`${ruta} muestra "${titulo}"`, () => {
      cy.visit(ruta)
      cy.contains('h1', titulo).should('be.visible')
    })
  })

  it('las noticias se leen de la base de datos', () => {
    cy.visit('/noticias')
    cy.get('a[href^="/noticias/"]').should('have.length.greaterThan', 0)
  })
})

const RUTAS_PROTEGIDAS = ['/admin', '/docente', '/dashboard']

describe('Regresión: el sistema sigue protegido', () => {
  RUTAS_PROTEGIDAS.forEach(ruta => {
    it(`${ruta} sin sesión lleva al login`, () => {
      cy.visit(ruta)
      cy.location('pathname').should('eq', '/login')
    })
  })

  it('el login rechaza credenciales inválidas', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('cuenta-inexistente@ejemplo.test')
    cy.get('input[placeholder="••••••••"]').type('clave-incorrecta')
    cy.contains('button', 'Ingresar').click()
    cy.contains('Email o contraseña incorrectos').should('be.visible')
  })
})
