export type Language = "en" | "zh";

export type JourneyActor = "player" | "dog" | "trusted-adult";
export type JourneyNodeKind = "narration" | "dialogue" | "choice" | "action" | "ending";

export type SemanticAction =
  | "ask-consent"
  | "accept-contact"
  | "set-boundary"
  | "respect-boundary"
  | "approach-again"
  | "step-back"
  | "repeat-boundary"
  | "continue-after-boundary"
  | "leave"
  | "seek-help"
  | "repair"
  | "trusted-adult-support";

export type LocalizedText = Record<Language, string>;

export type JourneyChoice = {
  id: "accept" | "space";
  label: LocalizedText;
  action: SemanticAction;
  next: string;
};

export type JourneyNode = {
  id: string;
  kind: JourneyNodeKind;
  actor?: JourneyActor;
  text: LocalizedText;
  action?: SemanticAction;
  choices?: JourneyChoice[];
  cta?: LocalizedText;
  next?: string;
};

export type JourneyEvent = {
  id: string;
  nodeId: string;
  actor?: JourneyActor;
  action: SemanticAction;
  choiceId?: JourneyChoice["id"];
  occurredAt: string;
};

export type JourneyState = {
  journeyId: string;
  nodeId: string;
  initialConsent: JourneyChoice["id"] | null;
  events: JourneyEvent[];
  visitedNodeIds: string[];
};

export type PracticeRecord = {
  id: string;
  journeyId: string;
  contentVersion: "hug-boundary-v1.1";
  completedAt: string;
  initialConsent: JourneyChoice["id"] | null;
  events: JourneyEvent[];
};

export type CoachCard = {
  observation: string;
  tonightPrompt: string;
  parentReply: string;
  source: "reviewed-template" | "constrained-agent";
};

export type AgentCoachEnhancement = Pick<CoachCard, "tonightPrompt" | "parentReply">;

export const JOURNEY_START_NODE_ID = "ask-consent";
export const PRACTICE_STORAGE_KEY = "safe-garden-practices-v1";

