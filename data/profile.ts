import type { Profile } from "./types";

export const profile: Profile = {
  name: "Yash Patil",
  title: "AI/ML Engineer",
  roles: ["LLM & RAG systems", "Agentic AI", "ML infrastructure", "Eval-driven AI"],
  tagline:
    "I build production AI systems — retrieval, agents, and evals — that hold up under real traffic.",
  location: "San Francisco Bay Area, CA",
  email: "yashpatil582@gmail.com",
  available: true,
  resumeUrl: "/Yash_Patil_Resume.pdf",
  summary: [
    "I'm an AI/ML engineer with ~4 years of experience shipping LLM, retrieval, and agentic systems to production. Right now I'm an AI/ML engineer at Tip Top Technologies, where I redesigned a real-time ranking pipeline (NDCG@10 +15%, p95 120ms → <50ms) and built an embedding-based semantic retrieval system serving 2M+ queries a day.",
    "My work runs the full stack of applied AI: RAG and hybrid search, multi-agent orchestration, and evaluation harnesses that actually catch hallucinations — much of it in healthcare, where correctness and HIPAA compliance are non-negotiable. I care about reproducibility and open weights: my projects are open-source and reproducible.",
    "I hold an M.S. in Computer Science from Santa Clara University. Before that I built large-scale data and ML pipelines across search and life-sciences companies.",
  ],
  metrics: [
    { value: "2M+", label: "queries / day served" },
    { value: "+15%", label: "NDCG@10 ranking lift" },
    { value: "<50ms", label: "p95 ranking latency" },
    { value: "~4 yrs", label: "applied AI/ML" },
  ],
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/yashpatil582",
      handle: "yashpatil582",
      icon: "github",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/yashpatil23/",
      handle: "yashpatil23",
      icon: "linkedin",
    },
    {
      label: "X",
      href: "https://twitter.com/YASHPATIL10",
      handle: "YASHPATIL10",
      icon: "twitter",
    },
    {
      label: "Email",
      href: "mailto:yashpatil582@gmail.com",
      handle: "yashpatil582@gmail.com",
      icon: "mail",
    },
  ],
};
