/**
 * Best-effort client IP for rate limiting. Trust only headers the hosting
 * platform controls — a raw leftmost X-Forwarded-For is client-spoofable, which
 * would let an attacker rotate it to evade per-IP limits. On Vercel the platform
 * sets x-vercel-forwarded-for; behind another trusted proxy, x-forwarded-for's
 * first hop is the original client. The global/day cap is the non-bypassable
 * backstop regardless of IP accuracy.
 */
export function getClientIp(req: Request): string {
  if (process.env.VERCEL) {
    const trusted = req.headers.get("x-vercel-forwarded-for") ?? req.headers.get("x-real-ip");
    if (trusted) return trusted.split(",")[0].trim();
  }
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}
