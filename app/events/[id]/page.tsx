'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import EventForm from '@/components/EventForm'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading'

export default function EventDetailPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadEvent()
  }, [isAuthenticated, isLoading, id, router])

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
      <div className="min-h-screen bg-background flex flex-col">
        <PageLoading text="Loading event..." />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            {error || 'Event not found'}
          </div>
        </main>
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setMode('view')}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl font-semibold">Edit Event</h1>
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

  const eventColor = event.color || '#4285F4'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/calendar')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Calendar
          </button>
        </div>

        <div
          className="rounded-lg p-4 mb-4"
          style={{
            backgroundColor: eventColor + '15',
            borderLeft: `3px solid ${eventColor}`,
          }}
        >
          <h1 className="text-xl font-semibold mb-3">{event.title}</h1>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <span className="text-foreground font-semibold">Date: </span>
              {format(parseISO(event.start_date), 'PPP')}
              {event.start_time && (
                <span> at {format(parseISO(event.start_time), 'p')}</span>
              )}
            </div>

            {event.end_date && (
              <div>
                <span className="text-foreground font-semibold">End: </span>
                {format(parseISO(event.end_date), 'PPP')}
                {event.end_time && (
                  <span> at {format(parseISO(event.end_time), 'p')}</span>
                )}
              </div>
            )}

            {event.location && (
              <div>
                <span className="text-foreground font-semibold">📍 Location: </span>
                {event.location}
              </div>
            )}
          </div>

          {event.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {deleteError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {deleteError}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => setMode('edit')} className="flex-1">
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </main>
    </div>
  )
}
