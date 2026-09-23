import { useEffect, useId, useRef } from 'react'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel
}) {
  const cancelRef = useRef(null)
  const lastFocused = useRef(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    if (!open) return

    lastFocused.current = document.activeElement
    cancelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      lastFocused.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className={`modal modal--${tone}`}
      // mousedown y no click: arrastrar desde adentro y soltar afuera no cierra
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div
        className="modal__box"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <span className="modal__icon" aria-hidden="true">!</span>

        <h3 id={titleId}>{title}</h3>
        <p className="modal__text" id={messageId}>{message}</p>

        <div className="modal__foot">
          <button
            className="btn btn--outline"
            type="button"
            ref={cancelRef}
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            className={tone === 'danger' ? 'btn btn--danger-solid' : 'btn btn--primary'}
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
