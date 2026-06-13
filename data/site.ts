/** Site-level config used for metadata, SEO, and canonical URLs. */
export const site = {
  name: "Yash Patil",
  /**
   * Canonical site URL. Set NEXT_PUBLIC_SITE_URL once the custom domain is
   * live (e.g. https://yashpatil.dev). Falls back to localhost in dev.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  title: "Yash Patil — AI/ML Engineer",
  description:
    "AI/ML engineer building production LLM, RAG, and agentic systems — retrieval at 2M+ queries/day, eval-driven, open-source-first.",
  ogImage: "/og.png",
} as const;
