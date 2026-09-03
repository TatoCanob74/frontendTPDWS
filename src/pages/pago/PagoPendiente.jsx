import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'

const REDIRECT_DELAY_MS = 5000

export default function PagoPendiente() {
  const { loading, reserve, error } = usePaymentReturn()
  const navigate = useNavigate()

  // El estado final llega por MercadoPago, así que lo útil es dejar al usuario
  // en "Mis reservas", que es donde va a ver el resultado.
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
        {!loading && <p className="hint">Te llevamos a tus reservas en unos segundos…</p>}
      </div>
    </section>
  )
}
