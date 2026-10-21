import { useEffect, useId, useRef } from 'react'
import { DEPOSIT_PERCENT, PAYMENT_WINDOW_MINUTES, depositFor } from '../../models/reserve'
import { formatCurrency } from '../../utils/currency'
import { MercadoPagoIcon } from '../paymentIcons/PaymentIcons'

// Pantalla intermedia del pago en efectivo: explica que el turno se asegura con una
// seña por Mercado Pago y cuánto queda para pagar en el complejo.
export default function CashDepositDialog({ open, total, busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined

    const lastFocused = document.activeElement
    cancelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      lastFocused?.focus?.()
    }
  }, [open, busy, onCancel])

  if (!open) return null

  const deposit = depositFor(total)
  const rest = Number(total) - deposit

  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div className="modal__box" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h3 id={titleId}>Pagar en efectivo</h3>
        <p className="modal__text">
          Para pagar en efectivo tenés que asegurar el turno con una seña del {DEPOSIT_PERCENT}% por Mercado Pago.
          El resto lo abonás en efectivo en el complejo.
        </p>

        <div className="detail-list">
          <div className="detail-list__row">
            <span>Total de la reserva</span>
            <span className="detail-list__value">{formatCurrency(total)}</span>
          </div>
          <div className="detail-list__row">
            <span>Seña a pagar ahora ({DEPOSIT_PERCENT}%)</span>
            <span className="detail-list__value">{formatCurrency(deposit)}</span>
          </div>
          <div className="detail-list__row detail-list__row--total">
            <span>Resto en efectivo en el complejo</span>
            <span className="detail-list__value">{formatCurrency(rest)}</span>
          </div>
        </div>

        <p className="hint">
          Tenés {PAYMENT_WINDOW_MINUTES} minutos para pagar la seña; si no, la reserva vence y el horario se libera.
          La seña no se devuelve: una vez señada, la reserva no se puede cancelar desde la app.
        </p>

        <div className="modal__foot">
          <button className="btn btn--outline" type="button" ref={cancelRef} onClick={onCancel} disabled={busy}>
            Volver
          </button>
          <button className="btn btn--mp" type="button" onClick={onConfirm} disabled={busy}>
            <MercadoPagoIcon />
            {busy ? 'Procesando…' : 'Pagar seña con Mercado Pago'}
          </button>
        </div>
      </div>
    </div>
  )
}
