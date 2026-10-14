import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if(!EMAIL_REGEX.test(email)){
      setError('Ingresá un formato de mail válido.');
      return;
    }

    setLoading(true)
    setError(null)

    try{
      await forgotPassword({emailUser: email});
      navigate('/resetpassword', {state: { email }})
    } catch (error){
      setError(error.response?.data?.error || "No pudimos enviar el código. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Recuperar contraseña</span>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresá tu email y te mandamos un código para elegir una nueva.</p>
      </div>

      <form className="booking" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="forgotEmail">Email</label>
          <input
            className="input input--lg"
            type="email"
            id="forgotEmail"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
          />
        </div>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <div className="booking__foot">
          <span className="summary__label"><Link to="/login">Volver al login</Link></span>
          <button
            className="btn btn--primary"
            type='submit'
            disabled = {loading}
          >
            {loading ? 'Enviando…' : 'Enviar código'}
          </button>
        </div>
      </form>
    </section>
  );
}
