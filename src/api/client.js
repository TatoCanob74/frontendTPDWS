import axios from 'axios'

const TOKEN_KEY = 'canchaya_token'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setToken(null)
    }
    return Promise.reject(error)
  }
)

// Los listados del backend devuelven 200 con lista vacía cuando no hay
// registros, que es lo correcto: "no hay nada" no es un error.
//
// Este helper se mantiene como red de seguridad por si algún endpoint vuelve a
// responder 404 en ese caso: traduce ese 404 a lista vacía sin tapar los
// errores reales (401, 403, 500 siguen propagándose).
export function emptyOn404(promise) {
  return promise.catch((error) => {
    if (error.response?.status === 404) return []
    throw error
  })
}
