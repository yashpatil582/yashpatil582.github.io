"use client";

import * as React from "react";
import { ArrowUp, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Auto-sizing textarea + Send/Stop. Enter sends; Shift+Enter inserts a newline. */
export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  disabled,
  streaming,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  disabled: boolean;
  streaming: boolean;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Grow to fit content up to a cap; no autosize library needed.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      className="border-border bg-background focus-within:border-ring focus-within:ring-ring/50 mt-4 flex items-end gap-2 rounded-xl border p-2 transition-shadow focus-within:ring-3"
    >
      <label htmlFor="chat-input" className="sr-only">
        Ask about Yash&apos;s experience, projects, or stack
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about my experience, projects, or stack…"
        className="text-foreground placeholder:text-muted-foreground/70 max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none"
      />
      {streaming ? (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onStop}
          aria-label="Stop generating"
        >
          <Square />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={disabled || value.trim().length === 0}
          aria-label="Send message"
        >
          <ArrowUp />
        </Button>
      )}
    </form>
  );
}
