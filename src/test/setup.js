// Se ejecuta antes de cada archivo de test (lo configura `setupFiles` en
// vite.config.js).
//
// jest-dom agrega matchers específicos del DOM a `expect`, para poder escribir
// afirmaciones legibles como:
//   expect(boton).toBeInTheDocument()
//   expect(boton).toBeDisabled()
// en vez de comparar propiedades a mano.
import '@testing-library/jest-dom/vitest'
