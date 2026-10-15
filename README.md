# CanchaYa - Frontend

## ¿Qué es CanchaYa?

CanchaYa es un sistema de reservas de canchas de fútbol, tenis o pádel, con pago a través de Mercado Pago.

Este software fue realizado para cumplir con el TP de aprobación directa de Desarrollo de Software.

Este repositorio es el de frontend.

## Integrantes

- **Francisco Gallon:** [Perfil de GitHub de Francisco](https://github.com/TatoCanob74)
- **Santiago Martínez:** [Perfil de GitHub de Santiago](https://github.com/santistark-ctrl)

## Link al otro repositorio

- https://github.com/TatoCanob74/backendTPDesarrollo

Ese es el link del repositorio donde tenemos el backend. El frontend necesita que el backend esté corriendo.

## Documentación

- [Arquitectura del frontend](docs/arquitectura.md): pantallas y niveles de acceso, componentes, servicios, modelos y estilos.
- [Índice de la documentación](docs/README.md): proposal, documentación de la API y evidencia de tests.

## Stack

- React 19 + Vite
- React Router
- Axios
- Sass (SCSS, mobile-first)
- Vitest + Testing Library (tests unitarios)
- Cypress (test end-to-end)

## Requisitos Previos

- **Node.js ≥ 20.6**.
- El **backend** de CanchaYa corriendo (ver su README).

## Instalación y puesta en marcha

1. Clonar el repositorio con `git clone` y entrar a la carpeta.
2. Instalar las dependencias con `npm install`.
3. Copiar `.env.example` a `.env` y completar `VITE_API_URL` con la URL del backend. Si no se crea el `.env`, se usa `http://localhost:3000`.
4. Levantar el servidor de desarrollo con `npm run dev`.

**Nota:** la app queda corriendo en `http://localhost:5173`.

## Variables de Entorno

| Variable       | Descripción                  | Ejemplo                 |
| -------------- | ---------------------------- | ----------------------- |
| `VITE_API_URL` | URL base de la API (backend) | `http://localhost:3000` |

## Scripts Disponibles

| Script     | Funcionalidad                                                              |
| ---------- | -------------------------------------------------------------------------- |
| dev        | Arranca el servidor de desarrollo de Vite con recarga automática.          |
| build      | Genera la versión de producción en la carpeta `dist`.                      |
| preview    | Sirve localmente la versión generada con `build`.                          |
| lint       | Revisa el código con ESLint.                                               |
| test       | Ejecuta los tests unitarios una sola vez.                                  |
| test:watch | Ejecuta los tests unitarios y queda escuchando cambios.                    |
| cy:open    | Abre Cypress con interfaz gráfica para correr el test end-to-end.          |
| cy:run     | Corre el test end-to-end de Cypress en la terminal, sin interfaz.          |

## Tests

### Unitarios (Vitest + Testing Library)

Se corren con `npm test` y no necesitan el backend.

- `src/components/bookingForm/BookingForm.test.jsx`: prueba el formulario de reserva: lista los horarios con su precio, calcula el total con los servicios elegidos y sugiere días o sedes alternativas cuando no hay turnos.
- `src/pages/pago/PagoPendiente.test.jsx`: prueba la pantalla que espera la confirmación del pago: reconsulta el estado, muestra el detalle al confirmarse y deja de consultar una vez resuelto.

### End-to-end (Cypress)

`cypress/e2e/accesoPorNiveles.cy.js` recorre la app real (front + back + base de test) y verifica que cada pantalla quede protegida según el nivel del usuario.

Para correrlo:

1. En el backend, con la base de test creada (ver README del backend), crear el usuario de prueba: `npm run e2e:seed`.
2. En el backend, levantar la API contra la base de test: `npm run start:test`.
3. En el frontend, levantar la app: `npm run dev`.
4. En otra terminal del frontend: `npm run cy:run` (o `npm run cy:open` para verlo en el navegador).

## Usuarios y Roles

| Rol        | Qué puede hacer en el frontend                                                           |
| ---------- | ---------------------------------------------------------------------------------------- |
| Visitante  | Ver la home y el catálogo de canchas. Registrarse e iniciar sesión.                      |
| Cliente    | Reservar, pagar con Mercado Pago, ver y cancelar sus reservas, editar su perfil.         |
| Admin      | Panel de administración de **su** complejo: canchas, horarios, reservas y pagos.         |
| Superadmin | Panel completo: localidades, servicios, complejos, administradores, usuarios y reservas. |

Las rutas privadas (`/reservas`, `/perfil`) redirigen al login si no hay sesión, y `/admin` solo deja entrar a admin y superadmin.

## Estructura

```
src/
├── api/          # Servicios: una función por endpoint del backend (axios)
├── components/   # Componentes reutilizables (formularios, diálogos, layout)
├── context/      # AuthContext: sesión y token JWT
├── hooks/        # Hooks propios (useAuth, usePaymentReturn, ...)
├── models/       # Clases de negocio (Reserve, Court, Complex, ...) que envuelven las respuestas de la API
├── pages/        # Una carpeta por pantalla
├── routes/       # PrivateRoute y AdminRoute (protección por nivel)
├── styles/       # SCSS: tokens, mixins de breakpoints (sm, md, lg) y parciales
└── utils/        # Funciones auxiliares (fechas, moneda, roles)
```
