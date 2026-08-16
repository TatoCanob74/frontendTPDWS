import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReserves, cancelReserve } from '../../api/reserves'

export default function Reservas() {
  const [reserves, setReserves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  const load = useCallback(() => {
    return getMyReserves()
      .then((data) => {
        setReserves(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar tus reservas. Probá de nuevo en un rato.'))
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  async function handleCancel(reserve) {
    const confirmed = window.confirm(
      `¿Cancelar la reserva del ${reserve.dateReserve}? Esta acción no se puede deshacer.`
    )
    if (!confirmed) return

    setCancellingId(reserve.idReserve)
    setNotice(null)
    setError(null)
    try {
      await cancelReserve(reserve.idReserve)
      setNotice('Reserva cancelada correctamente.')
      await load()
    } catch (err) {
      // El backend rechaza con 400 si faltan menos de 6 horas o si no está pendiente
      setError(err.response?.data?.error || 'No pudimos cancelar la reserva.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Tu cuenta</span>
        <h2>Mis reservas</h2>
        <p>Revisá el estado de tus reservas y sus pagos.</p>
      </div>

      {loading && <p className="hint">Cargando reservas…</p>}

      {notice && <div className="alert" role="status">{notice}</div>}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {!loading && !error && reserves.length === 0 && (
        <div className="alert">
          Todavía no tenés reservas. <Link to="/canchas">Reservá tu primera cancha</Link>.
        </div>
      )}

      {!loading && reserves.length > 0 && (
        <div className="reserve-list">
          {reserves.map((r) => (
            <div className="reserve-card" key={r.idReserve}>
              <div>
                <strong>{r.courtLabel ?? `Cancha #${r.idCourt}`}</strong> · {r.dateReserve}
                {r.scheduleLabel ? ` · ${r.scheduleLabel}` : ''}
              </div>
              <div>{r.formattedAmount}</div>
              <span className={`status-pill status-pill--${r.stateReserva}`}>{r.stateReserva}</span>
              {r.canBeCancelled && (
                <button
                  className="btn btn--sm btn--danger"
                  type="button"
                  disabled={cancellingId === r.idReserve}
                  onClick={() => handleCancel(r)}
                >
                  {cancellingId === r.idReserve ? 'Cancelando…' : 'Cancelar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
