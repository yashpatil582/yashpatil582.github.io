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
      "LangGraph",
      "LlamaIndex",
      "RAG",
      "Multi-Agent",
      "MCP",
      "Prompt Engineering",
      "HITL",
      "Evals (Braintrust)",
    ],
  },
  {
    name: "Models",
    skills: ["GPT-4o", "Claude", "Gemini", "Llama", "Qwen", "Mistral", "gpt-oss"],
  },
  {
    name: "Retrieval & Vector DBs",
    skills: [
      "FAISS",
      "Pinecone",
      "Qdrant",
      "pgvector",
      "Chroma",
      "OpenSearch",
      "BGE / nomic embeddings",
    ],
  },
  {
    name: "ML & Data Science",
    skills: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "Transformers",
      "NLP",
      "Forecasting",
      "A/B Testing",
    ],
  },
  {
    name: "Data Engineering",
    skills: [
      "Spark / PySpark",
      "Databricks",
      "Airflow",
      "dbt",
      "Kafka",
      "BigQuery",
      "Snowflake",
      "ETL/ELT",
    ],
  },
  {
    name: "Cloud & MLOps",
    skills: [
      "AWS (Bedrock, SageMaker, Lambda, Glue)",
      "GCP (Vertex AI, BigQuery)",
      "Azure OpenAI",
      "Docker",
      "Kubernetes",
      "Terraform",
      "CI/CD",
    ],
  },
  {
    name: "Visualization",
    skills: ["Streamlit", "Tableau", "Power BI", "Matplotlib", "Plotly"],
  },
];
