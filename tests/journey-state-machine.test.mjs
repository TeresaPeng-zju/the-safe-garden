import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceJourney,
  applyConstrainedAgentEnhancement,
  buildReviewedCoachCard,
  createJourneyState,
  createPracticeRecord,
  getJourneyNode,
  hugBoundaryJourney,
  parsePracticeRecords,
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
  assert.equal(twice[0].contentVersion, "park-bubble-v1.2");
});

test("malformed device history is discarded instead of breaking the family view", () => {
  const valid = createPracticeRecord(completeJourney("space"), "2026-01-01T00:05:00.000Z");
  const parsed = parsePracticeRecords(JSON.stringify([
    valid,
    { ...valid, id: "bad-date", completedAt: "not-a-date" },
    { ...valid, id: "bad-action", events: [{ ...valid.events[0], action: "invented-action" }] },
    { ...valid, id: "bad-shape", journeyId: null },
  ]));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, valid.id);
});

test("completed practice records the exploration, support style, and chosen garden plot", () => {
  const state = completeJourney("space");
  const record = createPracticeRecord(state, "2026-01-01T00:05:00.000Z", {
    discoveries: ["petal", "stone"],
    supportMode: "model-first",
    gardenPlot: 5,
  });
  assert.deepEqual(record.discoveries, ["petal", "stone"]);
  assert.equal(record.supportMode, "model-first");
  assert.equal(record.gardenPlot, 5);
});

test("coach output is factual and unsafe agent wording falls back to reviewed templates", () => {
  const record = createPracticeRecord(completeJourney("accept"));
  const fallback = buildReviewedCoachCard(record, "en");
  const result = applyConstrainedAgentEnhancement(fallback, {
    tonightPrompt: "Did your child pass the lesson?",
    parentReply: "Give them a correct score.",
    nextFocus: "Practice until this ability is mastered.",
  });
  assert.equal(result.source, "reviewed-template");
  assert.equal(result.observation, fallback.observation);
  assert.doesNotMatch(JSON.stringify(result), /score|correct|passed|ability|mastered/i);
});

test("a bounded agent can adapt parent wording but cannot change factual observation", () => {
  const record = createPracticeRecord(completeJourney("space"));
  const fallback = buildReviewedCoachCard(record, "en");
  const result = applyConstrainedAgentEnhancement(fallback, {
    tonightPrompt: "Which grown-up could you walk to if someone does not stop?",
    parentReply: "Thank you for telling me. I will listen and stay with you.",
    nextFocus: "Choose two trusted adults and practice pointing to their pictures.",
  });
  assert.equal(result.source, "constrained-agent");
  assert.equal(result.observation, fallback.observation);
});

test("reviewed coaching stays factual for partial records and adapts to support style", () => {
  const full = createPracticeRecord(completeJourney("space"), undefined, { supportMode: "model-first" });
  assert.match(buildReviewedCoachCard(full, "zh").nextFocus, /家长先示范/);

  const partial = { ...full, events: full.events.filter((event) => event.action === "step-back") };
  const card = buildReviewedCoachCard(partial, "zh");
  assert.match(card.observation, /1 个已练习的安全动作/);
  assert.doesNotMatch(card.observation, /离开并向可信赖的大人求助/);
  assert.match(card.nextFocus, /清楚地说/);
});

test("every journey node and coach card includes Traditional Chinese", () => {
  for (const node of hugBoundaryJourney) {
    assert.ok(node.text["zh-TW"], `${node.id} should include Traditional Chinese text`);
    if (node.cta) assert.ok(node.cta["zh-TW"], `${node.id} should include a Traditional Chinese action`);
    for (const choice of node.choices ?? []) {
      assert.ok(choice.label["zh-TW"], `${node.id}/${choice.id} should include a Traditional Chinese label`);
    }
  }
  const record = createPracticeRecord(completeJourney("space"));
  const coachCard = buildReviewedCoachCard(record, "zh-TW");
  assert.match(coachCard.observation, /選擇|練習|可信賴/);
  assert.match(coachCard.parentReply, /謝謝|相信/);
});
