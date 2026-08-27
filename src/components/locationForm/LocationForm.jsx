import { useState } from 'react'

const emptyForm = {
  nameCountry: '',
  nomLocation: ''
}

function toFormState(location) {
  if (!location) return emptyForm
  return {
    nameCountry: location.nameCountry,
    nomLocation: location.nomLocation
  }
}

/**
 * Formulario de alta y edición de localidades.
 *
 * Es un componente controlado desde afuera: no sabe nada de la API ni de cómo
 * se guarda. Recibe los datos por props (input properties) y avisa lo que pasa
 * por callbacks (output properties).
 *
 * El estado inicial se calcula una sola vez. Para cargar otra localidad, el
 * padre debe pasarle una `key` distinta y React remonta el componente: es el
 * patrón recomendado en vez de sincronizar el estado con un useEffect.
 *
 * @param {Location|null} location  localidad a editar; null para crear una nueva
 * @param {boolean}   submitting deshabilita el formulario mientras se guarda
 * @param {string|null} error    mensaje de error a mostrar
 * @param {Function}  onSubmit   (payload) => void  ← output property
 * @param {Function}  onCancel   () => void         ← output property
 */
export default function LocationForm({
  location = null,
  submitting = false,
  error = null,
  onSubmit,
  onCancel
}) {
  const [form, setForm] = useState(() => toFormState(location))
  const isEditing = Boolean(location)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      nameCountry: form.nameCountry.trim(),
      nomLocation: form.nomLocation.trim()
    })
  }

  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? `Editar ${location.nomLocation}` : 'Nueva localidad'}</h3>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="nomLocation">Localidad</label>
          <input
            className="input"
            id="nomLocation"
            name="nomLocation"
            required
            value={form.nomLocation}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="nameCountry">País</label>
          <input
            className="input"
            id="nameCountry"
            name="nameCountry"
            required
            value={form.nameCountry}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="booking__foot">
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear localidad'}
        </button>
      </div>
    </form>
  )
}
