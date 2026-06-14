// Cloudflare Turnstile TEST secret keys begin with 1x / 2x / 3x (always-pass,
// always-fail, token-already-spent). Real secrets begin with 0x. Any test key in
// production silently neuters the bot check.
const TURNSTILE_TEST_KEY = /^[123]x/i;

const LOOPBACK_ORIGIN = /localhost|127\.0\.0\.1|::1/i;

/**
 * Fail-closed production configuration check. In production it throws when the
 * /api/chat abuse controls would be ineffective, so the app refuses to boot
 * (called from instrumentation.ts at server init). In development it is a no-op:
 * the route keeps its loud-warn + Turnstile bypass for local testing.
 */
export function assertProductionConfig(): void {
  if (process.env.NODE_ENV !== "production") return;

  const problems: string[] = [];

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    problems.push("TURNSTILE_SECRET_KEY is missing — the server-side bot check would be skipped.");
  } else if (TURNSTILE_TEST_KEY.test(secret)) {
    problems.push(
      "TURNSTILE_SECRET_KEY is a Cloudflare test key (1x…/2x…/3x…) that always passes verification — set a real secret.",
    );
  }

  const origins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    problems.push("ALLOWED_ORIGINS is empty — the origin allow-list would accept every origin.");
  } else if (origins.some((o) => LOOPBACK_ORIGIN.test(o))) {
    problems.push("ALLOWED_ORIGINS still contains localhost — set your production origin(s).");
  }

  // Numeric abuse caps: if set, they must parse as a positive number. A
  // non-numeric value NaN-s out at runtime and silently disables that limit, so
  // we refuse to boot on it — same fail-closed philosophy as the Turnstile guard.
  for (const name of ["RL_PER_IP_PER_MIN", "RL_PER_IP_PER_DAY", "GLOBAL_DAILY_CAP"]) {
    const raw = process.env[name]?.trim();
    if (!raw) continue; // unset → the code falls back to a safe default
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      problems.push(
        `${name} is "${raw}", which isn't a positive number — a non-numeric cap would disable that rate limit.`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      "Refusing to start: insecure production configuration for the /api/chat route.\n" +
        problems.map((p) => `  • ${p}`).join("\n") +
        "\nFix these env vars (see .env.example), or run with NODE_ENV=development for local testing.",
    );
  }
}
