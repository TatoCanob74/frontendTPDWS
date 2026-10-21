import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReserves, cancelReserve, createPaymentPreference, syncPayments } from '../../api/reserves'
import ConfirmDialog from '../../components/confirmDialog/ConfirmDialog'
import ReserveDetailDialog from '../../components/reserveDetailDialog/ReserveDetailDialog'

export default function Reservas() {
  const [reserves, setReserves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [payingId, setPayingId] = useState(null)
  const [confirmingCancel, setConfirmingCancel] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const closeDetail = useCallback(() => setDetailId(null), [])

  const load = useCallback(() => {
    return getMyReserves()
      .then((data) => {
        setReserves(data)
        setError(null)
      })
      .catch(() => setError('No pudimos cargar tus reservas. Probá de nuevo en un rato.'))
  }, [])

  useEffect(() => {
    // Puede haber pagos aprobados que el webhook todavía no registró
    syncPayments()
      .catch(() => null)
      .then(load)
      .finally(() => setLoading(false))
  }, [load])

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
      setError(err.response?.data?.error || 'No pudimos cancelar la reserva.')
    } finally {
      setCancellingId(null)
    }
  }

  async function handlePay(reserve) {
    setPayingId(reserve.idReserve)
    setNotice(null)
    setError(null)
    try {
      const { init_point } = await createPaymentPreference(reserve.idReserve, reserve.paymentMethod)
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
          Todavía no tenés reservas. <Link to="/canchas">Reservá tu primera cancha</Link>
        </div>
      )}

      {!loading && reserves.length > 0 && (
        <div className="reserve-list">
          {reserves.map((r) => (
            <div className="reserve-card" key={r.idReserve}>
              <div>
                <strong>{r.courtLabel ?? `Cancha #${r.idCourt}`}</strong> · {r.dateReserve}
                {r.scheduleLabel ? ` · ${r.scheduleLabel}` : ''}
                {r.complexName ? ` · ${r.complexName}`: ''}
                {r.paymentLabel && <div className="hint">{r.paymentLabel}</div>}
                {r.hasBalance && (
                  <div className="hint">{`Seña pagada · Resta ${r.formattedBalance} en efectivo en el complejo`}</div>
                )}
                {r.isCashPaid && <div className="hint">Saldo pagado en efectivo</div>}
                {r.canBePaid && r.paymentDeadlineLabel && (
                  <div className="hint">{`Pagá antes de las ${r.paymentDeadlineLabel} o el horario se libera`}</div>
                )}
                {r.isExpired && <div className="hint">Venció sin pagarse y el horario se liberó</div>}
              </div>
              <div>{r.formattedAmount}</div>
              <span className={`status-pill status-pill--${r.stateClass}`}>{r.stateLabel}</span>
              <div className="row-actions">
                <button className="btn btn--sm btn--outline" type="button" onClick={() => setDetailId(r.idReserve)}>
                  Ver detalle
                </button>
                {r.canBePaid && (
                  <button
                    className="btn btn--sm btn--primary"
                    type="button"
                    disabled={payingId === r.idReserve}
                    onClick={() => handlePay(r)}
                  >
                    {payingId === r.idReserve ? 'Abriendo pago…' : r.isCash ? 'Pagar seña' : 'Pagar'}
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

      <ReserveDetailDialog idReserve={detailId} onClose={closeDetail} />

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
