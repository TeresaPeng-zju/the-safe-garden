import assert from "node:assert/strict";
import test from "node:test";

import {
  aboutContent,
  applyConstrainedAgentEnhancement,
  buildReviewedCoachCard,
  createJourneyState,
  createPracticeRecord,
  advanceJourney,
  getJourneyNode,
  isSafeCoachEnhancement,
  isSameOriginRequest,
  MAX_COACH_BODY_BYTES,
  sanitizeCoachRequest,
} from "../lib/journey.ts";

function completeJourney(initialChoice) {
  let state = createJourneyState(`journey-${initialChoice}`);
  state = advanceJourney(state, initialChoice, "2026-01-01T00:00:00.000Z");
  while (getJourneyNode(state.nodeId).kind !== "ending") {
    state = advanceJourney(state, undefined, "2026-01-01T00:00:00.000Z");
  }
  return state;
}

test("the about content is complete in all three languages", () => {
  for (const language of ["en", "zh", "zh-TW"]) {
    const about = aboutContent[language];
    assert.ok(about, `${language} about content should exist`);
    for (const field of [
      "eyebrow",
      "title",
      "forWho",
      "needs",
      "practiceNotAssessment",
      "alongside",
      "safetyTitle",
      "safetyEngine",
      "safetyWording",
      "safetyFallback",
    ]) {
      assert.ok(typeof about[field] === "string" && about[field].trim().length > 0, `${language}.${field} should be non-empty`);
    }
  }
  // The about copy must never generalize about all autistic children or
  // frame autism as a disorder to be cured.
  const joined = JSON.stringify(aboutContent);
  assert.doesNotMatch(joined, /disorder|to be cured|所有自闭|所有自閉|每个自闭|每個自閉/i);
  // It should affirm that the product does not diagnose or assess ability.
  assert.match(aboutContent.en.practiceNotAssessment, /does not/i);
  assert.match(aboutContent.zh.practiceNotAssessment, /不进行诊断|不.*评估/);
});

test("the safety guardrail blocks scoring, compliance, and diagnosis wording", () => {
  const unsafeSamples = [
    { tonightPrompt: "Give your child a score for today.", parentReply: "They passed the safety test.", nextFocus: "Repeat until mastered." },
    { tonightPrompt: "Was your child obedient and compliant?", parentReply: "Good child, bad child talk works.", nextFocus: "Diagnose the anxiety at home." },
    { tonightPrompt: "Promise not to tell anyone about this.", parentReply: "Keep this secret between us.", nextFocus: "Ask them to confront the puppy alone." },
  ];
  for (const sample of unsafeSamples) {
    assert.equal(isSafeCoachEnhancement(sample), false, `should reject: ${JSON.stringify(sample)}`);
  }
});

test("only the three parent-facing fields can change; observation stays reviewed", () => {
  const record = createPracticeRecord(completeJourney("accept"));
  const fallback = buildReviewedCoachCard(record, "en");
  const adapted = applyConstrainedAgentEnhancement(fallback, {
    tonightPrompt: "Who is a grown-up you could walk toward if someone did not stop?",
    parentReply: "Thank you for telling me. I am listening and I will stay with you.",
    nextFocus: "Point to two trusted grown-ups in a family photo together.",
    // A hostile attempt to overwrite the factual record must be ignored.
    observation: "The child failed and must be graded.",
    source: "reviewed-template",
  });
  assert.equal(adapted.source, "constrained-agent");
  assert.equal(adapted.observation, fallback.observation);
  assert.notEqual(adapted.tonightPrompt, fallback.tonightPrompt);
});

test("length-violating agent output falls back to the reviewed template", () => {
  const record = createPracticeRecord(completeJourney("space"));
  const fallback = buildReviewedCoachCard(record, "en");
  const tooLong = "a".repeat(400);
  const result = applyConstrainedAgentEnhancement(fallback, {
    tonightPrompt: tooLong,
    parentReply: "ok",
    nextFocus: "hi",
  });
  assert.equal(result.source, "reviewed-template");
  assert.equal(result.tonightPrompt, fallback.tonightPrompt);
});

