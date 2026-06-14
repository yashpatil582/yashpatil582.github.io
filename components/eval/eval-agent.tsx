"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";

import { EvalResults } from "@/components/eval/eval-results";
import { NoteInput } from "@/components/eval/note-input";
import { TurnstileGate, type TurnstileGateRef } from "@/components/chat/turnstile-gate";
import type { EvalExtraction, EvalProgress, EvalResult, EvalUIMessage } from "@/lib/eval-types";

// The server returns friendly, user-safe error messages; surface them as toasts.
function friendlyError(error: Error): string {
  const message = error.message?.trim();
  if (!message || /fetch|network|load failed|terminated/i.test(message)) {
    return "Network hiccup — check your connection and try again.";
  }
  return message;
}

// Surface the server's `{ error: { message } }` as the thrown Error message.
const transport = new DefaultChatTransport<EvalUIMessage>({
  api: "/api/eval",
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

/** Pull the latest progress / extraction / result data parts off the assistant message. */
function readParts(message: EvalUIMessage | undefined) {
  let progress: EvalProgress | undefined;
  let extraction: EvalExtraction | undefined;
  let result: EvalResult | undefined;
  if (message) {
    for (const p of message.parts) {
      if (p.type === "data-progress") progress = p.data;
      else if (p.type === "data-extraction") extraction = p.data;
      else if (p.type === "data-result") result = p.data;
    }
  }
  return { progress, extraction, result };
}

export function EvalAgent() {
  const turnstile = React.useRef<TurnstileGateRef>(null);
  const [note, setNote] = React.useState("");

  const { messages, sendMessage, setMessages, status, stop } = useChat<EvalUIMessage>({
    transport,
    onError: (err) => toast.error(friendlyError(err)),
  });

  const isBusy = status === "submitted" || status === "streaming";

  const send = React.useCallback(async () => {
    const value = note.trim();
    if (!value || isBusy) return;

    // Mint a fresh single-use Turnstile token per send.
    const token = await turnstile.current?.getToken();
    if (token == null) {
      toast.error("Bot check failed. Refresh and try again.");
      return;
    }

    // Single-shot: drop any prior run (and the note it carried) before the new one.
    setMessages([]);
    await sendMessage({ text: value }, { body: { turnstileToken: token } });
  }, [note, isBusy, sendMessage, setMessages]);

  const assistant = [...messages].reverse().find((m) => m.role === "assistant");
  const { progress, extraction, result } = readParts(assistant);
  const hasRun = messages.length > 0;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <NoteInput
        note={note}
        onNoteChange={setNote}
        onSubmit={send}
        onStop={stop}
        disabled={isBusy}
        streaming={isBusy}
      />

      {hasRun && (
        <EvalResults
          progress={progress}
          extraction={extraction}
          result={result}
          streaming={isBusy}
        />
      )}

      <TurnstileGate ref={turnstile} />
    </div>
  );
}
