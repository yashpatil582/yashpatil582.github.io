"use client";

import { ArrowUp, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SAMPLE_NOTES } from "@/lib/eval-samples";

const MAX = 6000;

/**
 * Multi-line clinical-note input with a live character counter and "try a sample"
 * chips. Cmd/Ctrl+Enter submits (plain Enter inserts a newline — notes are multi-line).
 */
export function NoteInput({
  note,
  onNoteChange,
  onSubmit,
  onStop,
  disabled,
  streaming,
}: {
  note: string;
  onNoteChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  disabled: boolean;
  streaming: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <div className="border-border bg-background focus-within:border-ring focus-within:ring-ring/50 rounded-xl border p-2 transition-shadow focus-within:ring-3">
        <label htmlFor="eval-note" className="sr-only">
          Synthetic clinical note to evaluate
        </label>
        <textarea
          id="eval-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={7}
          maxLength={MAX}
          placeholder="Paste a SYNTHETIC clinical note (no real PHI), or pick a sample below…"
          spellCheck={false}
          className="text-foreground placeholder:text-muted-foreground/70 min-h-36 w-full resize-y bg-transparent px-1 py-1 text-sm outline-none"
        />
        <div className="mt-1 flex items-center justify-between gap-2 px-1">
          <span className="text-muted-foreground/60 text-xs tabular-nums">
            {note.length.toLocaleString()} / {MAX.toLocaleString()}
          </span>
          {streaming ? (
            <Button type="button" size="sm" variant="outline" onClick={onStop}>
              <Square /> Stop
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={disabled || note.trim().length === 0}>
              <ArrowUp /> Evaluate note
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground/70 text-xs">Try a sample:</span>
        {SAMPLE_NOTES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onNoteChange(s.note)}
            className="border-border text-muted-foreground hover:bg-muted rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>
    </form>
  );
}
