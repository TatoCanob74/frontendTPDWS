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
