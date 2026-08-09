export type Language = "en" | "zh" | "zh-TW";
export type SupportMode = "standard" | "picture" | "model-first";
export type DiscoveryId = "petal" | "stone";

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
  contentVersion: "hug-boundary-v1.1" | "park-bubble-v1.2";
  completedAt: string;
  initialConsent: JourneyChoice["id"] | null;
  events: JourneyEvent[];
  discoveries?: DiscoveryId[];
  gardenPlot?: number;
  supportMode?: SupportMode;
};

export type CoachCard = {
  observation: string;
  tonightPrompt: string;
  parentReply: string;
  nextFocus: string;
  source: "reviewed-template" | "constrained-agent";
};

export type AgentCoachEnhancement = Pick<CoachCard, "tonightPrompt" | "parentReply" | "nextFocus">;

export type PracticeContext = {
  discoveries?: DiscoveryId[];
  gardenPlot?: number;
  supportMode?: SupportMode;
};

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
      "zh-TW": "你好，小狐狸！我可以抱抱你嗎？",
    },
    choices: [
      {
        id: "accept",
        label: { en: "Yes, that’s okay.", zh: "可以，我愿意。", "zh-TW": "可以，我願意。" },
        action: "accept-contact",
        next: "respect-accept",
      },
      {
        id: "space",
        label: { en: "No, I need some space.", zh: "不要，我需要一点空间。", "zh-TW": "不要，我需要一點空間。" },
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
      "zh-TW": "謝謝你告訴我。現在願意，之後也隨時可以改變主意。",
    },
    cta: { en: "Keep walking", zh: "继续散步", "zh-TW": "繼續散步" },
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
      "zh-TW": "當然可以。謝謝你告訴我——我會留一些空間給你。",
    },
    cta: { en: "Keep walking", zh: "继续散步", "zh-TW": "繼續散步" },
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
      "zh-TW": "過了一會兒，小狗又靠得很近，而且沒有馬上停下來。",
    },
    cta: { en: "Make some room", zh: "给自己留出空间", "zh-TW": "為自己留出空間" },
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
      "zh-TW": "小狐狸可以後退一步，為自己留出更多空間。",
    },
    cta: { en: "Step back", zh: "后退一步", "zh-TW": "後退一步" },
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
      "zh-TW": "小狐狸清楚地說：「不要，請停下來。」",
    },
    cta: { en: "Say it clearly", zh: "清楚地说出来", "zh-TW": "清楚地說出來" },
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
      "zh-TW": "小狗還是沒有停下來。小狐狸不需要留下來繼續解釋。",
    },
    cta: { en: "Move away", zh: "离开这里", "zh-TW": "離開這裡" },
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
      "zh-TW": "小狐狸離開這個情境，走向一位可信賴的大人。",
    },
    cta: { en: "Leave", zh: "离开", "zh-TW": "離開" },
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
      "zh-TW": "小狐狸說：「我說了不要，可是小狗沒有停。我需要幫助。」",
    },
    cta: { en: "Ask for help", zh: "告诉可信赖的大人", "zh-TW": "告訴可信賴的大人" },
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
      "zh-TW": "小狗停下來並退開：「對不起，你要我停下時我沒有聽。現在我會認真聽。」",
    },
    cta: { en: "Listen to the adult", zh: "听听大人怎么说", "zh-TW": "聽聽大人怎麼說" },
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
      "zh-TW": "「謝謝你告訴我。我相信你。你可以和我待在一起，我會幫助你們保持距離。」",
    },
    cta: { en: "Record this practice", zh: "记录这次练习", "zh-TW": "記錄這次練習" },
    next: "complete",
  },
  {
    id: "complete",
    kind: "ending",
    text: {
      en: "A flower records that this family practiced together.",
      zh: "一朵花记录这个家庭一起完成过这次练习。",
      "zh-TW": "一朵花記錄這個家庭一起完成過這次練習。",
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

export function createPracticeRecord(
  state: JourneyState,
  completedAt = new Date().toISOString(),
  context: PracticeContext = {},
): PracticeRecord {
  if (getJourneyNode(state.nodeId).kind !== "ending") {
    throw new Error("A practice can only be recorded after the ending node is reached");
  }
  return {
    id: makeId("practice"),
    journeyId: state.journeyId,
    contentVersion: "park-bubble-v1.2",
    completedAt,
    initialConsent: state.initialConsent,
    events: state.events,
    discoveries: context.discoveries?.filter((item, index, all) => all.indexOf(item) === index),
    gardenPlot: typeof context.gardenPlot === "number" ? Math.max(0, Math.min(7, Math.round(context.gardenPlot))) : undefined,
    supportMode: context.supportMode,
  };
}

const semanticActions = new Set<SemanticAction>([
  "ask-consent",
  "accept-contact",
  "set-boundary",
  "respect-boundary",
  "approach-again",
  "step-back",
  "repeat-boundary",
  "continue-after-boundary",
  "leave",
  "seek-help",
  "repair",
  "trusted-adult-support",
]);

function isValidStoredDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function sanitizeStoredEvent(value: unknown): JourneyEvent | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Partial<JourneyEvent>;
  if (
    typeof event.id !== "string"
    || typeof event.nodeId !== "string"
    || typeof event.action !== "string"
    || !semanticActions.has(event.action as SemanticAction)
    || !isValidStoredDate(event.occurredAt)
  ) return null;
  if (event.actor && !["player", "dog", "trusted-adult"].includes(event.actor)) return null;
  if (event.choiceId && event.choiceId !== "accept" && event.choiceId !== "space") return null;
  return {
    id: event.id,
    nodeId: event.nodeId,
    action: event.action as SemanticAction,
    occurredAt: event.occurredAt,
    ...(event.actor ? { actor: event.actor } : {}),
    ...(event.choiceId ? { choiceId: event.choiceId } : {}),
  };
}

export function parsePracticeRecords(value: string | null): PracticeRecord[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 20).flatMap((value): PracticeRecord[] => {
      if (!value || typeof value !== "object") return [];
      const record = value as Partial<PracticeRecord>;
      if (
        typeof record.id !== "string"
        || typeof record.journeyId !== "string"
        || (record.contentVersion !== "hug-boundary-v1.1" && record.contentVersion !== "park-bubble-v1.2")
        || !isValidStoredDate(record.completedAt)
        || (record.initialConsent !== null && record.initialConsent !== "accept" && record.initialConsent !== "space")
        || !Array.isArray(record.events)
        || record.events.length > 32
      ) return [];
      const events = record.events.map(sanitizeStoredEvent);
      if (events.some((event) => event === null)) return [];

      const discoveries = Array.isArray(record.discoveries)
        ? record.discoveries.filter((item, index, all): item is DiscoveryId => (
          (item === "petal" || item === "stone") && all.indexOf(item) === index
        ))
        : undefined;
      const supportMode = record.supportMode === "standard" || record.supportMode === "picture" || record.supportMode === "model-first"
        ? record.supportMode
        : undefined;
      const gardenPlot = typeof record.gardenPlot === "number" && Number.isFinite(record.gardenPlot)
        ? Math.max(0, Math.min(7, Math.round(record.gardenPlot)))
        : undefined;

      return [{
        id: record.id,
        journeyId: record.journeyId,
        contentVersion: record.contentVersion,
        completedAt: record.completedAt,
        initialConsent: record.initialConsent,
        events: events as JourneyEvent[],
        ...(discoveries ? { discoveries } : {}),
        ...(supportMode ? { supportMode } : {}),
        ...(gardenPlot !== undefined ? { gardenPlot } : {}),
      }];
    });
  } catch {
    return [];
  }
}

