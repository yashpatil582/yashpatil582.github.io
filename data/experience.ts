import type { Experience } from "./types";

export const experience: Experience[] = [
  {
    company: "Tip Top Technologies",
    role: "AI/ML Engineer",
    start: "Oct 2024",
    end: "Present",
    location: "Sunnyvale, CA",
    current: true,
    highlights: [
      "Redesigned the real-time recommendation ranking pipeline (retrieval + re-ranking) for News360, lifting NDCG@10 by 15% and cutting p95 latency from 120ms to under 50ms via profiling, caching, and serving optimizations.",
      "Built an embedding-based semantic retrieval system (FAISS + Pinecone) serving 2M+ queries/day with production monitoring, raising recall@100 by 12%.",
      "Shipped low-latency AI microservices on Kubernetes/AWS with CI/CD, observability, and reliability hooks.",
      "Building an agentic meeting copilot for COM360 — a voice interface backed by graph-based long-term memory, gated by explicit consent and guardrails.",
    ],
    tech: ["Python", "FAISS", "Pinecone", "Kubernetes", "AWS", "LLMs", "CI/CD"],
  },
  {
    company: "Samvid",
    role: "AI Intern",
    start: "Jul 2024",
    end: "Sep 2024",
    location: "Remote",
    highlights: [
      "Built LLM evaluation pipelines benchmarking quality and latency across GPT-4o, Gemini, and AWS Bedrock models (Claude, Llama 3.1, Mistral) to inform production-readiness decisions.",
      "Automated data-validation workflows (schema, nulls, distributions) for ML pipelines, accelerating iteration ~40% and cutting cross-team syncs by ~6 hours/week.",
      "Added real-time monitoring and structured logging for model evaluation and deployment stability.",
    ],
    tech: ["GPT-4o", "Claude", "AWS Bedrock", "LangChain", "RAG", "Python"],
  },
  {
    company: "Searchspring",
    role: "Data Scientist",
    start: "Apr 2023",
    end: "Aug 2023",
    location: "Remote",
    highlights: [
      "Developed spell-correction NLP models that improved search relevance by 30%.",
      "Built large-scale Databricks PySpark ETL pipelines, boosting analytics throughput by 40%.",
    ],
    tech: ["PySpark", "Databricks", "NLP", "Python"],
  },
  {
    company: "Anju Life Sciences Software",
    role: "Data Scientist",
    start: "Mar 2021",
    end: "Dec 2022",
    location: "Pune, India",
    highlights: [
      "Led HIPAA-compliant analytics across clinical-trial, claims, and EHR datasets; raised ingestion throughput by 45% with optimized ETL pipelines and SQL Server stored procedures.",
      "Built REST APIs to deliver ML-assisted insights.",
    ],
    tech: ["SQL Server", "REST APIs", "Healthcare"],
  },
];
