import { z } from "zod";

// Light envelope validation: enough to reject garbage and bound size, without
// stripping the AI SDK's UIMessage fields (we hand the ORIGINAL messages to
// convertToModelMessages, not the parsed copy).
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        // Cap each part's text so a single giant text part can't inflate input cost.
        parts: z.array(z.object({ type: z.string(), text: z.string().max(8000).optional() })).max(50),
      }),
    )
    .min(1)
    .max(50),
  turnstileToken: z.string().max(8192).optional(),
});

// Repo-agent envelope: the chat-style message array plus the target repo. The
// repo URL is validated for shape here; host allow-listing + parsing happens in
// the route via parseRepoUrl.
export const repoAgentRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        // Same per-part text cap as chat — one giant text part can't inflate cost.
        parts: z.array(z.object({ type: z.string(), text: z.string().max(8000).optional() })).max(50),
      }),
    )
    .min(1)
    .max(50),
  repoUrl: z.string().min(1).max(300),
  turnstileToken: z.string().max(8192).optional(),
});

export type TextLikePart = { type: string; text?: unknown };
export type MessageLike = { role: string; parts?: TextLikePart[] };

/** Concatenated text of the most recent user turn — drives retrieval. */
export function latestUserText(messages: readonly MessageLike[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user" || !Array.isArray(m.parts)) continue;
    const text = m.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join(" ")
      .trim();
    if (text) return text;
  }
  return "";
}

/** Trim leading assistant turns so the model history starts with a user turn. */
export function trimToUserStart<T extends MessageLike>(messages: T[]): T[] {
  const start = messages.findIndex((m) => m.role === "user");
  return start <= 0 ? messages : messages.slice(start);
}
