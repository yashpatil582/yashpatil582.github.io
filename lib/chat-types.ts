import type { UIMessage } from "ai";

/** A retrieved RAG citation shown as a chip in the UI. */
export interface ChatSource {
  /** Human label, e.g. "Repomind" or "Tip Top Technologies — Founding AI Engineer". */
  label: string;
  /** Section anchor to scroll to, e.g. "#projects". */
  anchor: string;
  /** Short snippet for the chip tooltip. */
  snippet: string;
}

/** Names → data payloads for our custom UI-message data parts. */
export type ChatDataParts = {
  sources: ChatSource[];
};

/** UIMessage typed with the RAG `data-sources` part (used by the route + useChat). */
export type ChatUIMessage = UIMessage<never, ChatDataParts>;
