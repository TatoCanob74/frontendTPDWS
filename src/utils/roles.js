// Los tres niveles de acceso que define el backend (ver DOCUMENTACION_BACKEND §5.3)
export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  CLIENTE: 'CLIENTE'
}

export const ROLE_LABELS = {
  SUPERADMIN: 'Superadministrador',
  ADMIN: 'Administrador de complejo',
  CLIENTE: 'Cliente'
}

// Cualquiera de los dos niveles de administración (entra al panel)
export const isAdminRole = (typeUser) =>
  typeUser === ROLES.ADMIN || typeUser === ROLES.SUPERADMIN

export const isSuperAdminRole = (typeUser) => typeUser === ROLES.SUPERADMIN
