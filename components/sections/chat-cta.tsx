import { Lock, MessageSquare, Sparkles } from "lucide-react";

import { Section } from "@/components/section";

const sampleQuestions = [
  "What has Yash shipped to production?",
  "Tell me about the eval / hallucination work.",
  "Which projects use RAG or agents?",
];

/**
 * Placeholder for the flagship "Chat with Yash" RAG agent (Stage 1). It reserves
 * the layout and signals the security posture; the disabled composer is replaced
 * by the live, streaming, rate-limited client in Stage 1.
 */
export function ChatCta() {
  return (
    <Section
      id="chat"
      eyebrow="Ask my AI"
      title="Chat with Yash"
      description="A retrieval-grounded agent that answers questions about my work — running on open-weight models behind a secured proxy. Wiring it up now."
    >
      <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-6 sm:p-8">
        <div
          aria-hidden
          className="bg-glow pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        />

        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Sparkles className="text-brand size-4" /> Open-weight RAG · grounded in this site&apos;s
          content
        </p>

        <div className="mt-6 space-y-3">
          {sampleQuestions.map((q) => (
            <div
              key={q}
              className="border-border bg-background text-muted-foreground w-fit max-w-full rounded-2xl border px-4 py-2 text-sm"
            >
              {q}
            </div>
          ))}
        </div>

        <form className="mt-6 flex items-center gap-2">
          <input
            disabled
            aria-label="Ask a question (coming soon)"
            placeholder="Ask about my experience, projects, or stack…"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground/70 h-11 w-full rounded-xl border px-4 text-sm outline-none disabled:opacity-70"
          />
          <button
            type="button"
            disabled
            className="bg-primary text-primary-foreground inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium opacity-60"
          >
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        <p className="text-muted-foreground/70 mt-3 flex items-center gap-1.5 text-xs">
          <Lock className="size-3 shrink-0" /> Live soon — open-weight model + pgvector RAG through
          a rate-limited, bot-checked proxy. No API keys in the browser.
        </p>
      </div>
    </Section>
  );
}
