import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'

// Cuánto se espera antes de llevar al usuario a "Mis reservas". Lo justo para
// que llegue a leer el resultado del pago sin quedarse en una pantalla muerta.
const REDIRECT_DELAY_MS = 4000

export default function PagoExito() {
  const { loading, reserve, error } = usePaymentReturn()
  const navigate = useNavigate()

  // Antes había que apretar el botón sí o sí: si el usuario no lo veía, se
  // quedaba en la pantalla de pago sin saber si la reserva había quedado hecha.
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
        {!loading && <p className="hint">Te llevamos a tus reservas en unos segundos…</p>}
      </div>
    </section>
  )
}
