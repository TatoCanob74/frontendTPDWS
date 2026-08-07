import { client } from './client'

export function login({ emailUser, passwordUser }) {
  return client.post('/auth/login', { emailUser, passwordUser }).then((r) => r.data)
}

export function register(data) {
  return client.post('/auth/register', data).then((r) => r.data)
}
