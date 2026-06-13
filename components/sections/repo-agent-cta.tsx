import { Lock, Wrench } from "lucide-react";

import { RepoAgent } from "@/components/repo-agent/repo-agent";
import { Section } from "@/components/section";

/**
 * "Explore any repo" — an MCP tool-using agent that explores a public GitHub repo
 * and shows its tool calls live. Separate from the RAG "Chat with Yash" agent;
 * this one demonstrates the agent loop + the MCP protocol (maps to Repomind).
 */
export function RepoAgentCta() {
  return (
    <Section
      id="repo-agent"
      eyebrow="MCP agent"
      title="Explore any repo"
      description="Paste a public GitHub repo and a tool-using agent explores it over MCP — listing the tree, reading the README and key files — then explains what it does and how it's built. Its tool calls stream live."
    >
      <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-4 sm:p-6">
        <div
          aria-hidden
          className="bg-glow pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        />

        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Wrench className="text-brand size-4" /> Tool-using agent · real MCP tools over the GitHub
          API · public repos only
        </p>

        <RepoAgent />

        <p className="text-muted-foreground/70 mt-4 flex items-center gap-1.5 text-xs">
          <Lock className="size-3 shrink-0" /> Read-only, single-repo tools through a rate-limited,
          bot-checked proxy. Repo contents are treated as untrusted data. No API keys in the browser.
        </p>
      </div>
    </Section>
  );
}
