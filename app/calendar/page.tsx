'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useCalendar, ViewMode } from '@/lib/calendar-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PageLoading } from '@/components/ui/loading'
import { useSwipe } from '@/hooks/use-swipe'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDay,
  isSameMonth,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
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

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { viewMode, setViewMode, currentDate, setCurrentDate, navigateToday } = useCalendar()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
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
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipeLeft = useCallback(() => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }, [currentDate, viewMode])

  const handleSwipeRight = useCallback(() => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }, [currentDate, viewMode])

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  })

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time || event.start_date)
      return isSameDay(eventStart, date)
    })
  }

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    try {
      await api.deleteEvent(String(selectedEvent.id))
      setEvents(events.filter(e => e.id !== selectedEvent.id))
      setIsSheetOpen(false)
      setSelectedEvent(null)
    } catch (err) {
      setDeleteError('Failed to delete event')
    }
  }

  const switchToDayView = (date: Date) => {
    setCurrentDate(date)
    setViewMode('day')
  }

  if (!isAuthenticated) return null

  const weekDays = getWeekDays()
  const monthDays = getMonthDays()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col px-4 py-3 max-w-7xl mx-auto w-full">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleSwipeRight}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-semibold">
            {viewMode === 'day'
              ? format(currentDate, 'MMM d, yyyy')
              : viewMode === 'week'
              ? `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
          </h2>

          <button
            onClick={handleSwipeLeft}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <PageLoading />
        ) : (
          <>
            {/* Day View */}
            {viewMode === 'day' && (
              <div className="flex-1" {...swipeHandlers}>
                <DayView
                  date={currentDate}
                  events={getEventsForDate(currentDate)}
                  onEventClick={handleEventClick}
                />
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="flex-1" {...swipeHandlers}>
                <WeekView
                  days={weekDays}
                  events={events}
                  onEventClick={handleEventClick}
                />
              </div>
            )}

            {/* Month View */}
            {viewMode === 'month' && (
              <div className="flex-1" {...swipeHandlers}>
                <MonthView
                  days={monthDays}
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onDayClick={switchToDayView}
                />
              </div>
            )}
          </>
        )}

        {deleteError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {deleteError}
          </div>
        )}
      </main>

      {/* Event Detail Bottom Sheet */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        snapPoints={['50%', '90%']}
      >
        {selectedEvent && (
          <div>
            <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                {format(new Date(selectedEvent.start_time || selectedEvent.start_date), 'PPP')}
                {selectedEvent.start_time && (
                  <span> at {format(new Date(selectedEvent.start_time), 'p')}</span>
                )}
              </p>
              {selectedEvent.location && (
                <p>📍 {selectedEvent.location}</p>
              )}
              {selectedEvent.description && (
                <p className="text-foreground">{selectedEvent.description}</p>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsSheetOpen(false)
                  router.push(`/events/${selectedEvent.id}`)
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteEvent}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

function DayView({
  date,
  events,
  onEventClick,
}: {
  date: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
      <div className="text-center mb-3">
        <span className={isToday(date) ? 'text-primary font-semibold' : ''}>
          {format(date, 'EEEE, MMMM d')}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No events scheduled
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WeekView({
  days,
  events,
  onEventClick,
}: {
  days: Date[]
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}) {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div
            key={day.toISOString()}
            className={`text-center p-2 rounded-lg ${
              isToday(day) ? 'bg-primary/20 text-primary' : ''
            }`}
          >
            <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
            <div className={`text-sm font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map(day => {
          const dayEvents = events.filter(event => {
            const eventStart = new Date(event.start_time || event.start_date)
            return isSameDay(eventStart, day)
          })

          return (
            <div key={day.toISOString()} className="space-y-0.5 min-h-[200px] border border-gray-300 dark:border-gray-600 rounded-lg p-1 overflow-hidden">
              {dayEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                  compact
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({
  days,
  currentDate,
  events,
  onEventClick,
  onDayClick,
}: {
  days: Date[]
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (date: Date) => void
}) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex-1">
      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
         {dayNames.map((name, index) => (
           <div key={name} className={`text-center text-xs font-medium py-1 ${
             index === getDay(new Date()) ? 'text-primary' : 'text-muted-foreground'
           }`}>
             {name}
           </div>
         ))}
       </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map(day => {
          const dayEvents = events.filter(event => {
            const eventStart = new Date(event.start_time || event.start_date)
            return isSameDay(eventStart, day)
          })
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-[80px] p-1 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border border-gray-300 dark:border-gray-600 ${
                isCurrentDay ? 'bg-primary/20' : ''
              } ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <div className={`text-xs font-medium mb-1 text-center ${
                 isCurrentDay ? 'text-primary' : 'text-foreground'
               }`}>
                 {format(day, 'd')}
               </div>
              <div className="space-y-0.5 overflow-hidden">
                 {dayEvents.slice(0, 3).map(event => (
                   <EventCard
                     key={event.id}
                     event={event}
                     onClick={() => onEventClick(event)}
                     ultraCompact
                   />
                 ))}
                 {dayEvents.length > 3 && (
                   <div className="text-[10px] text-muted-foreground pl-0.5">
                     +{dayEvents.length - 3} more
                   </div>
                 )}
               </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EventCard({
  event,
  onClick,
  compact = false,
  ultraCompact = false,
}: {
  event: CalendarEvent
  onClick: () => void
  compact?: boolean
  ultraCompact?: boolean
}) {
  const eventColor = event.color || '#4285F4'

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`rounded cursor-pointer hover:opacity-90 transition-opacity ${
        ultraCompact ? 'p-0.5' : compact ? 'p-1' : 'p-3'
      } ${!ultraCompact ? 'border-l-[3px]' : ''}`}
      style={{
        backgroundColor: eventColor + '30',
        ...(ultraCompact ? {} : { borderLeftColor: eventColor }),
      }}
      title={event.title}
    >
      <div className={`font-medium truncate ${
        ultraCompact ? 'text-[10px]' : compact ? 'text-xs' : 'text-sm'
      }`}>
        {event.title}
      </div>
      {!compact && !ultraCompact && event.start_time && (
        <div className="text-xs text-muted-foreground mt-1">
          {format(new Date(event.start_time), 'p')}
        </div>
      )}
    </div>
  )
}
