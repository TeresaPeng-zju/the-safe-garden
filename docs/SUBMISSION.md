# The Safe Garden — competition submission

## One-line pitch

The Safe Garden is a low-pressure exploration game where autistic children and their parents rehearse consent, clear boundaries, leaving, and asking a trusted adult for help — then grow a persistent family garden together. The child never receives a score; a flower simply records that the family practiced.

## Problem → User → Solution → Charitable value

**Problem.** Most personal-safety guidance for children is abstract, verbal, and one-size-fits-all. It often turns practice into a test, rewards compliance, and asks children to keep explaining or confronting. For many autistic children this is overwhelming and counter-productive: the format itself becomes a barrier before any safety idea lands.

**User.** Autistic children who value concrete, visual, repeatable practice and predictable pacing — and the parents and carers who practice with them. The prototype speaks English, Simplified Chinese, and Traditional Chinese so Hong Kong families can use it in their own language.

**Solution.** One short, complete park journey that is playable in about two to three minutes:

1. Name the fox and choose a support style.
2. Explore the park at your own pace, collect two small treasures, and — if you like — just watch a butterfly (an optional, non-scored moment of world and autonomy).
3. Meet the puppy and choose whether to accept or decline a hug. Both answers are respected; neither is correct.
4. When a boundary is not immediately respected, practice four concrete actions: step back, say clear words (press-and-hold), leave, and ask a trusted adult for help.
5. See repair: the puppy stops and apologizes; the trusted adult listens and stays nearby.
6. Choose where to plant the seed. The child, not the game, picks the plot.
7. The parent receives a factual coaching card; a flower is added to the family garden.

**Charitable value.** It gives autism-serving families a calm, non-judgemental rehearsal space they can repeat for free, in three languages, on any device, with or without internet-connected AI. It supports practice; it never diagnoses, grades, or ranks a child.

## Why it is different — the two-sided constrained loop

The core innovation is a **child ↔ parent ↔ rule-engine ↔ constrained-AI** loop that a judge can *see*, not just read about:

- The reviewed rule engine owns the entire child story, every safety transition, and the factual event record. It runs identically with or without AI.
- Support styles (words + icons, larger pictures, show-first) change only *how* an action is presented — never the safety conclusion. Show-first plays one calm demonstration before the child acts.
- After the run, the AI receives only an anonymous, whitelisted structured summary and may rewrite exactly three parent-facing fields: one question to ask tonight, one supportive reply, one small optional next step.
- The parent card shows its live source: *adapting*, *AI-adapted within reviewed safety rules*, or *reviewed offline template*. A tap opens an "About" panel that states the boundary in plain language: **rule engine guarantees safety and completeness → AI may only soften parent wording → anything unsafe falls back to the template.**

## Responsible AI boundary

- The DeepSeek key is read only from `process.env.DEEPSEEK_API_KEY` on the server. It is never prefixed with `NEXT_PUBLIC_`, never sent to the client, and never logged.
- The request is same-origin checked, size-limited, and reduced to a whitelist: language, support style, initial consent choice, and practiced semantic actions. No names, addresses, contact details, or free-text disclosures are ever sent.
- The objective `observation` always comes from the reviewed template; the AI can only ever change `tonightPrompt`, `parentReply`, and `nextFocus`, and even a response with extra keys cannot overwrite the record.
- Output is length-limited and screened for scores, correctness, pass/fail, ability or mastery judgements, compliance praise, diagnosis, "good/bad child", and secrecy promises. Timeouts, provider errors, empty output, malformed JSON, and guardrail failures all fall back to the reviewed offline card — so the game is fully playable with no key at all.
- Children never talk to an open-ended chatbot.

## Three-minute presentation

### 0:00–0:25 — problem and user

"Safety advice for children is usually abstract and graded. The Safe Garden turns it into a concrete family rehearsal, built with the pacing and picture-cue needs many autistic children value — and it never grades the child."

### 0:25–1:45 — child game (show the loop)

Name the fox, pick "Show first, then try". Explore, collect the petal and stone, and pause on the butterfly to show optional autonomy. Visit the puppy, choose *either* consent answer, and demonstrate step-back and press-and-hold "No. Please stop." Do not skip a single safety transition.

### 1:45–2:25 — repair, choice, and garden

Show the trusted adult beside the child, the puppy's apology, and the child choosing a garden plot. Say: "The flower records practice, not correctness."

### 2:25–2:50 — parent card and constrained AI

Open the parent panel: the factual observation, the live AI source label, the one small next step, and the "About" boundary card. Remove the key and show the same journey completing on the reviewed offline template.

### 2:50–3:00 — close

"Every child learns differently and every parent teaches differently. The Safe Garden helps each family find a concrete, respectful way to practice together."

## Self-assessment (post-polish)

| Judging area | Before | After | What changed |
| --- | --- | --- | --- |
| Theme fit | 9.5 | 10 | Trilingual parent-side "About / design principles" panel states who it serves and why, without labelling the child in the game. |
| Completeness | 9 | 9.5 | Persisted discoveries, non-overlapping garden placement, trilingual sound label, real show-first demonstration, clear collection feedback. |
| Innovation | 9 | 9.5 | Visible boundary card and live AI-source states make the constrained two-sided loop demonstrable. |
| Game feel | 8.5 | 9.5 | Optional non-scored butterfly moment, restrained world feedback, keyboard/touch/mouse hold action, calm-mode-safe demonstration. |
| Safety & responsible AI | 9 | 10 | Same-origin + size limit + whitelist + no-store, hardened field-picking so AI can never overwrite the observation, plus dedicated automated tests. |

## Submission checklist

- CodeBuddy checkpoints captured: `pre-codebuddy-competition-polish` and `codebuddy-competition-ready`.
- `npm test` passes in CodeBuddy (34 tests).
- `npm run lint` reports 0 errors.
- Cloud Studio public link verified in a fresh browser.
- DeepSeek server secret configured, then fallback also verified without it.
- A backup screen recording and screenshots are kept in case the temporary link or venue network fails.