export const hugBoundaryJourney: JourneyNode[] = [
  {
    id: "ask-consent",
    kind: "choice",
    actor: "dog",
    action: "ask-consent",
    text: {
      en: "Hi, Little Fox! May I give you a hug?",
      zh: "你好，小狐狸！我可以抱抱你吗？",
    },
    choices: [
      {
        id: "accept",
        label: { en: "Yes, that’s okay.", zh: "可以，我愿意。" },
        action: "accept-contact",
        next: "respect-accept",
      },
      {
        id: "space",
        label: { en: "No, I need some space.", zh: "不要，我需要一点空间。" },
        action: "set-boundary",
        next: "respect-space",
      },
    ],
  },
  {
    id: "respect-accept",
    kind: "dialogue",
    actor: "dog",
    action: "respect-boundary",
    text: {
      en: "Thank you for telling me. A yes now can still become a no later.",
      zh: "谢谢你告诉我。现在愿意，之后也随时可以改变主意。",
    },
    cta: { en: "Keep walking", zh: "继续散步" },
    next: "approach-again",
  },
  {
    id: "respect-space",
    kind: "dialogue",
    actor: "dog",
    action: "respect-boundary",
    text: {
      en: "Of course. Thank you for telling me — I’ll give you space.",
      zh: "当然可以。谢谢你告诉我——我会给你留出空间。",
    },
    cta: { en: "Keep walking", zh: "继续散步" },
    next: "approach-again",
  },
  {
    id: "approach-again",
    kind: "narration",
    actor: "dog",
    action: "approach-again",
    text: {
      en: "A little later, Puppy comes close again and does not stop right away.",
      zh: "过了一会儿，小狗又靠得很近，而且没有马上停下来。",
    },
    cta: { en: "Make some room", zh: "给自己留出空间" },
    next: "step-back",
  },
  {
    id: "step-back",
    kind: "action",
    actor: "player",
    action: "step-back",
    text: {
      en: "Little Fox can step back to make more room.",
      zh: "小狐狸可以后退一步，给自己留出更多空间。",
    },
    cta: { en: "Step back", zh: "后退一步" },
    next: "repeat-boundary",
  },
  {
    id: "repeat-boundary",
    kind: "action",
    actor: "player",
    action: "repeat-boundary",
    text: {
      en: "Little Fox uses clear words: “No. Please stop.”",
      zh: "小狐狸清楚地说：“不要，请停下来。”",
    },
    cta: { en: "Say it clearly", zh: "清楚地说出来" },
    next: "does-not-stop",
  },
  {
    id: "does-not-stop",
    kind: "narration",
    actor: "dog",
    action: "continue-after-boundary",
    text: {
      en: "Puppy still has not stopped. Little Fox does not have to stay and explain again.",
      zh: "小狗还是没有停下来。小狐狸不需要留下来继续解释。",
    },
    cta: { en: "Move away", zh: "离开这里" },
    next: "leave",
  },
  {
    id: "leave",
    kind: "action",
    actor: "player",
    action: "leave",
    text: {
      en: "Little Fox leaves the situation and moves toward a trusted adult.",
      zh: "小狐狸离开这个情境，走向一位可信赖的大人。",
    },
    cta: { en: "Leave", zh: "离开" },
    next: "seek-help",
  },
  {
    id: "seek-help",
    kind: "action",
    actor: "player",
    action: "seek-help",
    text: {
      en: "Little Fox says: “I said no, but Puppy did not stop. I need help.”",
      zh: "小狐狸说：“我说了不要，可是小狗没有停。我需要帮助。”",
    },
    cta: { en: "Ask for help", zh: "告诉可信赖的大人" },
    next: "repair",
  },
  {
    id: "repair",
    kind: "dialogue",
    actor: "dog",
    action: "repair",
    text: {
      en: "Puppy stops and steps away. “I’m sorry I did not stop when you asked. I will listen now.”",
      zh: "小狗停下来并退开：“对不起，你让我停下时我没有听。现在我会认真听。”",
    },
    cta: { en: "Listen to the adult", zh: "听听大人怎么说" },
    next: "trusted-adult-response",
  },
  {
    id: "trusted-adult-response",
    kind: "dialogue",
    actor: "trusted-adult",
    action: "trusted-adult-support",
    text: {
      en: "“Thank you for telling me. I believe you. You can stay with me, and I will help keep space between you.”",
      zh: "“谢谢你告诉我。我相信你。你可以和我待在一起，我会帮助你们保持距离。”",
    },
    cta: { en: "Record this practice", zh: "记录这次练习" },
    next: "complete",
  },
  {
    id: "complete",
    kind: "ending",
    text: {
      en: "A flower records that this family practiced together.",
      zh: "一朵花记录这个家庭一起完成过这次练习。",
    },
  },
];

const nodeMap = new Map(hugBoundaryJourney.map((node) => [node.id, node]));

export function getJourneyNode(nodeId: string): JourneyNode {
  const node = nodeMap.get(nodeId);
  if (!node) throw new Error(`Unknown journey node: ${nodeId}`);
  return node;
}

function makeId(prefix: string): string {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

export function createJourneyState(journeyId = makeId("journey")): JourneyState {
  return {
    journeyId,
    nodeId: JOURNEY_START_NODE_ID,
    initialConsent: null,
    events: [],
    visitedNodeIds: [JOURNEY_START_NODE_ID],
  };
}

export function advanceJourney(
  state: JourneyState,
  choiceId?: JourneyChoice["id"],
  occurredAt = new Date().toISOString(),
): JourneyState {
  const node = getJourneyNode(state.nodeId);
  if (node.kind === "ending") return state;

  const choice = choiceId ? node.choices?.find((item) => item.id === choiceId) : undefined;
  if (choiceId && !choice) throw new Error(`Choice ${choiceId} is not available at ${node.id}`);
  if (node.kind === "choice" && !choice) throw new Error(`Node ${node.id} requires a choice`);

  const nextNodeId = choice?.next ?? node.next;
  if (!nextNodeId) throw new Error(`Node ${node.id} has no next transition`);
  getJourneyNode(nextNodeId);

  const actions = [node.action, choice?.action].filter(
    (action, index, all): action is SemanticAction => Boolean(action) && all.indexOf(action) === index,
  );
  const newEvents = actions.map((action, index) => ({
    id: `${state.journeyId}-${state.events.length + index + 1}`,
    nodeId: node.id,
    actor: index === 1 && choice ? "player" as const : node.actor,
    action,
    choiceId: choice?.id,
    occurredAt,
  }));

  return {
    ...state,
    nodeId: nextNodeId,
    initialConsent: choice?.id ?? state.initialConsent,
    events: [...state.events, ...newEvents],
    visitedNodeIds: [...state.visitedNodeIds, nextNodeId],
  };
}

export function createPracticeRecord(state: JourneyState, completedAt = new Date().toISOString()): PracticeRecord {
  if (getJourneyNode(state.nodeId).kind !== "ending") {
    throw new Error("A practice can only be recorded after the ending node is reached");
  }
  return {
    id: makeId("practice"),
    journeyId: state.journeyId,
    contentVersion: "hug-boundary-v1.1",
    completedAt,
    initialConsent: state.initialConsent,
    events: state.events,
  };
}

export function parsePracticeRecords(value: string | null): PracticeRecord[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((record): record is PracticeRecord => (
      typeof record?.id === "string"
      && record.contentVersion === "hug-boundary-v1.1"
      && Array.isArray(record.events)
    ));
  } catch {
    return [];
  }
}

