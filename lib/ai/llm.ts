import { createGroq } from "@ai-sdk/groq";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

/**
 * Provider-agnostic generation adapter. Default = open weights via Groq
 * (OpenAI-compatible). Switching AI_PROVIDER to "openai-compatible" + AI_BASE_URL
 * points the exact same code at any OpenAI-compatible endpoint — including a
 * closed API — as a one-line config change. The route picks the model id; the
 * browser never does.
 */
export const PRIMARY_MODEL = process.env.AI_MODEL ?? "openai/gpt-oss-120b";
export const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL ?? "llama-3.3-70b-versatile";

export function getChatModel(modelId: string): LanguageModel {
  const provider = process.env.AI_PROVIDER ?? "groq";
  switch (provider) {
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY is not set.");
      return createGroq({ apiKey })(modelId);
    }
    case "openai-compatible": {
      const baseURL = process.env.AI_BASE_URL;
      if (!baseURL) throw new Error("AI_BASE_URL is required for AI_PROVIDER=openai-compatible.");
      return createOpenAICompatible({
        name: "custom",
        baseURL,
        apiKey: process.env.OPENAI_API_KEY ?? "",
      })(modelId);
    }
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}

/** The models the server is allowed to use, from MODEL_ALLOWLIST. */
export function allowedModels(): string[] {
  return (process.env.MODEL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Primary first, then fallback — but only those on the allow-list. */
export function resolveModelChain(): string[] {
  const allow = allowedModels();
  const chain = [PRIMARY_MODEL, FALLBACK_MODEL].filter((m, i, a) => a.indexOf(m) === i);
  return allow.length === 0 ? chain : chain.filter((m) => allow.includes(m));
}
