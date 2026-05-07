"use client";

import { useEffect, useState } from "react";
import { useCalendar } from "@/lib/calendar-context";
import { useAuth } from "@/lib/auth-context";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

function formatDateTimeInput(value: string | Date | null | undefined) {
  if (!value) return "";

  return typeof value === "string"
    ? value.slice(0, 16)
    : value.toISOString().slice(0, 16);
}

export default function RightPanel() {
  const { isAuthenticated } = useAuth();
  const {
    rightPanelMode,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    setRightPanelMode,
  } = useCalendar();
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => {
    // load events once for day-view filtering
    let mounted = true;
    api
      .getEvents()
      .then((res) => {
        if (!mounted) return;
        setEvents(res.events || res);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!isAuthenticated) return null;

  const handleDeleteEvent = async (id?: number) => {
    if (!id) return;
    try {
      await api.deleteEvent(String(id));
      // refresh
      const res = await api.getEvents();
      setEvents(res.events || res);
      setSelectedEvent(null);
      setRightPanelMode("day-view");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (evt: any) => {
    const payload: Record<string, unknown> = {
      title: evt.title,
      startDate: evt.start_date,
    };
    if (evt.start_time) payload.startTime = evt.start_time;
    if (evt.end_date) payload.endDate = evt.end_date;
    if (evt.end_time) payload.endTime = evt.end_time;
    if (evt.location) payload.location = evt.location;
    if (evt.description) payload.description = evt.description;
    try {
      await api.createEvent(payload);
      const res = await api.getEvents();
      setEvents(res.events || res);
      // keep viewing duplicated event list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="fixed right-0 top-0 h-full z-30 w-[400px] border-l border-border bg-right-panel-bg p-4">
      {rightPanelMode === "extracted-events" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Extracted Events</h3>
          <div className="text-sm text-muted-foreground">
            Extracted events are now managed in the dedicated input page.
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={() => setRightPanelMode("day-view")}
            >
              Back to Day View
            </Button>
          </div>
        </div>
      )}

      {rightPanelMode === "day-view" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {selectedDate ? new Date(selectedDate).toDateString() : "Day View"}
          </h3>
          <div className="space-y-2">
            {(events || [])
              .filter((e) => {
                if (!selectedDate) return false;
                const sd = new Date(e.startDate).toDateString();
                return sd === new Date(selectedDate).toDateString();
              })
              .map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    setSelectedEvent(e);
                    setRightPanelMode("event-details");
                  }}
                >
                  <EventCard event={e} />
                </div>
              ))}
          </div>
          <div className="mt-3">
            <Button onClick={() => router.push("/events/new")}>
              Add Event
            </Button>
          </div>
        </div>
      )}

      {rightPanelMode === "event-details" && selectedEvent && (
        <div>
          <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
          <div className="text-sm text-muted-foreground mb-3">
            {selectedEvent.start_date &&
              new Date(selectedEvent.start_date).toDateString()}
            {selectedEvent.start_time &&
              ` · ${new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </div>

          <div className="mb-3">
            {selectedEvent.location && (
              <div className="text-sm">Location: {selectedEvent.location}</div>
            )}
            {selectedEvent.description && (
              <div className="text-sm mt-2">{selectedEvent.description}</div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleDeleteEvent(selectedEvent.id)}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDuplicate(selectedEvent)}
            >
              Duplicate
            </Button>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Edit Event</h4>
            <EventForm
              mode="edit"
              eventId={String(selectedEvent.id)}
              initialData={{
                title: selectedEvent.title || "",
                startDate: selectedEvent.start_date
                  ? new Date(selectedEvent.start_date)
                      .toISOString()
                      .slice(0, 10)
                  : "",
                startTime: formatDateTimeInput(selectedEvent.start_time),
                endDate: selectedEvent.end_date
                  ? new Date(selectedEvent.end_date).toISOString().slice(0, 10)
                  : "",
                endTime: formatDateTimeInput(selectedEvent.end_time),
                location: selectedEvent.location || "",
                description: selectedEvent.description || "",
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
