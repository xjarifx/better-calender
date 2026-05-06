'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import EventForm from '@/components/EventForm'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export default function EventDetailPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadEvent()
  }, [isAuthenticated, id, router])

  const loadEvent = async () => {
    try {
      const data = await api.getEvent(id)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await api.deleteEvent(id)
      router.push('/calendar')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4">
          <Alert variant="destructive">{error || 'Event not found'}</Alert>
        </div>
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setMode('view')} className="text-muted-foreground">
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Edit Event</h1>
          </div>
          <EventForm
            mode="edit"
            eventId={id}
            initialData={{
              title: event.title,
              startDate: event.start_date?.split('T')[0] || '',
              startTime: event.start_time?.slice(0, 16) || '',
              endDate: event.end_date?.split('T')[0] || '',
              endTime: event.end_time?.slice(0, 16) || '',
              location: event.location || '',
              description: event.description || '',
            }}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-muted-foreground">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{event.title}</h1>
        </div>

        <div className="max-w-lg space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Date: </span>
            {new Date(event.start_date).toLocaleDateString()}
            {event.start_time && (
              <span> at {new Date(event.start_time).toLocaleTimeString()}</span>
            )}
          </div>

          {event.end_date && (
            <div>
              <span className="text-sm text-muted-foreground">End: </span>
              {new Date(event.end_date).toLocaleDateString()}
              {event.end_time && (
                <span> at {new Date(event.end_time).toLocaleTimeString()}</span>
              )}
            </div>
          )}

          {event.location && (
            <div>
              <span className="text-sm text-muted-foreground">Location: </span>
              {event.location}
            </div>
          )}

          {event.description && (
            <div>
              <span className="text-sm text-muted-foreground">Description: </span>
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {deleteError && (
            <Alert variant="destructive">{deleteError}</Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setMode('edit')}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
