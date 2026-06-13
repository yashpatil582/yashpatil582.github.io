/**
 * Server-side GitHub REST client for the repo-exploration agent. PUBLIC repos
 * only. Every request is hard-scoped to api.github.com:
 *
 *  - `parseRepoUrl` host allow-list (github.com) + strict owner/repo charset.
 *  - `redirect: "error"` so a renamed/transferred repo can never bounce us to
 *    another host (SSRF defense — a 3xx is treated as unreachable).
 *  - per-call timeout, byte caps on every body we inline into the model.
 *  - `sanitizeRepoPath` blocks traversal/absolute/encoded paths before a path
 *    ever reaches the URL, and segments are URL-encoded so the host can't change.
 *
 * An optional server-side GITHUB_TOKEN (never sent to the browser) raises the
 * GitHub rate limit; without it, calls are unauthenticated (60/hr per IP).
 */

const API = "https://api.github.com";
const NAME_RE = /^[A-Za-z0-9_.-]+$/;

export interface RepoRef {
  owner: string;
  repo: string;
}

export interface RepoMeta {
  owner: string;
  repo: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  topics: string[];
  primaryLanguage: string | null;
  license: string | null;
  homepage: string | null;
  htmlUrl: string;
  archived: boolean;
  pushedAt: string | null;
}

/** Typed GitHub failure so the route can map it to a clean HTTP status. */
export class GitHubError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export interface GhFetchOpts {
  /** Caller's request signal (lets a client disconnect abort the GitHub call). */
  signal?: AbortSignal;
  /** Per-call timeout in ms. */
  timeoutMs: number;
}

/**
 * Parse a user-supplied repo reference. Accepts a full github.com URL (host
 * allow-listed), `github.com/owner/repo`, or bare `owner/repo`. Returns null for
 * anything else (other hosts, malformed input). Never throws.
 */
export function parseRepoUrl(input: string): RepoRef | null {
  const s = input.trim();
  if (!s || s.length > 300) return null;

  let owner: string | undefined;
  let repo: string | undefined;

  const looksUrlish = /^https?:\/\//i.test(s) || /^(www\.)?github\.com\//i.test(s);
  if (looksUrlish) {
    let parsed: URL;
    try {
      parsed = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    } catch {
      return null;
    }
    const host = parsed.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") return null; // host allow-list
    const segs = parsed.pathname.split("/").filter(Boolean);
    [owner, repo] = segs;
  } else {
    // Bare form must be EXACTLY owner/repo — `gitlab.com/o/r` (3 segments) is rejected.
    const segs = s.split("/").filter(Boolean);
    if (segs.length !== 2) return null;
    [owner, repo] = segs;
  }

  if (!owner || !repo) return null;
  repo = repo.replace(/\.git$/i, "");
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo)) return null;
  if (owner.length > 100 || repo.length > 100) return null;
  return { owner, repo };
}

/**
 * Normalize a model-supplied file path to a safe, repo-relative path. Decodes
 * percent-encoding first (so `%2e%2e` can't sneak past), then rejects traversal,
 * absolute paths, and control characters. The result is still URL-encoded
 * per-segment by the caller before it reaches a URL.
 */
export function sanitizeRepoPath(input: string): string {
  let p = (input ?? "").trim();
  // Decode up to twice to catch double-encoded traversal, then validate the
  // fully-decoded form.
  for (let i = 0; i < 2; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(p);
    } catch {
      break;
    }
    if (decoded === p) break;
    p = decoded;
  }
  p = p.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
  if (!p) throw new GitHubError("bad_path", "Empty file path.", 400);
  if (p.length > 400) throw new GitHubError("bad_path", "File path is too long.", 400);
  if (p.startsWith("/")) throw new GitHubError("bad_path", "Absolute paths are not allowed.", 400);
  for (const seg of p.split("/")) {
    if (seg === "." || seg === "..") {
      throw new GitHubError("bad_path", "Path traversal is not allowed.", 400);
    }
    if (/[\x00-\x1f]/.test(seg)) {
      throw new GitHubError("bad_path", "Invalid characters in path.", 400);
    }
  }
  return p;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "yashpatil-portfolio-repo-agent",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Bridge the caller's signal with a per-call timeout, portably (no AbortSignal.any). */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}

/** GET a JSON endpoint under api.github.com, with redirects disabled and caps. */
async function ghJson<T>(path: string, opts: GhFetchOpts): Promise<T> {
  const { signal, cleanup } = withTimeout(opts.signal, opts.timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: authHeaders(),
      redirect: "error", // a 3xx must never carry us off api.github.com
      signal,
    });
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "AbortError" || name === "TimeoutError") {
      throw new GitHubError("github_timeout", "GitHub request timed out.", 504);
    }
    // redirect:"error" rejects with a TypeError when GitHub tries to redirect.
    throw new GitHubError("github_unreachable", "Could not reach GitHub for that repository.", 502);
  } finally {
    cleanup();
  }

  const remainingHeader = res.headers.get("x-ratelimit-remaining");
  const remaining = remainingHeader == null ? null : Number(remainingHeader);

  if (res.status === 404) {
    throw new GitHubError("repo_not_found", "Repository not found, or it isn't public.", 404);
  }
  if (res.status === 403 || res.status === 429) {
    if (remaining === 0) {
      throw new GitHubError(
        "github_rate_limited",
        "GitHub's API rate limit was reached. Try again later, or set a server-side GITHUB_TOKEN.",
        503,
      );
    }
    throw new GitHubError("github_forbidden", "GitHub denied that request.", 502);
  }
  if (!res.ok) {
    throw new GitHubError("github_error", `GitHub returned ${res.status}.`, 502);
  }
  return (await res.json()) as T;
}

