# Yash Patil — AI-native portfolio

An open-source, reproducible personal site whose centerpiece is a live, embedded
**"Chat with Yash"** RAG agent (with voice, live-eval, MCP, and vision demos to
follow). Built open-weight-first: a stranger can clone it and run it locally with
one command, and every model call goes through a provider-agnostic adapter so
closed APIs are a one-line config swap — never a rewrite.

> **Status:** Stage 0 complete — the full site renders from a single typed
> content layer. Stage 1 (the live RAG agent through a secured proxy) is next.

## Tech stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript (strict)
- **Styling/UI:** Tailwind CSS v4 · shadcn/ui (Base UI primitives) · `motion`
- **Theme:** `next-themes` (dark-first, reduced-motion aware)
- **AI (Stage 1):** provider-agnostic adapter, default open weights via **Groq**
  (`gpt-oss-120b` / Llama 3.3 70B) · **pgvector** on Postgres · open embeddings
- **Bot/abuse defense (Stage 1):** Cloudflare Turnstile · per-IP + global rate
  limits · origin allow-list · model allow-list · `max_tokens` cap
- **Hosting:** host-agnostic — Dockerfile + `docker-compose`; Vercel as a
  convenience target. The repo, not the host, is the artifact.

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Or fully containerized (no Node toolchain needed):

```bash
docker compose up                # Stage 0: the site at :3000
docker compose --profile ai up   # + Postgres/pgvector for Stage 1 RAG
```

Useful scripts: `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm typecheck` ·
`pnpm format`.

## How content works

All site content lives in one typed source of truth under [`data/`](./data) —
`profile.ts`, `experience.ts`, `projects.ts`, `skills.ts`, `education.ts`. The
rendered site reads from it, and (from Stage 1) the RAG index is built from the
**same** files, so bio/project text is never hand-duplicated. To update the site,
edit `data/*` — not the components.

## Project structure

```
app/                 # App Router entry (layout, page, globals.css)
components/
  sections/          # Page sections (hero, about, experience, projects, …)
  ui/                # shadcn/ui primitives
data/                # Single source of truth for all content
public/              # Profile image, résumé PDF, favicon
lib/                 # Shared utilities (RAG/adapter land here in Stage 1)
_archive/            # Legacy static site + source résumés (gitignored, local)
```

## Security posture (enforced on every AI route from Stage 1)

No API key or provider secret ever reaches the browser — keys are server-side
only, and [`.env.example`](./.env.example) lists key **names** only. Each public
AI route enforces an origin allow-list, a server-verified Turnstile check, per-IP
and global rate limits, a model allow-list, and an output-token cap, behind an
injection-hardened prompt scoped to "answer only about Yash's work." Set hard
monthly spend caps in every provider dashboard.

## Configuration

Copy [`.env.example`](./.env.example) to `.env.local` and fill what you need.
Stage 0 needs nothing but an optional `NEXT_PUBLIC_SITE_URL`. Stage 1 adds
`GROQ_API_KEY`, `DATABASE_URL`, and the Turnstile keys (all server-side).

## Roadmap

- **Stage 0 ✓** — host-agnostic Next.js app, MIT-licensed, Docker, content layer.
- **Stage 1** — "Chat with Yash" RAG (open-weight model + pgvector) via secured proxy.
- **Stage 2** — voice agent, live eval/hallucination demo, MCP repo agent, vision; publish Agent Skills.
- **Stage 3** — engineering blog posts (secure live-AI build, eval methodology, MCP agent design).

## License

[MIT](./LICENSE) © 2026 Yash Patil — clone, run, and reuse freely.

## Contact

[LinkedIn](https://www.linkedin.com/in/yashpatil23/) ·
[GitHub](https://github.com/yashpatil582) · yashpatil582@gmail.com
