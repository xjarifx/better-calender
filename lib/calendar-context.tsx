'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type ViewMode = 'day' | 'week' | 'month'

interface CalendarContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  currentDate: Date
  setCurrentDate: (date: Date) => void
  navigateToday: () => void
  firstDayOfWeek: number
  setFirstDayOfWeek: (day: number) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0)

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.firstDayOfWeek !== undefined) {
          setFirstDayOfWeek(data.firstDayOfWeek)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <CalendarContext.Provider
      value={{ viewMode, setViewMode, currentDate, setCurrentDate, navigateToday, firstDayOfWeek, setFirstDayOfWeek }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider')
  }
  return context
}
