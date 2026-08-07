import { Link } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'

export default function PagoExito() {
  const { loading, reserve, error } = usePaymentReturn()

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Pago</span>
        <h2>¡Gracias por tu reserva!</h2>
        <p>Estamos confirmando tu pago con MercadoPago.</p>
      </div>

      <div className="booking" style={{ maxWidth: 560, textAlign: 'center', gap: 18 }}>
        {loading && <p className="hint">Confirmando el pago…</p>}
        {!loading && error && <div className="alert alert--error">{error}</div>}
        {!loading && reserve && (
          <div className={`alert ${reserve.stateReserva === 'confirmada' ? '' : 'alert--error'}`}>
            {reserve.stateReserva === 'confirmada'
              ? '¡Listo! Tu cancha quedó reservada y el pago fue confirmado.'
              : `El pago quedó en estado: ${reserve.paymentStatus || 'pendiente'}.`}
          </div>
        )}
        <Link className="btn btn--primary" to="/reservas">Ver mis reservas</Link>
      </div>
    </section>
  )
}
