import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

function decodeToken(token) {
  if (!token) {
    return null
  }

  try {
    const payloadPart = token.split('.')[1]
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => decodeToken(localStorage.getItem('token')))

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const payload = decodeToken(token)
    if (!payload) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      return
    }

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      return
    }

    setUser(payload)
  }, [token])

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ token, user, login, logout }), [token, user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