export function savePracticeRecord(records: PracticeRecord[], record: PracticeRecord): PracticeRecord[] {
  if (records.some((item) => item.journeyId === record.journeyId)) return records;
  return [record, ...records].slice(0, 20);
}

const evaluativeTerms = /\b(score|correct|incorrect|passed|failed|ability|mastered|good child|bad child|good job|great job|well done|performance)\b|得分|答对|答错|通过|失败|能力|掌握|答對|答錯|通過|失敗|掌握|乖|不乖|很好|做得好|真棒|表现|表現/iu;

const coachingActionOrder = ["step-back", "repeat-boundary", "leave", "seek-help"] as const;
type CoachingAction = (typeof coachingActionOrder)[number];

const nextActionLabels: Record<Language, Record<CoachingAction, string>> = {
  en: {
    "step-back": "taking one step back to make room",
    "repeat-boundary": "using the clear words “No. Please stop.”",
    leave: "leaving without having to keep explaining",
    "seek-help": "going to a trusted adult and asking for help",
  },
  zh: {
    "step-back": "后退一步，给自己留出空间",
    "repeat-boundary": "清楚地说“不要，请停下来”",
    leave: "不必继续解释，直接离开",
    "seek-help": "走向可信赖的大人并请求帮助",
  },
  "zh-TW": {
    "step-back": "後退一步，為自己留出空間",
    "repeat-boundary": "清楚地說「不要，請停下來」",
    leave: "不必繼續解釋，直接離開",
    "seek-help": "走向可信賴的大人並請求幫助",
  },
};

