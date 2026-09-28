import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAdminRole } from '../utils/roles'

// Deja pasar a los dos niveles de administración. Qué ve cada uno adentro del panel
// lo decide Admin.jsx según el rol; la seguridad real la hace el backend.
export default function AdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdminRole(user?.typeUser)) return <Navigate to="/" replace />
  return <Outlet />
}
