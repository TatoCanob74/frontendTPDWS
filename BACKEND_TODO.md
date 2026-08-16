# Contrato frontend ↔ backend

El frontend ya está alineado con las rutas reales del backend (rama de Francisco,
commit `4acaad1`). Este documento registra **qué consume el frontend** y **qué
detalles del backend convendría corregir**, para que ambos lados converjan.

## Rutas que el frontend consume hoy

| Frontend | Método y ruta | Auth |
|---|---|---|
| `api/auth.js` | `POST /auth/register`, `POST /auth/login` | pública |
| `api/courts.js` | `GET /canchas/verCanchas?typeCourt=` | token |
| `api/courts.js` | `GET /seeCourts` | admin |
| `api/courts.js` | `POST /canchas`, `PUT /canchas/:id`, `PATCH /canchas/:id/estado`, `DELETE /canchas/:id` | admin |
| `api/courts.js` | `GET /localidades` | pública |
| `api/services.js` | `GET /servicios` | pública |
| `api/reserves.js` | `POST /usuarios/createReserve` | token |
| `api/reserves.js` | `GET /reservas/mis-reservas` | token |
| `api/reserves.js` | `PATCH /reservas/:id/cancelar` | token |
| `api/reserves.js` | `POST /reserves/:id/pago`, `.../confirmar`, `GET /reserves/:id/pago` | token |
| `api/admin.js` | `GET /seeUsers`, `GET /seeReserves` | admin |

## Pendientes del backend

Ordenados por impacto en el frontend. El frontend ya funciona sin estos cambios
(los tolera), pero cada uno mejora la app o la corrige.

### 1. `GET /canchas/verCanchas` debería ser público

Hoy está montado con `verifyToken` en `usuarioRoute.js`, así que **un visitante
sin cuenta no puede ver las canchas**. El catálogo es información pública y es lo
primero que ve alguien que entra: la home y `/canchas` quedan vacías hasta
loguearse. Conviene exponerlo sin token (el ABM sigue siendo admin-only).

### 2. Los listados vacíos deberían devolver `200 []`, no `404`

`seeMyReserves` (`reserveController.js:192`) y `seeHoraries`
(`horarioController.js:22`) responden 404 cuando no hay registros. "No hay nada"
no es un error: es una lista vacía. Un 404 obliga al cliente a distinguir entre
"no hay datos" y "la ruta no existe".

Mientras tanto el frontend lo normaliza con el helper `emptyOn404` de
`src/api/client.js`, que seguirá funcionando cuando esto se corrija.

### 3. `seeMyReserves` debería incluir la cancha y el horario

Hoy hace `Reserve.findAll({ where: filters })` sin `include`, así que la pantalla
"Mis reservas" solo puede mostrar fecha, monto y estado — no el deporte ni el
horario. Convendría incluir `Court` y `Horary`, **con alias explícitos**:

```js
include: [
  { model: Court, as: 'Cancha' },
  { model: Horary, as: 'Horario' }
]
```

El alias explícito importa: sin él, la clave del JSON depende de cómo Sequelize
singulariza el nombre del modelo, y el frontend tiene que adivinarla. Las clases
de `src/models/Reserve.js` esperan `Cancha` y `Horario`.

### 4. `seeCourtsWithHoraries` podría filtrar por sede e incluir la localidad

Acepta `typeCourt` pero no `idLocateCourt`, y no incluye el modelo `Location`.
El frontend filtra por sede en el cliente (`src/api/courts.js:getCourts`) y
muestra el ID en vez del nombre de la sede. Con esto se resuelve del lado del
servidor:

```js
if (req.query.idLocateCourt) filters.idLocateCourt = req.query.idLocateCourt;
// y en include: { model: Location, attributes: ['idLocation', 'nomLocation'] }
```

### 5. `register` no debería devolver el hash de la contraseña

`auth.controller.js:34` hace `res.status(201).json(newUser)`, que incluye
`passwordUser` hasheado. Conviene devolver solo los campos públicos, o agregar al
modelo `User`:

```js
defaultScope: { attributes: { exclude: ['passwordUser'] } }
```
más un scope `withPassword` para que el login siga funcionando.

### 6. En `register`, hashear después de validar

`auth.controller.js:14` llama a `bcrypt.hash(passwordUser, 10)` **antes** de
verificar que los campos existan (línea 16). Si falta `passwordUser`, bcrypt
lanza y la respuesta es un 500 en vez del 400 con el mensaje correcto.

### 7. Falta un 404 en JSON para rutas inexistentes

Cualquier ruta no registrada devuelve el HTML por defecto de Express, que el
cliente no puede parsear. Conviene cerrar `app.js` con:

```js
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
```

### 8. El puerto está hardcodeado

`app.js:25` usa `app.listen(3000)` fijo. Para poder desplegar debería ser
`process.env.PORT || 3000`.

## Nota sobre `GET /horarios`

El endpoint filtra por `idCourt`, pero el formulario de reserva razona en
términos de deporte + sede + día. No hace falta cambiarlo: `verCanchas` ya
devuelve cada cancha con sus horarios anidados, así que
`src/api/courts.js:getHorarios` resuelve todo con una sola llamada y filtra por
día en el cliente.
