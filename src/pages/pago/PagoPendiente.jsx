import { Link } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'

export default function PagoPendiente() {
  const { loading, reserve, error } = usePaymentReturn()

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Pago</span>
        <h2>Tu pago está en revisión</h2>
        <p>MercadoPago todavía está procesando el pago. Te avisaremos apenas se confirme.</p>
      </div>

      <div className="booking" style={{ maxWidth: 560, textAlign: 'center', gap: 18 }}>
        {loading && <p className="hint">Consultando el estado…</p>}
        {!loading && error && <div className="alert alert--error">{error}</div>}
        {!loading && reserve && (
          <div className="alert">
            Estado actual: {reserve.paymentStatus || reserve.stateReserva}. Podés revisar el resultado final en "Mis reservas".
          </div>
        )}
        <Link className="btn btn--primary" to="/reservas">Ver mis reservas</Link>
      </div>
    </section>
  )
}
