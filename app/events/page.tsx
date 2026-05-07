"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface Event {
  id: number;
  title: string;
  start_date: string;
  start_time: string | null;
  end_date: string;
  end_time: string | null;
  location?: string;
  description?: string;
  color?: string;
}

import { ArrowLeft } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";
import EventCard from "@/components/EventCard";
import { useCalendar } from "@/lib/calendar-context";

export default function EventsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const { setSelectedEvent, setRightPanelMode } = useCalendar();
  const [collapsedMonths, setCollapsedMonths] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadEvents();
  }, [isAuthenticated, isLoading, router]);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.deleteEvent(String(id));
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      setDeleteError("Failed to delete event");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    try {
      return format(parseISO(timeStr), "h:mm a");
    } catch {
      return null;
    }
  };

  const groupedByMonth = useMemo(() => {
    if (!events || events.length === 0) return [];
    const monthsMap: Record<
      string,
      { label: string; dates: Record<string, Event[]> }
    > = {};

    events.forEach((ev) => {
      const dateStr = (ev as any).start_date || (ev as any).startDate;
      const d = dateStr ? new Date(dateStr) : new Date();
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      const monthLabel = format(d, "MMMM yyyy");
      if (!monthsMap[monthKey])
        monthsMap[monthKey] = { label: monthLabel, dates: {} };

      const dayKey = format(d, "yyyy-MM-dd");
      if (!monthsMap[monthKey].dates[dayKey])
        monthsMap[monthKey].dates[dayKey] = [];
      monthsMap[monthKey].dates[dayKey].push(ev);
    });

    // Convert to sorted array
    const months = Object.keys(monthsMap)
      .sort((a, b) => {
        const [ay, am] = a.split("-").map(Number);
        const [by, bm] = b.split("-").map(Number);
        if (ay !== by) return by - ay;
        return bm - am;
      })
      .map((key) => {
        const month = monthsMap[key];
        const dates = Object.keys(month.dates)
          .sort((a, b) => (a < b ? -1 : 1))
          .map((dateKey) => ({
            dateKey,
            events: month.dates[dateKey].sort((x, y) => {
              const dx = new Date(
                (x as any).start_date || (x as any).startDate,
              ).getTime();
              const dy = new Date(
                (y as any).start_date || (y as any).startDate,
              ).getTime();
              return dx - dy;
            }),
          }));

        // total count
        const count = dates.reduce((s, d) => s + d.events.length, 0);
        return { key, label: month.label, dates, count };
      });

    return months;
  }, [events]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/calendar")}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Calendar
            </button>
            <h1 className="text-xl font-semibold">All Events</h1>
          </div>
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
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="mb-3">No events yet.</div>
            <Button
              variant="ghost"
              onClick={() => router.push("/events/input")}
            >
              Go to AI Input
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByMonth.map((month) => (
              <div key={month.key} className="bg-surface rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-sm font-medium"
                      onClick={() =>
                        setCollapsedMonths((s) => ({
                          ...s,
                          [month.key]: !s[month.key],
                        }))
                      }
                    >
                      {month.label}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {month.count} events
                    </span>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCollapsedMonths((s) => ({
                          ...s,
                          [month.key]: !s[month.key],
                        }))
                      }
                    >
                      {collapsedMonths[month.key] ? "Expand" : "Collapse"}
                    </Button>
                  </div>
                </div>

                {!collapsedMonths[month.key] && (
                  <div className="mt-3 space-y-4">
                    {month.dates.map((dg) => (
                      <div key={dg.dateKey}>
                        <div className="text-sm font-medium">
                          {format(parseISO(dg.dateKey), "EEEE, MMM d, yyyy")}
                        </div>
                        <div className="mt-2 space-y-2">
                          {dg.events.map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => {
                                try {
                                  setSelectedEvent(ev as any);
                                  setRightPanelMode("event-details");
                                } catch (_) {}
                              }}
                            >
                              <EventCard event={ev as any} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
