-- Schema for the "Chat with Yash" RAG agent. Idempotent: safe to run repeatedly.
-- Works identically on the local docker pgvector image and on Supabase.

-- pgvector. Preinstalled on Supabase (no-op there); shipped by pgvector/pgvector locally.
CREATE EXTENSION IF NOT EXISTS vector;

-- One row per retrievable chunk of Yash's content. Embedded with an open model
-- (bge-small-en-v1.5, 384-dim) at ingest time. The site's data/ files are the
-- single source of truth — this table is rebuilt from them by scripts/ingest.ts.
CREATE TABLE IF NOT EXISTS documents (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type         TEXT        NOT NULL,            -- profile | experience | project | skill | education | agent_skill
  source_label TEXT        NOT NULL,            -- chip label, e.g. "Repomind"
  anchor       TEXT        NOT NULL,            -- section anchor, e.g. #projects
  content      TEXT        NOT NULL,            -- the retrievable, human-readable text
  embedding    vector(384) NOT NULL,
  metadata     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW + cosine: no training step or row-count threshold (unlike ivfflat), ideal
-- for a tiny, occasionally-rebuilt corpus. Queries MUST use the <=> operator.
CREATE INDEX IF NOT EXISTS documents_embedding_hnsw
  ON documents USING hnsw (embedding vector_cosine_ops);

-- Fixed-window rate-limit counters (per-IP/min, per-IP/day, global/day). The key
-- embeds the time bucket, so windows reset implicitly by rolling to a new key.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT        PRIMARY KEY,
  count      INTEGER     NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expires_at ON rate_limits (expires_at);
