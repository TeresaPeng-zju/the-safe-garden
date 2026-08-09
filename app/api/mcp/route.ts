import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { requestCoachAgent } from "../../../lib/coach-agent.ts";
import {
  applyConstrainedAgentEnhancement,
  buildReviewedCoachCard,
  sanitizeCoachRequest,
  type PracticeRecord,
  type SanitizedCoachRequest,
} from "../../../lib/journey.ts";

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

const languageSchema = z.enum(["en", "zh", "zh-TW"]);
const supportModeSchema = z.enum(["standard", "picture", "model-first"]);
const consentSchema = z.enum(["accept", "space"]);
const actionSchema = z.enum(["step-back", "repeat-boundary", "leave", "seek-help"]);

const coachingInputSchema = z.object({
  language: languageSchema.default("zh").describe("Output language: en, zh, or zh-TW."),
  supportMode: supportModeSchema.default("standard").describe("The visual support style used in the completed practice."),
  initialConsent: consentSchema.default("space").describe("Whether the child initially accepted contact or asked for space."),
  actions: z.array(actionSchema).max(4).default([
    "step-back",
    "repeat-boundary",
    "leave",
    "seek-help",
  ]).describe("Anonymous semantic actions completed during the practice."),
});

const coachingOutputSchema = z.object({
  observation: z.string(),
  tonightPrompt: z.string(),
  parentReply: z.string(),
  nextFocus: z.string(),
  source: z.enum(["reviewed-template", "constrained-agent"]),
});

function makeCompletedRecord(practice: SanitizedCoachRequest): PracticeRecord {
  return {
    id: "mcp-anonymous-practice",
    journeyId: "mcp-hug-boundary",
    contentVersion: "park-bubble-v1.2",
    completedAt: new Date().toISOString(),
    initialConsent: practice.initialConsent,
    events: [],
    supportMode: practice.supportMode,
  };
}

export function createSafeGardenMcpServer(): McpServer {
  const server = new McpServer({
    name: "the-safe-garden",
    version: "1.0.0",
  });

  server.registerTool(
    "create_parent_coaching_card",
    {
      title: "Create a safe parent coaching card",
      description: "Create one calm, non-scoring parent coaching card from an anonymous completed body-boundary practice. A reviewed safety template owns the factual observation; the constrained Agent may adapt only the question, supportive reply, and next small practice.",
      inputSchema: coachingInputSchema,
      outputSchema: coachingOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => {
      const practice = sanitizeCoachRequest(input);
      const reviewed = buildReviewedCoachCard(makeCompletedRecord(practice), practice.language);
      const agentResult = await requestCoachAgent(practice);
      const card = applyConstrainedAgentEnhancement(reviewed, agentResult.candidate);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(card),
        }],
        structuredContent: card,
      };
    },
  );

  return server;
}

async function handleMcpRequest(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_MCP_BODY_BYTES) {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32600, message: "Request body too large" }, id: null },
      { status: 413, headers: corsHeaders },
    );
  }

  const server = createSafeGardenMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  const response = await transport.handleRequest(request);
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
