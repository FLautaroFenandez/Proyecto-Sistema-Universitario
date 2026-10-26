/**
 * Configuración de ESLint (Unidad 4: integración continua).
 * La corre `npm run lint` en local y en el pipeline de GitHub Actions.
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'docs', 'Metodología de Sistemas II', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    // El proyecto no usa PropTypes: los componentes documentan sus props con JSDoc.
    'react/prop-types': 'off',
    'react-refresh/only-export-components': 'off',
  },
  overrides: [
    {
      // Archivos de configuración que corren en Node.
      files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'cypress.config.js', 'scripts/**/*.mjs'],
      env: { node: true },
    },
    {
      // Pruebas de extremo a extremo con Cypress (Unidad 5).
      files: ['cypress/**/*.js'],
      env: { mocha: true },
      globals: { cy: 'readonly', Cypress: 'readonly', expect: 'readonly' },
    },
  ],
}
