import {
  isSafeCoachEnhancement,
  type AgentCoachEnhancement,
  type SanitizedCoachRequest,
} from "./journey.ts";

export type CoachAgentResult = {
  candidate: AgentCoachEnhancement | null;
  reason: string;
};

export async function requestCoachAgent(
  practice: SanitizedCoachRequest,
): Promise<CoachAgentResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { candidate: null, reason: "not-configured" };

  const outputLanguage = practice.language === "zh"
    ? "Simplified Chinese"
    : practice.language === "zh-TW"
      ? "Traditional Chinese used in Hong Kong"
      : "English";
  const systemPrompt = `You are the constrained parent-coach layer for a safety-practice game for autistic children and their families.

Return JSON only with exactly these string fields:
{"tonightPrompt":"...","parentReply":"...","nextFocus":"..."}

Write in ${outputLanguage}. Each value must be 8-180 characters.
Use concrete, calm, literal language. Describe practice, never performance.
Do not diagnose, score, praise compliance, evaluate ability, claim mastery, imply a correct answer, or promise secrecy.
Do not introduce new incident facts. Do not ask a child to confront someone or keep explaining after a boundary is ignored.
The prompt must be open-ended and easy to answer. The parent reply must begin by listening, thanking, or believing. The next focus must be one small optional practice.
This layer may adapt wording only; the reviewed safety sequence is fixed.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
        thinking: { type: "disabled" },
        temperature: 0.2,
        max_tokens: 320,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create JSON coaching wording from this anonymous structured practice record: ${JSON.stringify(practice)}` },
        ],
      }),
    });
    if (!response.ok) return { candidate: null, reason: "provider-error" };

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return { candidate: null, reason: "empty-response" };

    let candidate: unknown;
    try {
      candidate = JSON.parse(content);
    } catch {
      return { candidate: null, reason: "invalid-json" };
    }
    return isSafeCoachEnhancement(candidate)
      ? { candidate, reason: "adapted" }
      : { candidate: null, reason: "guardrail-rejected" };
  } catch {
    return { candidate: null, reason: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
