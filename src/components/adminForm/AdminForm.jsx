import { useState } from 'react'
import {
  maxBirthDateIso,
  minBirthDateIso,
  toBackendDate,
  validateBirthDate
} from '../../utils/birthDate'

const emptyForm = {
  nameUser: '',
  surnameUser: '',
  aliasUser: '',
  emailUser: '',
  dateUser: '',
  passwordUser: '',
  idComplex: ''
}

// Alta de un administrador de complejo. Los campos son los mismos del registro público
// (el backend aplica las mismas validaciones), más el complejo que se le asigna.
export default function AdminForm({
  complexes = [],
  submitting = false,
  error = null,
  onSubmit,
  onCancel
}) {
  const [form, setForm] = useState(emptyForm)
  const [dateError, setDateError] = useState(null)

  // Solo se ofrecen los complejos que todavía no tienen administrador
  const freeComplexes = complexes.filter((cx) => !cx.hasAdmin)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'dateUser') setDateError(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    const birthDateError = validateBirthDate(form.dateUser)
    if (birthDateError) {
      setDateError(birthDateError)
      return
    }

    const { idComplex, ...userData } = form
    onSubmit({
      ...userData,
      dateUser: toBackendDate(form.dateUser),
      idComplex: idComplex ? Number(idComplex) : undefined
    })
  }

  return (
    <form className="booking" onSubmit={handleSubmit} noValidate>
      <h3>Nuevo administrador de complejo</h3>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="nameUser">Nombre</label>
          <input className="input" id="nameUser" name="nameUser" required value={form.nameUser} onChange={handleChange} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="surnameUser">Apellido</label>
          <input className="input" id="surnameUser" name="surnameUser" required value={form.surnameUser} onChange={handleChange} />
        </div>
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="emailUser">Email</label>
          <input className="input" type="email" id="emailUser" name="emailUser" required value={form.emailUser} onChange={handleChange} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="aliasUser">Alias</label>
          <input className="input" id="aliasUser" name="aliasUser" required value={form.aliasUser} onChange={handleChange} />
        </div>
      </div>

      <div className="field__row">
        <div className="field">
          <label className="field__label" htmlFor="dateUser">Fecha de nacimiento</label>
          <input
            className="input"
            type="date"
            id="dateUser"
            name="dateUser"
            required
            min={minBirthDateIso()}
            max={maxBirthDateIso()}
            value={form.dateUser}
            onChange={handleChange}
          />
          {dateError && <p className="hint" role="alert">{dateError}</p>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="passwordUser">Contraseña inicial</label>
          <input
            className="input"
            type="password"
            id="passwordUser"
            name="passwordUser"
            minLength={8}
            required
            autoComplete="new-password"
            value={form.passwordUser}
            onChange={handleChange}
          />
          <p className="hint">Mínimo 8 caracteres. Pasásela al administrador para que ingrese.</p>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="idComplex">Complejo que administra</label>
        <select className="input" id="idComplex" name="idComplex" value={form.idComplex} onChange={handleChange}>
          <option value="">Asignar más tarde</option>
          {freeComplexes.map((cx) => (
            <option key={cx.idComplex} value={cx.idComplex}>{cx.label}</option>
          ))}
        </select>
        {freeComplexes.length === 0 && (
          <p className="hint">Todos los complejos ya tienen administrador.</p>
        )}
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="booking__foot">
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Crear administrador'}
        </button>
      </div>
    </form>
  )
}
