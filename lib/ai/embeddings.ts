import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

/**
 * Provider-agnostic embeddings adapter. Default = an OPEN model run in-process
 * (transformers.js / bge-small-en-v1.5, 384-dim) so the project stays key-free
 * and reproducible: clone → one command → running. A hosted open model is a
 * one-line swap via EMBEDDINGS_PROVIDER, kept behind this same interface.
 *
 * Both ingest (scripts/ingest.ts) and the runtime query path use this adapter,
 * so the document and query vectors always live in the same space.
 */
export interface Embedder {
  /** Embed corpus documents (no instruction prefix). */
  embedDocuments(texts: string[]): Promise<number[][]>;
  /** Embed a single search query (BGE retrieval instruction prefix applied). */
  embedQuery(text: string): Promise<number[]>;
  readonly dimension: number;
}

export const EMBEDDING_DIMENSION = 384;

// BGE retrieval models expect queries — not documents — to carry this prefix.
// Skipping it silently degrades recall, so it lives in one place.
const QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: ";

const DEFAULT_MODEL = "Xenova/bge-small-en-v1.5";

// ---- Local in-process embedder (default) -----------------------------------

// Cache the (async) pipeline on globalThis so Next.js hot-reloads and repeated
// script runs don't reload the ~30MB ONNX model.
declare global {
  var __embedPipeline: Promise<FeatureExtractionPipeline> | undefined;
}

function getPipeline(): Promise<FeatureExtractionPipeline> {
  // Pull weights from the HF hub cache; never look for a local ./models dir.
  env.allowLocalModels = false;
  if (!globalThis.__embedPipeline) {
    const model = process.env.EMBEDDINGS_MODEL ?? DEFAULT_MODEL;
    globalThis.__embedPipeline = pipeline("feature-extraction", model);
  }
  return globalThis.__embedPipeline;
}

async function embedLocal(texts: string[]): Promise<number[][]> {
  const pipe = await getPipeline();
  const output = await pipe(texts, { pooling: "mean", normalize: true });
  // For [N, dim] mean-pooled, normalized output, tolist() is number[][]. The
  // tensor's tolist() return type is intentionally loose, so we assert the shape.
  return output.tolist() as number[][];
}

const localEmbedder: Embedder = {
  dimension: EMBEDDING_DIMENSION,
  embedDocuments: (texts) => embedLocal(texts),
  async embedQuery(text) {
    const [vector] = await embedLocal([QUERY_INSTRUCTION + text]);
    return vector;
  },
};

// ---- Hosted open embedder (optional swap) ----------------------------------
// Uses the HF Inference API for the SAME open model so the 384-dim space (and
// the vector(384) column) stays valid. Set EMBEDDINGS_PROVIDER=hosted + HF_API_TOKEN.

function l2normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

async function embedHosted(texts: string[]): Promise<number[][]> {
  const token = process.env.HF_API_TOKEN;
  if (!token) throw new Error("EMBEDDINGS_PROVIDER=hosted requires HF_API_TOKEN.");
  const model = process.env.EMBEDDINGS_MODEL?.replace(/^Xenova\//, "") ?? "BAAI/bge-small-en-v1.5";
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
  });
  if (!res.ok) throw new Error(`Hosted embeddings failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as number[][];
  return data.map(l2normalize);
}

const hostedEmbedder: Embedder = {
  dimension: EMBEDDING_DIMENSION,
  embedDocuments: (texts) => embedHosted(texts),
  async embedQuery(text) {
    const [vector] = await embedHosted([QUERY_INSTRUCTION + text]);
    return vector;
  },
};

export function getEmbedder(): Embedder {
  return process.env.EMBEDDINGS_PROVIDER === "hosted" ? hostedEmbedder : localEmbedder;
}

/** Format a JS number[] as a pgvector literal, e.g. "[0.1,0.2,...]". */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
