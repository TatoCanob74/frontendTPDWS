import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // El front corriendo con `npm run dev`; las llamadas a la API van al backend de test en el 3000
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    video: false,
    screenshotsFolder: 'cypress/screenshots',
  },
  // Credenciales de prueba: las crea `npm run e2e:seed` en el backend, solo en la base de test
  env: {
    clienteEmail: 'e2e.cliente@canchaya.test',
    clientePassword: 'ClienteE2E2026',
  },
})
