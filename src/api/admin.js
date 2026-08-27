import { client } from './client'
import { Reserve } from '../models/Reserve'

export function getUsers() {
  return client.get('/seeUsers').then((r) => r.data)
}

/** Alterna ACTIVO ↔ INACTIVO. El backend decide el nuevo estado. */
export function updateUserState(idUser) {
  return client.patch(`/usuarios/${idUser}/estado`).then((r) => r.data)
}

export function deleteUser(idUser) {
  return client.delete(`/usuarios/${idUser}`).then((r) => r.data)
}

/** El backend ahora incluye la Cancha y el Horario anidados en cada reserva. */
export function getReserves({ stateReserva, dateReserve } = {}) {
  return client
    .get('/seeReserves', { params: { stateReserva, dateReserve } })
    .then((r) => r.data)
    .then(Reserve.fromList)
}

/** Cambia el estado de una reserva: 'pendiente' | 'confirmada' | 'cancelada'. */
export function updateReserveState(idReserve, stateReserva) {
  return client.patch(`/reservas/${idReserve}/estado`, { stateReserva }).then((r) => r.data)
}

export function deleteReserve(idReserve) {
  return client.delete(`/reservas/${idReserve}`).then((r) => r.data)
}
