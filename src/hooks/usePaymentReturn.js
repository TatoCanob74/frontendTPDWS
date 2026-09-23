import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { confirmPayment, getPaymentStatus } from '../api/reserves'

const POLL_MS = 3000
const POLL_TIMEOUT_MS = 10 * 60 * 1000

const PENDING_STATUSES = ['pending', 'in_process', 'in_mediation', 'authorized']

function isSettled(reserve) {
  if (!reserve) return false
  if (reserve.stateReserva === 'confirmada' || reserve.stateReserva === 'cancelada') return true
  return Boolean(reserve.paymentStatus) && !PENDING_STATUSES.includes(reserve.paymentStatus)
}

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

    function onFocus() {
      if (poll && !done) check(false)
    }
    // El navegador frena los timers de las pestañas en segundo plano
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
