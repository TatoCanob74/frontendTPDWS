import { useState } from 'react'
import { DAYS } from '../../models/Horary'

const emptyForm = {
  idCourt: '',
  day: 'Lunes',
  startTime: '18:00',
  endTime: '19:00'
}

function toFormState(horary) {
  if (!horary) return emptyForm
  return {
    idCourt: String(horary.idCourt),
    day: horary.day,
    startTime: horary.start, // "18:00:00" -> "18:00"
    endTime: horary.end
  }
}

/**
 * Formulario de alta y edición de horarios.
 *
 * Igual que CourtForm, es un componente controlado desde afuera: recibe todo
 * por props (input properties) y avisa por callbacks (output properties). No
 * conoce la API.
 *
 * @param {Horary|null} horary     horario a editar; null para crear uno nuevo
 * @param {Array}       courts     canchas disponibles para el select
 * @param {boolean}     submitting deshabilita el formulario mientras guarda
 * @param {string|null} error      mensaje de error a mostrar
 * @param {Function}    onSubmit   (payload) => void  ← output property
 * @param {Function}    onCancel   () => void         ← output property
 */
export default function HoraryForm({
  horary = null,
  courts = [],
  submitting = false,
  error = null,
  onSubmit,
  onCancel
}) {
  const [form, setForm] = useState(() => toFormState(horary))
  const isEditing = Boolean(horary)

  // El backend rechaza inicio >= fin; se avisa antes de mandar el pedido.
  const rangoInvalido = Boolean(form.startTime && form.endTime && form.startTime >= form.endTime)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (rangoInvalido) return
    onSubmit({
      idCourt: Number(form.idCourt),
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime
    })
  }

  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? 'Editar horario' : 'Nuevo horario'}</h3>

      <div className="field">
        <label className="field__label" htmlFor="idCourt">Cancha</label>
        <select
          className="input"
          id="idCourt"
          name="idCourt"
          required
          value={form.idCourt}
          onChange={handleChange}
        >
          <option value="">Elegí una cancha</option>
          {courts.map((c) => (
            <option key={c.idCourt} value={c.idCourt}>
              {c.nameCourt} ({c.typeLabel})
            </option>
          ))}
        </select>
        {courts.length === 0 && <p className="hint">No hay canchas cargadas todavía.</p>}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="day">Día</label>
        <select className="input" id="day" name="day" value={form.day} onChange={handleChange}>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="startTime">Hora de inicio</label>
          <input
            className="input"
            type="time"
            id="startTime"
            name="startTime"
            required
            value={form.startTime}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="endTime">Hora de fin</label>
          <input
            className="input"
            type="time"
            id="endTime"
            name="endTime"
            required
            value={form.endTime}
            onChange={handleChange}
          />
        </div>
      </div>

      {rangoInvalido && (
        <div className="alert alert--error" role="alert">
          La hora de inicio tiene que ser anterior a la de fin.
        </div>
      )}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="booking__foot">
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn--primary" type="submit" disabled={submitting || rangoInvalido}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear horario'}
        </button>
      </div>
    </form>
  )
}
