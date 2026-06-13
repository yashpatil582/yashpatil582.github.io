/**
 * Shared JSON error response for the AI routes. Every pre-stream rejection uses
 * this single shape — `{ error: { code, message } }` — so the client can surface
 * the server's friendly message verbatim.
 */
export function fail(code: string, message: string, status: number, headers?: HeadersInit): Response {
  return Response.json({ error: { code, message } }, { status, headers });
}
