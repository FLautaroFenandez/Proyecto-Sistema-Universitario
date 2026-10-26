/**
 * HU2 — Cargar calificaciones (Unidad 5 · prueba dinámica).
 *
 * Automatiza los casos CP-40, CP-41 y CP-45 del Sprint 2. Las pruebas escriben
 * en las celdas pero nunca guardan: el entorno local usa la misma base que el
 * sitio publicado, así que no dejan datos.
 *
 * Necesita la cuenta del docente de prueba en cypress.env.json. Sin ella, la
 * suite queda como pendiente en lugar de fallar.
 */

const email = Cypress.env('DOCENTE_EMAIL')
const password = Cypress.env('DOCENTE_PASSWORD')

describe('HU2: carga de calificaciones', () => {
  before(function () {
    if (!email || !password) this.skip()
  })

  beforeEach(() => {
    cy.iniciarSesion(email, password)
  })

  it('CP-40 y CP-41: rechaza notas fuera de rango o con más de dos decimales', () => {
    cy.visit('/docente')
    // Una materia del docente con alumnos matriculados.
    cy.get('a[href^="/docente/calificaciones/"]')
      .filter((_, enlace) => !/\b0 alumnos/.test(enlace.innerText))
      .first()
      .click()
    cy.contains('[role="tab"]', '2.º trimestre').click()

    cy.get('input[aria-label^="Nota 3 de"]').first().as('celda')
    cy.get('@celda').invoke('val').then(original => {
      cy.get('@celda').clear().type('11')
      cy.get('@celda').should('have.attr', 'aria-invalid', 'true').and('have.attr', 'title', 'Entre 1 y 10.')
      cy.contains('button', 'Guardar notas').should('be.disabled')

      cy.get('@celda').clear().type('7,555')
      cy.get('@celda').should('have.attr', 'title', 'Hasta dos decimales.')
      cy.contains('button', 'Guardar notas').should('be.disabled')

      cy.get('@celda').clear().type('8,5')
      cy.get('@celda').should('have.attr', 'aria-invalid', 'false')
      cy.contains('button', 'Guardar notas').should('be.enabled')

      // La celda vuelve a su valor: la prueba no guarda nada.
      cy.get('@celda').clear()
      if (original) cy.get('@celda').type(original)
    })
  })

  it('CP-45: un docente que no es titular no puede cargar notas', () => {
    cy.visit('/docente')
    // Una materia de otro docente: el catálogo de asignaciones es legible para
    // cualquier usuario autenticado. El cliente está expuesto en desarrollo.
    cy.window()
      .then(async win => {
        const { data: { user } } = await win.supabase.auth.getUser()
        const { data } = await win.supabase.from('curso_materia').select('id').neq('docente_id', user.id).limit(1)
        return data[0].id
      })
      .then(dictadoAjeno => {
        cy.visit(`/docente/calificaciones/${dictadoAjeno}`)
        cy.contains('Solo el docente titular puede cargar estas notas').should('be.visible')
      })
  })
})
