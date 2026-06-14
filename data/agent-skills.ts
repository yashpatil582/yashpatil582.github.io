import type { AgentSkill } from "./types";

/** Public repo holding the SKILL.md skills (MIT/Apache, reproducible, stdlib-only Python). */
export const AGENT_SKILLS_REPO = "https://github.com/yashpatil582/agent-skills";

/**
 * Published Agent Skills (Anthropic SKILL.md format). Each packages a method from a
 * real, shipped project and ties to a live demo here, so it's defensible — not a toy.
 */
export const agentSkills: AgentSkill[] = [
  {
    slug: "clinical-note-eval",
    name: "clinical-note-eval",
    description:
      "Two-pass extract-then-ground eval for clinical-note extractions, with a deterministic, code-side span check the model can't inflate.",
    packages: "The methodology behind the live “Score a note” demo (ClinEval + Open-Scribe).",
    tech: ["Python", "Evals", "Grounding", "Hallucination", "LLM-as-judge"],
    license: "MIT",
    repo: `${AGENT_SKILLS_REPO}/tree/main/clinical-note-eval`,
    mapsTo: { label: "Live demo: Score a note", href: "#eval" },
  },
  {
    slug: "token-eval-harness",
    name: "token-eval-harness",
    description:
      "Token-level multiset-F1 scorer for free-text output vs references — the honest surface-overlap metric, per-example and macro-aggregated.",
    packages: "Open-Scribe's PriMock57 / ACI-Bench token-F1 evaluation harness.",
    tech: ["Python", "Token-F1", "Evals", "RAG", "PriMock57"],
    license: "Apache-2.0",
    repo: `${AGENT_SKILLS_REPO}/tree/main/token-eval-harness`,
    mapsTo: { label: "Open-Scribe", href: "https://github.com/yashpatil582/open-scribe" },
  },
];
