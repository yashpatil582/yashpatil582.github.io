import type { SkillGroup } from "./types";

export const skills: SkillGroup[] = [
  {
    name: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "SQL", "Java", "Bash"],
  },
  {
    name: "LLMs & Agents",
    skills: [
      "LangChain",
      "LlamaIndex",
      "RAG",
      "Multi-Agent",
      "MCP",
      "Prompt Engineering",
      "Evals",
    ],
  },
  {
    name: "Models",
    skills: ["GPT-4o", "Claude", "Gemini", "Llama", "Mistral", "gpt-oss"],
  },
  {
    name: "Retrieval & Vector DBs",
    skills: ["FAISS", "Pinecone", "pgvector", "Chroma", "BGE / nomic embeddings"],
  },
  {
    name: "ML & Data Science",
    skills: ["PyTorch", "TensorFlow", "scikit-learn", "Transformers", "NLP", "Forecasting"],
  },
  {
    name: "Data Engineering",
    skills: ["Spark / PySpark", "Databricks", "Kafka", "BigQuery", "ETL/ELT"],
  },
  {
    name: "Cloud & MLOps",
    skills: [
      "AWS (Bedrock)",
      "GCP (BigQuery)",
      "Azure OpenAI",
      "Docker",
      "Kubernetes",
      "CI/CD",
    ],
  },
  {
    name: "Visualization",
    skills: ["Streamlit", "Tableau", "Power BI", "Matplotlib", "Plotly"],
  },
];
