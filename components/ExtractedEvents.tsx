"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatTimeForInput(timeStr: string): string {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(11, 16);
}

export interface ExtractedEvent {
  title: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

interface ExtractedEventsProps {
  events: ExtractedEvent[];
  onClear: () => void;
  hideActionBar?: boolean;
}

export default function ExtractedEvents({
  events,
  onClear,
  hideActionBar,
}: ExtractedEventsProps) {
  const router = useRouter();
  const [editableEvents, setEditableEvents] = useState<ExtractedEvent[]>(
    events.map((e) => ({ ...e })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setEditableEvents(events.map((event) => ({ ...event })));
      setError("");
    });
  }, [events]);

  const updateEvent = (
    index: number,
    field: keyof ExtractedEvent,
    value: string,
  ) => {
    setEditableEvents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value || undefined };
      return updated;
    });
  };

  const removeEvent = (index: number) => {
    setEditableEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    const invalid = editableEvents.some((e) => !e.title || !e.startDate);
    if (invalid) {
      setError("All events must have a title and start date");
      return;
    }

    setSaving(true);
    setError("");

    for (const event of editableEvents) {
      try {
        const eventData: Record<string, unknown> = {
          title: event.title,
          startDate: event.startDate,
        };
        if (event.startTime) eventData.startTime = event.startTime;
        if (event.endDate) eventData.endDate = event.endDate;
        if (event.endTime) eventData.endTime = event.endTime;
        if (event.location) eventData.location = event.location;
        if (event.description) eventData.description = event.description;

        await api.createEvent(eventData);
      } catch (err) {
        setError(
          `Failed to save "${event.title}": ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        setSaving(false);
        return;
      }
    }

    router.push("/calendar");
  };

  if (editableEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Extracted Events ({editableEvents.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the AI results before saving them.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="rounded-xl"
        >
          Clear All
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {editableEvents.map((event, index) => (
          <Card
            key={index}
            size="sm"
            className={cn("rounded-2xl border-border/70 bg-card/80 py-0")}
          >
            <CardHeader className="border-b border-border/60 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-medium">
                    Event {index + 1}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Edit extracted details before saving.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEvent(index)}
                  className="h-8 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-4 py-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Title *
                </label>
                <Input
                  value={event.title}
                  onChange={(e) => updateEvent(index, "title", e.target.value)}
                  required
                  className="h-9 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={event.startDate}
                    onChange={(e) =>
                      updateEvent(index, "startDate", e.target.value)
                    }
                    required
                    className="h-9 rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={
                      event.startTime ? formatTimeForInput(event.startTime) : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const [hours, minutes] = e.target.value.split(":");
                        const date = new Date(event.startDate);
                        date.setHours(parseInt(hours), parseInt(minutes));
                        updateEvent(index, "startTime", date.toISOString());
                      } else {
                        updateEvent(index, "startTime", "");
                      }
                    }}
                    className="h-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={event.endDate || ""}
                    onChange={(e) =>
                      updateEvent(index, "endDate", e.target.value)
                    }
                    className="h-9 rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={
                      event.endTime ? formatTimeForInput(event.endTime) : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const endDate = event.endDate || event.startDate;
                        const [hours, minutes] = e.target.value.split(":");
                        const date = new Date(endDate);
                        date.setHours(parseInt(hours), parseInt(minutes));
                        updateEvent(index, "endTime", date.toISOString());
                      } else {
                        updateEvent(index, "endTime", "");
                      }
                    }}
                    className="h-9 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Location
                </label>
                <Input
                  value={event.location || ""}
                  onChange={(e) =>
                    updateEvent(index, "location", e.target.value)
                  }
                  className="h-9 rounded-xl"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  className="min-h-[76px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50"
                  value={event.description || ""}
                  onChange={(e) =>
                    updateEvent(index, "description", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hideActionBar && (
        <div className="flex gap-2 rounded-2xl border border-border/70 bg-card/60 p-4">
          <Button
            onClick={handleSaveAll}
            disabled={saving || editableEvents.length === 0}
            className="h-10 rounded-xl"
          >
            {saving ? "Saving..." : `Save All ${editableEvents.length} Event(s)`}
          </Button>
          <Button variant="outline" onClick={onClear} className="h-10 rounded-xl">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
