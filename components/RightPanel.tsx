"use client";

import { useEffect, useState } from "react";
import { useCalendar } from "@/lib/calendar-context";
import { useAuth } from "@/lib/auth-context";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import EmptyStatePet from "./EmptyStatePet";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import { Plus, ArrowLeft, X } from "lucide-react";

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const refreshEvents = async () => {
    try {
      const res = await api.getEvents();
      setEvents(res.events || res);
    } catch {}
  };

  useEffect(() => {
    refreshEvents();
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

  return (
    <aside className="fixed right-0 top-0 h-full z-30 w-[400px] border-l border-border bg-right-panel-bg flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {rightPanelMode === "empty" && <EmptyStatePet />}

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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                {selectedDate ? new Date(selectedDate).toDateString() : "Day View"}
              </h3>
              <button
                onClick={() => setRightPanelMode("empty")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {(events || [])
                .filter((e) => {
                  if (!selectedDate) return false;
                  const sd = new Date(e.start_date).toDateString();
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
          </div>
        )}

        {rightPanelMode === "event-details" && selectedEvent && (
          <div>
            <button
              onClick={() => {
                setRightPanelMode("day-view");
                setSelectedEvent(null);
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to list
            </button>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setRightPanelMode("empty");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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

            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Edit Event</h4>
              <EventForm
                mode="edit"
                eventId={String(selectedEvent.id)}
                onCancel={() => {
                  setRightPanelMode("day-view");
                  setSelectedEvent(null);
                }}
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
      </div>

      <div className="border-t border-border bg-right-panel-bg p-4">
        <Button className="w-full" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogTitle>New Event</DialogTitle>
          <EventForm
            mode="create"
            onSuccess={() => {
              refreshEvents();
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </aside>
  );
}
