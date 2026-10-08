import { client } from './client'

export function login({ emailUser, passwordUser }) {
  return client.post('/auth/login', { emailUser, passwordUser }).then((r) => r.data)
}

export function register(data) {
  return client.post('/auth/register', data).then((r) => r.data)
}

export function verifyEmail(data) {
  return client.post('/auth/verifyemail', data).then((r) => r.data)
}

export function resendCode(data) {
  return client.post('/auth/resend', data).then((r) => r.data)
}

export function forgotPassword(data) {
  return client.post('/auth/forgotpassword', data).then((r) => r.data)
}

export function resetPassword(data) {
  return client.post('/auth/resetpassword', data).then((r) => r.data)
}