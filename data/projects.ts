import type { Project } from "./types";

const GH = "https://github.com/yashpatil582";

/**
 * Curated project set, grounded in real public repos. The `featured` entries
 * map to the flagship live demos planned for this site (RAG, MCP, eval, voice,
 * vision). Order is intentional: featured work first.
 */
export const projects: Project[] = [
  {
    slug: "repo-agent",
    name: "MCP Repo Agent",
    description:
      "A live, in-page agent that explores any public GitHub repository over a real in-process MCP server — reading the tree, README, and files through scoped read-only tools and streaming each tool call as it works. Built for this site.",
    impact: "Live MCP agent",
    tech: ["TypeScript", "MCP", "LLM", "Agents"],
    categories: ["Agents", "LLM"],
    // The agent lives in this site's source; try it live in the "Explore any repo" section.
    repo: `${GH}/yashpatil582.github.io`,
    demo: "#repo-agent",
    featured: true,
  },
  {
    slug: "open-scribe",
    name: "Open-Scribe",
    description:
      "Open-source, FHIR-native ambient medical scribe: encounter audio → SOAP note → ICD-10/CPT → FHIR bundle. Ships a real evaluation harness on the PriMock57 dataset.",
    impact: "FHIR + real eval harness",
    tech: ["Python", "Whisper", "FHIR", "Evals", "LLM"],
    categories: ["AI/ML", "LLM"],
    repo: `${GH}/open-scribe`,
    featured: true,
  },
  {
    slug: "clineval",
    name: "ClinEval",
    description:
      "Measures clinical hallucination, failure modes, and demographic equity in LLM-generated medical notes using an LLM-as-judge pipeline over synthetic data.",
    impact: "Hallucination scoring",
    tech: ["Python", "LLM-as-Judge", "Evals", "Healthcare AI"],
    categories: ["AI/ML", "LLM"],
    repo: `${GH}/clineval`,
    demo: "https://dashboard-three-kappa-58.vercel.app",
    featured: true,
  },
  {
    slug: "voice-triage",
    name: "Voice-Triage",
    description:
      "Voice-first clinical intake agent with red-flag triage — Whisper STT + Llama 3.3 (Groq) + browser TTS, deployed on Vercel. An open take on the real-time voice agent stack.",
    impact: "Whisper + Llama 3.3, on Vercel",
    tech: ["Next.js", "Groq", "Llama 3.3", "Whisper", "Voice AI"],
    categories: ["Agents", "LLM"],
    repo: `${GH}/voice-triage`,
    demo: "https://voice-triage.vercel.app",
    featured: true,
  },
  {
    slug: "circuit-extract",
    name: "Circuit-Extract",
    description:
      "Extracts structured data from electrical circuit diagrams into machine-readable relational graphs — a hybrid vision pipeline of PaddleOCR + Gemini/Claude Vision + OpenCV.",
    impact: "Vision → structured graph",
    tech: ["Python", "Vision", "OpenCV", "Multimodal"],
    categories: ["AI/ML"],
    repo: `${GH}/circuit-extract`,
    featured: true,
  },
  {
    slug: "databricks-smart-merge",
    name: "Databricks Smart Merge",
    description:
      "Reproduces a real Databricks Assistant failure where partial LLM fixes overwrite working cells, then applies fixes as a safe patch with an inline diff preview — practical LLM safety in code workflows.",
    impact: "LLM code safety",
    tech: ["Python", "Streamlit", "Gemini"],
    categories: ["LLM", "AI/ML"],
    repo: `${GH}/databricks-agent-smart-merge-demo`,
    featured: true,
  },
  {
    slug: "autolabel",
    name: "AutoLabel",
    description:
      "Autonomous, self-improving data-labeling system: LLM-powered weak supervision with a Karpathy-style ratchet that ratchets quality up over iterations.",
    impact: "Self-improving weak supervision",
    tech: ["Python", "Weak Supervision", "LLM"],
    categories: ["AI/ML", "Agents"],
    repo: `${GH}/autolabel`,
    featured: true,
  },
  {
    slug: "fintech-decisioning-agent",
    name: "Fintech Decisioning Agent",
    description:
      "A LangChain agent on AWS Bedrock with RAG workflows and a FastAPI backend, with an EKS deployment pipeline (CI/CD via GitHub Actions).",
    tech: ["LangChain", "AWS Bedrock", "FastAPI", "Kubernetes"],
    categories: ["Agents", "Data"],
    repo: `${GH}/fintech-decisioning-agent`,
  },
];

/** Distinct categories present in the project set, for UI filters. */
export const projectCategories = Array.from(new Set(projects.flatMap((p) => p.categories)));
