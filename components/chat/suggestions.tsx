/** Clickable starter questions shown in the empty state (prefill + send). */
export function Suggestions({
  items,
  onPick,
  disabled,
}: {
  items: string[];
  onPick: (question: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">Try asking…</p>
      <div className="flex flex-col items-start gap-2">
        {items.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q)}
            className="border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-fit max-w-full rounded-2xl border px-4 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
