'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type ViewMode = 'day' | 'week' | 'month'

interface CalendarContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  currentDate: Date
  setCurrentDate: (date: Date) => void
  navigateToday: () => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  return (
    <CalendarContext.Provider
      value={{ viewMode, setViewMode, currentDate, setCurrentDate, navigateToday }}
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
