"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { events as Event } from "@prisma/client";
import { api } from "@/lib/api";

export type RightPanelMode = "day-view" | "event-details" | "extracted-events" | "empty";

interface CalendarContextType {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  rightPanelMode: RightPanelMode;
  setRightPanelMode: (mode: RightPanelMode) => void;
  navigateToday: () => void;
  firstDayOfWeek: number;
  setFirstDayOfWeek: (day: number) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rightPanelMode, setRightPanelMode] =
    useState<RightPanelMode>("empty");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);

  useEffect(() => {
    api
      .getUserProfile()
      .then((data) => {
        if (data.firstDayOfWeek !== undefined)
          setFirstDayOfWeek(data.firstDayOfWeek);
      })
      .catch(() => {});
  }, []);

  const navigateToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedEvent,
        setSelectedEvent,
        rightPanelMode,
        setRightPanelMode,
        navigateToday,
        firstDayOfWeek,
        setFirstDayOfWeek,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
}
