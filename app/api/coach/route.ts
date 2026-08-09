import { NextResponse } from "next/server";
import {
  isSameOriginRequest,
  MAX_COACH_BODY_BYTES,
  sanitizeCoachRequest,
  type CoachRequestInput,
} from "../../../lib/journey";
import { requestCoachAgent } from "../../../lib/coach-agent";

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
  const result = await requestCoachAgent(practice);
  if (!result.candidate) return fallback(result.reason);
  return NextResponse.json(
    { ok: true, source: "constrained-agent", candidate: result.candidate },
    { headers: noStore },
  );
}
