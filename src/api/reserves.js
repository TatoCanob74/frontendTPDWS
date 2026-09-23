import { client, emptyOn404 } from './client'
import { Reserve } from '../models/Reserve'

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
  return client.get(`/reserves/${idReserve}/pago`).then((r) => Reserve.fromDTO(r.data))
}

export function syncPayments() {
  return client.post('/reservas/sincronizar-pagos').then((r) => r.data)
}
