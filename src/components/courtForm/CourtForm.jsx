import { useState } from 'react'
import { COURT_TYPES } from '../../models/court'

const emptyForm = {
  typeCourt: 'FUTBOL',
  nameCourt: '',
  hourlyPrice: '',
  capacityPlayers: '',
  idComplex: ''
}

function toFormState(court) {
  if (!court) return emptyForm
  return {
    typeCourt: court.typeCourt,
    nameCourt: court.nameCourt,
    hourlyPrice: String(court.hourlyPrice),
    capacityPlayers: String(court.capacityPlayers),
    idComplex: String(court.idComplex)
  }
}

export default function CourtForm({
  court = null,
  complexes = [],
  lockedComplex = null,
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
    const payload = {
      typeCourt: form.typeCourt,
      nameCourt: form.nameCourt.trim(),
      hourlyPrice: Number(form.hourlyPrice),
      capacityPlayers: Number(form.capacityPlayers)
    }
    // El admin de un complejo no elige: el backend usa el suyo
    if (!lockedComplex) payload.idComplex = Number(form.idComplex)
    onSubmit(payload)
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
            step="1"
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

      {lockedComplex ? (
        <div className="summary">
          <span className="summary__label">Complejo</span>
          <span className="summary__value">{lockedComplex.label}</span>
        </div>
      ) : (
        <div className="field">
          <label className="field__label" htmlFor="idComplex">Complejo</label>
          <select
            className="input"
            id="idComplex"
            name="idComplex"
            required
            value={form.idComplex}
            onChange={handleChange}
          >
            <option value="">Elegí un complejo</option>
            {complexes.map((cx) => (
              <option key={cx.idComplex} value={cx.idComplex}>{cx.label}</option>
            ))}
          </select>
          {complexes.length === 0 && (
            <p className="hint">No hay complejos cargados todavía. Creá uno en la pestaña Complejos.</p>
          )}
        </div>
      )}

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
