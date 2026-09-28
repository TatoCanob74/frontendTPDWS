import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isAdminRole, isSuperAdminRole } from '../../utils/roles'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = isAdminRole(user?.typeUser)
  const isSuperAdmin = isSuperAdminRole(user?.typeUser)

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
          {!isAdmin && (
            <Link className="nav__link" to="/canchas">Reservar</Link>
          )}
          {isAuthenticated && !isAdmin && (
            <Link className="nav__link" to="/reservas">Mis reservas</Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link className="nav__link" to="/admin">
              {isSuperAdmin ? 'Panel de Superadmin' : 'Mi complejo'}
            </Link>
          )}
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <span className="nav__user" title="Tu nivel de acceso">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
                  <span>{isSuperAdmin ? 'Superadmin' : 'Admin'}</span>
                </span>
              )}
              {!isAdmin && (
              <Link className="nav__user" to="/perfil" title="Ver y editar mi perfil">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user preview-icon">
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
