import { createUIMessageStream, createUIMessageStreamResponse, generateObject } from "ai";

import {
  buildExtractionPrompt,
  buildExtractionSystemPrompt,
  buildGroundingPrompt,
  buildGroundingSystemPrompt,
  computeScore,
  ExtractionSchema,
  type ExtractionObject,
  flattenToClaims,
  getEvalMaxOutputTokens,
  GroundingSchema,
  type GroundingObject,
  reconcileVerdicts,
} from "@/lib/ai/eval";
import { getChatModel, resolveModelChain } from "@/lib/ai/llm";
import { evalRequestSchema, latestUserText } from "@/lib/ai/validate";
import { fail } from "@/lib/api/errors";
import {
  type EvalExtraction,
  type EvalResult,
  SCORE_FORMULA,
  type EvalUIMessage,
} from "@/lib/eval-types";
import { getClientIp } from "@/lib/security/client-ip";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";

// PRIVACY (hard rule): the clinical note is SENSITIVE. It is held in memory for the
// duration of this request only — NEVER logged, persisted, cached, sent to analytics,
// or written to the rate-limit table (which stores IP-keyed counters only). Error logs
// carry a static phase tag + error class name ONLY — never err.message or response
// bodies (the AI SDK embeds the prompt in those). The note + quoted spans return only
// to the same caller over the response stream (Cache-Control: no-store).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

/** Safe error log: phase tag + error class name (+ provider status), never the note/prompt/body. */
function logPhaseError(phase: string, err: unknown): void {
  const name = err instanceof Error ? err.name : typeof err;
  const status = (err as { statusCode?: unknown })?.statusCode;
  console.error(`[eval] ${phase} failed`, typeof status === "number" ? { name, status } : { name });
}

