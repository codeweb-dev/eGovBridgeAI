"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export interface ReasoningStep {
  label: string;
  status: "pending" | "running" | "done";
}

/**
 * What the tool is actually doing, one marker per step. Statuses come from real
 * state — nothing here is on a timer.
 */
export function Reasoning({ steps }: { steps: ReasoningStep[] }) {
  return (
    <div className="space-y-1.5 border-l pl-3">
      {steps.map((step) => (
        <Marker key={step.label} role="status">
          <MarkerIcon>
            {step.status === "running" ? (
              <Spinner />
            ) : step.status === "done" ? (
              <Check className="text-primary" />
            ) : (
              <span className="block size-1.5 translate-x-1 translate-y-1 rounded-full bg-border" />
            )}
          </MarkerIcon>
          <MarkerContent
            className={cn(
              "text-xs",
              step.status === "running" && "shimmer",
              step.status === "pending" && "text-muted-foreground/50",
            )}
          >
            {step.label}
          </MarkerContent>
        </Marker>
      ))}
    </div>
  );
}

/** Tool-call chrome shared by the assistant's inline tools. */
export function ToolHeader({
  name,
  status,
  label,
}: {
  name: string;
  status: "waiting" | "running" | "done";
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
      <span className="relative flex size-2">
        {status === "running" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${status === "done" ? "bg-primary" : "bg-primary/70"}`}
        />
      </span>
      <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {name}
      </span>
      <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
        {label}
      </span>
    </div>
  );
}
