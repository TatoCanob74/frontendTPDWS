import CodeInput from '../../components/codeInput/codeInput.jsx';
import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { resetPassword, forgotPassword } from '../../api/auth';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailUser = location.state?.email;

  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!emailUser){
    return <Navigate to="/forgotpassword" replace/>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Un mensaje por problema: con uno genérico el usuario no sabe qué corregir
    if (code.length !== 6) {
      setError("El código tiene que tener 6 dígitos.");
      return
    }
    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword({ emailUser, code, newPassword: password });

      navigate('/login', { replace:true, state: {passwordReset : true }});
    } catch (error){
      setError(error.response?.data?.error || "No se pudo restablecer la contraseña.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // El backend espera el campo emailUser (con "email" responde 400)
      await forgotPassword({ emailUser });
      setMessage("Te enviamos un nuevo código a tu email.");
    } catch (error) {
      setError(error.response?.data?.error || "Error al reenviar el código.");
    } finally {
      setLoading(false);
    }
  };

  return(
    <section className="section shell">
      <div className="section-head">
        <span className="eyebrow">Recuperar contraseña</span>
        <h2>Restablecer contraseña</h2>
        <p>Ingresá el código que te mandamos a {emailUser} e ingresa una contraseña nueva.</p>
      </div>

      <form className="booking" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="resetCode">Código de verificación</label>
          <CodeInput
            id="resetCode"
            value={code}
            onChange={(val) => { setCode(val); setError(null); }}
            error={Boolean(error)}
            disabled={loading}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="newPassword">Nueva contraseña</label>
          <input
            type="password"
            id="newPassword"
            autoComplete="new-password"
            className="input input--lg"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            disabled={loading}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            className="input input--lg"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
            disabled={loading}
          />
        </div>

        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {message && !error && <div className="alert" role="status">{message}</div>}

        <div className="booking__foot">
          <span className="summary__label">
            <button
              className="btn btn--outline"
              type="button"
              onClick={handleResendCode}
              disabled={loading}
            >
              Pedir otro código
            </button>
          </span>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
          >
            {loading ? 'Restableciendo…' : 'Restablecer contraseña'}
          </button>
        </div>
      </form>
    </section>
  );
}