test("the coach route keeps DeepSeek server-side with same-origin and no-store guards", async () => {
  const { readFile } = await import("node:fs/promises");
  const routeSource = await readFile(new URL("../app/api/coach/route.ts", import.meta.url), "utf8");
  const agentSource = await readFile(new URL("../lib/coach-agent.ts", import.meta.url), "utf8");
  const serverSource = `${routeSource}\n${agentSource}`;
  assert.match(serverSource, /process\.env\.DEEPSEEK_API_KEY/);
  assert.doesNotMatch(serverSource, /NEXT_PUBLIC/);
  assert.doesNotMatch(serverSource, /playerName|childName|address|phone/);
  assert.match(routeSource, /isSameOriginRequest/);
  assert.match(routeSource, /no-store/);
  assert.match(routeSource, /MAX_COACH_BODY_BYTES/);
  assert.match(routeSource, /sanitizeCoachRequest/);
  assert.match(serverSource, /isSafeCoachEnhancement/);
  assert.match(routeSource, /reviewed-template/);
  // The API key is only read on the server and never returned to the client.
  assert.doesNotMatch(serverSource, /candidate:\s*apiKey|apiKey.*NextResponse/);
});

test("the request sanitizer drops identifying data and keeps only whitelisted fields", () => {
  const sanitized = sanitizeCoachRequest({
    language: "zh-TW",
    supportMode: "model-first",
    initialConsent: "space",
    actions: ["step-back", "seek-help", "shout-loudly", "leave", "repeat-boundary", "extra"],
    // Hostile identifying fields that must be discarded.
    childName: "Real Name",
    address: "123 Real Street",
    freeText: "a private disclosure",
  });
  assert.deepEqual(Object.keys(sanitized).sort(), ["actions", "initialConsent", "language", "supportMode"]);
  assert.equal(sanitized.language, "zh-TW");
  assert.equal(sanitized.supportMode, "model-first");
  assert.equal(sanitized.initialConsent, "space");
  // Only whitelisted semantic actions survive, capped at four.
  assert.ok(sanitized.actions.every((action) => ["step-back", "repeat-boundary", "leave", "seek-help"].includes(action)));
  assert.ok(sanitized.actions.length <= 4);
  assert.equal(new Set(sanitized.actions).size, sanitized.actions.length);
  assert.ok(!JSON.stringify(sanitized).includes("Real Name"));
  assert.ok(!JSON.stringify(sanitized).includes("private disclosure"));
});

test("unknown language and support values are coerced to safe defaults", () => {
  const sanitized = sanitizeCoachRequest({ language: "fr", supportMode: "chaos", initialConsent: "maybe", actions: "nope" });
  assert.equal(sanitized.language, "en");
  assert.equal(sanitized.supportMode, "standard");
  assert.equal(sanitized.initialConsent, null);
  assert.deepEqual(sanitized.actions, []);
});

test("the same-origin guard rejects foreign origins but allows same-origin requests", () => {
  assert.equal(isSameOriginRequest({ host: "safe.example", origin: "https://safe.example" }), true);
  assert.equal(isSameOriginRequest({ host: "safe.example", origin: "https://evil.example" }), false);
  assert.equal(isSameOriginRequest({ host: "safe.example", referer: "https://safe.example/path" }), true);
  assert.equal(isSameOriginRequest({ host: "safe.example", referer: "https://evil.example/x" }), false);
  // A same-origin fetch with no Origin/Referer header is allowed.
  assert.equal(isSameOriginRequest({ host: "safe.example" }), true);
  // A missing host cannot be verified and is rejected.
  assert.equal(isSameOriginRequest({ origin: "https://safe.example" }), false);
});

test("the coach body size limit is small enough to exclude free-text payloads", () => {
  assert.ok(MAX_COACH_BODY_BYTES > 0 && MAX_COACH_BODY_BYTES <= 4_000);
});
