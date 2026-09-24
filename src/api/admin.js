import { client } from './client'
import { Reserve } from '../models/reserve'

export function getUsers() {
  return client.get('/seeUsers').then((r) => r.data)
}

export function updateUserState(idUser) {
  return client.patch(`/usuarios/${idUser}/estado`).then((r) => r.data)
}

export function deleteUser(idUser) {
  return client.delete(`/usuarios/${idUser}`).then((r) => r.data)
}

export function getReserves({ stateReserva, dateReserve } = {}) {
  return client
    .get('/seeReserves', { params: { stateReserva, dateReserve } })
    .then((r) => r.data)
    .then(Reserve.fromList)
}

export function updateReserveState(idReserve, stateReserva) {
  return client.patch(`/reservas/${idReserve}/estado`, { stateReserva }).then((r) => r.data)
}

export function deleteReserve(idReserve) {
  return client.delete(`/reservas/${idReserve}`).then((r) => r.data)
}
