import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReserves, cancelReserve, createPaymentPreference, syncPayments } from '../../api/reserves'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'

export default function Reservas() {
  const [reserves, setReserves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  // idReserve cuyo link de pago se está generando (null = ninguno)
  const [payingId, setPayingId] = useState(null)

  // Reserva pendiente de confirmación de cancelación (null = diálogo cerrado)
  const [confirmingCancel, setConfirmingCancel] = useState(null)

  const load = useCallback(() => {
    return getMyReserves()
      .then((data) => {
        setReserves(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar tus reservas. Probá de nuevo en un rato.'))
  }, [])

  useEffect(() => {
    // Un pago aprobado puede no haber quedado registrado todavía: pasa si el
    // usuario cerró la pestaña de MercadoPago antes de volver, o si el webhook
    // no llega (backend en localhost). Se sincroniza antes de listar para que la
    // reserva aparezca con el estado real y no "pendiente" para siempre.
    syncPayments()
      .catch(() => null)
      .then(load)
      .finally(() => setLoading(false))
  }, [load])

  /** Se ejecuta cuando el usuario confirma en el diálogo, no al apretar "Cancelar". */
  async function handleCancelConfirmed() {
    const reserve = confirmingCancel
    if (!reserve) return

    setCancellingId(reserve.idReserve)
    setConfirmingCancel(null)
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

  /** Retoma el pago de una reserva que quedó pendiente. */
  async function handlePay(reserve) {
    setPayingId(reserve.idReserve)
    setNotice(null)
    setError(null)
    try {
      const { init_point } = await createPaymentPreference(reserve.idReserve)
      window.location.assign(init_point)
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos generar el link de pago.')
      setPayingId(null)
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
                {r.paymentLabel && <div className="hint">{r.paymentLabel}</div>}
              </div>
              <div>{r.formattedAmount}</div>
              <span className={`status-pill status-pill--${r.stateReserva}`}>{r.stateReserva}</span>
              <div className="row-actions">
                {r.canBePaid && (
                  <button
                    className="btn btn--sm btn--primary"
                    type="button"
                    disabled={payingId === r.idReserve}
                    onClick={() => handlePay(r)}
                  >
                    {payingId === r.idReserve ? 'Abriendo pago…' : 'Pagar'}
                  </button>
                )}
                {r.canBeCancelled && (
                  <button
                    className="btn btn--sm btn--danger"
                    type="button"
                    disabled={cancellingId === r.idReserve}
                    onClick={() => setConfirmingCancel(r)}
                  >
                    {cancellingId === r.idReserve ? 'Cancelando…' : 'Cancelar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmingCancel)}
        tone="danger"
        title="Cancelar reserva"
        message={
          confirmingCancel
            ? `Vas a cancelar tu reserva del ${confirmingCancel.dateReserve}. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        onConfirm={handleCancelConfirmed}
        onCancel={() => setConfirmingCancel(null)}
      />
    </section>
  )
}
