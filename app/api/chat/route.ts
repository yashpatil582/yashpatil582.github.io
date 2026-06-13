import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

import { getChatModel, resolveModelChain } from "@/lib/ai/llm";
import { buildContextBlock, buildSystemPrompt } from "@/lib/ai/prompt";
import { documentCount, retrieve } from "@/lib/ai/retrieve";
import { chatRequestSchema, latestUserText, trimToUserStart } from "@/lib/ai/validate";
import type { ChatSource, ChatUIMessage } from "@/lib/chat-types";
import { getClientIp } from "@/lib/security/client-ip";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";

// pg + in-process embeddings need Node; this route must never be statically cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const HISTORY_LIMIT = 12; // ~6 turns of context handed to the model

function fail(code: string, message: string, status: number, headers?: HeadersInit): Response {
  return Response.json({ error: { code, message } }, { status, headers });
}

export async function POST(req: Request): Promise<Response> {
  // --- Security pipeline (fail fast, cheapest checks first) ---

  // 1. Content type
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return fail("unsupported_media_type", "Send application/json.", 415);
  }

  // 2. Origin/Referer allow-list
  if (!isAllowedOrigin(req)) {
    return fail("forbidden_origin", "Request origin not allowed.", 403);
  }

  // 3. Body shape
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("bad_request", "Invalid JSON body.", 400);
  }
  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) return fail("bad_request", "Malformed chat request.", 400);

  const allMessages = (json as { messages: UIMessage[] }).messages;
  const recent = trimToUserStart(allMessages.slice(-HISTORY_LIMIT));
  const query = latestUserText(recent);
  if (!query) return fail("bad_request", "No user message to answer.", 400);

  const ip = getClientIp(req);

  // 4. Turnstile, verified server-side
  if (!(await verifyTurnstile(parsed.data.turnstileToken ?? "", ip))) {
    return fail("turnstile_failed", "Bot check failed. Refresh and try again.", 403);
  }

  // 5. Per-IP + global rate limits (Postgres counters)
  const rl = await checkRateLimits(ip);
  if (!rl.ok) {
    return fail("rate_limited", "You're sending messages too fast. Try again shortly.", 429, {
      "Retry-After": String(rl.retryAfter ?? 60),
    });
  }

  // 6. Model allow-list — the server picks the model, never the client
  const modelChain = resolveModelChain();
  if (modelChain.length === 0) {
    return fail("model_not_allowed", "No allowed model is configured.", 400);
  }

  // 7. Retrieve grounding context
  let sources;
  try {
    sources = await retrieve(query, 6);
  } catch (err) {
    console.error("[chat] retrieval failed", err);
    return fail("retrieval_error", "Search is temporarily unavailable.", 503);
  }
  if (sources.length === 0 && (await documentCount()) === 0) {
    return fail(
      "index_not_ready",
      "The knowledge index isn't built yet. Run `pnpm db:reset`.",
      503,
    );
  }

  // 8. Build model input (before streaming, so failures return a clean 400)
  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(recent as ChatUIMessage[]);
  } catch {
    return fail("bad_request", "Could not parse the conversation.", 400);
  }

  const system = `${buildSystemPrompt()}\n\n${buildContextBlock(sources)}`;
  const maxOutputTokens = Math.min(Number(process.env.MAX_OUTPUT_TOKENS ?? 512) || 512, 1024);
  // Display only the 3 highest-scoring citations (sources is already ordered by
  // similarity, highest first). The model still grounds on the full retrieved set.
  const sourcePayload: ChatSource[] = sources.slice(0, 3).map((s) => ({
    label: s.label,
    anchor: s.anchor,
    snippet: s.content.length > 160 ? `${s.content.slice(0, 157)}…` : s.content,
  }));

  // --- Stream: sources first, then token deltas with primary → fallback ---
  const stream = createUIMessageStream<ChatUIMessage>({
    onError: (err) => {
      console.error("[chat] stream error", err);
      return "Something went wrong generating a response.";
    },
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      // RAG citations arrive immediately so the UI can render source chips.
      writer.write({ type: "data-sources", id: "sources", data: sourcePayload });

      const id = "answer";
      let produced = false;

      for (const modelId of modelChain) {
        try {
          const result = streamText({
            model: getChatModel(modelId),
            system,
            messages: modelMessages,
            maxOutputTokens,
            temperature: 0.3,
            abortSignal: req.signal,
            maxRetries: 1,
          });
          for await (const delta of result.textStream) {
            if (!produced) {
              writer.write({ type: "text-start", id });
              produced = true;
            }
            writer.write({ type: "text-delta", id, delta });
          }
          if (produced) {
            writer.write({ type: "text-end", id });
            break;
          }
          // No tokens but no throw — fall through to the next model.
        } catch (err) {
          console.error(`[chat] model ${modelId} failed`, err);
          if (produced) {
            // Partial answer already streamed — close it; don't duplicate with fallback.
            writer.write({ type: "text-end", id });
            break;
          }
          // Otherwise try the next model in the chain.
        }
      }

      // Every model unavailable before producing output → graceful degradation.
      if (!produced) {
        writer.write({ type: "text-start", id });
        writer.write({
          type: "text-delta",
          id,
          delta: "Chat's seeing high demand right now — please try again in a moment.",
        });
        writer.write({ type: "text-end", id });
      }

      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
