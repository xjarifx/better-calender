"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TourStep = {
  target: string;
  title: string;
  description: string;
};

const TOUR_STORAGE_KEY = "onboarding-complete";

const steps: TourStep[] = [
  {
    target: "sidebar",
    title: "Navigate from the sidebar",
    description:
      "Use this panel to switch between your calendar, event input, events, and settings.",
  },
  {
    target: "calendar",
    title: "Work from the month calendar",
    description:
      "This center view is the main workspace for checking dates and moving events around.",
  },
];

function getTargetRect(target: string) {
  if (typeof window === "undefined") return null;

  const element = document.querySelector(`[data-tour="${target}"]`);
  if (!element) return null;

  return element.getBoundingClientRect();
}

export default function OnboardingTour() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[stepIndex];

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setIsVisible(false);
      return;
    }

    const alreadyCompleted =
      window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    if (!alreadyCompleted) {
      setStepIndex(0);
      setIsVisible(true);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isVisible) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      setTargetRect(getTargetRect(currentStep.target));
    };

    updateTargetRect();

    const rafId = window.requestAnimationFrame(updateTargetRect);
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [currentStep.target, isVisible]);

  const tooltipPosition = useMemo(() => {
    if (!targetRect) return null;

    const preferredTop = targetRect.bottom + 18;
    const preferredLeft = targetRect.left;
    const maxLeft =
      typeof window !== "undefined" ? window.innerWidth - 332 : preferredLeft;
    const maxTop =
      typeof window !== "undefined" ? window.innerHeight - 240 : preferredTop;

    return {
      top: Math.max(16, Math.min(preferredTop, maxTop)),
      left: Math.max(16, Math.min(preferredLeft, maxLeft)),
    };
  }, [targetRect]);

  if (!isMounted || !isVisible || !currentStep) return null;

  const isFinalStep = stepIndex === steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-950/72 backdrop-blur-sm" />

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-3xl border border-primary/70 bg-primary/5 shadow-[0_0_0_9999px_rgba(2,6,23,0.72),0_0_0_2px_rgba(96,165,250,0.25),0_0_38px_rgba(99,102,241,0.45)] transition-all duration-300"
          style={{
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        />
      )}

      <div
        className="absolute w-[320px] rounded-3xl border border-white/10 bg-slate-950/95 p-5 text-sm text-slate-100 shadow-2xl"
        style={{
          top: tooltipPosition?.top ?? 24,
          left: tooltipPosition?.left ?? 24,
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
              Quick tour
            </p>
            <h2 className="mt-1 text-base font-semibold text-white">
              {currentStep.title}
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300">
            {stepIndex + 1}/{steps.length}
          </span>
        </div>

        <p className="leading-6 text-slate-300">{currentStep.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <span
                key={step.target}
                className={cn(
                  "h-2.5 w-2.5 rounded-full border transition-all duration-200",
                  index === stepIndex
                    ? "border-primary bg-primary"
                    : "border-white/20 bg-white/10",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={completeTour}
            >
              Skip
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (isFinalStep) {
                  completeTour();
                  return;
                }

                setStepIndex((current) => current + 1);
              }}
            >
              {isFinalStep ? "Got it" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
