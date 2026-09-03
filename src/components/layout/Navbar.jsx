import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="nav">
      <nav className="shell nav__inner" aria-label="Principal">
        <Link className="brand" to="/">
          <span className="brand__mark" aria-hidden="true">C</span>
          <span className="brand__name">CanchaYa</span>
        </Link>
        <div className="nav__links">
          <Link className="nav__link" to="/canchas">Reservar</Link>
          {isAuthenticated && (
            <Link className="nav__link" to="/reservas">Mis reservas</Link>
          )}
          {isAuthenticated && user?.typeUser === 'ADMIN' && (
            <Link className="nav__link" to="/admin">Admin</Link>
          )}
          {isAuthenticated ? (
            <>
              <Link className="nav__user" to="/perfil" title="Ver y editar mi perfil">
                {user?.emailUser}
              </Link>
              <button className="nav__cta" type="button" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link className="nav__link" to="/register">Crear cuenta</Link>
              <Link className="nav__cta" to="/login">Ingresar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
