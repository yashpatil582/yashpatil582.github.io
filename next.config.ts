import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the Docker image stays small and
  // the app runs the same on Vercel, a VPS, or any container host.
  output: "standalone",
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Keep these Node-only packages out of the bundler: the Postgres driver and
  // the in-process embeddings runtime (transformers.js + its native ONNX
  // backend) must load from node_modules at runtime, not be webpacked.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node", "pg"],
};

export default nextConfig;
