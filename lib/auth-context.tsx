'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  hasApiKey: boolean
  logout: () => void
  isLoading: boolean
  refreshAuth: () => Promise<void>
  setUsernameState: (username: string | null) => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  hasApiKey: false,
  logout: () => {},
  isLoading: true,
  refreshAuth: async () => {},
  setUsernameState: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUsername(data.username)

          try {
            const profileRes = await fetch('/api/user')
            if (profileRes.ok) {
              const profile = await profileRes.json()
              setHasApiKey(profile.hasApiKey || false)
            }
          } catch {
            // Ignore profile fetch errors
          }
        } else {
          setIsAuthenticated(false)
          setUsername(null)
          setHasApiKey(false)
        }
      } else {
        setIsAuthenticated(false)
        setUsername(null)
        setHasApiKey(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUsername(null)
      setHasApiKey(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUsername(data.username)
          return fetch('/api/user').then((r) => r.ok ? r.json() : null)
        }
        return Promise.reject()
      })
      .then((profile) => {
        if (profile) setHasApiKey(profile.hasApiKey || false)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUsername(null)
        setHasApiKey(false)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors on logout
    }
    setIsAuthenticated(false)
    setUsername(null)
    setHasApiKey(false)
    router.push('/login')
  }

  const setUsernameState = (newUsername: string | null) => {
    setUsername(newUsername)
    if (newUsername !== null) {
      document.cookie = `username=${newUsername}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, hasApiKey, logout, isLoading, refreshAuth: checkAuth, setUsernameState }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
