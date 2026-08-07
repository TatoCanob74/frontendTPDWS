import { Link } from 'react-router-dom'
import { usePaymentReturn } from '../../hooks/usePaymentReturn'

export default function PagoError() {
  const { loading, error } = usePaymentReturn()

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Pago</span>
        <h2>El pago no se pudo completar</h2>
        <p>No te preocupes, tu cancha no fue reservada y no se realizó ningún cobro.</p>
      </div>

      <div className="booking" style={{ maxWidth: 560, textAlign: 'center', gap: 18 }}>
        {loading && <p className="hint">Verificando el estado del pago…</p>}
        {!loading && (
          <div className="alert alert--error">
            {error || 'El pago fue rechazado o cancelado. Podés intentar de nuevo cuando quieras.'}
          </div>
        )}
        <Link className="btn btn--primary" to="/canchas">Volver a intentar</Link>
      </div>
    </section>
  )
}
