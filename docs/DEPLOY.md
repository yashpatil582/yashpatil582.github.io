# Deploy to Vercel — runbook (AI routes working)

A step-by-step checklist to take this portfolio live on Vercel with all three public AI
routes working: **`/api/chat`** (RAG), **`/api/repo-agent`** (MCP repo explorer), and
**`/api/eval`** (clinical-note hallucination scorer).

Work top to bottom; each `[ ]` is one action. Assumes you're deploying the GitHub repo
`yashpatil582/yashpatil582.github.io`.

> **Why the order matters:** the AI routes are fail-closed in production. Vercel sets
> `NODE_ENV=production` automatically, which arms the security guards in
> `lib/security/config.ts` — at runtime cold-start the app **refuses to boot** (the
> function 500s on every call) if the Turnstile secret is missing/a test key, if
> `ALLOWED_ORIGINS` is empty or contains localhost, or if a rate-limit cap is
> non-numeric. So get the env right _before_ you deploy.

---

## 1. Accounts & what to grab

- [ ] **Vercel** — sign up at vercel.com with your **GitHub** account (so it can import
      the repo). Nothing secret to copy yet; you set env vars in §2 and import in §4. After
      import, note the auto-assigned **`<project>.vercel.app`** URL — that's your default
      production origin.
- [ ] **Supabase** — create a project (Postgres 16, **pgvector preinstalled**). Set a
      strong DB password and save it. From **Project → Connect**, copy **both** connection
      strings:
  - **Transaction pooler** (host `...pooler.supabase.com`, **port 6543**) → use as
    `DATABASE_URL` **on Vercel** (built for many short-lived serverless connections).
  - **Direct / Session** connection (**port 5432**) → use **from your laptop** for the
    one-time migrate + ingest in §3.
  - **Do not append `?sslmode=require`.** The app's DB client (`lib/db/client.ts`) already
    enables TLS for remote hosts (`rejectUnauthorized: false`); with the current `pg`,
    `sslmode=require` is treated as strict `verify-full` and **fails** against Supabase's
    cert chain (`SELF_SIGNED_CERT_IN_CHAIN`). Use the bare connection string.
  - **Pick an alphanumeric DB password** (letters + digits only — avoid `+ & ? / * @ #`)
    so you never have to URL-encode it; the same string goes in the laptop command and the
    Vercel env var. If your password does contain a special char, percent-encode it
    (`/`→`%2F`, `&`→`%26`, `?`→`%3F`, `+`→`%2B`, `*`→`%2A`). _(IPv4 note: the direct 5432
    connection is IPv6-only unless you have Supabase's IPv4 add-on; the **poolers are
    IPv4-safe** — if your network is IPv4-only, use the **Session pooler** string for the
    laptop step too.)_
- [ ] **Cloudflare Turnstile** — Cloudflare dashboard → **Turnstile → Add site**. Widget
      mode **Managed** (invisible is fine). Under **Hostnames**, add `localhost`, your
      `<project>.vercel.app`, and (if used) your custom domain. Grab:
  - **Site Key** (public) → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - **Secret Key** (server-side) → `TURNSTILE_SECRET_KEY`
  - ⚠️ Production **must** use a **real** key. Cloudflare _test_ keys start `1x`/`2x`/`3x`
    and the app **refuses to boot** in production if it sees one.
- [ ] **Groq** — you already have `GROQ_API_KEY`. Confirm a **monthly/spend cap** is set
      in the Groq dashboard (the app's `GLOBAL_DAILY_CAP` is a second backstop, not a
      replacement).

---

## 2. Environment variables to set on Vercel

