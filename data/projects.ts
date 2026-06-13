import type { Project } from "./types";

const GH = "https://github.com/yashpatil582";

/**
 * Curated project set, grounded in real public repos. The `featured` entries
 * map to the flagship live demos planned for this site (RAG, MCP, eval, voice,
 * vision). Order is intentional: featured work first.
 */
export const projects: Project[] = [
  {
    slug: "repomind",
    name: "Repomind",
    description:
      "An MCP tool-using agent that explores and summarizes any public GitHub repository — surfacing architecture, entry points, and how the pieces fit, with its tool calls shown step by step.",
    impact: "MCP agent",
    tech: ["TypeScript", "MCP", "LLM", "Agents"],
    categories: ["Agents", "LLM"],
    repo: `${GH}/repomind`,
    // Live, in-page demo of the same idea — see the "Explore any repo" section.
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
    slug: "gpt-from-scratch",
    name: "GPT from Scratch",
    description:
      "A 124M-parameter GPT implemented and trained from scratch with a custom tokenizer — transformer internals end to end, no high-level shortcuts.",
    impact: "124M params from scratch",
    tech: ["PyTorch", "Transformers", "Deep Learning"],
    categories: ["AI/ML"],
    repo: `${GH}/gpt_from_scratch`,
    featured: true,
  },
  {
    slug: "agentic-rag-llamaindex",
    name: "Agentic RAG (LlamaIndex)",
    description:
      "A RAG pipeline with agentic reasoning and hybrid search over a document corpus, built on LlamaIndex with retrieval-quality evaluation.",
    tech: ["LlamaIndex", "RAG", "Python"],
    categories: ["LLM", "AI/ML"],
    repo: `${GH}/Building-Agentic-RAG-with-Llamaindex`,
  },
  {
    slug: "circuit-extract",
    name: "Circuit-Extract",
    description:
      "Extracts structured data from electrical circuit diagrams into machine-readable relational graphs — a hybrid vision pipeline of PaddleOCR + Gemini/Claude Vision + OpenCV.",
    tech: ["Python", "Vision", "OpenCV", "Multimodal"],
    categories: ["AI/ML"],
    repo: `${GH}/circuit-extract`,
  },
  {
    slug: "fintech-decisioning-agent",
    name: "Fintech Decisioning Agent",
    description:
      "A LangChain agent on AWS Bedrock with RAG workflows and a FastAPI backend, deployed to EKS via GitHub Actions CI/CD.",
    tech: ["LangChain", "AWS Bedrock", "FastAPI", "Kubernetes"],
    categories: ["Agents", "Data"],
    repo: `${GH}/fintech-decisioning-agent`,
  },
  {
    slug: "neural-fabric",
    name: "Neural-Fabric",
    description:
      "A production-quality neural-network framework written in pure Python + NumPy — autograd, layers, and optimizers built from first principles.",
    tech: ["Python", "NumPy", "Deep Learning"],
    categories: ["AI/ML"],
    repo: `${GH}/neural-fabric`,
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
  },
  {
    slug: "multi-agent-chatbot",
    name: "Multi-Agent Chatbot",
    description:
      "A multi-agent system that routes tasks across parallel LLM agents for faster, more reliable resolution.",
    tech: ["Python", "Multi-Agent", "LLM"],
    categories: ["Agents", "LLM"],
    repo: `${GH}/Multi-Agent-Chatbot-Application`,
  },
];

/** Distinct categories present in the project set, for UI filters. */
export const projectCategories = Array.from(new Set(projects.flatMap((p) => p.categories)));
