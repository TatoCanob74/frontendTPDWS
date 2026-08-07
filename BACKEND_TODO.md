# Backend pendiente para que el frontend funcione con datos reales

El frontend de CanchaYa (esta carpeta) ya está implementado completo, pero fue
construido **contra el contrato que estos endpoints deberían tener** — todavía
no existen en `backend/`. Hasta que se agreguen, las pantallas que dependen de
ellos muestran un mensaje de "no disponible" en vez de romperse, pero no
funcionan de punta a punta.

1. **`GET /courts`** — enrutar `courtController.seeCourts`
   (`backend/src/controllers/courtController.js`, ya existe pero no está
   montado en `app.js`). Filtrable por `typeCourt` e `idLocateCourt`.
2. **`GET /locations`** — listar `Location` (sedes). No existe controller ni
   route hoy. Usado por el selector de sede en `src/components/bookingForm/BookingForm.jsx`.
3. **`GET /horarios?typeCourt=&idLocateCourt=&day=`** — listar `Horary`
   disponibles para canchas de un tipo/sede/día. Hoy `Horary` solo se
   consulta indirectamente dentro de `reserveController.createReserve`; no
   hay endpoint de lectura. Usado por el grid de horarios en `BookingForm.jsx`
   (`src/api/courts.js:getHorarios`).
4. **`GET /services`** — listar `Service` (servicios adicionales). No existe.
   Usado en `src/api/services.js`.
5. **`GET /reserves/mine`** — reservas del usuario logueado, para "Mis
   reservas" (`src/pages/reservas/Reservas.jsx`). Hoy solo existe
   `GET /seeReserves`, que es admin-only.
6. *(Opcional)* `PATCH /reserves/:id/cancelar` — cancelar una reserva propia.
7. *(Opcional, no bloqueante)* Corregir o eliminar
   `backend/src/routes/userRoute.js` (duplicado de `/auth/register`, no está
   montado en `app.js`, y además no hashea el password si se llegara a
   habilitar).

## Contrato esperado (nombres de campo ya usados en el frontend)

- Igual que los modelos Sequelize actuales: `idCourt`, `typeCourt`,
  `idLocateCourt`, `idHorary`, `startTime`, `endTime`, `day`, `idLocation`,
  `nomLocation`, `idService`, `nameService`, `priceService`.
- `GET /horarios` debería devolver una lista de objetos `{ idHorary,
  startTime, endTime, day, idCourt }` para el tipo/sede/día pedidos (no hace
  falta que sea por cancha específica; el frontend solo necesita elegir un
  horario y el backend ya resuelve qué cancha usar en `POST /reserves`).
- `GET /reserves/mine` debería devolver lo mismo que `GET /seeReserves`
  (incluyendo `Court` y `Horary` si es posible, ver `Reservas.jsx` que ya lee
  `r.Court?.typeCourt` y `r.Horary?.startTime`), pero filtrado por
  `req.user.idUser` en vez de admin-only.

Una vez agregados, el frontend no necesita ningún cambio: `src/api/courts.js`,
`src/api/services.js` y `src/api/reserves.js` ya están armados contra este
contrato.
