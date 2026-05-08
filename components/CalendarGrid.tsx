"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCalendar } from "@/lib/calendar-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SearchModal from "@/components/SearchModal";
import { useSwipe } from "@/hooks/use-swipe";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

type RawEvent = {
  id: number;
  title: string;
  startDate?: string | Date | null;
  startTime?: string | Date | null;
  endDate?: string | Date | null;
  endTime?: string | Date | null;
  location?: string | null;
  description?: string | null;
  start_date?: string | Date | null;
  start_time?: string | Date | null;
  end_date?: string | Date | null;
  end_time?: string | Date | null;
};

type CalendarEvent = {
  id: number;
  title: string;
  startDate: Date;
  startTime: Date | null;
  endDate: Date | null;
  endTime: Date | null;
  location: string | null;
  description: string | null;
};

function normalizeDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeEvent(event: RawEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    startDate: normalizeDate(event.startDate ?? event.start_date) ?? new Date(),
    startTime: normalizeDate(event.startTime ?? event.start_time),
    endDate: normalizeDate(event.endDate ?? event.end_date),
    endTime: normalizeDate(event.endTime ?? event.end_time),
    location: event.location ?? null,
    description: event.description ?? null,
  };
}

function hashString(value: string) {
  return value.split("").reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

function getEventAnchorDate(event: CalendarEvent) {
  return event.startTime ?? event.startDate;
}

function getEventColor(title: string) {
  const hue = hashString(title) % 360;
  return {
    borderColor: `hsl(${hue}, 55%, 50%)`,
    backgroundColor: `hsla(${hue}, 55%, 50%, 0.15)`,
    color: `hsl(${hue}, 55%, 80%)`,
  };
}

function DesktopDayCell({
  date,
  events,
  isOutsideMonth,
  onClick,
  onEventClick,
  draggingEventId,
  maxVisible,
}: {
  date: Date;
  events: CalendarEvent[];
  isOutsideMonth: boolean;
  onClick: () => void;
  onEventClick: (event: CalendarEvent) => void;
  draggingEventId: string | null;
  maxVisible: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${format(date, "yyyy-MM-dd")}`,
  });

  const mode = maxVisible >= 4 ? "full" : maxVisible >= 2 ? "compact" : "dot";

  const visibleEvents = events.slice(0, maxVisible);
  const overflowCount = Math.max(events.length - visibleEvents.length, 0);

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group relative flex min-h-0 flex-col overflow-hidden border border-border/80 p-2 text-left transition-all duration-200 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isOutsideMonth && "bg-muted/10 text-muted-foreground",
        isOver && "bg-primary/10 ring-1 ring-primary/40",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            isSameDay(date, new Date()) &&
              "rounded-full bg-primary px-2 py-0.5 text-primary-foreground",
          )}
        >
          {format(date, "d")}
        </span>
      </div>

      {mode === "dot" ? (
        <div className="flex flex-wrap gap-0.5 content-start">
          {events.slice(0, 20).map((event) => (
            <div
              key={event.id}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getEventColor(event.title).borderColor }}
            />
          ))}
          {events.length > 20 && (
            <span className="text-[9px] leading-none text-muted-foreground">
              +{events.length - 20}
            </span>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
          {visibleEvents.map((event) => {
            const isDragging = draggingEventId === `event-${event.id}`;
            return (
              <DesktopDraggableEventBar
                key={event.id}
                event={event}
                isDragging={isDragging}
                onClick={() => onEventClick(event)}
                mode={mode}
              />
            );
          })}
          <div className="flex-1" />
          {overflowCount > 0 && (
            <div className="text-[11px] font-medium text-muted-foreground">
              +{overflowCount} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DesktopDraggableEventBar({
  event,
  onClick,
  isDragging,
  mode,
}: {
  event: CalendarEvent;
  onClick: () => void;
  isDragging: boolean;
  mode: "full" | "compact";
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `event-${event.id}`,
    data: { event },
  });

  const startTime = event.startTime ? format(event.startTime, "p") : "";

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={(eventObject) => {
        eventObject.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex items-center gap-1 rounded-md border-l-4 text-left shadow-sm",
        mode === "full" ? "px-2 py-1.5 text-[11px]" : "px-1 py-0.5 text-[10px]",
        isDragging && "opacity-40",
      )}
      style={getEventColor(event.title)}
      {...attributes}
      {...listeners}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-current/80" />
      <span className="min-w-0 flex-1 truncate font-semibold">{event.title}</span>
      {startTime && mode === "full" && (
        <span className="shrink-0 text-current/80">{startTime}</span>
      )}
    </button>
  );
}

function MobileDayCell({
  date,
  events,
  isOutsideMonth,
  onClick,
}: {
  date: Date;
  events: CalendarEvent[];
  isOutsideMonth: boolean;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "relative flex flex-col items-center justify-center border border-border/60 transition-colors duration-150 active:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isOutsideMonth && "bg-muted/5 text-muted-foreground/60",
      )}
    >
      <span
        className={cn(
          "text-xs font-semibold tabular-nums leading-none",
          isSameDay(date, new Date()) &&
            "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground",
        )}
      >
        {format(date, "d")}
      </span>

      {events.length > 0 && (
        <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
          {events.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: getEventColor(event.title).borderColor }}
            />
          ))}
          {events.length > 4 && (
            <span className="text-[9px] leading-none text-muted-foreground">
              +{events.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function CalendarGrid({
  onSearchClick,
}: {
  onSearchClick?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const {
    setSelectedDate,
    setSelectedEvent,
    setRightPanelMode,
    navigateToday,
    firstDayOfWeek,
  } = useCalendar();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [maxVisible, setMaxVisible] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => setCurrentMonth((c) => addMonths(c, 1)),
    onSwipeRight: () => setCurrentMonth((c) => subMonths(c, 1)),
    threshold: 40,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    api
      .getEvents()
      .then((response) => {
        if (!mounted) return;
        const list = Array.isArray(response)
          ? response
          : (response.events ?? []);
        setEvents(list.map((event: RawEvent) => normalizeEvent(event)));
      })
      .catch((error) => {
        console.error("Failed to load calendar events:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth, firstDayOfWeek]);

  const updateMaxVisible = useCallback(() => {
    if (!gridRef.current) return;
    const gridHeight = gridRef.current.offsetHeight;
    const weekCount = Math.ceil(monthDays.length / 7);
    const cellHeight = Math.floor(gridHeight / weekCount);
    const overhead = 24;
    const labelHeight = 18;
    setMaxVisible(Math.max(1, Math.floor((cellHeight - overhead) / labelHeight)));
  }, [monthDays.length]);

  useEffect(() => {
    updateMaxVisible();
    const el = gridRef.current;
    const observer = new ResizeObserver(updateMaxVisible);
    if (el) observer.observe(el);
    window.addEventListener("resize", updateMaxVisible);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMaxVisible);
    };
  }, [updateMaxVisible]);

  const eventsByDay = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();

    for (const date of monthDays) {
      groups.set(format(date, "yyyy-MM-dd"), []);
    }

    for (const event of events) {
      const anchorDate = getEventAnchorDate(event);
      const key = format(anchorDate, "yyyy-MM-dd");
      const bucket = groups.get(key) ?? [];
      bucket.push(event);
      groups.set(key, bucket);
    }

    return groups;
  }, [events, monthDays]);

  const goToMonth = (direction: 1 | -1) => {
    setCurrentMonth((current) =>
      direction === 1 ? addMonths(current, 1) : subMonths(current, 1),
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    navigateToday();
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setRightPanelMode("day-view");
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(getEventAnchorDate(event));
    setSelectedEvent({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: event.endDate,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
    } as never);
    setRightPanelMode("event-details");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingEventId(String(event.active.id));
    setActiveEvent(event.active.data.current?.event as CalendarEvent ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggingEventId(null);
    setActiveEvent(null);

    if (!event.over) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);

    if (!activeId.startsWith("event-") || !overId.startsWith("day-")) return;

    const eventId = Number(activeId.replace("event-", ""));
    const targetEvent = events.find((item) => item.id === eventId);
    if (!targetEvent) return;

    const targetDate = new Date(`${overId.replace("day-", "")}T00:00:00`);
    const originalAnchorDate = getEventAnchorDate(targetEvent);
    const dayDelta = differenceInCalendarDays(
      targetDate,
      startOfDay(originalAnchorDate),
    );

    if (dayDelta === 0) return;

    const originalEvent = { ...targetEvent };
    const movedStartDate = addDays(startOfDay(targetEvent.startDate), dayDelta);

    const optimisticEvent: CalendarEvent = {
      ...targetEvent,
      startDate: movedStartDate,
      startTime: targetEvent.startTime
        ? addDays(new Date(targetEvent.startTime), dayDelta)
        : null,
      endDate: targetEvent.endDate
        ? addDays(startOfDay(targetEvent.endDate), dayDelta)
        : null,
      endTime: targetEvent.endTime
        ? addDays(new Date(targetEvent.endTime), dayDelta)
        : null,
    };

    setEvents((current) =>
      current.map((item) =>
        item.id === optimisticEvent.id ? optimisticEvent : item,
      ),
    );

    const payload: Record<string, unknown> = {
      startDate: format(movedStartDate, "yyyy-MM-dd"),
    };

    if (targetEvent.startTime) {
      const movedStartTime = new Date(targetEvent.startTime);
      movedStartTime.setDate(movedStartTime.getDate() + dayDelta);
      payload.startTime = movedStartTime.toISOString();
    } else {
      payload.startTime = null;
    }

    if (targetEvent.endDate) {
      const movedEndDate = addDays(startOfDay(targetEvent.endDate), dayDelta);
      payload.endDate = format(movedEndDate, "yyyy-MM-dd");
    }

    if (targetEvent.endTime) {
      const movedEndTime = new Date(targetEvent.endTime);
      movedEndTime.setDate(movedEndTime.getDate() + dayDelta);
      payload.endTime = movedEndTime.toISOString();
    } else if (targetEvent.endDate) {
      payload.endTime = null;
    }

    try {
      const response = await api.updateEvent(String(eventId), payload);
      const updatedEvent = normalizeEvent(response as RawEvent);
      setEvents((current) =>
        current.map((item) =>
          item.id === updatedEvent.id ? updatedEvent : item,
        ),
      );
    } catch (error) {
      console.error("Failed to move event, reverting:", error);
      setEvents((current) =>
        current.map((item) =>
          item.id === originalEvent.id ? originalEvent : item,
        ),
      );
    }
  };

  if (!isAuthenticated) return null;

  const selectedMonthLabel = format(currentMonth, "MMMM yyyy");

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col bg-background px-6 py-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2 md:mb-5 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner shadow-primary/10 md:h-11 md:w-11 md:rounded-2xl">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div>
            <p className="hidden text-xs uppercase tracking-[0.24em] text-muted-foreground md:block">
              Month view
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-foreground transition-all duration-200 md:text-2xl">
              {selectedMonthLabel}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => {
              onSearchClick?.();
              setIsSearchOpen(true);
            }}
            aria-label="Search events"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 overflow-hidden rounded-xl border border-border/60 bg-card/80 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground shadow-sm md:mb-4 md:rounded-2xl md:text-xs md:tracking-[0.2em]">
        {(() => {
          const base = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return [...base.slice(firstDayOfWeek), ...base.slice(0, firstDayOfWeek)];
        })().map((day) => (
          <div
            key={day}
            className="border-r border-border/60 px-1 py-2 text-center last:border-r-0 md:px-3 md:py-3"
          >
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-card/40 text-sm text-muted-foreground md:rounded-3xl">
          Loading calendar...
        </div>
      ) : (
        <>
          {/* Mobile compact grid */}
          <div
            className="flex flex-1 flex-col overflow-auto md:hidden touch-pan-y"
            {...swipeHandlers}
          >
            <div className="grid flex-1 grid-cols-7 auto-rows-fr rounded-xl border border-border/60 bg-card/70 shadow-lg">
              {monthDays.map((date) => {
                const dayKey = format(date, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(dayKey) ?? [];

                return (
                  <MobileDayCell
                    key={dayKey}
                    date={date}
                    events={dayEvents}
                    isOutsideMonth={!isSameMonth(date, currentMonth)}
                    onClick={() => handleDayClick(date)}
                  />
                );
              })}
            </div>
          </div>

          {/* Desktop grid with DnD */}
          <div className="hidden flex-1 flex-col md:flex">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div ref={gridRef} className="grid flex-1 grid-cols-7 auto-rows-fr rounded-3xl border border-border/80 bg-card/70 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                {monthDays.map((date) => {
                  const dayKey = format(date, "yyyy-MM-dd");
                  const dayEvents = eventsByDay.get(dayKey) ?? [];

                  return (
                    <DesktopDayCell
                      key={dayKey}
                      date={date}
                      events={dayEvents}
                      isOutsideMonth={!isSameMonth(date, currentMonth)}
                      onClick={() => handleDayClick(date)}
                      onEventClick={handleEventClick}
                      draggingEventId={draggingEventId}
                      maxVisible={maxVisible}
                    />
                  );
                })}
              </div>

              <DragOverlay dropAnimation={null}>
                {activeEvent ? (
                  <div
                    className="flex items-center gap-2 rounded-md border-l-4 px-2 py-1.5 text-left text-[11px] shadow-2xl"
                    style={{
                      ...getEventColor(activeEvent.title),
                      cursor: "grabbing",
                      transform: "scale(1.05)",
                      pointerEvents: "none",
                    }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-current/80" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {activeEvent.title}
                    </span>
                    {activeEvent.startTime && (
                      <span className="shrink-0 text-current/80">
                        {format(activeEvent.startTime, "p")}
                      </span>
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </>
      )}

      {isSearchOpen && (
        <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      )}
    </section>
  );
}
