import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'
import ReserveDetail from '../../components/reserveDetail/ReserveDetail'

const CONFIRMED_DELAY_MS = 8000
const REDIRECT_DELAY_MS = 5000

export default function PagoPendiente() {
  const [params] = useSearchParams()
  const waiting = params.get('esperando') === '1'

  const { loading, reserve, error, settled } = usePaymentReturn({ poll: waiting })
  const navigate = useNavigate()

  const confirmed = reserve?.stateReserva === 'confirmada'

  useEffect(() => {
    if (loading) return
    if (waiting && !settled) return

    const timer = setTimeout(
      () => navigate('/reservas', { replace: true }),
      confirmed ? CONFIRMED_DELAY_MS : REDIRECT_DELAY_MS
    )

    return () => clearTimeout(timer)
  }, [loading, waiting, settled, confirmed, navigate])

  const heading = confirmed
    ? '¡Reserva confirmada!'
    : waiting && !settled
      ? 'Esperando tu pago'
      : 'Tu pago está en revisión'

  const subheading = confirmed
    ? 'Tu pago fue aprobado y la cancha ya es tuya.'
    : waiting && !settled
      ? 'Abrimos el checkout de MercadoPago en otra pestaña. Terminá el pago ahí y esta página se actualiza sola.'
      : 'MercadoPago todavía está procesando el pago. Te avisaremos apenas se confirme.'

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Pago</span>
        <h2>{heading}</h2>
        <p>{subheading}</p>
      </div>

      <div className="booking" style={{ maxWidth: 560, textAlign: 'center', gap: 18 }}>
        {loading && <p className="hint">Consultando el estado…</p>}
        {!loading && error && <div className="alert alert--error">{error}</div>}

        {!loading && reserve && (
          <div className={`alert ${confirmed || !settled ? '' : 'alert--error'}`}>
            {confirmed
              ? 'Pago aprobado · Reserva confirmada'
              : `Estado actual: ${reserve.paymentStatus || reserve.stateReserva}.`}
          </div>
        )}

        {!loading && confirmed && <ReserveDetail reserve={reserve} />}

        <Link className="btn btn--primary" to="/reservas">Ver mis reservas</Link>

        {!loading && waiting && !settled && (
          <p className="hint">Seguimos consultando el estado del pago…</p>
        )}
        {!loading && (!waiting || settled) && (
          <p className="hint">Te llevamos a tus reservas en unos segundos…</p>
        )}
      </div>
    </section>
  )
}
