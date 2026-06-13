// Build the RAG index from the typed content layer. Run with `pnpm db:ingest`.
// Idempotent: truncates and rebuilds `documents` in one transaction so a failed
// run never leaves a half-populated index.

import { config } from "dotenv";

import { applySchema } from "../lib/db/migrate";
import { getPool } from "../lib/db/client";
import { EMBEDDING_DIMENSION, getEmbedder, toVectorLiteral } from "../lib/ai/embeddings";
import { buildDocuments } from "./lib/flatten";

config({ path: ".env.local" });
config({ path: ".env" });

async function main(): Promise<void> {
  const pool = getPool();
  await applySchema(pool);

  const docs = buildDocuments();
  const embedder = getEmbedder();
  if (embedder.dimension !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Embedder dimension ${embedder.dimension} != schema vector(${EMBEDDING_DIMENSION}). ` +
        `Update the schema + re-ingest if you change the embedding model.`,
    );
  }

  console.log(`Embedding ${docs.length} documents…`);
  const vectors = await embedder.embedDocuments(docs.map((d) => d.content));

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE documents RESTART IDENTITY");
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      await client.query(
        `INSERT INTO documents (type, source_label, anchor, content, embedding, metadata)
         VALUES ($1, $2, $3, $4, $5::vector, $6)`,
        [d.type, d.source_label, d.anchor, d.content, toVectorLiteral(vectors[i]), d.metadata],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const byType = await pool.query<{ type: string; n: string }>(
    "SELECT type, count(*)::text AS n FROM documents GROUP BY type ORDER BY type",
  );
  console.log(`✓ Ingested ${docs.length} documents:`);
  for (const row of byType.rows) console.log(`    ${row.type.padEnd(12)} ${row.n}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