const observationActionLabels: Record<Language, Record<CoachingAction, string>> = {
  en: { "step-back": "stepping back", "repeat-boundary": "saying no clearly", leave: "leaving", "seek-help": "asking a trusted adult for help" },
  zh: { "step-back": "后退", "repeat-boundary": "清楚说不要", leave: "离开", "seek-help": "向可信赖的大人求助" },
  "zh-TW": { "step-back": "後退", "repeat-boundary": "清楚說不要", leave: "離開", "seek-help": "向可信賴的大人求助" },
};

function completedCoachingActions(record: PracticeRecord): CoachingAction[] {
  const completed = new Set(record.events.map((event) => event.action));
  return coachingActionOrder.filter((action) => completed.has(action));
}

function nextPractice(language: Language, record: PracticeRecord, completed: CoachingAction[]): string {
  const missing = coachingActionOrder.find((action) => !completed.includes(action));

  if (missing) {
    if (language === "zh") return `下一次只练习一个小步骤：${nextActionLabels.zh[missing]}。`;
    if (language === "zh-TW") return `下一次只練習一個小步驟：${nextActionLabels["zh-TW"][missing]}。`;
    return `Next time, practice one small step: ${nextActionLabels.en[missing]}.`;
  }
  if (record.supportMode === "picture") {
    if (language === "zh") return "下次可以用照片指认家里或学校中两位可以求助的大人。";
    if (language === "zh-TW") return "下次可以用照片指認家裡或學校中兩位可以求助的大人。";
    return "Next time, use photos to point to two trusted adults at home or school.";
  }
  if (record.supportMode === "model-first") {
    if (language === "zh") return "下次可以由家长先示范一次走向可信赖大人求助，再邀请孩子按自己的方式尝试。";
    if (language === "zh-TW") return "下次可以由家長先示範一次走向可信賴大人求助，再邀請孩子按自己的方式嘗試。";
    return "Next time, let the parent model asking a trusted adult for help, then invite the child to try in their own way.";
  }
  if (language === "zh") return "下次可以继续练习：先辨认家里或学校中可以求助的两位大人。";
  if (language === "zh-TW") return "下次可以繼續練習：先辨認家裡或學校中可以求助的兩位大人。";
  return "Next time, identify two trusted adults at home or school who can help.";
}

