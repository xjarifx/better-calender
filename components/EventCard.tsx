"use client";

import React from "react";
import { Card, CardContent, CardTitle, CardDescription } from "./ui/card";
import { cn } from "@/lib/utils";
import type { events as Event } from "@prisma/client";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  showActions?: boolean;
}

export default function EventCard({
  event,
  onClick,
  showActions,
}: EventCardProps) {
  const start = event.startDate
    ? new Date(event.startDate).toLocaleDateString()
    : "";
  const time = event.startTime
    ? new Date(event.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Card className={cn("cursor-pointer")} onClick={onClick}>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">{event.title}</CardTitle>
            <CardDescription className="text-xs">
              {start} {time && `· ${time}`}
            </CardDescription>
            {event.location && (
              <div className="text-xs text-muted-foreground mt-1">
                {event.location}
              </div>
            )}
          </div>
          {showActions && (
            <div className="text-xs text-muted-foreground">Actions</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
