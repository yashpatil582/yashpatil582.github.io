import { Lock, Sparkles } from "lucide-react";

import { ChatAgent } from "@/components/chat/chat-agent";
import { Section } from "@/components/section";
import { StatusDot } from "@/components/status-dot";

const sampleQuestions = [
  "What has Yash shipped to production?",
  "Tell me about the eval / hallucination work.",
  "Which projects use RAG or agents?",
];

/**
 * Flagship "Chat with Yash" RAG agent. This server shell owns the section framing
 * and the security footnote; the live, streaming, rate-limited client is
 * <ChatAgent />. It answers only from this site's content, grounded via retrieval.
 */
export function ChatCta() {
  return (
    <Section
      id="chat"
      index="04"
      eyebrow="Ask my AI"
      title="Chat with Yash"
      description="A retrieval-grounded agent that answers questions about my work — running on open-weight models behind a secured proxy."
    >
      <div className="surface-glass surface-glass-lit relative overflow-hidden rounded-2xl p-4 sm:p-6">
        <div
          aria-hidden
          className="bg-glow pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40"
        />

        <div className="border-hairline relative -mx-4 mb-4 flex items-center justify-between gap-2 border-b px-4 pb-3 sm:-mx-6 sm:px-6">
          <span className="label-mono text-muted-foreground">CHAT-RAG</span>
          <span className="label-mono text-muted-foreground inline-flex items-center gap-1.5">
            <StatusDot /> Ready
          </span>
        </div>

        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Sparkles className="text-brand size-4" /> Open-weight RAG · grounded in this site&apos;s
          content
        </p>

        <ChatAgent suggestions={sampleQuestions} />

        <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
          <Lock className="size-3 shrink-0" /> Open-weight model + pgvector RAG through a
          rate-limited, bot-checked proxy. No API keys in the browser.
        </p>
      </div>
    </Section>
  );
}
