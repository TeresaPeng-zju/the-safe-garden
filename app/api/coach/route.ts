import { NextResponse } from "next/server";
import {
  isSafeCoachEnhancement,
  isSameOriginRequest,
  MAX_COACH_BODY_BYTES,
  sanitizeCoachRequest,
  type CoachRequestInput,
} from "../../../lib/journey";

export const runtime = "nodejs";

// Responses must never be cached: they are anonymous, short-lived, and per-request.
const noStore = { "Cache-Control": "no-store, max-age=0" } as const;

function fallback(reason: string, status = 200) {
  return NextResponse.json(
    { ok: false, source: "reviewed-template", reason },
    { status, headers: noStore },
  );
}

export async function POST(request: Request) {
  const sameOrigin = isSameOriginRequest({
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
  });
  if (!sameOrigin) {
    return fallback("cross-origin", 403);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return fallback("not-configured");
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_COACH_BODY_BYTES) {
    return fallback("payload-too-large", 413);
  }

  let body: CoachRequestInput;
  try {
    body = JSON.parse(rawBody) as CoachRequestInput;
  } catch {
    return fallback("invalid-request", 400);
  }

  // Only anonymous, whitelisted fields ever leave this server.
  const practice = sanitizeCoachRequest(body);
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

    if (!response.ok) {
      return fallback("provider-error");
    }
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return fallback("empty-response");
    }
    let candidate: unknown;
    try {
      candidate = JSON.parse(content);
    } catch {
      return fallback("invalid-json");
    }
    if (!isSafeCoachEnhancement(candidate)) {
      return fallback("guardrail-rejected");
    }
    return NextResponse.json(
      { ok: true, source: "constrained-agent", candidate },
      { headers: noStore },
    );
  } catch {
    return fallback("unavailable");
  } finally {
    clearTimeout(timeout);
  }
}
