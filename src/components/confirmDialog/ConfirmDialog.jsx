import { useEffect, useId, useRef } from 'react'

/**
 * Diálogo de confirmación de la propia app.
 *
 * Reemplaza a `window.confirm()`: el navegador dibuja esa ventana con su propio
 * estilo, bloquea el hilo y no se puede adaptar ni al diseño ni al idioma de la
 * aplicación. Este componente es HTML común, así que se ve igual en todos los
 * navegadores y sigue los tokens de color del proyecto.
 *
 * Igual que `CourtForm`, es un componente controlado desde afuera: recibe los
 * datos por props (input properties) y avisa lo que pasa por callbacks
 * (output properties). No sabe qué se está confirmando ni qué pasa después.
 *
 * Accesibilidad: usa `role="alertdialog"`, arranca con el foco en el botón
 * seguro ("Cancelar"), cierra con la tecla Escape o clic en el fondo, y
 * devuelve el foco a donde estaba al cerrarse.
 *
 * @param {boolean}  open         si el diálogo está visible
 * @param {string}   title        título corto de la advertencia
 * @param {string}   message      explicación de la consecuencia
 * @param {string}   confirmLabel texto del botón que confirma
 * @param {string}   cancelLabel  texto del botón que cancela
 * @param {string}   tone         'danger' (destructivo) o 'default'
 * @param {boolean}  busy         deshabilita los botones mientras se procesa
 * @param {Function} onConfirm    () => void  ← output property
 * @param {Function} onCancel     () => void  ← output property
 */
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

  // Foco inicial y bloqueo del scroll de fondo. Depende solo de `open` para no
  // volver a robar el foco en cada render del padre.
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

  // Escape cierra. Va en su propio efecto porque sí depende de `onCancel`.
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
      // mousedown y no click: si arrastrás desde adentro y soltás afuera, no cierra
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
