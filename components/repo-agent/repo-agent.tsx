"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";

import { RepoInput } from "@/components/repo-agent/repo-input";
import { ToolTimeline } from "@/components/repo-agent/tool-timeline";
import { TurnstileGate, type TurnstileGateRef } from "@/components/chat/turnstile-gate";
import type { RepoAgentUIMessage } from "@/lib/repo-agent-types";
import { cn } from "@/lib/utils";

const DEFAULT_QUESTION =
  "What does this repository do, and how is it structured? Cover its purpose, the main entry points, and how the pieces fit together.";

function friendlyError(error: Error): string {
  const message = error.message?.trim();
  if (!message || /fetch|network|load failed|terminated/i.test(message)) {
    return "Network hiccup — check your connection and try again.";
  }
  return message;
}

// Surface the server's `{ error: { message } }` as the thrown Error message.
const transport = new DefaultChatTransport<RepoAgentUIMessage>({
  api: "/api/repo-agent",
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

function getText(parts: UIMessage["parts"]): string {
  let text = "";
  for (const p of parts) if (p.type === "text") text += p.text;
  return text;
}

export function RepoAgent() {
  const turnstile = React.useRef<TurnstileGateRef>(null);
  const [repoUrl, setRepoUrl] = React.useState("");
  const [question, setQuestion] = React.useState("");

  const { messages, sendMessage, status, stop } = useChat<RepoAgentUIMessage>({
    transport,
    onError: (err) => toast.error(friendlyError(err)),
  });

  const isBusy = status === "submitted" || status === "streaming";

  const send = React.useCallback(async () => {
    const repo = repoUrl.trim();
    if (!repo || isBusy) return;

    const token = await turnstile.current?.getToken();
    if (token == null) {
      toast.error("Bot check failed. Refresh and try again.");
      return;
    }

    await sendMessage(
      { text: question.trim() || DEFAULT_QUESTION },
      { body: { repoUrl: repo, turnstileToken: token } },
    );
  }, [repoUrl, question, isBusy, sendMessage]);

  const lastId = messages.at(-1)?.id;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <RepoInput
        repoUrl={repoUrl}
        onRepoUrlChange={setRepoUrl}
        question={question}
        onQuestionChange={setQuestion}
        onSubmit={send}
        onStop={stop}
        disabled={isBusy}
        streaming={isBusy}
      />

      {messages.length > 0 && (
        <div className="flex flex-col gap-4">
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <p key={m.id} className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">Asked:</span> {getText(m.parts)}
                </p>
              );
            }
            const text = getText(m.parts);
            const streaming = isBusy && m.id === lastId;
            return (
              <div
                key={m.id}
                className="border-border bg-background rounded-xl border p-4 text-sm leading-relaxed"
              >
                <ToolTimeline parts={m.parts} />
                {text.length > 0 ? (
                  <p className="text-foreground text-pretty whitespace-pre-wrap">
                    {text}
                    {streaming && (
                      <span
                        aria-hidden
                        className="bg-brand ml-0.5 inline-block h-[1em] w-px translate-y-[0.1em] animate-pulse"
                      />
                    )}
                  </p>
                ) : (
                  <p className={cn("text-muted-foreground", streaming && "animate-pulse")}>
                    {streaming ? "Exploring the repository…" : "No answer was produced."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TurnstileGate ref={turnstile} />
    </div>
  );
}
