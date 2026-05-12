"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ExtractedEvents from "@/components/ExtractedEvents";
import {
  Sparkles,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { InlineLoading } from "@/components/ui/loading";

const LS_KEY_TEXT = "ai-input-text";
const LS_KEY_EVENTS = "ai-input-events";
const LS_KEY_EXTRACTING = "ai-input-extracting";
const LS_KEY_REQUEST_ID = "ai-input-request-id";

let activeController: AbortController | null = null;

const RECOMMENDED_MODEL_IDS = [
  "openai/gpt-oss-120b",
  "nvidia/nemotron-3-super",
];
const HARDCODED_RECOMMENDED_MODELS: FreeModel[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "OpenAI: gpt-oss-120b",
    context: "131k",
  },
  {
    id: "nvidia/nemotron-3-super",
    name: "NVIDIA: Nemotron 3 Super",
    context: "128k",
  },
];

interface FreeModel {
  id: string;
  name: string;
  context: string;
  description?: string;
}

interface ExtractedEvent {
  title: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export default function EventInputPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [text, setText] = useState(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem(LS_KEY_TEXT) || ""
        : "",
  );
  const [models, setModels] = useState<FreeModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        const saved = localStorage.getItem(LS_KEY_EVENTS);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    },
  );
  const requestIdRef = useRef(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedRequestId = localStorage.getItem(LS_KEY_REQUEST_ID);
    if (savedRequestId) {
      requestIdRef.current = parseInt(savedRequestId, 10) || 0;
    }

    if (localStorage.getItem(LS_KEY_EXTRACTING) === "true") {
      const pollId = setInterval(() => {
        if (localStorage.getItem(LS_KEY_EXTRACTING) !== "true") {
          const events = localStorage.getItem(LS_KEY_EVENTS);
          if (events) {
            try {
              setExtractedEvents(JSON.parse(events));
            } catch {}
          }
          clearInterval(pollId);
        }
      }, 400);
      const timeoutId = setTimeout(() => {
        clearInterval(pollId);
        localStorage.setItem(LS_KEY_EXTRACTING, "false");
      }, 10000);
      return () => {
        clearInterval(pollId);
        clearTimeout(timeoutId);
      };
    } else {
      localStorage.setItem(LS_KEY_EXTRACTING, "false");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY_TEXT, text);
  }, [text]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    queueMicrotask(() => setLoading(true));
    fetch("/api/ai/models")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load models");
        return res.json();
      })
      .then((data) => {
        const apiModels = data.models || [];
        const allModels = [...HARDCODED_RECOMMENDED_MODELS, ...apiModels];
        setModels(allModels);
        if (allModels.length > 0) {
          setSelectedModel(allModels[0].id);
        }
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load models",
        ),
      )
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleExtract = async () => {
    if (extracting && activeController) {
      activeController.abort();
      activeController = null;
      setExtracting(false);
      localStorage.setItem(LS_KEY_EXTRACTING, "false");
      setError("Extraction cancelled");
      return;
    }

    if (!text.trim()) {
      setError("Please paste some text to extract events from");
      return;
    }
    if (!selectedModel) {
      setError("Please select an AI model");
      return;
    }

    const thisRequestId = requestIdRef.current + 1;
    requestIdRef.current = thisRequestId;
    localStorage.setItem(LS_KEY_REQUEST_ID, String(thisRequestId));

    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();

    setExtracting(true);
    localStorage.setItem(LS_KEY_EXTRACTING, "true");
    setError("");
    setSuccess("");
    setExtractedEvents([]);

    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model: selectedModel }),
        signal: activeController.signal,
      });

      if (
        localStorage.getItem(LS_KEY_REQUEST_ID) !== String(thisRequestId)
      )
        return;

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Extraction failed");
      }

      const data = await res.json();

      if (
        localStorage.getItem(LS_KEY_REQUEST_ID) !== String(thisRequestId)
      )
        return;

      if (data.events?.length === 0) {
        setError("No events found in the text. Try adding more details.");
        localStorage.removeItem(LS_KEY_EVENTS);
      } else {
        const events = data.events || [];
        setExtractedEvents(events);
        setSuccess(`Found ${events.length} event${events.length > 1 ? "s" : ""}!`);
        localStorage.setItem(LS_KEY_EVENTS, JSON.stringify(events));
      }
    } catch (err) {
      if (
        localStorage.getItem(LS_KEY_REQUEST_ID) !== String(thisRequestId)
      )
        return;

      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Extraction cancelled");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to extract events",
        );
      }
      localStorage.removeItem(LS_KEY_EVENTS);
    } finally {
      if (
        localStorage.getItem(LS_KEY_REQUEST_ID) === String(thisRequestId)
      ) {
        setExtracting(false);
        localStorage.setItem(LS_KEY_EXTRACTING, "false");
        activeController = null;
      }
    }
  };

  const handleClear = () => {
    setText("");
    setExtractedEvents([]);
    setError("");
    setSuccess("");
    localStorage.removeItem(LS_KEY_TEXT);
    localStorage.removeItem(LS_KEY_EVENTS);
    localStorage.setItem(LS_KEY_EXTRACTING, "false");
  };

  const handleCancelEvents = () => {
    setExtractedEvents([]);
    setError("");
    setSuccess("");
    localStorage.removeItem(LS_KEY_EVENTS);
    localStorage.setItem(LS_KEY_EXTRACTING, "false");
    if (activeController) {
      activeController.abort();
      activeController = null;
    }
  };

  const handleSaveAllEvents = async () => {
    const invalid = extractedEvents.some((e) => !e.title || !e.startDate);
    if (invalid) {
      setSaveError("All events must have a title and start date");
      return;
    }
    setSaving(true);
    setSaveError("");
    for (const event of extractedEvents) {
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
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create event");
        }
      } catch (err) {
        setSaveError(
          `Failed to save "${event.title}": ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        setSaving(false);
        return;
      }
    }
    localStorage.removeItem(LS_KEY_EVENTS);
    router.push("/calendar");
  };

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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Extract Events</h1>
            <p className="text-sm text-muted-foreground">
              Paste text and let AI extract your events
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {saveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {/* Text input */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle>Event Text</CardTitle>
            </div>
            <CardDescription>
              Paste your event notices, emails, or any text containing event
              details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full min-h-[160px] rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 font-mono placeholder:text-muted-foreground resize-y"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Paste your event notices here...

Example:
Team Meeting
January 15, 2026 at 2:00 PM
Conference Room B

Birthday Party
Feb 20, 2026
123 Main Street`}
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label>AI Model</Label>
                {loading ? (
                  <InlineLoading text="Loading models..." />
                ) : (
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                    >
                      <span>
                        {models.find((m) => m.id === selectedModel)?.name ||
                          "Select a model"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                          Recommended
                        </div>
                        {models
                          .filter((m) => RECOMMENDED_MODEL_IDS.includes(m.id))
                          .map((model) => (
                            <div
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${
                                selectedModel === model.id
                                  ? "bg-primary/10 font-medium"
                                  : ""
                              }`}
                            >
                              {model.name}
                              <span className="text-xs text-muted-foreground ml-2">
                                ({model.context} context)
                              </span>
                            </div>
                          ))}

                        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-t border-input">
                          All AI Models
                        </div>
                        {models
                          .filter(
                            (m) => !RECOMMENDED_MODEL_IDS.includes(m.id),
                          )
                          .map((model) => (
                            <div
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${
                                selectedModel === model.id
                                  ? "bg-primary/10 font-medium"
                                  : ""
                              }`}
                            >
                              {model.name}
                              <span className="text-xs text-muted-foreground ml-2">
                                ({model.context} context)
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExtract}
                  disabled={
                    loading ||
                    !selectedModel ||
                    (!extracting && !text.trim())
                  }
                  variant={extracting ? "destructive" : "default"}
                >
                  {extracting ? "Cancel" : "Extract"}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {extractedEvents.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle>
                    Results ({extractedEvents.length} event
                    {extractedEvents.length > 1 ? "s" : ""})
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEvents}
                >
                  Clear All
                </Button>
              </div>
              <CardDescription>
                Review the AI results before saving them to your calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExtractedEvents
                events={extractedEvents}
                onClear={handleCancelEvents}
                hideActionBar
              />
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  onClick={handleSaveAllEvents}
                  disabled={saving || extractedEvents.length === 0}
                  className="flex-1"
                >
                  {saving
                    ? "Saving..."
                    : `Save All ${extractedEvents.length} Event${extractedEvents.length > 1 ? "s" : ""}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEvents}
                >
                  Discard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
