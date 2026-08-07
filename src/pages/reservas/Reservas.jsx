import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReserves } from '../../api/reserves'

function formatMoney(amount) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

export default function Reservas() {
  const [reserves, setReserves] = useState([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    getMyReserves()
      .then(setReserves)
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Tu cuenta</span>
        <h2>Mis reservas</h2>
        <p>Revisá el estado de tus reservas y sus pagos.</p>
      </div>

      {loading && <p className="hint">Cargando reservas…</p>}

      {!loading && unavailable && (
        <div className="alert alert--error">
          Todavía no podemos mostrar tus reservas: falta habilitar este listado en el backend.
        </div>
      )}

      {!loading && !unavailable && reserves.length === 0 && (
        <div className="alert">
          Todavía no tenés reservas. <Link to="/canchas">Reservá tu primera cancha</Link>.
        </div>
      )}

      {!loading && !unavailable && reserves.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reserves.map((r) => (
            <div className="reserve-card" key={r.idReserve}>
              <div>
                <strong>{r.Court?.typeCourt}</strong> · {r.dateReserve} · {r.Horary ? `${r.Horary.startTime?.slice(0, 5)} - ${r.Horary.endTime?.slice(0, 5)}` : ''}
              </div>
              <div>{formatMoney(r.totalAmount)}</div>
              <span className={`status-pill status-pill--${r.stateReserva}`}>{r.stateReserva}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
