import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { confirmPayment, getPaymentStatus } from '../api/reserves'

// MercadoPago agrega estos query params a las back_urls (success/failure/pending):
// external_reference (= idReserve), payment_id / collection_id.
// El backend además deja un ?reserva= propio en la back_url, que se usa como
// respaldo por si MercadoPago no manda external_reference.
export function usePaymentReturn() {
  const [params] = useSearchParams()
  const idReserve = params.get('external_reference') || params.get('reserva')
  const paymentId = params.get('payment_id') || params.get('collection_id')

  const [state, setState] = useState(() =>
    idReserve
      ? { loading: true, reserve: null, error: null }
      : { loading: false, reserve: null, error: 'No encontramos la reserva asociada a este pago.' }
  )

  useEffect(() => {
    if (!idReserve) return

    const confirmStep = paymentId ? confirmPayment(idReserve, paymentId) : Promise.resolve(null)

    confirmStep
      .catch(() => null)
      .then(() => getPaymentStatus(idReserve))
      .then((reserve) => setState({ loading: false, reserve, error: null }))
      .catch(() => setState({ loading: false, reserve: null, error: 'No pudimos consultar el estado del pago.' }))
  }, [idReserve, paymentId])

  return state
}
