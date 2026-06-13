# Portfolio — Project Guide for Claude Code

## Mission

Rebuild Yash Patil's personal portfolio into an **AI-native** site that makes senior
recruiters/engineers at top AI labs want to hire on sight. The signature element is a
**live, embedded AI agent** ("Chat with Yash" RAG + a voice agent), plus one tasteful
futuristic visual flourish. Substance (eval rigor, production agents, reproducible code)
must read louder than the visuals.

## Owner context (use to ground all content)

- AI/ML Engineer, ~4 yrs. MS CS, Santa Clara University. Founding AI Engineer @ Tip Top Technologies.
- Stack: Python, TypeScript, Node.js, React, Next.js, FastAPI; LLM APIs (OpenAI, Anthropic, AWS Bedrock);
  LangChain, LangGraph, LlamaIndex, RAG, MCP, agentic/multi-agent, HITL, evals (Braintrust);
  AWS, Azure OpenAI, GCP, Docker, K8s, CI/CD, Terraform; vector DBs (Pinecone, FAISS, Chroma, OpenSearch).
- Flagship projects: Repomind (MCP repo agent), Open-Scribe (FHIR ambient scribe + eval harness),
  ClinEval (clinical hallucination detection), AutoLabel (LLM weak supervision), COM360 (real-time
  meeting AI), HealthRADAR (chronic care).
- GitHub: github.com/yashpatil582 · existing site repo: yashpatil582/yashpatil582.github.io

## Open-source posture (non-negotiable)

- This repo ships **MIT-licensed**, fully reproducible: a stranger can clone -> one command -> running locally.
- **No proprietary lock-in in the code.** Anything provider-specific lives behind a swappable adapter.
- **Provider-agnostic model adapter:** one interface; open-weight models are the DEFAULT, closed APIs
  optional via env/config. (This is a skill on the owner's resume — the architecture is itself the proof.)
- Publish the owner's Agent Skills (SKILL.md) in a public repo. Document one-click deploy.

## Target architecture (open-source-first)

- **Front-end:** Next.js (App Router) + TS + Tailwind; shadcn/ui + Magic UI + Aceternity (all MIT/Apache).
  Fork base: Toukoum AI-portfolio template (github.com/toukoum/portfolio). One optional Three.js hero, restrained.
- **Model layer (default = open weights):** Llama / Qwen / DeepSeek / gpt-oss, served via Groq, Together,
  or HF Inference free tiers, or self-hosted via Ollama/vLLM. ALL calls go through the provider-agnostic
  adapter so any model (incl. a closed API) is a one-line config swap.
- **RAG:** open vector DB — Qdrant, Chroma, or pgvector (self-hostable). Open embeddings — BGE / nomic-embed.
- **Voice (Stage 2, default = open):** LiveKit Agents or Pipecat (open orchestration) + Whisper/Parakeet STT
  - Kokoro/Chatterbox TTS + open-weight LLM. OpenAI Realtime is an OPTIONAL swap if latency/quality demands
    it — decide at Stage 2, not now.
- **AI backend:** serverless proxy / small server. No business logic or secrets in the browser.
- **Hosting:** deploy to Cloudflare Pages or Vercel free tier for convenience, BUT keep the code
  host-agnostic — ship a Dockerfile + one-command deploy so it also runs on any VPS / Coolify / Dokku.
  The repo, not the host, is the open-source artifact.

## HARD RULES (do not violate)

1. **No API key or provider secret ever reaches the browser.** Keys live server-side (env / secret store);
   maintain `.env.example` with key names only. (Self-hosted open models avoid keys entirely — prefer that
   where practical.)
2. **Every public AI route enforces:** Origin/Referer allow-list, a CAPTCHA/bot check (Cloudflare Turnstile
   or open hCaptcha) verified server-side, per-IP + global rate limit, model allow-list, and a `max_tokens`
   cap. Use a cheap/efficient open-weight model for public demos.
3. **Voice:** with the open LiveKit/Pipecat stack, keep any provider keys server-side and authenticate the
   media path. If OpenAI Realtime is swapped in, mint short-lived `ek_` ephemeral tokens server-side via
   `POST /v1/realtime/client_secrets` — never the standard key client-side.
4. **Hard monthly spend caps** in every provider dashboard. Assume the public demo will be abused.
5. **Injection-hardened system prompts;** scope every agent to "answer only about Yash's work."
6. **Single source of truth for content:** one typed data layer (`/data/*.ts` + project READMEs) feeds BOTH
   the rendered site AND the RAG index. Never hand-duplicate bio/project text.
7. **No secrets, PII, or real keys** in commits, logs, or screenshots.
8. **MIT + reproducibility:** anything added must keep "clone -> one command -> running locally" true.

## Flagship demos (build these; map each to a real project — all run on open weights)

- **"Chat with Yash" RAG agent** (centerpiece) -> Open-Scribe / RAG / LangChain.
- **MCP tool-using agent** ("summarize any public GitHub repo", show tool calls) -> Repomind.
- **Live eval / hallucination-score demo** (paste clinical note -> structured output + grounding score)
  -> ClinEval + Open-Scribe. The piece that impresses engineers, not just recruiters.
- **Voice agent** (open LiveKit/Pipecat stack) -> COM360 / Open-Scribe.
- **Image understanding** (vision: explain an uploaded architecture diagram) -> Repomind.

## Build order

- Stage 0: host-agnostic project + forked template live as a static site, MIT license, Dockerfile, content layer.
- Stage 1: "Chat with Yash" RAG (open-weight model via adapter + open vector DB) through the secured proxy.
- Stage 2: voice agent, live eval demo, publish 1–2 Agent Skills (SKILL.md) with test cases.
- Stage 3: 3 blog posts (secure live-AI build + injection defenses; eval methodology; MCP agent design).

## Conventions

- TypeScript strict; no `any` without a justifying comment. ESLint + Prettier clean.
- Components: prefer shadcn/Magic UI primitives; keep visual effects behind reduced-motion guards.
- Accessibility: semantic HTML, keyboard-navigable chat/voice UI, visible focus states.
- Performance budget: Lighthouse >= 95 perf/a11y on the landing route; lazy-load 3D/heavy bundles.
- Streaming: SSE for text chat; show tool calls in the UI when an agent uses tools.
- Commits: conventional commits, small and reviewable.

## Commands (fill in once scaffolded)

- Dev: `npm run dev` · Build: `npm run build` · Lint: `npm run lint`
- Deploy: host-agnostic (Docker) + optional `wrangler pages deploy` / Vercel git-connected.

## How to work in this repo

- Use **plan mode** before any change that touches >5 files, migrates hosting, or adds an AI route.
- Surface decisions explicitly (open-weight model choice, open vector DB, fork-vs-migrate) rather than
  silently picking — flag them in the plan.
- Prefer open / self-hostable components. If a proprietary service is the only practical option, isolate it
  behind the adapter AND document the open alternative.
- Never weaken a HARD RULE to "make the demo work." If a key would have to touch the client, stop and propose
  the proxy/ephemeral-token approach instead.
