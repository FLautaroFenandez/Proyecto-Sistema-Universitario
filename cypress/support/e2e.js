/**
 * Comandos compartidos por las pruebas E2E.
 * Las credenciales de la cuenta de prueba salen de cypress.env.json, que no se
 * sube al repositorio (la plantilla es cypress.env.example.json).
 */

/** Inicia sesión por la pantalla de login y conserva la sesión entre pruebas. */
Cypress.Commands.add('iniciarSesion', (email, password) => {
  cy.session([email], () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type(email)
    cy.get('input[placeholder="••••••••"]').type(password, { log: false })
    cy.contains('button', 'Ingresar').click()
    cy.location('pathname', { timeout: 15000 }).should('not.eq', '/login')
  })
})
