import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Pool } from "pg";

import { getPool } from "./client";

/** Apply the canonical schema (extension + tables + indexes). Idempotent. */
export async function applySchema(pool: Pool): Promise<void> {
  const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  await pool.query(sql);
}

async function main(): Promise<void> {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
  config({ path: ".env" });

  const pool = getPool();
  await applySchema(pool);
  console.log("✓ Applied lib/db/schema.sql");
  await pool.end();
}

// Run only when invoked directly (pnpm db:migrate), not when imported by ingest.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
