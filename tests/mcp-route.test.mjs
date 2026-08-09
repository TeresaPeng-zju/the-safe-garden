import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../app/api/mcp/route.ts";

const endpoint = "https://safe-garden.example/api/mcp";

async function mcpRequest(body) {
  return POST(new Request(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }));
}

test("MCP initialize succeeds without authentication", async () => {
  const response = await mcpRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "competition-test", version: "1.0.0" },
    },
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.result.serverInfo.name, "the-safe-garden");
  assert.equal(payload.result.serverInfo.version, "1.1.0");
  assert.equal(payload.result.protocolVersion, "2025-06-18");
});

test("MCP tools/list exposes a stable tool with JSON Schema", async () => {
  const response = await mcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.result.tools.length, 1);
  const [tool] = payload.result.tools;
  assert.equal(tool.name, "create_parent_coaching_card");
  assert.equal(tool.annotations.idempotentHint, false);
  assert.equal(tool.inputSchema.type, "object");
  assert.ok(tool.inputSchema.properties.language);
});

test("MCP tools/call returns a complete reviewed fallback without an API key", async () => {
  const response = await mcpRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "create_parent_coaching_card",
      arguments: {
        language: "zh",
        supportMode: "model-first",
        initialConsent: "space",
        actions: ["step-back", "repeat-boundary", "leave", "seek-help"],
      },
    },
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.result.isError, undefined);
  assert.equal(payload.result.structuredContent.source, "reviewed-template");
  assert.match(payload.result.structuredContent.observation, /需要空间|可信赖/);
  assert.ok(payload.result.structuredContent.tonightPrompt);
  assert.ok(payload.result.structuredContent.parentReply);
  assert.ok(payload.result.structuredContent.nextFocus);
});

test("MCP coaching never invents unrecorded actions", async () => {
  const response = await mcpRequest({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "create_parent_coaching_card",
      arguments: { language: "zh", actions: ["step-back"] },
    },
  });
  const payload = await response.json();
  assert.match(payload.result.structuredContent.observation, /1 个已练习的安全动作/);
  assert.doesNotMatch(payload.result.structuredContent.observation, /离开并向可信赖的大人求助/);
});

test("MCP rejects malformed and oversized bodies before the SDK parses them", async () => {
  const malformed = await POST(new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not-json",
  }));
  assert.equal(malformed.status, 400);

  const oversized = await POST(new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(13_000) }),
  }));
  assert.equal(oversized.status, 413);
});
