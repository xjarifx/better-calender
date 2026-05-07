"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: {
    title: string;
    startDate: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    description?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventForm({
  mode,
  eventId,
  initialData,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setStartDate(initialData?.startDate || "");
    setStartTime(initialData?.startTime || "");
    setEndDate(initialData?.endDate || "");
    setEndTime(initialData?.endTime || "");
    setLocation(initialData?.location || "");
    setDescription(initialData?.description || "");
    setError("");
  }, [initialData, eventId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !startDate) {
      setError("Title and start date are required");
      return;
    }

    setLoading(true);

    const eventData: Record<string, unknown> = {
      title,
      startDate: new Date(startDate).toISOString(),
    };

    if (startTime) {
      eventData.startTime = new Date(startTime).toISOString();
    }
    if (endDate) {
      eventData.endDate = new Date(endDate).toISOString();
    }
    if (endTime) {
      eventData.endTime = new Date(endTime).toISOString();
    }
    if (location) eventData.location = location;
    if (description) eventData.description = description;

    try {
      if (mode === "edit" && eventId) {
        await api.updateEvent(eventId, eventData);
      } else {
        await api.createEvent(eventData);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/calendar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-3 rounded-2xl border border-border bg-card/70 p-4 shadow-sm",
        "max-w-none",
      )}
    >
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium">Title *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="h-10 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Start Date *
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="h-10 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Start Time</label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">End Time</label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Location</label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-10 rounded-xl"
          placeholder="Add location"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea
          className="min-h-[96px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          disabled={loading}
          className="h-10 flex-1 rounded-xl"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel ? onCancel() : router.push("/calendar")}
          className="h-10 flex-1 rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
