import { client, emptyOn404 } from './client'
import { Reserve } from '../models/Reserve'

// Rutas reales del backend (rama de Francisco):
//   POST  /usuarios/createReserve       crear reserva
//   GET   /reservas/mis-reservas        reservas del usuario logueado
//   PATCH /reservas/:id/cancelar        cancelar una reserva propia
//   POST  /reserves/:id/pago            preferencia de MercadoPago
//   POST  /reserves/:id/pago/confirmar  confirmar el pago al volver del checkout
//   GET   /reserves/:id/pago            estado del pago

export function createReserve({ typeCourt, idLocateCourt, dateReserve, day, idHorary, services }) {
  return client
    .post('/usuarios/createReserve', {
      typeCourt,
      idLocateCourt,
      dateReserve,
      day,
      idHorary,
      services
    })
    .then((r) => r.data)
}

export function getMyReserves({ stateReserva } = {}) {
  return emptyOn404(
    client.get('/reservas/mis-reservas', { params: { stateReserva } }).then((r) => r.data)
  ).then(Reserve.fromList)
}

/**
 * Cancela una reserva propia.
 * El backend solo permite cancelar reservas pendientes y con al menos
 * 6 horas de anticipación; si no, responde 400 con el motivo.
 */
export function cancelReserve(idReserve) {
  return client.patch(`/reservas/${idReserve}/cancelar`).then((r) => r.data)
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
