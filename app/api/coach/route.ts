import { NextResponse } from "next/server";
import { isSafeCoachEnhancement, type Language, type SupportMode } from "../../../lib/journey";

export const runtime = "nodejs";

type CoachRequest = {
  language?: Language;
  supportMode?: SupportMode;
  initialConsent?: "accept" | "space" | null;
  actions?: string[];
};

const allowedActions = new Set(["step-back", "repeat-boundary", "leave", "seek-help"]);

function safeRequest(value: CoachRequest) {
  const language: Language = value.language === "zh" || value.language === "zh-TW" ? value.language : "en";
  const supportMode: SupportMode = value.supportMode === "picture" || value.supportMode === "model-first"
    ? value.supportMode
    : "standard";
  const initialConsent = value.initialConsent === "accept" || value.initialConsent === "space" ? value.initialConsent : null;
  const actions = Array.isArray(value.actions)
    ? value.actions.filter((item): item is string => typeof item === "string" && allowedActions.has(item)).slice(0, 4)
    : [];
  return { language, supportMode, initialConsent, actions };
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, source: "reviewed-template", reason: "not-configured" });
  }

  let body: CoachRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, source: "reviewed-template", reason: "invalid-request" }, { status: 400 });
  }

  const practice = safeRequest(body);
  const outputLanguage = practice.language === "zh" ? "Simplified Chinese" : practice.language === "zh-TW" ? "Traditional Chinese used in Hong Kong" : "English";
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

    if (!response.ok) {
      return NextResponse.json({ ok: false, source: "reviewed-template", reason: "provider-error" });
    }
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ ok: false, source: "reviewed-template", reason: "empty-response" });
    }
    const candidate: unknown = JSON.parse(content);
    if (!isSafeCoachEnhancement(candidate)) {
      return NextResponse.json({ ok: false, source: "reviewed-template", reason: "guardrail-rejected" });
    }
    return NextResponse.json({ ok: true, source: "constrained-agent", candidate });
  } catch {
    return NextResponse.json({ ok: false, source: "reviewed-template", reason: "unavailable" });
  } finally {
    clearTimeout(timeout);
  }
}
