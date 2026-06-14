const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side Cloudflare Turnstile verification. The secret never reaches the
 * browser. In local dev with no TURNSTILE_SECRET_KEY set, the check is bypassed
 * with a loud warning — this NEVER happens in production (returns false instead).
 * Use Cloudflare's test keys to exercise the real path in dev.
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn(
      "[turnstile] No TURNSTILE_SECRET_KEY — DEV BYPASS active. Set test keys to exercise the real path; never ship without a secret.",
    );
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "0.0.0.0") body.set("remoteip", ip);

  // Fail CLOSED on a slow/unreachable Cloudflare: a ~3s timeout aborts the
  // request, and the catch treats the abort as unverified — siteverify can't
  // stall the route.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: controller.signal });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification request failed or timed out", err);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
