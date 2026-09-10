import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { confirmPayment, getPaymentStatus } from '../api/reserves'

// MercadoPago agrega estos query params a las back_urls (success/failure/pending):
// external_reference (= idReserve), payment_id / collection_id.
// El backend además deja un ?reserva= propio en la back_url, que se usa como
// respaldo por si MercadoPago no manda external_reference.

// Cada cuánto se vuelve a preguntar mientras el pago sigue en curso.
const POLL_MS = 3000
// Tope de espera: si a los 10 minutos no se resolvió, el usuario abandonó el
// checkout. Sin este corte la pestaña quedaría consultando para siempre.
const POLL_TIMEOUT_MS = 10 * 60 * 1000

/** Estados en los que MercadoPago todavía no dijo la última palabra. */
const PENDING_STATUSES = ['pending', 'in_process', 'in_mediation', 'authorized']

function isSettled(reserve) {
  if (!reserve) return false
  if (reserve.stateReserva === 'confirmada' || reserve.stateReserva === 'cancelada') return true
  return Boolean(reserve.paymentStatus) && !PENDING_STATUSES.includes(reserve.paymentStatus)
}

/**
 * Resuelve el estado del pago de la reserva que viene en la URL.
 *
 * Con `poll: true` sigue consultando hasta que el pago se resuelve. Hace falta
 * cuando el checkout se abrió en otra pestaña: acá no llega ningún `payment_id`
 * por query, y el único modo de enterarse es preguntando.
 */
export function usePaymentReturn({ poll = false } = {}) {
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

    let cancelled = false
    let inFlight = false
    let done = false
    let timer
    const startedAt = Date.now()

    async function check(isFirst) {
      if (cancelled || done || inFlight) return
      inFlight = true
      try {
        // El payment_id solo llega cuando MercadoPago nos devolvió por back_url.
        if (isFirst && paymentId) {
          await confirmPayment(idReserve, paymentId).catch(() => null)
        }

        const reserve = await getPaymentStatus(idReserve)
        if (cancelled) return
        setState({ loading: false, reserve, error: null })

        const expired = Date.now() - startedAt > POLL_TIMEOUT_MS
        if (!poll || isSettled(reserve) || expired) {
          done = true
          return
        }
        clearTimeout(timer)
        timer = setTimeout(() => check(false), POLL_MS)
      } catch {
        if (!cancelled) {
          setState({ loading: false, reserve: null, error: 'No pudimos consultar el estado del pago.' })
        }
      } finally {
        inFlight = false
      }
    }

    check(true)

    // El checkout se paga en OTRA pestaña, y el navegador congela los timers de
    // las pestañas en segundo plano (Chrome los baja a uno por minuto y después
    // los suspende). Sin esto, al volver el usuario ve "pendiente" durante un
    // rato largo aunque el pago ya esté aprobado.
    function onFocus() {
      if (poll && !done) check(false)
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [idReserve, paymentId, poll])

  return { ...state, settled: isSettled(state.reserve) }
}
