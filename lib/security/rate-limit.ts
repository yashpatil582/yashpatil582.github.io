import { getPool } from "@/lib/db/client";

/**
 * Fixed-window rate limiting on Postgres (no Redis). Each window is a row keyed
 * by a time bucket, so windows reset implicitly by rolling to a new key. Three
 * buckets per request: per-IP/min, per-IP/day, and a global/day cap that doubles
 * as the spend backstop (size GLOBAL_DAILY_CAP to your Groq free-tier TPD).
 */
interface Bucket {
  key: string;
  max: number;
  windowSec: number;
}

function buckets(ip: string): Bucket[] {
  const now = Math.floor(Date.now() / 1000);
  const minWindow = Math.floor(now / 60);
  const dayWindow = Math.floor(now / 86_400);
  // `Number(x) || default`: a non-numeric env parses to NaN, and `count > NaN`
  // is always false — which would silently DISABLE the limit. Fall back to the
  // default instead (matches the chat route's max-tokens guard).
  const perIpMin = Number(process.env.RL_PER_IP_PER_MIN) || 8;
  const perIpDay = Number(process.env.RL_PER_IP_PER_DAY) || 60;
  const globalDay = Number(process.env.GLOBAL_DAILY_CAP) || 300;
  return [
    { key: `ip:${ip}:min:${minWindow}`, max: perIpMin, windowSec: 60 },
    { key: `ip:${ip}:day:${dayWindow}`, max: perIpDay, windowSec: 86_400 },
    { key: `global:day:${dayWindow}`, max: globalDay, windowSec: 86_400 },
  ];
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter?: number;
  scope?: string;
}

export async function checkRateLimits(ip: string): Promise<RateLimitResult> {
  const pool = getPool();
  for (const b of buckets(ip)) {
    // Atomic increment: one statement, no read-modify-write race under concurrency.
    const { rows } = await pool.query<{ count: number }>(
      `INSERT INTO rate_limits (bucket_key, count, expires_at)
       VALUES ($1, 1, now() + ($2::int * interval '1 second'))
       ON CONFLICT (bucket_key) DO UPDATE SET count = rate_limits.count + 1
       RETURNING count`,
      [b.key, b.windowSec],
    );
    if (rows[0].count > b.max) {
      return { ok: false, retryAfter: b.windowSec, scope: b.key.split(":").slice(0, 2).join(":") };
    }
  }

  // Opportunistic cleanup of expired windows (cheap, occasional, best-effort).
  if (Math.random() < 0.02) {
    await pool.query("DELETE FROM rate_limits WHERE expires_at < now()").catch(() => {});
  }
  return { ok: true };
}
