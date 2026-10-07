// Test end-to-end: front + backend + base de test reales, sin simular nada.
// Recorre cómo el frontend protege sus pantallas según el nivel del usuario.

const completarLogin = (email, password) => {
  cy.get('#emailUser').type(email)
  cy.get('#passwordUser').type(password, { log: false })
  cy.contains('button', 'Ingresar').click()
}

describe('Acceso a las pantallas según el nivel de usuario', () => {
  it('Sin sesión, entrar a Mis reservas manda al login', () => {
    cy.visit('/reservas')

    cy.location('pathname').should('eq', '/login')
    cy.contains('h2', 'Iniciá sesión').should('be.visible')
  })

  it('Con credenciales incorrectas muestra un error y no deja entrar', () => {
    cy.visit('/login')

    completarLogin(Cypress.env('clienteEmail'), 'contraseña-equivocada')

    cy.get('[role="alert"]').should('contain.text', 'Credenciales inválidas')
    cy.location('pathname').should('eq', '/login')
  })

  it('Un cliente inicia sesión y vuelve a la pantalla que había pedido', () => {
    cy.visit('/reservas')
    cy.location('pathname').should('eq', '/login')

    completarLogin(Cypress.env('clienteEmail'), Cypress.env('clientePassword'))

    cy.location('pathname').should('eq', '/reservas')
    cy.contains('h2', 'Mis reservas').should('be.visible')
    cy.contains('button', 'Cerrar sesión').should('be.visible')
  })

  it('Un cliente no puede entrar al panel de administración', () => {
    cy.visit('/login')
    completarLogin(Cypress.env('clienteEmail'), Cypress.env('clientePassword'))
    cy.location('pathname').should('eq', '/canchas')

    cy.visit('/admin')

    cy.location('pathname').should('eq', '/')
    cy.contains('h1', 'Tu cancha lista').should('be.visible')
  })
})
