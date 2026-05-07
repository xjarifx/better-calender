"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useCalendar } from "@/lib/calendar-context";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RawEvent = {
  id: number;
  title: string;
  startDate?: string | Date | null;
  startTime?: string | Date | null;
  location?: string | null;
  description?: string | null;
  start_date?: string | Date | null;
  start_time?: string | Date | null;
};

type SearchEvent = {
  id: number;
  title: string;
  startDate: Date;
  startTime: Date | null;
  location: string | null;
  description: string | null;
};

function normalizeDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function normalizeEvent(event: RawEvent): SearchEvent {
  return {
    id: event.id,
    title: event.title,
    startDate: normalizeDate(event.startDate ?? event.start_date) ?? new Date(),
    startTime: normalizeDate(event.startTime ?? event.start_time),
    location: event.location ?? null,
    description: event.description ?? null,
  };
}

function formatEventDate(event: SearchEvent) {
  const dateLabel = event.startDate.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = event.startTime
    ? event.startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "All day";

  return `${dateLabel} • ${timeLabel}`;
}

export default function SearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setSelectedEvent, setRightPanelMode } = useCalendar();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

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
        console.error("Failed to load events for search:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return events;

    return events.filter((event) =>
      event.title.toLowerCase().includes(normalizedQuery),
    );
  }, [events, query]);

  const handleSelectEvent = (event: SearchEvent) => {
    setSelectedEvent({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: null,
      endTime: null,
      location: event.location,
      description: event.description,
    } as never);
    setRightPanelMode("event-details");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden border-border/80 bg-popover/95 p-0 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <DialogHeader className="border-b border-border/70 px-6 py-5">
          <DialogTitle className="text-lg font-semibold">Search events</DialogTitle>
          <DialogDescription>
            Type a title to filter matching events and open one in the right
            panel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
            className="h-11 rounded-xl"
          />

          <div className="max-h-[50vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                Loading events...
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-2">
                {filteredEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleSelectEvent(event)}
                    className="w-full rounded-2xl border border-border/70 bg-card/70 px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {event.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatEventDate(event)}
                        </div>
                      </div>
                      <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground/90">
                        Open
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
                No events match &quot;{query.trim()}&quot;.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
