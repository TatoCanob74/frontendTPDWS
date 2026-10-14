import axios from 'axios'

const TOKEN_KEY = 'canchaya_token'

// Lo escucha AuthContext: borrar el token del localStorage no alcanza, el estado de React también tiene que enterarse
export const SESSION_EXPIRED_EVENT = 'canchaya:session-expired'

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
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  }
)

// Algunos listados devuelven 404 cuando no hay registros
export function emptyOn404(promise) {
  return promise.catch((error) => {
    if (error.response?.status === 404) return []
    throw error
  })
}
