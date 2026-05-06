'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import EventForm from '@/components/EventForm'

export default function NewEventPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-muted-foreground">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">New Event</h1>
        </div>
        <EventForm mode="create" />
      </main>
    </div>
  )
}