export function buildReviewedCoachCard(record: PracticeRecord, language: Language): CoachCard {
  const accepted = record.initialConsent === "accept";
  const completed = completedCoachingActions(record);
  const hasFullSafetySequence = completed.length === coachingActionOrder.length;
  if (language === "zh") {
    return {
      observation: hasFullSafetySequence ? (accepted
        ? "小狐狸一开始选择接受拥抱，小狗回应了这个选择。之后的练习中，小狗再次靠近且没有马上停下；小狐狸后退、清楚说不要、离开并向可信赖的大人求助。小狗随后停下并道歉，大人听完后陪在小狐狸身边。"
        : "小狐狸一开始选择需要空间，小狗回应了这个选择。之后的练习中，小狗再次靠近且没有马上停下；小狐狸后退、清楚说不要、离开并向可信赖的大人求助。小狗随后停下并道歉，大人听完后陪在小狐狸身边。")
        : `这次匿名记录包含 ${completed.length} 个已练习的安全动作：${completed.length ? completed.map((action) => observationActionLabels.zh[action]).join("、") : "暂未记录具体动作"}。这里不根据动作数量评分。`,
      tonightPrompt: "“如果你说了不要，对方还是没有停下来，你可以去找谁？”",
      parentReply: "家长可以回应：“谢谢你告诉我。我相信你，也会和你一起想办法。”",
      nextFocus: nextPractice(language, record, completed),
      source: "reviewed-template",
    };
  }
  if (language === "zh-TW") {
    return {
      observation: hasFullSafetySequence ? (accepted
        ? "小狐狸一開始選擇接受擁抱，小狗回應了這個選擇。之後的練習中，小狗再次靠近且沒有馬上停下；小狐狸後退、清楚說不要、離開並向可信賴的大人求助。小狗隨後停下並道歉，大人聽完後陪在小狐狸身邊。"
        : "小狐狸一開始選擇需要空間，小狗回應了這個選擇。之後的練習中，小狗再次靠近且沒有馬上停下；小狐狸後退、清楚說不要、離開並向可信賴的大人求助。小狗隨後停下並道歉，大人聽完後陪在小狐狸身邊。")
        : `這次匿名記錄包含 ${completed.length} 個已練習的安全動作：${completed.length ? completed.map((action) => observationActionLabels["zh-TW"][action]).join("、") : "暫未記錄具體動作"}。這裡不根據動作數量評分。`,
      tonightPrompt: "「如果你說了不要，對方還是沒有停下來，你可以去找誰？」",
      parentReply: "家長可以回應：「謝謝你告訴我。我相信你，也會和你一起想辦法。」",
      nextFocus: nextPractice(language, record, completed),
      source: "reviewed-template",
    };
  }
  return {
    observation: hasFullSafetySequence ? (accepted
      ? "Little Fox first chose a hug, and Puppy acknowledged that choice. Later in the practice, Puppy came close again and did not stop right away. Little Fox stepped back, said no clearly, left, and asked a trusted adult for help. Puppy then stopped and apologized, and the adult listened and stayed with Little Fox."
      : "Little Fox first chose more space, and Puppy acknowledged that choice. Later in the practice, Puppy came close again and did not stop right away. Little Fox stepped back, said no clearly, left, and asked a trusted adult for help. Puppy then stopped and apologized, and the adult listened and stayed with Little Fox.")
      : `This anonymous record contains ${completed.length} practiced safety ${completed.length === 1 ? "action" : "actions"}: ${completed.length ? completed.map((action) => observationActionLabels.en[action]).join(", ") : "no specific actions recorded yet"}. Action counts are never used as a score.`,
    tonightPrompt: "“If you say no and someone still does not stop, who could you go to for help?”",
    parentReply: "You can respond: “Thank you for telling me. I believe you, and we can decide what to do together.”",
    nextFocus: nextPractice(language, record, completed),
    source: "reviewed-template",
  };
}

