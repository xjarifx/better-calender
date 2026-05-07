'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  addHours,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

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
  const { viewMode, setViewMode, currentDate, setCurrentDate, navigateToday, firstDayOfWeek } = useCalendar()
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
    const weekStart = startOfWeek(currentDate, { weekStartsOn: firstDayOfWeek as any })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: firstDayOfWeek as any })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek as any })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek as any })
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
                    firstDayOfWeek={firstDayOfWeek}
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

        {/* Mobile FAB for adding events */}
        <button
          onClick={() => router.push('/events/new')}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-30"
          aria-label="Add Event"
        >
          <Plus className="h-6 w-6" />
        </button>
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const allDayEvents = events.filter(e => !e.start_time)
  const timedEvents = events.filter(e => e.start_time)
  const rowHeight = 60

  useEffect(() => {
    if (scrollRef.current) {
      const scrollToHour = 8
      scrollRef.current.scrollTop = scrollToHour * rowHeight
    }
  }, [date])

  const getEventStyle = (event: CalendarEvent) => {
    if (!event.start_time) return {}
    const start = new Date(event.start_time)
    const hours = start.getHours()
    const minutes = start.getMinutes()
    const top = hours * rowHeight + (minutes / 60) * rowHeight
    const height = event.end_time
      ? (() => {
          const end = new Date(event.end_time)
          const durationMs = end.getTime() - start.getTime()
          return Math.max((durationMs / (1000 * 60 * 60)) * rowHeight, 20)
        })()
      : rowHeight
    return { top, height, position: 'absolute' as const }
  }

  const currentTimePosition = isToday(date)
    ? (() => {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        return hours * rowHeight + (minutes / 60) * rowHeight
      })()
    : null

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {allDayEvents.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg p-2 bg-muted/30">
          <div className="text-xs font-medium text-muted-foreground mb-1">All Day</div>
          <div className="flex flex-wrap gap-1">
            {allDayEvents.map(event => (
              <div
                key={event.id}
                onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80"
                style={{ backgroundColor: (event.color || '#4285F4') + '30', borderLeft: `3px solid ${event.color || '#4285F4'}` }}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-b-lg relative">
        <div className="flex" style={{ height: `${24 * rowHeight}px` }}>
          <div className="w-16 flex-shrink-0">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-[60px] text-xs text-muted-foreground text-right pr-2 pt-1 border-b border-gray-100 dark:border-gray-800">
                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-[60px] border-b border-gray-100 dark:border-gray-800" />
            ))}

            {timedEvents.map(event => {
              const style = getEventStyle(event)
              return (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                  className="absolute left-1 right-1 rounded px-2 py-1 cursor-pointer hover:opacity-80 overflow-hidden"
                  style={{
                    ...style,
                    backgroundColor: (event.color || '#4285F4') + '30',
                    borderLeft: `3px solid ${event.color || '#4285F4'}`,
                  }}
                >
                  <div className="text-xs font-medium truncate">{event.title}</div>
                  {event.start_time && (
                    <div className="text-[10px] text-muted-foreground">
                      {format(new Date(event.start_time), 'h:mm a')}
                    </div>
                  )}
                </div>
              )
            })}

            {currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: currentTimePosition }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                  <div className="flex-1 h-[2px] bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const rowHeight = 60
  const allDayEvents = events.filter(e => !e.start_time)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollToHour = 8
      scrollRef.current.scrollTop = scrollToHour * rowHeight
    }
  }, [days])

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time || event.start_date)
      return isSameDay(eventStart, day) && event.start_time
    })
  }

  const getEventStyle = (event: CalendarEvent) => {
    if (!event.start_time) return {}
    const start = new Date(event.start_time)
    const hours = start.getHours()
    const minutes = start.getMinutes()
    const top = hours * rowHeight + (minutes / 60) * rowHeight
    const height = event.end_time
      ? (() => {
          const end = new Date(event.end_time)
          const startT = new Date(event.start_time)
          const durationMs = end.getTime() - startT.getTime()
          return Math.max((durationMs / (1000 * 60 * 60)) * rowHeight, 20)
        })()
      : rowHeight
    return { top, height, position: 'absolute' as const }
  }

  const currentTimePosition = (() => {
    const now = new Date()
    const currentDayIndex = days.findIndex(day => isToday(day))
    if (currentDayIndex === -1) return null
    const hours = now.getHours()
    const minutes = now.getMinutes()
    return { dayIndex: currentDayIndex, top: hours * rowHeight + (minutes / 60) * rowHeight }
  })()

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day header with names and numbers */}
      <div className="flex mb-1">
        <div className="w-16 flex-shrink-0" />
        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map(day => (
            <div
              key={day.toISOString()}
              className={`text-center p-1 rounded ${
                isToday(day) ? 'bg-primary/20' : ''
              }`}
            >
              <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
              <div className={`text-sm font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

       {allDayEvents.length > 0 && (
        <div className="border border-gray-300 dark:border-gray-600 border-b-0 rounded-t-lg pt-1 pb-2 bg-muted/30">
          <div className="flex px-2">
            <div className="w-16 flex-shrink-0 text-xs font-medium text-muted-foreground text-right pt-1 pr-2">All Day</div>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayAllDayEvents = allDayEvents.filter(e => isSameDay(new Date(e.start_date), day))
                return (
                  <div key={day.toISOString()} className={`min-h-[30px] ${idx < 6 ? 'border-r border-gray-100 dark:border-gray-800' : ''}`}>
                    {dayAllDayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                        className="px-1 py-[2px] rounded text-[10px] cursor-pointer hover:opacity-80 truncate"
                        style={{ backgroundColor: (event.color || '#4285F4') + '30', borderLeft: `2px solid ${event.color || '#4285F4'}` }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border border-gray-300 dark:border-gray-600 border-t-0 rounded-b-lg">
        <div className="flex px-2">
          <div className="w-16 flex-shrink-0">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-[60px] text-xs text-muted-foreground text-right pr-2 pt-1 border-b border-gray-100 dark:border-gray-800">
                {i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`}
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 gap-1">
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)
              return (
                <div key={day.toISOString()} className="relative border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="h-[60px] border-b border-gray-100 dark:border-gray-800" />
                  ))}
                  {dayEvents.map(event => {
                    const style = getEventStyle(event)
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                        className="absolute left-[2px] right-[2px] rounded px-1 py-[2px] cursor-pointer hover:opacity-80 overflow-hidden z-10"
                        style={{
                          ...style,
                          backgroundColor: (event.color || '#4285F4') + '30',
                          borderLeft: `2px solid ${event.color || '#4285F4'}`,
                        }}
                      >
                        <div className="text-[10px] font-medium truncate">{event.title}</div>
                      </div>
                    )
                  })}
                  {currentTimePosition !== null && currentTimePosition.dayIndex === dayIndex && (
                    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: currentTimePosition.top }}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                        <div className="flex-1 h-[2px] bg-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
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
  firstDayOfWeek,
}: {
  days: Date[]
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (date: Date) => void
  firstDayOfWeek: number
}) {
  const dayNames = []
  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek as any }), i)
    dayNames.push(format(day, 'EEE'))
  }

  return (
    <div className="flex-1">
      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
         {dayNames.map((name, index) => {
           const todayIndex = (getDay(new Date()) - firstDayOfWeek + 7) % 7
           return (
            <div key={name} className={`text-center text-xs font-medium py-1 ${
              index === todayIndex ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {name}
            </div>
           )
         })}
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
  onClick?: () => void
  compact?: boolean
  ultraCompact?: boolean
}) {
  const eventColor = event.color || '#4285F4'

  return (
    <div
      onClick={onClick ? (e) => {
        e.stopPropagation()
        onClick()
      } : undefined}
      className={`rounded hover:opacity-90 transition-opacity border-l-[3px] ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${
        ultraCompact ? 'p-0.5' : compact ? 'p-1' : 'p-3'
      }`}
      style={{
        backgroundColor: eventColor + '30',
        borderLeftColor: eventColor,
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
