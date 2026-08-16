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

// Varios endpoints de listado del backend devuelven 404 cuando no hay registros,
// en vez de un 200 con lista vacía. Para el frontend "no hay nada" no es un error:
// es una lista vacía. Este helper normaliza ese caso sin tapar los errores reales.
export function emptyOn404(promise) {
  return promise.catch((error) => {
    if (error.response?.status === 404) return []
    throw error
  })
}