export async function POST(req: Request): Promise<Response> {
  // --- Security pipeline (same fail-fast order as /api/chat + /api/repo-agent) ---

  // 1. Content type
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return fail("unsupported_media_type", "Send application/json.", 415);
  }

  // 2. Origin/Referer allow-list
  if (!isAllowedOrigin(req)) {
    return fail("forbidden_origin", "Request origin not allowed.", 403);
  }

  // 3. Body shape (do NOT log parse errors — they can echo the input)
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail("bad_request", "Invalid JSON body.", 400);
  }
  const parsed = evalRequestSchema.safeParse(json);
  if (!parsed.success) return fail("bad_request", "Malformed request.", 400);

  // 4. The note rides as the latest user turn (single-shot).
  const note = latestUserText(
    (json as { messages: { role: string; parts?: { type: string; text?: unknown }[] }[] }).messages,
  ).trim();
  if (!note) return fail("bad_request", "Paste a note to evaluate.", 400);

  const ip = getClientIp(req);

  // 5. Turnstile, verified server-side
  if (!(await verifyTurnstile(parsed.data.turnstileToken ?? "", ip))) {
    return fail("turnstile_failed", "Bot check failed. Refresh and try again.", 403);
  }

  // 6. Rate limits — tighter per-IP (two model passes per request), own global sub-cap.
  const rl = await checkRateLimits(ip, {
    scope: "eval",
    perIpMin: Number(process.env.RL_EVAL_PER_IP_PER_MIN) || 2,
    perIpDay: Number(process.env.RL_EVAL_PER_IP_PER_DAY) || 15,
    globalDailyCap: Number(process.env.RL_EVAL_GLOBAL_DAILY) || 120,
  });
  if (!rl.ok) {
    return fail("rate_limited", "Too many evaluations right now. Try again shortly.", 429, {
      "Retry-After": String(rl.retryAfter ?? 60),
    });
  }

  // 7. Model allow-list — the server picks the models, never the client. Both passes
  //    use the same primary → fallback chain. (Of the default open-weight models, only
  //    gpt-oss does reliable structured output on Groq; the rigor of the grounding pass
  //    is its independent context + the CODE-side span verification below, not model
  //    diversity — which a config with a second json_schema-capable model would add.)
  const modelChain = resolveModelChain();
  if (modelChain.length === 0) {
    return fail("model_not_allowed", "No allowed model is configured.", 400);
  }

  const maxOutputTokens = getEvalMaxOutputTokens();
  // Per-model Groq options. gpt-oss supports strict json_schema, so we keep that and
  // just curb its runaway reasoning (reasoning-only options). Other open-weight models
  // (e.g. llama-3.3) DON'T support json_schema on Groq — they 400 — so we drop to
  // json_object mode (the prompt contains the word "JSON", which json_object requires).
  // generateObject still validates the result against the Zod schema either way, so the
  // fallback model is a genuine safety net, not just a json_schema-only path.
  const groqOptionsFor = (modelId: string) =>
    /gpt-oss/i.test(modelId)
      ? { groq: { reasoningEffort: "low", reasoningFormat: "hidden" } }
      : { groq: { structuredOutputs: false } };

  // --- Stream: progress + structured extraction + scored result, with fallback ---
  const stream = createUIMessageStream<EvalUIMessage>({
    onError: (err) => {
      logPhaseError("stream", err);
      return "Something went wrong evaluating that note.";
    },
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({
        type: "data-progress",
        id: "progress",
        data: { stage: "extracting", model: null },
      });

      // ---- Pass 1: structured extraction (primary → fallback) ----
      let extraction: ExtractionObject | null = null;
      let extractedBy = "";
      for (const modelId of modelChain) {
        try {
          const { object } = await generateObject({
            model: getChatModel(modelId),
            schema: ExtractionSchema,
            schemaName: "clinical_extraction",
            schemaDescription:
              "Problems, medications, and plan items explicitly stated in the note.",
            system: buildExtractionSystemPrompt(),
            prompt: buildExtractionPrompt(note),
            maxOutputTokens,
            temperature: 0,
            maxRetries: 1,
            abortSignal: req.signal,
            providerOptions: groqOptionsFor(modelId),
          });
          extraction = object;
          extractedBy = modelId;
          break;
        } catch (err) {
          logPhaseError(`extraction model ${modelId}`, err);
        }
      }

      if (!extraction) {
        // Every model failed before producing an extraction → graceful, no 500.
        writer.write({
          type: "data-progress",
          id: "progress",
          data: { stage: "error", model: null },
        });
        writer.write({ type: "finish" });
        return;
      }

      const claims = flattenToClaims(extraction);
      const extractionPart: EvalExtraction = {
        problems: extraction.problems,
        medications: extraction.medications,
        plan: extraction.plan,
        claims,
        model: extractedBy,
      };
      writer.write({ type: "data-extraction", id: "extraction", data: extractionPart });

      // No verifiable claims → nothing to ground; emit a zero-claim result (score null).
      if (claims.length === 0) {
        writer.write({
          type: "data-progress",
          id: "progress",
          data: { stage: "scoring", model: null },
        });
        const empty: EvalResult = {
          verdicts: [],
          counts: { grounded: 0, partial: 0, unsupported: 0, total: 0 },
          score: null,
          formula: SCORE_FORMULA,
          extractedBy,
          gradedBy: extractedBy,
        };
        writer.write({ type: "data-result", id: "result", data: empty });
        writer.write({
          type: "data-progress",
          id: "progress",
          data: { stage: "done", model: null },
        });
        writer.write({ type: "finish" });
        return;
      }

      // ---- Pass 2: grounding (a separate pass with independent context) ----
      writer.write({
        type: "data-progress",
        id: "progress",
        data: { stage: "grounding", model: modelChain[0] },
      });
      let modelVerdicts: GroundingObject["verdicts"] | null = null;
      let gradedBy = "";
      for (const modelId of modelChain) {
        try {
          const { object } = await generateObject({
            model: getChatModel(modelId),
            schema: GroundingSchema,
            schemaName: "per_claim_grounding",
            schemaDescription:
              "One grounding verdict per claim id, with a verbatim supporting span or null.",
            system: buildGroundingSystemPrompt(),
            prompt: buildGroundingPrompt(note, claims),
            maxOutputTokens,
            temperature: 0,
            maxRetries: 1,
            abortSignal: req.signal,
            providerOptions: groqOptionsFor(modelId),
          });
          modelVerdicts = object.verdicts;
          gradedBy = modelId;
          break;
        } catch (err) {
          logPhaseError(`grounding model ${modelId}`, err);
        }
      }

      if (!modelVerdicts) {
        // Extraction succeeded but grading failed on every model → show extraction,
        // signal the grounding step is unavailable (don't fabricate a 0% score).
        writer.write({
          type: "data-progress",
          id: "progress",
          data: { stage: "error", model: null },
        });
        writer.write({ type: "finish" });
        return;
      }

      // ---- Scoring: deterministic, in code (span-verified, never model-emitted) ----
      writer.write({
        type: "data-progress",
        id: "progress",
        data: { stage: "scoring", model: null },
      });
      const verdicts = reconcileVerdicts(claims, modelVerdicts, note);
      const { counts, score } = computeScore(verdicts);
      const result: EvalResult = {
        verdicts,
        counts,
        score,
        formula: SCORE_FORMULA,
        extractedBy,
        gradedBy,
      };
      writer.write({ type: "data-result", id: "result", data: result });
      writer.write({ type: "data-progress", id: "progress", data: { stage: "done", model: null } });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream, headers: { "Cache-Control": "no-store" } });
}
