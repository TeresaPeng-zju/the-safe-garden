import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createSafeGardenMcpServer } from "../../../lib/mcp-server.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MCP_BODY_BYTES = 12_000;
const corsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
  "Cache-Control": "no-store, max-age=0",
} as const;

async function handleMcpRequest(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_MCP_BODY_BYTES) {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32600, message: "Request body too large" }, id: null },
      { status: 413, headers: corsHeaders },
    );
  }

  let parsedBody: unknown;
  if (request.method === "POST") {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_MCP_BODY_BYTES) {
      return Response.json(
        { jsonrpc: "2.0", error: { code: -32600, message: "Request body too large" }, id: null },
        { status: 413, headers: corsHeaders },
      );
    }
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        { status: 400, headers: corsHeaders },
      );
    }
  }

  const server = createSafeGardenMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  const response = await transport.handleRequest(request, { parsedBody });
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const GET = handleMcpRequest;
export const POST = handleMcpRequest;
export const DELETE = handleMcpRequest;

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}
