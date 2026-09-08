import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Los componentes de React necesitan un DOM para renderizarse; jsdom lo
    // simula en Node, sin abrir un navegador real.
    environment: 'jsdom',
    // describe / it / expect disponibles sin importarlos en cada archivo.
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}']
  }
})
