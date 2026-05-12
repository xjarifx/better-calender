"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import EventForm from "@/components/EventForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";

interface EventData {
  title: string;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  color?: string;
}

export default function EventDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    api.getEvent(id)
      .then((data) => setEvent(data as EventData))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load event"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, id, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.deleteEvent(id);
      router.push("/calendar");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-4 max-w-2xl mx-auto">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="rounded-xl border p-6 space-y-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-56 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-20 w-full bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 p-6 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Event not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 md:px-6 md:py-5 max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("view")}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Edit Event</h1>
              <p className="text-sm text-muted-foreground">
                Update the event details below
              </p>
            </div>
          </div>
          <EventForm
            mode="edit"
            eventId={id}
            initialData={{
              title: event.title,
              startDate: event.start_date?.split("T")[0] || "",
              startTime: event.start_time?.slice(0, 16) || "",
              endDate: event.end_date?.split("T")[0] || "",
              endTime: event.end_time?.slice(0, 16) || "",
              location: event.location || "",
              description: event.description || "",
            }}
          />
        </div>
      </div>
    );
  }

  const eventColor = event.color || "#4285F4";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-4 md:px-6 md:py-5 max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
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

        {/* Event card */}
        <Card
          className="overflow-hidden"
          style={{ borderLeftColor: eventColor, borderLeftWidth: 3 }}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  Created{" "}
                  {(() => {
                    try {
                      return format(parseISO(event.start_date), "PPP");
                    } catch {
                      return event.start_date;
                    }
                  })()}
                </CardDescription>
              </div>
              <Badge
                style={{
                  backgroundColor: eventColor + "20",
                  color: eventColor,
                }}
                className="border-0 shrink-0"
              >
                Event
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Date/time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {format(parseISO(event.start_date), "PPP")}
                </span>
                {event.start_time && (
                  <span className="text-muted-foreground">
                    at {format(parseISO(event.start_time), "p")}
                  </span>
                )}
              </div>

              {event.end_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">End:</span>
                  <span className="font-medium">
                    {format(parseISO(event.end_date), "PPP")}
                  </span>
                  {event.end_time && (
                    <span className="text-muted-foreground">
                      at {format(parseISO(event.end_time), "p")}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Location:</span>
                <span>{event.location}</span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {deleteError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => setMode("edit")} className="flex-1">
            <Pencil className="h-4 w-4" />
            Edit Event
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
