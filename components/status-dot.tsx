import { cn } from "@/lib/utils";

/**
 * Small status indicator: a solid dot with an optional pulsing ring. Pure CSS
 * (`animate-ping`), so the global prefers-reduced-motion block freezes it. Uses
 * the quiet "ok" status hue by default. Server-renderable (no hooks).
 */
export function StatusDot({ className, pulse = true }: { className?: string; pulse?: boolean }) {
  return (
    <span aria-hidden className={cn("relative flex size-2", className)}>
      {pulse && (
        <span className="bg-status-ok/60 absolute inline-flex h-full w-full animate-ping rounded-full" />
      )}
      <span className="bg-status-ok relative inline-flex size-2 rounded-full" />
    </span>
  );
}
