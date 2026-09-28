import { useState } from 'react'

const emptyForm = {
  nameComplex: '',
  addressComplex: '',
  idLocation: '',
  idAdmin: ''
}

function toFormState(complex) {
  if (!complex) return emptyForm
  return {
    nameComplex: complex.nameComplex,
    addressComplex: complex.addressComplex,
    idLocation: String(complex.idLocation ?? ''),
    idAdmin: complex.idAdmin ? String(complex.idAdmin) : ''
  }
}

// restricted = true cuando lo usa el admin de un complejo: solo puede editar nombre y
// dirección del suyo. La localidad y el administrador los decide el superadmin.
export default function ComplexForm({
  complex = null,
  locations = [],
  admins = [],
  restricted = false,
  submitting = false,
  error = null,
  onSubmit,
  onCancel
}) {
  const [form, setForm] = useState(() => toFormState(complex))
  const isEditing = Boolean(complex)

  // Para asignar solo sirven los admins libres, más el que ya tiene este complejo
  const assignableAdmins = admins.filter(
    (a) => !a.managedComplex || a.managedComplex.idComplex === complex?.idComplex
  )

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      nameComplex: form.nameComplex.trim(),
      addressComplex: form.addressComplex.trim()
    }
    if (!restricted) {
      payload.idLocation = form.idLocation ? Number(form.idLocation) : undefined
      // "" = sin administrador: null le dice al backend que lo desasigne
      payload.idAdmin = form.idAdmin ? Number(form.idAdmin) : null
    }
    onSubmit(payload)
  }

  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <h3>{isEditing ? `Editar ${complex.nameComplex}` : 'Nuevo complejo'}</h3>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="nameComplex">Nombre</label>
          <input
            className="input"
            id="nameComplex"
            name="nameComplex"
            required
            value={form.nameComplex}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="addressComplex">Dirección</label>
          <input
            className="input"
            id="addressComplex"
            name="addressComplex"
            required
            value={form.addressComplex}
            onChange={handleChange}
          />
        </div>
      </div>

      {!restricted && (
        <div className="field__row">
          <div className="field">
            <label className="field__label" htmlFor="idLocation">Localidad</label>
            <select
              className="input"
              id="idLocation"
              name="idLocation"
              required
              value={form.idLocation}
              onChange={handleChange}
            >
              <option value="">Elegí una localidad</option>
              {locations.map((loc) => (
                <option key={loc.idLocation} value={loc.idLocation}>{loc.nomLocation}</option>
              ))}
            </select>
            {locations.length === 0 && (
              <p className="hint">No hay localidades cargadas todavía.</p>
            )}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="idAdmin">Administrador</label>
            <select
              className="input"
              id="idAdmin"
              name="idAdmin"
              value={form.idAdmin}
              onChange={handleChange}
            >
              <option value="">Sin administrador</option>
              {assignableAdmins.map((a) => (
                <option key={a.idUser} value={a.idUser}>{`${a.fullName} (${a.emailUser})`}</option>
              ))}
            </select>
            <p className="hint">Solo aparecen los administradores que no tienen otro complejo.</p>
          </div>
        </div>
      )}

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="booking__foot">
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear complejo'}
        </button>
      </div>
    </form>
  )
}
