import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'
import ReserveDetail from '../../components/reserveDetail/ReserveDetail'

const REDIRECT_DELAY_MS = 8000

export default function PagoExito() {
  const { loading, reserve, error } = usePaymentReturn()
  const navigate = useNavigate()

  const confirmed = reserve?.stateReserva === 'confirmada'

  useEffect(() => {
    if (loading) return

    const timer = setTimeout(() => {
      navigate('/reservas', { replace: true })
    }, REDIRECT_DELAY_MS)

    return () => clearTimeout(timer)
  }, [loading, navigate])

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Pago</span>
        <h2>{confirmed ? '¡Reserva confirmada!' : '¡Gracias por tu reserva!'}</h2>
        <p>
          {confirmed
            ? 'Tu pago fue aprobado y la cancha ya es tuya.'
            : 'Estamos confirmando tu pago con MercadoPago.'}
        </p>
      </div>

      <div className="booking" style={{ maxWidth: 560, textAlign: 'center', gap: 18 }}>
        {loading && <p className="hint">Confirmando el pago…</p>}
        {!loading && error && <div className="alert alert--error">{error}</div>}

        {!loading && reserve && (
          <div className={`alert ${confirmed ? '' : 'alert--error'}`}>
            {confirmed
              ? 'Pago aprobado · Reserva confirmada'
              : `El pago quedó en estado: ${reserve.paymentStatus || 'pendiente'}.`}
          </div>
        )}

        {!loading && confirmed && <ReserveDetail reserve={reserve} />}

        <Link className="btn btn--primary" to="/reservas">Ver mis reservas</Link>
        {!loading && <p className="hint">Te llevamos a tus reservas en unos segundos…</p>}
      </div>
    </section>
  )
}
