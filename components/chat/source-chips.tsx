import { badgeVariants } from "@/components/ui/badge";
import type { ChatSource } from "@/lib/chat-types";
import { cn } from "@/lib/utils";

/** RAG citations for an assistant turn — small pills linking to the section anchor. */
export function SourceChips({ sources }: { sources: ChatSource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="border-border/60 mt-2.5 flex flex-wrap items-center gap-1.5 border-t pt-2.5">
      <span className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">Sources</span>
      {sources.map((s) => (
        <a
          key={`${s.anchor}-${s.label}`}
          href={s.anchor}
          title={s.snippet}
          className={cn(
            badgeVariants({ variant: "outline" }),
            "hover:border-brand/50 hover:text-foreground transition-colors",
          )}
        >
          {s.label}
        </a>
      ))}
    </div>
  );
}
