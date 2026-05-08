"use client";

import { useEffect, useState } from "react";
import { useCalendar } from "@/lib/calendar-context";
import { useAuth } from "@/lib/auth-context";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import EmptyStatePet from "./EmptyStatePet";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
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

interface EventData {
  id: number
  user_id: number
  title: string
  start_date: Date
  start_time: Date | null
  end_date: Date | null
  end_time: Date | null
  location: string | null
  description: string | null
  created_at: Date
  updated_at: Date
}

function RightPanelContent({ isMobile }: { isMobile?: boolean }) {
  const {
    rightPanelMode,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    setRightPanelMode,
  } = useCalendar();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshEvents = () => {
    api.getEvents()
      .then((res) => setEvents(res.events || res))
      .catch(() => {});
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshEvents();
    }
  }, [isAuthenticated]);

  const handleDeleteEvent = async (id?: number) => {
    if (!id) return;
    try {
      await api.deleteEvent(String(id));
      const res = await api.getEvents();
      setEvents(res.events || res);
      setSelectedEvent(null);
      setRightPanelMode("day-view");
    } catch (err) {
      console.error(err);
    }
  };

  if (rightPanelMode === "empty") {
    if (isMobile) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Select a day to view events
            </p>
          </div>
        </div>
      );
    }
    return <EmptyStatePet />;
  }

  return (
    <>
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
            {events.filter((e) => {
              if (!selectedDate) return false;
              return new Date(e.start_date).toDateString() === new Date(selectedDate).toDateString();
            }).length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No events on this day
              </p>
            )}
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
    </>
  );
}

export default function RightPanel() {
  const { isAuthenticated } = useAuth();
  const {
    rightPanelMode,
    setRightPanelMode,
    setSelectedEvent,
  } = useCalendar();

  if (!isAuthenticated) return null;

  const handleClose = () => {
    setRightPanelMode("empty");
    setSelectedEvent(null);
  };

  return (
    <>
      {/* Desktop right panel */}
      <aside className="fixed right-0 top-0 z-30 hidden h-full w-[400px] flex-col border-l border-border bg-right-panel-bg md:flex">
        <div className="flex-1 overflow-y-auto p-4">
          <RightPanelContent />
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      {rightPanelMode !== "empty" && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={handleClose}
          />
          <div className="absolute bottom-0 left-0 right-0 z-10 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-right-panel-bg shadow-2xl animate-slide-up pb-[env(safe-area-inset-bottom,16px)]">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <button
                type="button"
                className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30"
                onClick={handleClose}
                aria-label="Close"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <RightPanelContent isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
