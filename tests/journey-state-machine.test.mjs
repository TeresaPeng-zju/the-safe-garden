import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceJourney,
  applyConstrainedAgentEnhancement,
  buildReviewedCoachCard,
  createJourneyState,
  createPracticeRecord,
  getJourneyNode,
  savePracticeRecord,
} from "../lib/journey.ts";

function completeJourney(initialChoice) {
  let state = createJourneyState(`journey-${initialChoice}`);
  state = advanceJourney(state, initialChoice, "2026-01-01T00:00:00.000Z");
  while (getJourneyNode(state.nodeId).kind !== "ending") {
    state = advanceJourney(state, undefined, "2026-01-01T00:00:00.000Z");
  }
  return state;
}

test("both initial consent choices enter the same complete safety sequence", () => {
  for (const choice of ["accept", "space"]) {
    const state = completeJourney(choice);
    assert.equal(state.nodeId, "complete");
    assert.equal(state.initialConsent, choice);
    assert.deepEqual(
      state.events.map((event) => event.action),
      [
        "ask-consent",
        choice === "accept" ? "accept-contact" : "set-boundary",
        "respect-boundary",
        "approach-again",
        "step-back",
        "repeat-boundary",
        "continue-after-boundary",
        "leave",
        "seek-help",
        "repair",
        "trusted-adult-support",
      ],
    );
  }
});

test("a practice cannot be recorded before the trusted-adult ending", () => {
  const state = createJourneyState("journey-incomplete");
  assert.throws(() => createPracticeRecord(state), /only be recorded after the ending/i);
});

test("completed practices persist once per journey", () => {
  const state = completeJourney("space");
  const record = createPracticeRecord(state, "2026-01-01T00:05:00.000Z");
  const once = savePracticeRecord([], record);
  const twice = savePracticeRecord(once, record);
  assert.equal(once.length, 1);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].contentVersion, "hug-boundary-v1.1");
});

test("coach output is factual and unsafe agent wording falls back to reviewed templates", () => {
  const record = createPracticeRecord(completeJourney("accept"));
  const fallback = buildReviewedCoachCard(record, "en");
  const result = applyConstrainedAgentEnhancement(fallback, {
    tonightPrompt: "Did your child pass the lesson?",
    parentReply: "Give them a correct score.",
  });
  assert.equal(result.source, "reviewed-template");
  assert.equal(result.observation, fallback.observation);
  assert.doesNotMatch(JSON.stringify(result), /score|correct|passed|ability|mastered/i);
});
