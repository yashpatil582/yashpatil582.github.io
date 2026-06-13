import { getEmbedder, toVectorLiteral } from "@/lib/ai/embeddings";
import { getPool } from "@/lib/db/client";

export interface RetrievedSource {
  label: string;
  anchor: string;
  content: string;
  score: number;
}

/**
 * Minimum cosine similarity for a chunk to count as relevant. Tuned against a
 * battery of off-topic vs on-topic queries on this corpus: genuine off-topic
 * questions (e.g. "who is Sundar Pichai?", "write Python code", "the weather")
 * top out around 0.50, while every on-topic query scores ≥0.58. 0.52 sits in
 * that gap — off-topic queries retrieve nothing (so a refusal shows no
 * misleading citations), and real questions still retrieve. Filtering here (not
 * in the route) keeps the refusal and the source chips consistent. Re-tune if
 * the corpus changes.
 */
export const MIN_RELEVANCE_SCORE = 0.52;

export async function retrieve(query: string, k = 6): Promise<RetrievedSource[]> {
  const pool = getPool();
  const queryVector = await getEmbedder().embedQuery(query);
  const { rows } = await pool.query<{
    source_label: string;
    anchor: string;
    content: string;
    score: number;
  }>(
    `SELECT source_label, anchor, content, 1 - (embedding <=> $1::vector) AS score
     FROM documents
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [toVectorLiteral(queryVector), k],
  );
  return rows
    .filter((r) => r.score >= MIN_RELEVANCE_SCORE)
    .map((r) => ({ label: r.source_label, anchor: r.anchor, content: r.content, score: r.score }));
}

/** Total indexed chunks — used to distinguish "off-topic" from "index not built". */
export async function documentCount(): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query<{ n: string }>("SELECT count(*)::text AS n FROM documents");
  return Number(rows[0]?.n ?? 0);
}
