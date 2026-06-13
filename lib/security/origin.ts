/**
 * Origin/Referer allow-list. ALLOWED_ORIGINS is a comma-separated list of exact
 * origins (e.g. https://yashpatil.dev). If unset, requests are allowed (dev);
 * in production ALLOWED_ORIGINS must be set.
 */
export function isAllowedOrigin(req: Request): boolean {
  const allow = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allow.length === 0) return true;

  const origin = req.headers.get("origin");
  if (origin) return allow.includes(origin);

  // Some browsers omit Origin on same-origin requests — fall back to Referer.
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return allow.includes(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  // A state-changing POST with neither Origin nor Referer is rejected.
  return false;
}