interface RepoApiResponse {
  private: boolean;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  topics?: string[];
  language: string | null;
  license: { spdx_id?: string | null; name?: string | null } | null;
  homepage: string | null;
  html_url: string;
  archived: boolean;
  pushed_at: string | null;
}

/**
 * Fetch repo metadata and assert it is a PUBLIC repo. A private repo (only
 * reachable if a token is configured) is reported as not-found — we never expose
 * private data, and we don't leak which private repos exist.
 */
export async function assertPublicRepo(ref: RepoRef, opts: GhFetchOpts): Promise<RepoMeta> {
  const data = await ghJson<RepoApiResponse>(`/repos/${ref.owner}/${ref.repo}`, opts);
  if (data.private) {
    throw new GitHubError("repo_not_found", "Repository not found, or it isn't public.", 404);
  }
  return {
    owner: ref.owner,
    repo: ref.repo,
    description: data.description,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
    topics: Array.isArray(data.topics) ? data.topics.slice(0, 20) : [],
    primaryLanguage: data.language,
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    homepage: data.homepage || null,
    htmlUrl: data.html_url,
    archived: data.archived,
    pushedAt: data.pushed_at,
  };
}

export async function fetchLanguages(ref: RepoRef, opts: GhFetchOpts): Promise<Record<string, number>> {
  return ghJson<Record<string, number>>(`/repos/${ref.owner}/${ref.repo}/languages`, opts);
}

function decodeBase64Capped(b64: string, maxBytes: number) {
  const buf = Buffer.from(b64, "base64");
  const truncated = buf.length > maxBytes;
  const slice = truncated ? buf.subarray(0, maxBytes) : buf;
  const binary = slice.includes(0); // NUL byte => almost certainly binary
  return { text: binary ? "" : slice.toString("utf8"), bytes: slice.length, truncated, binary };
}

export interface ReadmeResult {
  name: string;
  text: string;
  bytes: number;
  truncated: boolean;
}

/** Fetch the repo README (any conventional filename). Returns null if absent. */
export async function fetchReadme(
  ref: RepoRef,
  opts: GhFetchOpts,
  maxBytes: number,
): Promise<ReadmeResult | null> {
  let data: { name: string; content: string; encoding: string };
  try {
    data = await ghJson(`/repos/${ref.owner}/${ref.repo}/readme`, opts);
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return null;
    throw err;
  }
  const { text, bytes, truncated } = decodeBase64Capped(data.content ?? "", maxBytes);
  return { name: data.name, text, bytes, truncated };
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree" | string;
  size?: number;
}

export interface TreeResult {
  entries: TreeEntry[];
  truncated: boolean;
}

/** Fetch the recursive git tree for a branch, capped to `maxEntries`. */
export async function fetchTree(
  ref: RepoRef,
  branch: string,
  opts: GhFetchOpts,
  maxEntries: number,
): Promise<TreeResult> {
  const data = await ghJson<{ tree: TreeEntry[]; truncated: boolean }>(
    `/repos/${ref.owner}/${ref.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    opts,
  );
  const entries = Array.isArray(data.tree) ? data.tree : [];
  return {
    entries: entries.slice(0, maxEntries),
    truncated: Boolean(data.truncated) || entries.length > maxEntries,
  };
}

export type FileResult =
  | { kind: "file"; path: string; text: string; bytes: number; truncated: boolean }
  | { kind: "directory"; path: string }
  | { kind: "binary"; path: string }
  | { kind: "too-large"; path: string };

/** Fetch a single file's contents via the Contents API, scoped to this repo. */
export async function fetchFile(
  ref: RepoRef,
  rawPath: string,
  branch: string,
  opts: GhFetchOpts,
  maxBytes: number,
): Promise<FileResult> {
  const safePath = sanitizeRepoPath(rawPath);
  const encoded = safePath.split("/").map(encodeURIComponent).join("/");
  const data = await ghJson<
    | { type: string; content?: string; encoding?: string; size: number }
    | Array<unknown>
  >(`/repos/${ref.owner}/${ref.repo}/contents/${encoded}?ref=${encodeURIComponent(branch)}`, opts);

  if (Array.isArray(data)) return { kind: "directory", path: safePath };
  if (data.type !== "file") return { kind: "directory", path: safePath };
  // GitHub omits inline content for files > ~1MB.
  if (!data.content) return { kind: "too-large", path: safePath };

  const decoded = decodeBase64Capped(data.content, maxBytes);
  if (decoded.binary) return { kind: "binary", path: safePath };
  return {
    kind: "file",
    path: safePath,
    text: decoded.text,
    bytes: decoded.bytes,
    truncated: decoded.truncated,
  };
}
