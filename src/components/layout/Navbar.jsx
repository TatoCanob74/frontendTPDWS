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
          {user?.typeUser != 'ADMIN' && (
            <Link className="nav__link" to="/canchas">Reservar</Link>
          )}
          {isAuthenticated && user?.typeUser != 'ADMIN' && (
            <Link className="nav__link" to="/reservas">Mis reservas</Link>
          )}
          {isAuthenticated && user?.typeUser === 'ADMIN' && (
            <Link className="nav__link" to="/admin">Panel de Admin</Link>
          )}
          {isAuthenticated ? (
            <>
              {isAuthenticated && user?.typeUser != 'ADMIN' && (
              <Link className="nav__user" to="/perfil" title="Ver y editar mi perfil">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user preview-icon">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span >Mi perfil</span>
              </Link>
              )}
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
