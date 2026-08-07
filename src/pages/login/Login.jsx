import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ emailUser: '', passwordUser: '' })
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
      await login(form.emailUser, form.passwordUser)
      const redirectTo = location.state?.from?.pathname || '/canchas'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos iniciar sesión. Revisá tus datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Bienvenido de nuevo</span>
        <h2>Iniciá sesión</h2>
        <p>Ingresá para reservar tu cancha y ver tus reservas.</p>
      </div>

      <form className="booking" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="emailUser">Email</label>
          <input
            className="input"
            type="email"
            id="emailUser"
            name="emailUser"
            autoComplete="email"
            required
            value={form.emailUser}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="passwordUser">Contraseña</label>
          <input
            className="input"
            type="password"
            id="passwordUser"
            name="passwordUser"
            autoComplete="current-password"
            required
            value={form.passwordUser}
            onChange={handleChange}
          />
        </div>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <div className="booking__foot">
          <span className="summary__label">¿No tenés cuenta? <Link to="/register">Registrate</Link></span>
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </div>
      </form>
    </section>
  )
}
