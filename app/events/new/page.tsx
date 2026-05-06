'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import EventForm from '@/components/EventForm'

export default function NewEventPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) return null
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/calendar')}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Calendar
          </button>
          <h1 className="text-xl font-semibold">New Event</h1>
        </div>
        <EventForm mode="create" />
      </main>
    </div>
  )
}
