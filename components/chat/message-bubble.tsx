"use client";

import { SourceChips } from "@/components/chat/source-chips";
import type { ChatSource, ChatUIMessage } from "@/lib/chat-types";
import { cn } from "@/lib/utils";

function getText(parts: ChatUIMessage["parts"]): string {
  let text = "";
  for (const p of parts) if (p.type === "text") text += p.text;
  return text;
}

function getSources(parts: ChatUIMessage["parts"]): ChatSource[] {
  for (const p of parts) if (p.type === "data-sources") return p.data;
  return [];
}

/**
 * One chat turn. `streaming` is true only for the assistant turn currently being
 * generated — it drives the typing dots (pre-token) and the streaming caret.
 */
export function MessageBubble({
  message,
  streaming,
}: {
  message: ChatUIMessage;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  const text = getText(message.parts);
  const sources = getSources(message.parts);
  const showDots = !isUser && streaming && text.length === 0;
  const showCaret = !isUser && streaming && text.length > 0;

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground border-transparent"
            : "border-border bg-background text-foreground",
        )}
      >
        <p className="text-pretty whitespace-pre-wrap">
          {text}
          {showCaret && (
            <span
              aria-hidden
              className="bg-brand ml-0.5 inline-block h-[1em] w-px translate-y-[0.1em] animate-pulse"
            />
          )}
          {showDots && (
            <span aria-hidden className="inline-flex items-center gap-1 align-middle">
              <span className="bg-muted-foreground size-1.5 animate-pulse rounded-full" />
              <span className="bg-muted-foreground size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
              <span className="bg-muted-foreground size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
            </span>
          )}
        </p>

        {!isUser && <SourceChips sources={sources} />}
      </div>
    </div>
  );
}
