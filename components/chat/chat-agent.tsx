"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";

import { Composer } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { Suggestions } from "@/components/chat/suggestions";
import { TurnstileGate, type TurnstileGateRef } from "@/components/chat/turnstile-gate";
import type { ChatUIMessage } from "@/lib/chat-types";

// The server already returns friendly, user-safe error messages; surface them as
// toasts. Only network-level failures (no response) need a generic fallback.
function friendlyError(error: Error): string {
  const message = error.message?.trim();
  if (!message || /fetch|network|load failed|terminated/i.test(message)) {
    return "Network hiccup — check your connection and try again.";
  }
  return message;
}

// Custom fetch surfaces the server's `{ error: { message } }` as the thrown
// Error message, so 429/403/400 reach the UI as readable copy.
const transport = new DefaultChatTransport<ChatUIMessage>({
  api: "/api/chat",
  async fetch(input, init) {
    const res = await fetch(input, init);
    if (!res.ok) {
      let message = `Request failed (${res.status}).`;
      try {
        const body = (await res.clone().json()) as { error?: { message?: string } };
        if (body?.error?.message) message = body.error.message;
      } catch {
        // non-JSON error body — keep the status message
      }
      throw new Error(message);
    }
    return res;
  },
});

export function ChatAgent({ suggestions }: { suggestions: string[] }) {
  const turnstile = React.useRef<TurnstileGateRef>(null);
  const [input, setInput] = React.useState("");

  const { messages, sendMessage, status, error, stop } = useChat<ChatUIMessage>({
    transport,
    onError: (err) => toast.error(friendlyError(err)),
  });

  const isBusy = status === "submitted" || status === "streaming";

  const send = React.useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || isBusy) return;

      // Mint a fresh single-use Turnstile token per send.
      const token = await turnstile.current?.getToken();
      if (token == null) {
        toast.error("Bot check failed. Refresh and try again.");
        return;
      }

      setInput("");
      await sendMessage({ text: value }, { body: { turnstileToken: token } });
    },
    [isBusy, sendMessage],
  );

  return (
    <div className="mt-6">
      {messages.length === 0 ? (
        <Suggestions items={suggestions} onPick={send} disabled={isBusy} />
      ) : (
        <MessageList messages={messages} streaming={isBusy} />
      )}

      {error && (
        <p role="status" className="text-muted-foreground mt-3 text-sm">
          That request didn&apos;t go through. Please try again.
        </p>
      )}

      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send(input)}
        onStop={stop}
        disabled={isBusy}
        streaming={isBusy}
      />

      <TurnstileGate ref={turnstile} />
    </div>
  );
}
