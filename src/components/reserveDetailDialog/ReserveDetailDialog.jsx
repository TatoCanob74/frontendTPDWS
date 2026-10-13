import { useEffect, useId, useRef, useState } from 'react'
import { getReserve } from '../../api/reserves'
import ReserveDetail from '../reserveDetail/ReserveDetail'

// Detalle de una reserva del listado: lo pide al backend al abrirse, así trae
// datos que el listado no tiene (servicios, complejo, sede y cliente).
export default function ReserveDetailDialog({ idReserve, onClose }) {
  // Guarda para qué id es el resultado: si no coincide con el actual, todavía está cargando
  const [result, setResult] = useState({ id: null, reserve: null, error: null })
  const closeRef = useRef(null)
  const titleId = useId()
  const open = idReserve != null

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false

    getReserve(idReserve)
      .then((data) => {
        if (!cancelled) setResult({ id: idReserve, reserve: data, error: null })
      })
      .catch((err) => {
        const error = err.response?.data?.error || 'No pudimos cargar el detalle de la reserva.'
        if (!cancelled) setResult({ id: idReserve, reserve: null, error })
      })

    return () => {
      cancelled = true
    }
  }, [open, idReserve])

  useEffect(() => {
    if (!open) return undefined

    const lastFocused = document.activeElement
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      lastFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const current = result.id === idReserve
  const reserve = current ? result.reserve : null
  const error = current ? result.error : null

  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal__box" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h3 id={titleId}>Reserva #{idReserve}</h3>

        {!reserve && !error && <p className="hint">Cargando detalle…</p>}
        {error && <div className="alert alert--error" role="alert">{error}</div>}

        {reserve && (
          <>
            <div>
              <span className={`status-pill status-pill--${reserve.stateReserva}`}>{reserve.stateReserva}</span>
            </div>
            <ReserveDetail reserve={reserve} />
            {reserve.paymentLabel && <p className="hint">{reserve.paymentLabel}</p>}
          </>
        )}

        <div className="modal__foot">
          <button className="btn btn--outline" type="button" ref={closeRef} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