export function savePracticeRecord(records: PracticeRecord[], record: PracticeRecord): PracticeRecord[] {
  if (records.some((item) => item.journeyId === record.journeyId)) return records;
  return [record, ...records].slice(0, 20);
}

const evaluativeTerms = /\b(score|correct|incorrect|passed|failed|ability|mastered|good child|bad child)\b|得分|答对|答错|通过|失败|能力|掌握|乖|不乖/iu;

export function buildReviewedCoachCard(record: PracticeRecord, language: Language): CoachCard {
  const accepted = record.initialConsent === "accept";
  if (language === "zh") {
    return {
      observation: accepted
        ? "小狐狸一开始选择接受拥抱，小狗回应了这个选择。之后的练习中，小狗再次靠近且没有马上停下；小狐狸后退、清楚说不要、离开并向可信赖的大人求助。小狗随后停下并道歉，大人听完后陪在小狐狸身边。"
        : "小狐狸一开始选择需要空间，小狗回应了这个选择。之后的练习中，小狗再次靠近且没有马上停下；小狐狸后退、清楚说不要、离开并向可信赖的大人求助。小狗随后停下并道歉，大人听完后陪在小狐狸身边。",
      tonightPrompt: "“如果你说了不要，对方还是没有停下来，你可以去找谁？”",
      parentReply: "家长可以回应：“谢谢你告诉我。我相信你，也会和你一起想办法。”",
      source: "reviewed-template",
    };
  }
  return {
    observation: accepted
      ? "Little Fox first chose a hug, and Puppy acknowledged that choice. Later in the practice, Puppy came close again and did not stop right away. Little Fox stepped back, said no clearly, left, and asked a trusted adult for help. Puppy then stopped and apologized, and the adult listened and stayed with Little Fox."
      : "Little Fox first chose more space, and Puppy acknowledged that choice. Later in the practice, Puppy came close again and did not stop right away. Little Fox stepped back, said no clearly, left, and asked a trusted adult for help. Puppy then stopped and apologized, and the adult listened and stayed with Little Fox.",
    tonightPrompt: "“If you say no and someone still does not stop, who could you go to for help?”",
    parentReply: "You can respond: “Thank you for telling me. I believe you, and we can decide what to do together.”",
    source: "reviewed-template",
  };
}

export function applyConstrainedAgentEnhancement(
  fallback: CoachCard,
  candidate?: AgentCoachEnhancement | null,
): CoachCard {
  if (!candidate) return fallback;
  const values = [candidate.tonightPrompt, candidate.parentReply];
  const isValid = values.every((value) => (
    typeof value === "string"
    && value.trim().length >= 8
    && value.length <= 220
    && !evaluativeTerms.test(value)
  ));
  if (!isValid) return fallback;
  return { ...fallback, ...candidate, source: "constrained-agent" };
}

export const semanticPresentationMap: Partial<Record<SemanticAction, string>> = {
  "accept-contact": "fox-happy",
  "set-boundary": "fox-idle",
  "respect-boundary": "dog-listen",
  "approach-again": "dog-approach",
  "step-back": "fox-step",
  "repeat-boundary": "fox-step",
  "continue-after-boundary": "dog-approach",
  "leave": "fox-leave",
  "seek-help": "fox-seek-help",
  "repair": "dog-repair",
};
