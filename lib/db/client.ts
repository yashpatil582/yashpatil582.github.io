import { Pool } from "pg";

// A single pooled connection, cached on globalThis so Next.js hot-reloads (and
// repeated script invocations) reuse one pool instead of leaking connections.
declare global {
  var __pgPool: Pool | undefined;
}

/** Local Postgres needs no TLS; managed hosts (Supabase) require it. */
function isLocalHost(connectionString: string): boolean {
  try {
    const host = new URL(connectionString).hostname;
    return ["localhost", "127.0.0.1", "::1", "db"].includes(host);
  } catch {
    return false;
  }
}

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — point it at local docker pgvector or Supabase.");
  }
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool({
      connectionString,
      ssl: isLocalHost(connectionString) ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return globalThis.__pgPool;
}
