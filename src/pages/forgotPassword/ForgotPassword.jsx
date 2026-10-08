import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try{
    if(!EMAIL_REGEX.test(email)){
      setError('Ingresá un formato de mail válido.');
      return setLoading(false);
    }

    setLoading(true)
    setError(null)

    await forgotPassword({emailUser: email});
    navigate('/resetpassword', {state: { email }})

    } catch (error){
      setError(error.response?.data?.error || "Email ingresado incorrectamente.");
      setLoading(false);
    }
  }

  return (
    <section className="section shell">
        <form className="booking" onSubmit={handleSubmit} noValidate>
          <div>Ingresar email para recuperación</div>

          {error && <div className="alert alert--error">{error}</div>}
          <div className="field">
            <input
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            />
          </div>

          <button
            className="btn btn--primary"
            type='submit'
            disabled = {loading}
          >
            {loading ? 'Verificando...':'Verificar'}
          </button>
      </form>
    </section>
  );
}