const disclosurePromises = /keep (this|it) secret|promise not to tell|一定保密|不要告訴|不要告诉|替你保密|為你保密/iu;
const harmfulCoachTerms = /\b(diagnos(?:e|ed|es|ing|is)|obedien(?:t|ce)|compliance|punish(?:ment|ed|ing)?|blame|confront .* alone)\b|诊断|診斷|服从|服從|惩罚|懲罰|责怪|責怪|独自面对|獨自面對/iu;
const coerciveNextFocus = /\b(must|required|force(?:d)?|until (?:they|the child))\b|必须|必須|强迫|強迫|一定要|直到孩子/iu;
const supportiveReplyOpening = /^[“”"'「『]?(?:thank|thanks|i hear|i am listening|i['’]m listening|i believe|i will listen|谢谢|謝謝|我听|我聽|我在听|我在聽|我相信|我会听|我會聽)/iu;

export function isSafeCoachEnhancement(candidate: unknown): candidate is AgentCoachEnhancement {
  if (!candidate || typeof candidate !== "object") return false;
  const value = candidate as Partial<AgentCoachEnhancement>;
  const values = [value.tonightPrompt, value.parentReply, value.nextFocus];
  if (!values.every((item) => (
    typeof item === "string"
    && item.trim().length >= 8
    && item.length <= 220
    && !evaluativeTerms.test(item)
    && !disclosurePromises.test(item)
    && !harmfulCoachTerms.test(item)
  ))) return false;
  return /[?？]/u.test(value.tonightPrompt as string)
    && supportiveReplyOpening.test((value.parentReply as string).trim())
    && !coerciveNextFocus.test(value.nextFocus as string);
}

export function applyConstrainedAgentEnhancement(
  fallback: CoachCard,
  candidate?: AgentCoachEnhancement | null,
): CoachCard {
  if (!isSafeCoachEnhancement(candidate)) return fallback;
  // Explicitly pick only the three parent-facing fields. The factual
  // observation and every other field always come from the reviewed template,
  // so a model can never overwrite the objective record even if it returns
  // extra keys.
  return {
    ...fallback,
    tonightPrompt: candidate.tonightPrompt.trim(),
    parentReply: candidate.parentReply.trim(),
    nextFocus: candidate.nextFocus.trim(),
    source: "constrained-agent",
  };
}

export type AboutContent = {
  eyebrow: string;
  title: string;
  originTitle: string;
  originStory: string;
  forWho: string;
  needs: string;
  practiceNotAssessment: string;
  alongside: string;
  safetyTitle: string;
  safetyEngine: string;
  safetyWording: string;
  safetyFallback: string;
};

// A restrained parent-side explanation of who this supports and why.
// It never appears in the child game and never labels the child.
export const aboutContent: Record<Language, AboutContent> = {
  en: {
    eyebrow: "About this practice",
    title: "Made for families who practice together",
    originTitle: "It began with one child",
    originStory: "The Safe Garden began with Xiaoshu (a pseudonym), an autistic primary-school child the creator met while volunteering. When a relative moved in for a hug, he stepped back but could not quickly explain it in words. Repeated verbal teaching soon felt like a test. This is the concrete, visual, repeatable practice we wished he and his family had in that moment.",
    forWho: "This is for families who prefer concrete, visual, repeatable practice rather than abstract talks.",
    needs: "It was shaped with the different language, reading, picture-cue, and pacing needs that many autistic children value in mind.",
    practiceNotAssessment: "It offers practice support. It does not assess, diagnose, or measure a child’s ability.",
    alongside: "Use it alongside your child’s own way of communicating and any professional support you already have.",
    safetyTitle: "How safety and AI work here",
    safetyEngine: "A reviewed rule engine owns the child story, safety steps, and the factual record. It always runs, with or without AI.",
    safetyWording: "The optional AI can only soften the parent wording — one question, one reply, one small next step.",
    safetyFallback: "Anything unsafe, slow, or malformed falls back to the reviewed offline template automatically.",
  },
  zh: {
    eyebrow: "关于这次练习",
    title: "为一起练习的家庭而做",
    originTitle: "它从一个具体的孩子开始",
    originStory: "The Safe Garden 从小树（化名）开始。他是创作者做公益时认识的一名小学阶段自闭症儿童。一次亲友想拥抱他时，他明显后退，却来不及用语言说明；事后的反复口头讲解又很快变成了问答测试。这正是当时希望能送给他和家人的那段具体、视觉化、可重复且不评分的练习。",
    forWho: "这适合更偏好具体、视觉化、可重复练习方式的家庭，而不是抽象的说教。",
    needs: "设计时特别考虑了许多自闭症儿童所看重的、不同的语言、阅读、图片提示与节奏需求。",
    practiceNotAssessment: "它提供的是练习支持，不进行诊断，也不评估孩子的能力。",
    alongside: "请结合孩子自己的沟通方式，以及你已经在使用的专业支持一起使用。",
    safetyTitle: "这里的安全与 AI 如何运作",
    safetyEngine: "经过审核的规则引擎负责儿童剧情、安全步骤和客观记录。无论有没有 AI，它都能完整运行。",
    safetyWording: "可选的 AI 只能调整家长端的措辞——一个问题、一句回应、一个很小的下一步。",
    safetyFallback: "任何不安全、超时或格式错误的输出，都会自动退回到经过审核的离线模板。",
  },
  "zh-TW": {
    eyebrow: "關於這次練習",
    title: "為一起練習的家庭而做",
    originTitle: "它從一個具體的孩子開始",
    originStory: "The Safe Garden 從小樹（化名）開始。他是創作者做公益時認識的一名小學階段自閉症兒童。一次親友想擁抱他時，他明顯後退，卻來不及用語言說明；事後反覆的口頭講解又很快變成了問答測試。這正是當時希望能送給他和家人的那段具體、視覺化、可重複且不評分的練習。",
    forWho: "這適合更偏好具體、視覺化、可重複練習方式的家庭，而不是抽象的說教。",
    needs: "設計時特別考慮了許多自閉症兒童所看重的、不同的語言、閱讀、圖片提示與節奏需求。",
    practiceNotAssessment: "它提供的是練習支持，不進行診斷，也不評估孩子的能力。",
    alongside: "請結合孩子自己的溝通方式，以及你已經在使用的專業支持一起使用。",
    safetyTitle: "這裡的安全與 AI 如何運作",
    safetyEngine: "經過審核的規則引擎負責兒童劇情、安全步驟和客觀記錄。無論有沒有 AI，它都能完整運行。",
    safetyWording: "可選的 AI 只能調整家長端的措辭——一個問題、一句回應、一個很小的下一步。",
    safetyFallback: "任何不安全、逾時或格式錯誤的輸出，都會自動退回到經過審核的離線範本。",
  },
};

// ---------------------------------------------------------------------------
// Constrained coach request handling (shared by the API route so the exact
// same anonymization and abuse guards can be unit tested without Next.js).
// ---------------------------------------------------------------------------

export const MAX_COACH_BODY_BYTES = 2_000;

const coachAllowedActions = new Set<SemanticAction>([
  "step-back",
  "repeat-boundary",
  "leave",
  "seek-help",
]);

export type CoachRequestInput = {
  language?: unknown;
  supportMode?: unknown;
  initialConsent?: unknown;
  actions?: unknown;
};

export type SanitizedCoachRequest = {
  language: Language;
  supportMode: SupportMode;
  initialConsent: JourneyChoice["id"] | null;
  actions: SemanticAction[];
};

// Reduce any incoming body to a small, anonymous, whitelisted structure.
// No names, free text, or identifying fields can survive this step.
export function sanitizeCoachRequest(value: CoachRequestInput): SanitizedCoachRequest {
  const language: Language = value.language === "zh" || value.language === "zh-TW" ? value.language : "en";
  const supportMode: SupportMode = value.supportMode === "picture" || value.supportMode === "model-first"
    ? value.supportMode
    : "standard";
  const initialConsent = value.initialConsent === "accept" || value.initialConsent === "space"
    ? value.initialConsent
    : null;
  const actions = Array.isArray(value.actions)
    ? value.actions.filter((item): item is SemanticAction => (
      typeof item === "string" && coachAllowedActions.has(item as SemanticAction)
    )).filter((item, index, all) => all.indexOf(item) === index).slice(0, 4)
    : [];
  return { language, supportMode, initialConsent, actions };
}

// Lightweight same-origin abuse guard suitable for this prototype. A foreign
// Origin/Referer is rejected; a missing one (same-origin fetch in some
// runtimes) is allowed. Returns true when the request may proceed.
export function isSameOriginRequest(headers: {
  host?: string | null;
  origin?: string | null;
  referer?: string | null;
}): boolean {
  const host = headers.host;
  if (!host) return false;
  if (headers.origin) {
    try {
      return new URL(headers.origin).host === host;
    } catch {
      return false;
    }
  }
  if (headers.referer) {
    try {
      return new URL(headers.referer).host === host;
    } catch {
      return false;
    }
  }
  return true;
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
