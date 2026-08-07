import { client } from './client'

export function createReserve({ typeCourt, idLocateCourt, dateReserve, day, idHorary, services }) {
  return client
    .post('/reserves', { typeCourt, idLocateCourt, dateReserve, day, idHorary, services })
    .then((r) => r.data)
}

export function createPaymentPreference(idReserve) {
  return client.post(`/reserves/${idReserve}/pago`).then((r) => r.data)
}

export function confirmPayment(idReserve, paymentId) {
  return client.post(`/reserves/${idReserve}/pago/confirmar`, { payment_id: paymentId }).then((r) => r.data)
}

export function getPaymentStatus(idReserve) {
  return client.get(`/reserves/${idReserve}/pago`).then((r) => r.data)
}

// TODO backend: no existe todavía GET /reserves/mine (reservas del usuario logueado).
export function getMyReserves() {
  return client.get('/reserves/mine').then((r) => r.data)
}
