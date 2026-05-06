'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

export default function LoginPage() {
  const { refreshAuth } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.login(username, password)
      await refreshAuth()
      router.push('/calendar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Username</label>
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="rounded-lg"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="rounded-lg"
              placeholder="Enter password"
            />
          </div>
          <Button type="submit" className="w-full rounded-lg" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-foreground underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