Set these under **Vercel → Project → Settings → Environment Variables**, scope
**Production** (also **Preview** if you'll test preview URLs — see §6). Names and defaults
are pulled directly from `.env.example` and the code.

> ⚠️ **`NEXT_PUBLIC_*` are inlined at BUILD time.** Set them **before** the production
> build. If you add them later, **redeploy** — otherwise the browser ships empty values
> and chat breaks (no Turnstile token → `403 turnstile_failed`).

### Required for the AI routes in production

| Var                              | What it does                                                                           | Value / notes                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Canonical site URL (metadata/SEO, `data/site.ts`). **Public, build-time.**             | Your final origin, e.g. `https://<project>.vercel.app` (or custom domain).                                                                                                      |
| `DATABASE_URL`                   | Postgres+pgvector connection (vector store + rate-limit counters). **Server, secret.** | Supabase **Transaction pooler (6543)** string. **No** `?sslmode=require` (the client sets TLS itself; `require` now maps to strict `verify-full` and fails on Supabase's cert). |
| `GROQ_API_KEY`                   | Auth for Groq LLM calls. **Server, secret.**                                           | From Groq. Required while `AI_PROVIDER=groq`.                                                                                                                                   |
| `AI_PROVIDER`                    | Model adapter provider. **Server.**                                                    | `groq`                                                                                                                                                                          |
| `AI_MODEL`                       | Primary model id. **Server.**                                                          | `openai/gpt-oss-120b`                                                                                                                                                           |
| `AI_FALLBACK_MODEL`              | Fallback model id. **Server.**                                                         | `llama-3.3-70b-versatile`                                                                                                                                                       |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget key. **Public, build-time.**                                          | **Real** site key (not `1x…`).                                                                                                                                                  |
| `TURNSTILE_SECRET_KEY`           | Server-side Turnstile verify. **Server, secret.**                                      | **Real** secret (`0x…`); a test key blocks boot.                                                                                                                                |
| `ALLOWED_ORIGINS`                | Origin/Referer allow-list. **Server.**                                                 | Comma-separated **exact prod origins**, e.g. `https://<project>.vercel.app`. **No localhost** (blocks boot).                                                                    |

### Recommended (safe defaults exist, but set explicitly for prod)

| Var                 | Default                        | Notes                                                                                                                                                                                    |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MODEL_ALLOWLIST`   | empty = allow configured chain | Set to `openai/gpt-oss-120b,llama-3.3-70b-versatile`. **If you set it, it MUST contain both** `AI_MODEL` and `AI_FALLBACK_MODEL`, or the chain resolves empty → `400 model_not_allowed`. |
| `GLOBAL_DAILY_CAP`  | `300`                          | Global daily request backstop across all routes. Size to your Groq free-tier tokens/day.                                                                                                 |
| `GITHUB_TOKEN`      | none                           | Server-only. Raises the GitHub API limit 60→5000/hr for the repo-agent. Fine-grained, public-repo read.                                                                                  |
| `MAX_OUTPUT_TOKENS` | `512`                          | Per-request chat cap (hard-clamped ≤1024 in code).                                                                                                                                       |

### Optional (leave unset unless you need them)

- **Closed-API swaps** (keep blank to stay open-weight): `AI_BASE_URL`, `OPENAI_API_KEY`,
  `ANTHROPIC_API_KEY`, `TOGETHER_API_TOKEN`.
- **Embeddings (chat) — REQUIRED on Vercel, not optional:** the default in-process
  embedder (`EMBEDDINGS_PROVIDER=local`, BGE via `onnxruntime-node`) **crashes in Vercel
  serverless** (`libonnxruntime.so.1: cannot open shared object file`). On Vercel set
  **`EMBEDDINGS_PROVIDER=hosted`** + **`HF_API_TOKEN`** (free HuggingFace _read_ token) so
  queries embed the _same_ bge-small model via the HF Inference API. **Leave
  `EMBEDDINGS_MODEL` unset** so it resolves to `BAAI/bge-small-en-v1.5` (a set
  `Xenova/…` value would strip to an invalid id). Local dev/ingest keep using `local`.
- **Chat rate limits:** `RL_PER_IP_PER_MIN` (8), `RL_PER_IP_PER_DAY` (60).
- **Repo-agent tuning:** `REPO_AGENT_MAX_STEPS` (6), `REPO_AGENT_MAX_FILES` (4),
  `REPO_AGENT_MAX_BYTES` (131072), `REPO_AGENT_MAX_FILE_BYTES` (16384),
  `REPO_AGENT_MAX_TREE_ENTRIES` (400), `REPO_AGENT_TIMEOUT_MS` (8000),
  `REPO_AGENT_MAX_OUTPUT_TOKENS` (768); `RL_REPO_PER_IP_PER_MIN` (3),
  `RL_REPO_PER_IP_PER_DAY` (20), `RL_REPO_GLOBAL_DAILY` (150).
- **Eval tuning:** `EVAL_MAX_OUTPUT_TOKENS` (1024); `RL_EVAL_PER_IP_PER_MIN` (2),
  `RL_EVAL_PER_IP_PER_DAY` (15), `RL_EVAL_GLOBAL_DAILY` (120).

### `NODE_ENV` — the master switch (do **not** set it manually)

- [ ] **Leave `NODE_ENV` unset in Vercel.** Vercel sets `NODE_ENV=production`
      automatically for Production (and Preview) deployments — that's what arms the
      fail-closed guards. It's a **reserved** var; setting it by hand can break the build.
      Your job is to make the guard-required vars correct (real Turnstile secret +
      non-localhost `ALLOWED_ORIGINS` + numeric `RL_*`) so the production boot doesn't
      `exit(1)`.

---

## 3. Supabase setup + content ingest

Run from your **laptop** (a clone of the repo), pointing at Supabase. The app embeds
content **locally** at ingest time, so this step does **not** run on Vercel.

- [ ] Put the **direct/session (5432)** Supabase URL in a local `.env.local` — **no
      `sslmode` param**, and percent-encode any special chars in the password:
  ```
  DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-...pooler.supabase.com:5432/postgres
  ```
  (`db:migrate`/`db:ingest` read `.env.local` via dotenv.) _IPv4-only network? use the
  Session-pooler string instead. Editing `.env.local` in your editor avoids the line-wrap
  corruption you can hit pasting a long URL into the terminal._
- [ ] `pnpm install`
- [ ] `pnpm db:migrate` — creates the `vector` extension (no-op on Supabase, it's
      preinstalled), the **`documents`** table (`vector(384)` + HNSW cosine index), and the
      **`rate_limits`** table. Idempotent.
- [ ] `pnpm db:ingest` — embeds every `data/*.ts` entity with BGE and rebuilds
      `documents` in one transaction. (Or `pnpm db:reset` = migrate + ingest.) This loads the
      current, fact-checked content into the index.
- [ ] **Verify** in the Supabase SQL editor:
  ```sql
  SELECT type, count(*) FROM documents GROUP BY type ORDER BY type;  -- profile/experience/project/skill/education/agent_skill rows
  SELECT to_regclass('public.rate_limits');                          -- not null
  SELECT extname FROM pg_extension WHERE extname = 'vector';         -- one row
  ```

> Ingest against the **same** `DATABASE_URL` Vercel will use (same Supabase project).
> The pg client (`lib/db/client.ts`) auto-enables TLS for any non-localhost host, so no
> extra SSL config is needed.
>
> **Re-ingest is mandatory after content edits.** The chat agent answers from the
> embeddings index, **not** the live `data/*` files. Any time `data/*` changes (the
> latest accuracy pass already did), re-run `pnpm db:ingest` against the prod DB or the
> live chat serves stale answers.

---

## 4. Vercel build & function settings

- [ ] **Import** the repo (Vercel → Add New → Project → pick the GitHub repo).
- [ ] **Framework:** Next.js (auto-detected). **Package manager:** pnpm (auto from
      `pnpm-lock.yaml` + `packageManager: pnpm@10.12.2`). Leave **Build Command**
      (`next build`), **Install Command**, and **Output** at defaults — `next.config.ts`
      (`output: "standalone"`, `serverExternalPackages` for `@huggingface/transformers`,
      `onnxruntime-node`, `pg`) needs no Vercel-side changes, and **no `vercel.json` is
      required**.
- [ ] **Node version:** default (Node ≥20) is fine.
- [ ] **Function duration caps — check this.** Routes declare `maxDuration` in code:
      chat **30s**, eval **45s**, repo-agent **90s**. **With Fluid Compute (Vercel's
      default), the Hobby max is 300s, so all three fit on the free plan.** Confirm
      **Settings → Functions → Fluid Compute is ON** (default for new projects).
  - **If Fluid Compute is OFF:** Hobby reverts to a 60s cap and the **90s repo-agent**
    would be over. Fix by either **(a)** re-enable Fluid Compute (recommended), **(b)**
    lower `export const maxDuration` in `app/api/repo-agent/route.ts` to `60` (and tighten
    `REPO_AGENT_MAX_STEPS`/`REPO_AGENT_TIMEOUT_MS` so it finishes in time), or **(c)**
    upgrade to **Pro** (800s max).
- [ ] **Chat embeddings must be `hosted` on Vercel (see §2).** The in-process
      `onnxruntime-node` native lib isn't available in Vercel functions, so the default
      `local` embedder crashes `/api/chat` at module load (`libonnxruntime.so.1`). Set
      `EMBEDDINGS_PROVIDER=hosted` + `HF_API_TOKEN`: hosted mode calls the HF Inference API
      (`router.huggingface.co/hf-inference/<model>/pipeline/feature-extraction`) — no native
      deps, no cold-start model download. Verified that hosted query vectors share the same
      384-dim space as the locally-ingested docs, so retrieval stays accurate.

---

## 5. Deploy

- [ ] Confirm **all §2 env vars are saved for Production first** (especially the two
      `NEXT_PUBLIC_*`, which bake in at build time).
- [ ] Trigger the **Production** deploy (Deploy on import, or push to the production
      branch / Promote to Production). Watch the build log succeed.
- [ ] If you added or changed any env **after** the first build → **redeploy** so it takes
      effect.

---

## 6. Post-deploy verification

- [ ] **Confirm it's a Production deploy.** Vercel marks the deployment **Production** →
      `NODE_ENV=production` is implied (Vercel sets it; there's no page that reads it back).
      The real proof is the guard behavior below — if Turnstile/origin were misconfigured for
      production, every AI function would have `exit(1)` and 500'd, so a working reject path
      _is_ the confirmation the production guards are armed.
- [ ] **Guard reject-paths** (run against your live origin `https://<DOMAIN>`):

  ```bash
  # Wrong/missing Origin → 403 forbidden_origin
  curl -i -X POST https://<DOMAIN>/api/chat -H 'content-type: application/json' \
    -H 'origin: https://evil.example' --data '{"messages":[]}'

  # Correct Origin but no Turnstile token → 403 turnstile_failed
  curl -i -X POST https://<DOMAIN>/api/chat -H 'content-type: application/json' \
    -H 'origin: https://<DOMAIN>' \
    --data '{"messages":[{"role":"user","parts":[{"type":"text","text":"hi"}]}]}'
  ```

  Both 403s prove the origin allow-list and server-side Turnstile verify are live.

- [ ] **Exercise all three routes via the live UI** (the invisible Turnstile widget mints
      a real token automatically — these only pass end-to-end in the browser):
  - **Chat** — ask a question → streamed answer **+ source chips**. If you get
    `503 index_not_ready` ("Run `pnpm db:reset`"), the prod DB wasn't ingested → re-run
    §3's `pnpm db:ingest` against the **same** `DATABASE_URL` (no redeploy needed; the
    route reads the DB live).
  - **Repo agent** — paste a public GitHub repo (e.g. `vercel/next.js`) → it streams
    **tool steps**, then a summary. (Set `GITHUB_TOKEN` if you hit GitHub rate limits.)
  - **Eval** — paste a **synthetic** clinical note → structured extraction + per-claim
    grounding verdicts + a hallucination score.
- [ ] **Confirm chat reflects the current, corrected content.** Ask questions that the
      accuracy pass changed and check the answers are up to date:
  - "What is Yash's current title?" → **AI/ML Engineer** (not "Founding AI Engineer").
  - "Does he work with LangGraph or Qdrant?" → **no** (removed in the pass).
    If answers are stale, ingest didn't run against the prod DB → re-run `pnpm db:ingest`.

---

## (Optional) Custom domain

- [ ] Vercel → **Settings → Domains** → add e.g. `yashpatil.dev`; set the DNS records
      Vercel shows (apex `A`/`ALIAS`, or `CNAME` for `www`).
- [ ] Update env to the custom origin and **redeploy** (both are build-time / guard
      values): `NEXT_PUBLIC_SITE_URL=https://yashpatil.dev`, and add the origin to
      `ALLOWED_ORIGINS` (e.g. `https://yashpatil.dev,https://www.yashpatil.dev`).
- [ ] Add the custom hostname(s) to the **Turnstile** widget's allowed Hostnames.
- [ ] Re-run the §6 checks against the custom domain.

> **Preview deployments caveat:** Vercel runs Previews with `NODE_ENV=production` too, so
> the same fail-closed guards apply. To use preview URLs, scope the env vars to
> **Preview**, set `ALLOWED_ORIGINS`/`NEXT_PUBLIC_SITE_URL` to the preview domain, and add
> it to Turnstile — otherwise preview AI routes will 500/403. Simplest path: verify on
> **Production**.

---

## Quick reference — what each route needs

| Route             | maxDuration | Needs DB rows?                 | External calls                 | Tighter limits       |
| ----------------- | ----------- | ------------------------------ | ------------------------------ | -------------------- |
| `/api/chat`       | 30s         | **Yes** (`documents` ingested) | Groq (+ in-process embeddings) | 8/min, 60/day per IP |
| `/api/repo-agent` | 90s         | No                             | Groq + GitHub API (MCP tools)  | 3/min, 20/day per IP |
| `/api/eval`       | 45s         | No                             | Groq (2 passes/request)        | 2/min, 15/day per IP |

All three share one guard envelope: content-type → origin allow-list → body validation →
Turnstile verify → Postgres rate limits → server-side model allow-list. The
`GLOBAL_DAILY_CAP` (default 300) is the non-bypassable daily spend backstop across every
route.
