// src/pages/verifyEmail/VerifyEmail.jsx
import CodeInput from '../../components/codeInput/codeInput.jsx'
import { useEffect, useState } from 'react'
import { useLocation, Navigate, useNavigate } from 'react-router-dom'
import { resendCode } from '../../api/auth'
import { verifyEmail } from '../../api/auth'

const COOLDOWN_SECONDS = 60

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const emailUser = location.state?.emailUser

  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [seconds, setSeconds] = useState(COOLDOWN_SECONDS)

  // Cuenta regresiva. Va ANTES del return temprano de abajo (regla de los hooks).
  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  if (!emailUser) {
    return <Navigate to="/login" replace />
  }

  function handleCodeChange(value) {
    setCode(value)
    setError(null)
  }

  async function handleVerify(codeVer) {
    const finCode = codeVer || code
    if (loading || finCode.length !== 6) return

    setLoading(true)
    setError(null)
    try {
      await verifyEmail({emailUser, code: finCode})
      navigate('/login', { replace: true, state: {verifiedEmail: true} })
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'No pudimos verificar el código.')
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resending || seconds > 0) return

    setResending(true)
    setError(null)
    setNotice(null)
    try {
      await resendCode(emailUser)
      setNotice('Te enviamos un código nuevo.')
      setSeconds(COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'No se pudo reenviar el código.')
    } finally {
      setResending(false)
    }
  }

  return (
    <section className="section shell">
      <div className="booking">
        <h2>Verificar cuenta</h2>
        <p>Ingresá el código de 6 dígitos que te enviamos por correo.</p>

        {notice && !error && <div className="alert" role="status">{notice}</div>}
        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <div className="field">
          <CodeInput
            value={code}
            onChange={handleCodeChange}
            onComplete={handleVerify}
            error={Boolean(error)}
            disabled={loading}
          />
        </div>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() => handleVerify(code)}
          disabled={loading || code.length < 6}
        >
          {loading ? 'Verificando…' : 'Verificar'}
        </button>

        <button
          type="button"
          className="btn"
          onClick={handleResend}
          disabled={resending || seconds > 0 || loading}
        >
          {seconds > 0 ? `Reenviar en ${seconds}s` : 'Reenviar código'}
        </button>
      </div>
    </section>
  )
}