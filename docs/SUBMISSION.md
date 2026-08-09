# The Safe Garden — competition submission

## One-line pitch

The Safe Garden｜给自闭症孩子的边界练习花园，是从小树（化名）的一次真实困境出发，为更容易理解图片与具体动作的孩子和家长设计的不评分边界练习。孩子练习表达意愿、后退、离开和求助；一朵花只记录“我们一起练习过”，从不记录分数。

## Problem → User → Solution → Charitable value

**Demand origin.** The creator met Xiaoshu (a pseudonym), an autistic primary-school child, while volunteering at a school for children with additional needs. In one family-hug situation he visibly stepped back but could not quickly explain it in words. The later verbal explanation soon became a question-and-answer test, and he refused to continue. His parent also had no reliable way to know what he understood or how to explain it without testing him.

**Problem.** Most personal-safety guidance for children is abstract, verbal, and one-size-fits-all. It often turns practice into a test, rewards compliance, and asks children to keep explaining or confronting. For Xiaoshu, the format itself became the barrier before the safety idea could land.

**User.** It starts with Xiaoshu and his parent, then extends to autistic children with similar picture-cue, concrete-action and predictable-pacing needs — and the adults who practice alongside them. The prototype speaks English, Simplified Chinese, and Traditional Chinese.

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
- Runtime validation also requires an actual open question, a listening/thanks/belief opening for the parent reply, and a non-coercive next step; prompt instructions alone are never treated as a safety boundary.
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

## Evidence mapped to the judging criteria

| Judging area | Evidence in the working product |
| --- | --- |
| Insight & understanding | The parent-only About panel names Xiaoshu (pseudonym), the observed hug situation, why verbal teaching became a test, and the resulting design constraints. |
| Creative translation & experience | A complete non-chatbot loop: explore → choose consent → rehearse four embodied actions → see repair and adult support → choose a planting place → receive parent guidance. Three support styles change presentation without changing the safety conclusion. |
| Real use & completeness | Practice history and the garden persist on the device; both consent branches reach the same complete safety plan; every transition is tested. Actual target-user feedback must be added after a consented session and is never fabricated in this repository. |
| Technical connectivity | A typed state machine owns child safety, an optional constrained model adapts only three parent-facing fields, unsafe output falls back, and a public Streamable HTTP MCP tool exposes the same bounded coaching capability. |

## Submission checklist

- CodeBuddy checkpoints captured: `pre-codebuddy-competition-polish` and `codebuddy-competition-ready`.
- Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build:vercel` immediately before submission; record the current passing count in the final form.
- Verify the Vercel experience link and `/api/mcp` initialize → tools/list → tools/call sequence from a fresh connection.
- Configure `DEEPSEEK_API_KEY` in production only after explicit authorization; without it, the reviewed fallback remains complete and the UI labels it honestly.
- Complete one consented target-user session, record specific observed behaviour and one resulting iteration, and obtain permission before using any quote, image, or story detail.
- A backup screen recording and screenshots are kept in case the temporary link or venue network fails.
