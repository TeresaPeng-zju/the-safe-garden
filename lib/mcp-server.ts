import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { requestCoachAgent } from "./coach-agent.ts";
import {
  applyConstrainedAgentEnhancement,
  buildReviewedCoachCard,
  sanitizeCoachRequest,
  type PracticeRecord,
  type SanitizedCoachRequest,
} from "./journey.ts";

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
  observation: z.string().describe("Factual, non-scoring summary owned by the reviewed rule engine."),
  tonightPrompt: z.string().describe("One calm open question for a parent to ask."),
  parentReply: z.string().describe("One listening-first response a parent can use."),
  nextFocus: z.string().describe("One small, optional next practice."),
  source: z.enum(["reviewed-template", "constrained-agent"]).describe("Whether reviewed fallback wording or bounded AI wording was returned."),
});

function makeCompletedRecord(practice: SanitizedCoachRequest): PracticeRecord {
  return {
    id: "mcp-anonymous-practice",
    journeyId: "mcp-hug-boundary",
    contentVersion: "park-bubble-v1.2",
    completedAt: "1970-01-01T00:00:00.000Z",
    initialConsent: practice.initialConsent,
    events: practice.actions.map((action, index) => ({
      id: `mcp-action-${index + 1}`,
      nodeId: action,
      actor: "player",
      action,
      occurredAt: "anonymous-practice",
    })),
    supportMode: practice.supportMode,
  };
}

export function createSafeGardenMcpServer(): McpServer {
  const server = new McpServer({
    name: "the-safe-garden",
    version: "1.1.0",
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
        idempotentHint: false,
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
