import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContextBase'
import { getToken, setToken as persistToken } from '../api/client'
import { login as loginRequest, register as registerRequest } from '../api/auth'

function decodePayload(token) {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function decodeUser(token) {
  const payload = decodePayload(token)
  if (!payload) return null
  // El token trae `exp` en segundos: si ya venció, lo tratamos como si no
  // hubiera sesión (si no, el Navbar seguía mostrando "Admin" con un token viejo).
  if (payload.exp && Date.now() >= payload.exp * 1000) return null
  return { idUser: payload.idUser, emailUser: payload.emailUser, typeUser: payload.typeUser }
}

// Devuelve el token guardado solo si sigue siendo válido; si venció, lo borra.
function getValidToken() {
  const token = getToken()
  if (token && !decodeUser(token)) {
    persistToken(null)
    return null
  }
  return token
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getValidToken)
  const [user, setUser] = useState(() => decodeUser(token))

  const applyToken = useCallback((newToken) => {
    persistToken(newToken)
    setTokenState(newToken)
    setUser(decodeUser(newToken))
  }, [])

  const login = useCallback(
    async (emailUser, passwordUser) => {
      const data = await loginRequest({ emailUser, passwordUser })
      applyToken(data.token)
      return data
    },
    [applyToken]
  )

  const register = useCallback(async (formData) => registerRequest(formData), [])

  const logout = useCallback(() => applyToken(null), [applyToken])

  const value = useMemo(
    () => ({ token, user, login, register, logout, isAuthenticated: Boolean(token) }),
    [token, user, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
