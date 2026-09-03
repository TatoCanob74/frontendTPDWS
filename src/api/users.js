import { client } from './client'
import { User } from '../models/User'

// Rutas reales del backend:
//   GET /usuarios/me   perfil del usuario logueado
//   PUT /usuarios/me   editar nombre, apellido, alias y fecha de nacimiento
//
// El email no se puede editar: identifica la cuenta en el login.

export function getMyProfile() {
  return client.get('/usuarios/me').then((r) => User.fromDTO(r.data))
}

export function updateMyProfile(payload) {
  return client.put('/usuarios/me', payload).then((r) => r.data)
}
