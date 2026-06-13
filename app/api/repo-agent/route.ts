import { createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText } from "ai";

import { getChatModel, resolveModelChain } from "@/lib/ai/llm";
import {
  buildRepoAgentSystemPrompt,
  DEFAULT_REPO_QUESTION,
  getRepoAgentCaps,
  getRepoAgentMaxOutputTokens,
  getRepoAgentMaxSteps,
} from "@/lib/ai/repo-agent";
import { latestUserText, repoAgentRequestSchema } from "@/lib/ai/validate";
import { fail } from "@/lib/api/errors";
import { assertPublicRepo, GitHubError, parseRepoUrl } from "@/lib/mcp/github";
import { bridgeMcpServer } from "@/lib/mcp/bridge";
import { createRepoMcpServer } from "@/lib/mcp/repo-server";
import type { RepoAgentUIMessage } from "@/lib/repo-agent-types";
import { getClientIp } from "@/lib/security/client-ip";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimits } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";

// MCP + GitHub I/O need Node; never statically cache. The agent loop can run a
// few tool round-trips, so allow more wall-clock than the single-shot chat route.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: Request): Promise<Response> {
  // --- Security pipeline (same fail-fast order as /api/chat) ---

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
  const parsed = repoAgentRequestSchema.safeParse(json);
  if (!parsed.success) return fail("bad_request", "Malformed request.", 400);

  // 4. Resolve + host-allow-list the repo (cheap, no I/O yet)
  const ref = parseRepoUrl(parsed.data.repoUrl);
  if (!ref) {
    return fail("invalid_repo_url", "Enter a public GitHub repo, e.g. owner/repo.", 400);
  }

  const question =
    latestUserText((json as { messages: { role: string; parts?: { type: string; text?: unknown }[] }[] }).messages) ||
    DEFAULT_REPO_QUESTION;

  const ip = getClientIp(req);

  // 5. Turnstile, verified server-side
  if (!(await verifyTurnstile(parsed.data.turnstileToken ?? "", ip))) {
    return fail("turnstile_failed", "Bot check failed. Refresh and try again.", 403);
  }

  // 6. Rate limits — tighter per-IP for this heavier route, with its own global
  //    sub-cap, all still under the shared global daily spend backstop.
  const rl = await checkRateLimits(ip, {
    scope: "repo",
    perIpMin: Number(process.env.RL_REPO_PER_IP_PER_MIN ?? 3),
    perIpDay: Number(process.env.RL_REPO_PER_IP_PER_DAY ?? 20),
    globalDailyCap: Number(process.env.RL_REPO_GLOBAL_DAILY ?? 150),
  });
  if (!rl.ok) {
    return fail("rate_limited", "Too many repo explorations right now. Try again shortly.", 429, {
      "Retry-After": String(rl.retryAfter ?? 60),
    });
  }

  // 7. Model allow-list — the server picks the model, never the client
  const modelChain = resolveModelChain();
  if (modelChain.length === 0) {
    return fail("model_not_allowed", "No allowed model is configured.", 400);
  }

  // 8. Confirm the repo is public + get its default branch (also fails fast on a
  //    bad/missing repo or an exhausted GitHub rate limit, before streaming).
  const caps = getRepoAgentCaps();
  let meta;
  try {
    meta = await assertPublicRepo(ref, { signal: req.signal, timeoutMs: caps.perCallTimeoutMs });
  } catch (err) {
    if (err instanceof GitHubError) return fail(err.code, err.message, err.status);
    console.error("[repo-agent] repo lookup failed", err);
    return fail("repo_lookup_failed", "Could not look up that repository.", 502);
  }

  // 9. Stand up the in-process MCP server (scoped to this repo) + bridge to tools
  let bridge;
  try {
    const server = createRepoMcpServer({ ref, meta, caps, signal: req.signal });
    bridge = await bridgeMcpServer(server);
  } catch (err) {
    console.error("[repo-agent] MCP bridge failed", err);
    return fail("agent_unavailable", "The repo agent is temporarily unavailable.", 503);
  }

  const system = buildRepoAgentSystemPrompt(meta);
  const maxOutputTokens = getRepoAgentMaxOutputTokens();
  const maxSteps = getRepoAgentMaxSteps();

  // --- Stream: tool steps + answer, with primary → fallback model chain ---
  const stream = createUIMessageStream<RepoAgentUIMessage>({
    onError: (err) => {
      console.error("[repo-agent] stream error", err);
      return "Something went wrong exploring that repository.";
    },
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      // "Visible" = a real answer delta or a completed tool output. Reasoning or a
      // half-formed tool call doesn't count, so a model that only reasoned and
      // then errored (e.g. a malformed tool name) still falls back cleanly.
      let producedVisible = false;

      try {
        for (const modelId of modelChain) {
          const result = streamText({
            model: getChatModel(modelId),
            system,
            prompt: question,
            tools: bridge.tools,
            stopWhen: stepCountIs(maxSteps),
            maxOutputTokens,
            temperature: 0.2,
            abortSignal: req.signal,
            maxRetries: 1,
          });

          // toUIMessageStream masks a model failure as an "error" chunk rather
          // than throwing, so we swallow that chunk and use it to drive the
          // primary → fallback chain (and a graceful message if all fail).
          let modelErrored = false;
          for await (const chunk of result.toUIMessageStream({
            sendStart: false,
            sendFinish: false,
            onError: (err) => {
              console.error(`[repo-agent] model ${modelId} error`, err);
              return "The model could not complete this request.";
            },
          })) {
            if (chunk.type === "error") {
              modelErrored = true;
              continue; // don't forward the masked error; decide after the stream
            }
            if (chunk.type === "text-delta" || chunk.type === "tool-output-available") {
              producedVisible = true;
            }
            writer.write(chunk);
          }

          if (!modelErrored) break; // clean finish
          if (producedVisible) break; // real output already streamed — don't double up
          // else fall through to the next model in the chain
        }

        if (!producedVisible) {
          const id = "answer";
          writer.write({ type: "text-start", id });
          writer.write({
            type: "text-delta",
            id,
            delta: "The repo agent is seeing high demand right now — please try again in a moment.",
          });
          writer.write({ type: "text-end", id });
        }
      } finally {
        writer.write({ type: "finish" });
        await bridge.close();
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
