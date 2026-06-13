import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { jsonSchema, tool, type ToolSet } from "ai";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// The JSON Schema shape jsonSchema() accepts, derived from the function itself so
// we don't depend on @ai-sdk/provider being hoisted as a direct dependency.
type JsonSchemaInput = Parameters<typeof jsonSchema>[0];

/**
 * Connect an in-process MCP server to an MCP client over a linked in-memory
 * transport (a real initialize + tools/list + tools/call handshake), then expose
 * its tools as an AI SDK ToolSet. Every AI SDK tool call round-trips through the
 * MCP protocol — this is the part that demonstrates MCP, end to end.
 */
export async function bridgeMcpServer(
  server: McpServer,
): Promise<{ tools: ToolSet; close: () => Promise<void> }> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "repo-agent-bridge", version: "1.0.0" });

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const { tools: mcpTools } = await client.listTools();
  const tools: ToolSet = {};

  for (const t of mcpTools) {
    tools[t.name] = tool({
      description: t.description,
      inputSchema: jsonSchema(t.inputSchema as JsonSchemaInput),
      execute: async (args) => {
        try {
          const result = await client.callTool({
            name: t.name,
            arguments: (args ?? {}) as Record<string, unknown>,
          });
          const parts = Array.isArray(result.content) ? result.content : [];
          const body = parts
            .filter((c): c is { type: "text"; text: string } => c?.type === "text")
            .map((c) => c.text)
            .join("\n");
          // Surface tool errors to the model as readable text (not a thrown
          // exception) so a blocked path or budget limit just steers the agent.
          return result.isError ? `ERROR: ${body || "tool failed"}` : body;
        } catch {
          return "ERROR: that tool call could not be completed.";
        }
      },
    });
  }

  const close = async () => {
    await client.close().catch(() => {});
    await server.close().catch(() => {});
  };

  return { tools, close };
}
