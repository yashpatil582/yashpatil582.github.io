"use client";

import * as React from "react";

import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatUIMessage } from "@/lib/chat-types";

/** Scrollable transcript. Announces streamed text and autoscrolls only when the
 *  user is already pinned to the bottom (so reading earlier messages isn't yanked). */
export function MessageList({
  messages,
  streaming,
}: {
  messages: ChatUIMessage[];
  streaming: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const pinned = React.useRef(true);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (pinned.current) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streaming]);

  const lastIndex = messages.length - 1;

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Conversation with Yash's AI"
      aria-live="polite"
      aria-relevant="additions text"
      className="max-h-[min(60vh,28rem)] space-y-4 overflow-y-auto overscroll-contain pr-1"
    >
      {messages.map((m, i) => (
        <MessageBubble
          key={m.id}
          message={m}
          streaming={streaming && i === lastIndex && m.role === "assistant"}
        />
      ))}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
