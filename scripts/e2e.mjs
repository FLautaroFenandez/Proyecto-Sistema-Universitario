/**
 * Corre las pruebas E2E: levanta el servidor de desarrollo de Vite, ejecuta
 * Cypress y apaga el servidor al terminar (Unidad 5 · prueba dinámica).
 *
 * Uso: npm run test:e2e
 *      npm run test:e2e -- --spec cypress/e2e/regresion-web-publica.cy.js
 *
 * Reemplaza a start-server-and-test, que en Windows 11 no puede cerrar el
 * servidor porque depende de wmic.exe.
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const cypress = fileURLToPath(new URL('../node_modules/cypress/bin/cypress', import.meta.url))

// Algunos editores (VS Code y sus extensiones) definen esta variable, que hace
// arrancar a Cypress, una aplicación Electron, como si fuera Node.
const entorno = { ...process.env }
delete entorno.ELECTRON_RUN_AS_NODE

const servidor = await createServer({ server: { port: 5173, strictPort: true } })
await servidor.listen()

const codigo = await new Promise(resolve => {
  const proceso = spawn(process.execPath, [cypress, 'run', ...process.argv.slice(2)], { stdio: 'inherit', env: entorno })
  proceso.on('exit', resolve)
})

await servidor.close()
process.exitCode = codigo ?? 1
