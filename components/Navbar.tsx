'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) return null

  return (
    <nav className="border-b bg-background px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/calendar" className="text-xl font-bold">
          Better Calendar
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{username}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
