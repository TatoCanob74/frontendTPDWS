import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const initialForm = {
  nameUser: '',
  surnameUser: '',
  aliasUser: '',
  emailUser: '',
  dateUser: '',
  passwordUser: ''
}

// El backend espera dateUser como string "dd/mm/aaaa"
function toBackendDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ ...form, dateUser: toBackendDate(form.dateUser), typeUser: 'CLIENTE' })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos crear tu cuenta. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Sumate a CanchaYa</span>
        <h2>Creá tu cuenta</h2>
        <p>Registrate para reservar canchas en segundos.</p>
      </div>

      <form className="booking" onSubmit={handleSubmit} noValidate>
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
            <label className="field__label" htmlFor="aliasUser">Alias</label>
            <input className="input" id="aliasUser" name="aliasUser" required value={form.aliasUser} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="dateUser">Fecha de nacimiento</label>
            <input className="input" type="date" id="dateUser" name="dateUser" required value={form.dateUser} onChange={handleChange} />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="emailUser">Email</label>
          <input className="input" type="email" id="emailUser" name="emailUser" autoComplete="email" required value={form.emailUser} onChange={handleChange} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="passwordUser">Contraseña</label>
          <input
            className="input"
            type="password"
            id="passwordUser"
            name="passwordUser"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.passwordUser}
            onChange={handleChange}
          />
          <p className="hint">Mínimo 8 caracteres.</p>
        </div>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <div className="booking__foot">
          <span className="summary__label">¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></span>
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </section>
  )
}
