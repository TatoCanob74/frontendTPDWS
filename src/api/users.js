import { client } from './client'
import { User } from '../models/user'

export function getMyProfile() {
  return client.get('/usuarios/me').then((r) => User.fromDTO(r.data))
}

export function updateMyProfile(payload) {
  return client.put('/usuarios/me', payload).then((r) => r.data)
}
