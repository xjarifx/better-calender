"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, ChevronDown, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import EventCard from "@/components/EventCard";
import { useCalendar } from "@/lib/calendar-context";

interface Event {
  id: number;
  user_id: number;
  title: string;
  start_date: Date;
  start_time: Date | null;
  end_date: Date | null;
  end_time: Date | null;
  location: string | null;
  description: string | null;
  color?: string;
  created_at: Date;
  updated_at: Date;
}

export default function EventsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    api.getEvents()
      .then((data) => setEvents(data))
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

  const groupedByMonth = useMemo(() => {
    if (!events || events.length === 0) return [];
    const monthsMap: Record<
      string,
      { label: string; dates: Record<string, Event[]> }
    > = {};

    events.forEach((ev) => {
      const dateStr = ev.start_date;
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
              const dx = new Date(x.start_date).getTime();
              const dy = new Date(y.start_date).getTime();
              return dx - dy;
            }),
          }));

        const count = dates.reduce((s, d) => s + d.events.length, 0);
        return { key, label: month.label, dates, count };
      });

    return months;
  }, [events]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-4 md:px-6 md:py-5 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/calendar")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Calendar
          </button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">All Events</h1>
              <p className="text-sm text-muted-foreground">
                {events.length} event{events.length !== 1 ? "s" : ""} across{" "}
                {groupedByMonth.length} month{groupedByMonth.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/events/input")}
            className="shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            AI Input
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-36 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-16 w-full bg-muted rounded-lg animate-pulse" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No events yet</p>
            <p className="text-xs mt-1 mb-4">Create your first event to get started</p>
            <Button
              variant="outline"
              onClick={() => router.push("/events/input")}
            >
              <Sparkles className="h-4 w-4" />
              AI Event Input
            </Button>
          </div>
        )}

        {/* Event list */}
        {!loading && events.length > 0 && (
          <div className="space-y-4">
            {groupedByMonth.map((month) => {
              const isCollapsed = collapsedMonths[month.key];
              return (
                <Card key={month.key}>
                  <CardHeader
                    className="cursor-pointer select-none"
                    onClick={() =>
                      setCollapsedMonths((s) => ({
                        ...s,
                        [month.key]: !s[month.key],
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <CardTitle>{month.label}</CardTitle>
                        <Badge variant="secondary" className="ml-1">
                          {month.count}
                        </Badge>
                      </div>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollapsedMonths((s) => ({
                            ...s,
                            [month.key]: !s[month.key],
                          }));
                        }}
                      >
                        {isCollapsed ? "Expand" : "Collapse"}
                      </Button>
                    </div>
                  </CardHeader>

                  {!isCollapsed && (
                    <CardContent className="space-y-4">
                      {month.dates.map((dg) => (
                        <div key={dg.dateKey}>
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            {format(parseISO(dg.dateKey), "EEEE, MMM d, yyyy")}
                          </div>
                          <div className="space-y-2">
                            {dg.events.map((ev) => (
                              <div
                                key={ev.id}
                                onClick={() => {
                                  try {
                                    setSelectedEvent(ev);
                                    setRightPanelMode("event-details");
                                  } catch {}
                                }}
                              >
                                <EventCard event={ev} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
