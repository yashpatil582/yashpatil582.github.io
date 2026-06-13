/**
 * Runs once when the Next.js server starts. Fail-closed: in production it refuses
 * to boot when the /api/chat abuse controls are misconfigured (test Turnstile
 * keys, open/localhost origins). See lib/security/config.ts. No-op in development.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionConfig } = await import("./lib/security/config");
    try {
      assertProductionConfig();
    } catch (err) {
      // Hard-exit, don't just throw: Next.js catches a thrown instrumentation
      // error and keeps serving 500s. A security misconfiguration in production
      // must stop the server from starting at all.
      console.error(`\n[startup] ${(err as Error).message}\n`);
      process.exit(1);
    }
  }
}
