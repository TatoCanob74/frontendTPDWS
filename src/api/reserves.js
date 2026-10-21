import { client, emptyOn404 } from './client'
import { Reserve } from '../models/reserve'

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

export function getReserve(idReserve) {
  return client.get(`/reservas/${idReserve}`).then((r) => Reserve.fromDTO(r.data))
}

export function cancelReserve(idReserve) {
  return client.patch(`/reservas/${idReserve}/cancelar`).then((r) => r.data)
}

// metodo: 'MERCADO_PAGO' cobra el total; 'EFECTIVO' cobra solo la seña
export function createPaymentPreference(idReserve, metodo = 'MERCADO_PAGO') {
  return client.post(`/reserves/${idReserve}/pago`, { metodo }).then((r) => r.data)
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
