import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/auth/me')
      const user = res?.data?.user || null
      setMe(user)
      
      // Set language from user preferences
      if (user?.language) {
        localStorage.setItem('language', user.language)
        document.documentElement.lang = user.language
        if (user.language === 'ar') {
          document.documentElement.dir = 'rtl'
        } else {
          document.documentElement.dir = 'ltr'
        }
      }
      
      return user
    } catch {
      setMe(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setMe(null)
  }, [])

  const value = useMemo(() => ({ me, loading, refreshMe, logout }), [me, loading, refreshMe, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
