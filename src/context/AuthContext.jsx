import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContextBase'
import { getToken, setToken as persistToken } from '../api/client'
import { login as loginRequest, register as registerRequest } from '../api/auth'

function decodeUser(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { idUser: payload.idUser, emailUser: payload.emailUser, typeUser: payload.typeUser }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())
  const [user, setUser] = useState(() => decodeUser(getToken()))

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
