import { useState } from 'react'

const emptyForm = {
  nameService: '',
  priceService: '',
  descriptionService: ''
}

function toFormState(service) {
  if (!service) return emptyForm
  return {
    nameService: service.nameService,
    priceService: String(service.priceService),
    descriptionService: service.descriptionService
  }
}

/**
 * Formulario de alta y edición de servicios adicionales.
 *
 * Es un componente controlado desde afuera: no sabe nada de la API ni de cómo
 * se guarda. Recibe los datos por props (input properties) y avisa lo que pasa
 * por callbacks (output properties).
 *
 * El estado inicial se calcula una sola vez. Para cargar otro servicio, el
 * padre debe pasarle una `key` distinta y React remonta el componente: es el
 * patrón recomendado en vez de sincronizar el estado con un useEffect.
 *
 * @param {Service|null} service   servicio a editar; null para crear uno nuevo
 * @param {boolean}   submitting deshabilita el formulario mientras se guarda
 * @param {string|null} error    mensaje de error a mostrar
 * @param {Function}  onSubmit   (payload) => void  ← output property
 * @param {Function}  onCancel   () => void         ← output property
 */
export default function ServiceForm({
  service = null,
  submitting = false,
  error = null,
  onSubmit,
  onCancel
}) {
  const [form, setForm] = useState(() => toFormState(service))
  const isEditing = Boolean(service)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      nameService: form.nameService.trim(),
      priceService: Number(form.priceService),
      descriptionService: form.descriptionService.trim()
    })
  }

  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? `Editar ${service.nameService}` : 'Nuevo servicio'}</h3>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="nameService">Nombre</label>
          <input
            className="input"
            id="nameService"
            name="nameService"
            required
            value={form.nameService}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="priceService">Precio</label>
          <input
            className="input"
            type="number"
            id="priceService"
            name="priceService"
            min="1"
            step="1"
            required
            value={form.priceService}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="descriptionService">Descripción</label>
        <textarea
          className="input"
          id="descriptionService"
          name="descriptionService"
          required
          rows={3}
          value={form.descriptionService}
          onChange={handleChange}
        />
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="booking__foot">
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear servicio'}
        </button>
      </div>
    </form>
  )
}
