"use client";

import React, { useEffect, useState } from "react";
import { useCalendar } from "@/lib/calendar-context";
import ExtractedEvents, { ExtractedEvent } from "./ExtractedEvents";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RightPanel() {
  const {
    rightPanelMode,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    setRightPanelMode,
  } = useCalendar();
  const [text, setText] = useState("");
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [extracted, setExtracted] = useState<ExtractedEvent[] | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleExtract = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await api.extractEvents(text, model);
      const items = res.events || res;
      setExtracted(items);
      setRightPanelMode("extracted-events");
    } catch (err) {
      console.error(err);
      // keep simple: show nothing on error
    } finally {
      setLoading(false);
    }
  };

  const handleClearExtracted = () => {
    setExtracted(null);
    setRightPanelMode("ai-input");
  };

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
      startDate: evt.startDate,
    };
    if (evt.startTime) payload.startTime = evt.startTime;
    if (evt.endDate) payload.endDate = evt.endDate;
    if (evt.endTime) payload.endTime = evt.endTime;
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
      {rightPanelMode === "ai-input" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">AI Input</h3>
          <textarea
            className="w-full min-h-[140px] rounded-md bg-background p-3 text-sm border border-border"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text to extract events..."
          />
          <div className="flex items-center gap-2 mt-3">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-md bg-background p-2 border border-border text-sm"
            >
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
            <Button onClick={handleExtract} disabled={loading}>
              {loading ? "Extracting..." : "Extract Events"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setText("");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {rightPanelMode === "extracted-events" && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Extracted Events</h3>
          {extracted ? (
            <ExtractedEvents
              events={extracted}
              onClear={handleClearExtracted}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              No extracted events. Paste text and Extract.
            </div>
          )}
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
            {selectedEvent.startDate &&
              new Date(selectedEvent.startDate).toDateString()}
            {selectedEvent.startTime &&
              ` · ${new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
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
            <Button onClick={() => setRightPanelMode("ai-input")}>Edit</Button>
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
                startDate: selectedEvent.startDate
                  ? new Date(selectedEvent.startDate).toISOString().slice(0, 10)
                  : "",
                startTime: selectedEvent.startTime || "",
                endDate: selectedEvent.endDate
                  ? new Date(selectedEvent.endDate).toISOString().slice(0, 10)
                  : "",
                endTime: selectedEvent.endTime || "",
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
