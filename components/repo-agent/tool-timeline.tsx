"use client";

import { Check, X } from "lucide-react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";

import { describeToolStep } from "@/lib/repo-agent-types";
import { cn } from "@/lib/utils";

type Part = UIMessage["parts"][number];

/**
 * Live timeline of the agent's MCP tool calls, rendered straight from the
 * streamed message parts so each step appears as it happens. Animations respect
 * prefers-reduced-motion (handled globally in globals.css).
 */
export function ToolTimeline({ parts }: { parts: Part[] }) {
  const steps = parts.filter(isToolUIPart);
  if (steps.length === 0) return null;

  return (
    <ol className="border-border/70 mb-3 flex flex-col gap-2 border-l pl-4">
      {steps.map((part) => {
        const name = getToolName(part);
        const label = describeToolStep(name, "input" in part ? part.input : undefined);
        const state = part.state;
        const isError = state === "output-error";
        const isDone = state === "output-available";
        const isRunning = !isDone && !isError;

        return (
          <li key={part.toolCallId} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden
              className={cn(
                "relative -ml-[1.4rem] flex size-4 shrink-0 items-center justify-center rounded-full border",
                isError
                  ? "border-destructive/50 bg-destructive/15 text-destructive"
                  : isDone
                    ? "border-brand/50 bg-brand/15 text-brand"
                    : "border-brand/40 bg-background text-brand",
              )}
            >
              {isError ? (
                <X className="size-2.5" />
              ) : isDone ? (
                <Check className="size-2.5" />
              ) : (
                <span className="bg-brand size-1.5 animate-pulse rounded-full" />
              )}
            </span>
            <span className={cn(isRunning ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
