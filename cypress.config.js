/**
 * Pruebas de extremo a extremo con Cypress (Unidad 5 · prueba dinámica).
 *
 * `npm run test:e2e` levanta el servidor de desarrollo y corre todas las suites.
 * Para correr solo la regresión contra el sitio publicado:
 *   npx cypress run --config baseUrl=https://educar-para-transforma.netlify.app
 *     --spec cypress/e2e/regresion-web-publica.cy.js
 */
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    video: false,
  },
})
