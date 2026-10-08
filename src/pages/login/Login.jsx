import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { resendCode } from '../../api/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ emailUser: '', passwordUser: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  const exitResetPassword = location.state?.passwordReset || false;

  const emailVerified = location.state?.verifiedEmail || false;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setNeedsVerification(false)
    try {
      await login(form.emailUser, form.passwordUser)
      const redirectTo = location.state?.from?.pathname || '/canchas'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'No pudimos iniciar sesión. Revisá tus datos.')
      if(err.response?.data?.code === 'EMAIL_NO_VERIFICADO'){
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyNow = async() => {
      try {
        setLoading(true);
        await resendCode(form.emailUser);
        
        navigate('/verifyemail', { replace: true, state: { emailUser: form.emailUser } })
  
      } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'El reenvío del código falló.')
      } finally {
        setLoading(false)
      }
    };

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
            className="input input--lg"
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
            className="input input--lg"
            type="password"
            id="passwordUser"
            name="passwordUser"
            autoComplete="current-password"
            required
            value={form.passwordUser}
            onChange={handleChange}
          />
           <p className="hint">
           <Link to="/forgotpassword">¿Olvidaste tu contraseña?</Link>
           </p>
        </div>

        {exitResetPassword && !error && <div
          className="alert" role="status">
          Contraseña actualizada. Ya podés iniciar sesión.
        </div>
        }

        {emailVerified && !error && <div
          className="alert" role="status">
          Email verificado. Ya podés iniciar sesión.
        </div>
        }

        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {needsVerification && (
        <button type="button" className="btn" onClick={handleVerifyNow}>
          Verificar ahora
        </button>
        )}

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