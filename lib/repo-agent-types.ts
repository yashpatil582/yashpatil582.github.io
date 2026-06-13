import type { UIMessage } from "ai";

/** The repo agent streams standard tool + text parts; no custom data parts. */
export type RepoAgentUIMessage = UIMessage;

/** Human labels for each MCP tool, shown in the live tool-call timeline. */
export const REPO_TOOL_LABELS: Record<string, string> = {
  get_repo_metadata: "Reading repo metadata",
  list_repo_tree: "Inspecting the file tree",
  read_readme: "Reading the README",
  read_file: "Reading a file",
};

/**
 * A short, human description of a tool step — refining the label with the most
 * useful argument (e.g. the file path or tree prefix) when present.
 */
export function describeToolStep(toolName: string, input: unknown): string {
  const base = REPO_TOOL_LABELS[toolName] ?? toolName;
  const args = (input ?? {}) as Record<string, unknown>;
  if (toolName === "read_file" && typeof args.path === "string") {
    return `Reading ${args.path}`;
  }
  if (toolName === "list_repo_tree" && typeof args.path === "string" && args.path) {
    return `Inspecting ${args.path}/`;
  }
  return base;
}
