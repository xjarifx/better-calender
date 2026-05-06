'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearAuth } from './api'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (token) {
      setIsAuthenticated(true)
      setUsername(localStorage.getItem('username'))
    }
  }, [])

  const logout = () => {
    clearAuth()
    setIsAuthenticated(false)
    setUsername(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
