import { client } from './client'

export function getUsers() {
  return client.get('/seeUsers').then((r) => r.data)
}

export function getReserves({ stateReserva, dateReserve } = {}) {
  return client.get('/seeReserves', { params: { stateReserva, dateReserve } }).then((r) => r.data)
}
