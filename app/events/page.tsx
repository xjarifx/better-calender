'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'

interface Event {
  id: number
  title: string
  start_date: string
  start_time: string | null
  end_date: string
  end_time: string | null
  location?: string
  description?: string
  color?: string
}

import { ArrowLeft } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading'

export default function EventsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadEvents()
  }, [isAuthenticated, isLoading, router])

  const loadEvents = async () => {
    try {
      const data = await api.getEvents()
      setEvents(data)
    } catch (err) {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await api.deleteEvent(String(id))
      setEvents(events.filter(e => e.id !== id))
    } catch (err) {
      setDeleteError('Failed to delete event')
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date'
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null
    try {
      return format(parseISO(timeStr), 'h:mm a')
    } catch {
      return null
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/calendar')}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Calendar
            </button>
            <h1 className="text-xl font-semibold">All Events</h1>
          </div>
          <Button
            size="sm"
            onClick={() => router.push('/events/new')}
            className="rounded-lg"
          >
            + New
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {deleteError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {deleteError}
          </div>
        )}

        {loading ? (
          <PageLoading text="Loading events..." />
        ) : events.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No events yet. Create your first event!
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => {
              const eventColor = event.color || '#4285F4'
              return (
                <div
                  key={event.id}
                  className="rounded-lg p-3 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: eventColor + '15',
                    borderLeft: `3px solid ${eventColor}`,
                  }}
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>
                          {formatDate(event.start_date)}
                          {formatTime(event.start_time) && (
                            <span> at {formatTime(event.start_time)}</span>
                          )}
                        </span>
                      </div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(event.id, event.title)
                      }}
                      className="text-destructive hover:text-destructive/80 text-xs ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
