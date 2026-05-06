'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  allDay: boolean
  location?: string
  description?: string
}

// Google Calendar-style event styling
const eventStyleGetter = (event: CalendarEvent) => {
  return {
    style: {
      backgroundColor: '#4285f4',
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      padding: '2px 4px',
      fontSize: '12px',
    },
  }
}

export default function CalendarPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadEvents()
  }, [isAuthenticated, router])

  const loadEvents = async () => {
    try {
      const data = await api.getEvents()
      console.log('Raw API events:', data)
      const calendarEvents: CalendarEvent[] = data.map((event: any) => {
        const start = new Date(event.start_time || event.start_date)
        const end = new Date(event.end_time || event.end_date || event.start_date)
        console.log('Mapped event:', { id: event.id, title: event.title, start, end })
        return {
          id: event.id,
          title: event.title,
          start,
          end,
          allDay: !event.start_time,
          location: event.location,
          description: event.description,
        }
      })
      setEvents(calendarEvents)
    } catch (err) {
      setError('Failed to load events')
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      router.push(`/events/${event.id}`)
    },
    [router]
  )

  const handleSelectSlot = useCallback(
    () => {
      router.push('/events/new')
    },
    [router]
  )

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/events')}>
              List View
            </Button>
            <Button onClick={() => router.push('/events/new')}>
              New Event
            </Button>
          </div>
        </div>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : (
          <div className="h-[calc(100vh-120px)]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              allDayAccessor="allDay"
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              style={{ height: '100%' }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
