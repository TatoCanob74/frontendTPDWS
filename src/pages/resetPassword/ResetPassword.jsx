import CodeInput from '../../components/codeInput/codeInput.jsx';
import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const emailUser = location.state?.email;

  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!emailUser){
    return <Navigate to="/forgotpassword" replace/>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!(code.length === 6 && password.length >=8 && password === confirmPassword)){
      setError("Código inválido o contraseña inválida.");
      return 
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(emailUser, code, password);

      navigate('/login', { replace:true, state: {passwordReset : true }});
    } catch (error){
      setError(error.response?.data?.error || "No se puedo restablecer la contraseña.");
      setLoading(false);
    }
  };

  return(
    <section className="section shell">
      <div className="section-head">
        <h2>Reestablecer Contraseña</h2>
        <p>Ingresa la nueva contraseña</p>

        <form className="booking" onSubmit={handleSubmit} noValidate>

          {error && <div className="alert alert--error">{error}</div>}
          
          <div className="field">
            <label>Código de verificación</label>
            <CodeInput
              value={code}
              onChange={(val) => { setCode(val); setError(null); }}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Nueva contraseña</label>
            <input
              type="password"
              className="input input--lg"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              className="input input--lg"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>

        </form>
      </div>
    </section>
  );
}