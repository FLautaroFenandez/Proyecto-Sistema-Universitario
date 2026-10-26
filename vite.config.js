import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Las pruebas corren con la hora de Argentina, la de la institución, en cualquier
// máquina: también en GitHub Actions, que usa UTC.
if (process.env.VITEST) process.env.TZ = 'America/Argentina/Buenos_Aires'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    rollupOptions: {
      output: {
        // Unidad 4 (estrategia de mejora): las librerías van en archivos propios.
        // Cambian poco, así que el navegador las conserva en caché entre
        // despliegues y cada actualización solo descarga el código de la app.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('framer-motion')) return 'animaciones'
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    // Unidad 5 (métricas): cobertura de código con `npm run test:coverage`.
    // El informe lcov lo lee SonarCloud; el html queda en coverage/index.html.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.js'],
      reporter: ['text-summary', 'text', 'lcov', 'html'],
    },
  },
})
