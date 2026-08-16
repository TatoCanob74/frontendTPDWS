import { useState } from 'react'
import { COURT_TYPES } from '../../models/Court'

const emptyForm = {
  typeCourt: 'FUTBOL',
  nameCourt: '',
  hourlyPrice: '',
  capacityPlayers: '',
  idLocateCourt: ''
}

function toFormState(court) {
  if (!court) return emptyForm
  return {
    typeCourt: court.typeCourt,
    nameCourt: court.nameCourt,
    hourlyPrice: String(court.hourlyPrice),
    capacityPlayers: String(court.capacityPlayers),
    idLocateCourt: String(court.idLocateCourt)
  }
}

/**
 * Formulario de alta y edición de canchas.
 *
 * Es un componente controlado desde afuera: no sabe nada de la API ni de cómo
 * se guarda. Recibe los datos por props (input properties) y avisa lo que pasa
 * por callbacks (output properties).
 *
 * El estado inicial se calcula una sola vez. Para cargar otra cancha, el padre
 * debe pasarle una `key` distinta y React remonta el componente: es el patrón
 * recomendado en vez de sincronizar el estado con un useEffect.
 *
 * @param {Court|null} court      cancha a editar; null para crear una nueva
 * @param {Array}      locations  sedes disponibles para el select
 * @param {boolean}    submitting deshabilita el formulario mientras se guarda
 * @param {string|null} error     mensaje de error a mostrar
 * @param {Function}   onSubmit   (payload) => void  ← output property
 * @param {Function}   onCancel   () => void         ← output property
 */
export default function CourtForm({
  court = null,
  locations = [],
  submitting = false,
  error = null,
  onSubmit,
  onCancel
}) {
  const [form, setForm] = useState(() => toFormState(court))
  const isEditing = Boolean(court)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      typeCourt: form.typeCourt,
      nameCourt: form.nameCourt.trim(),
      hourlyPrice: Number(form.hourlyPrice),
      capacityPlayers: Number(form.capacityPlayers),
      idLocateCourt: Number(form.idLocateCourt)
    })
  }

  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? `Editar ${court.nameCourt}` : 'Nueva cancha'}</h3>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="nameCourt">Nombre</label>
          <input
            className="input"
            id="nameCourt"
            name="nameCourt"
            required
            value={form.nameCourt}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="typeCourt">Deporte</label>
          <select
            className="input"
            id="typeCourt"
            name="typeCourt"
            value={form.typeCourt}
            onChange={handleChange}
          >
            {COURT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="hourlyPrice">Precio por hora</label>
          <input
            className="input"
            type="number"
            id="hourlyPrice"
            name="hourlyPrice"
            min="1"
            step="0.01"
            required
            value={form.hourlyPrice}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="capacityPlayers">Capacidad</label>
          <input
            className="input"
            type="number"
            id="capacityPlayers"
            name="capacityPlayers"
            min="1"
            step="1"
            required
            value={form.capacityPlayers}
            onChange={handleChange}
          />
          <p className="hint">Cantidad de jugadores.</p>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="idLocateCourt">Sede</label>
        <select
          className="input"
          id="idLocateCourt"
          name="idLocateCourt"
          required
          value={form.idLocateCourt}
          onChange={handleChange}
        >
          <option value="">Elegí una sede</option>
          {locations.map((loc) => (
            <option key={loc.idLocation} value={loc.idLocation}>{loc.nomLocation}</option>
          ))}
        </select>
        {locations.length === 0 && (
          <p className="hint">No hay sedes cargadas todavía.</p>
        )}
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="booking__foot">
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear cancha'}
        </button>
      </div>
    </form>
  )
}
