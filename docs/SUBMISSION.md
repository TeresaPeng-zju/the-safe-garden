# The Safe Garden — competition submission draft

## One-line pitch

The Safe Garden is a low-pressure exploration game where autistic children and their parents practice consent, clear boundaries, leaving, and asking a trusted adult for help—then grow a persistent family garden together.

## Problem

Many safety resources rely on abstract language and one-size-fits-all instruction. Families need a concrete, visual way to rehearse difficult situations without grading the child or turning every interaction into a test.

## What the player does

1. Names the fox and chooses a support style.
2. Explores the park and collects two small discoveries.
3. Chooses whether to accept or decline a hug; both choices are respected.
4. Practices a short action sequence when a boundary is not immediately respected: step back, use clear words, leave, and ask a trusted adult for help.
5. Watches repair: Puppy stops and apologizes, and the adult listens and stays nearby.
6. Chooses where to plant the practice seed.
7. Returns to a persistent garden while the parent receives a factual coaching card.

## Why it is different

- The child is never scored and there is no correct consent choice.
- A flower represents practice, not performance.
- The game includes purposeless exploration and child ownership, not only educational questions.
- The child experience and parent coaching loop are designed as one product.
- Three support modes change how actions are presented without changing the safety content.
- English, Simplified Chinese, and Traditional Chinese make the prototype locally relevant to Hong Kong families.

## Responsible AI

The reviewed rule engine owns the child-facing story, transitions, event record, and offline parent card. An optional server-side DeepSeek layer receives only anonymous structured events and may rewrite three parent-facing fields: a question, a supportive reply, and one small next practice. It cannot change the factual observation or safety sequence. Output is length-limited, checked for evaluative and secrecy language, and rejected to the reviewed template on timeout, error, malformed JSON, or a guardrail failure.

## Three-minute presentation

### 0:00–0:25 — problem

“Important safety advice is often abstract. The Safe Garden turns it into a concrete family rehearsal that adapts its presentation without ever grading the child.”

### 0:25–1:45 — child game

Name the fox, select “Show first, then try,” collect the petal and stone, visit Puppy, choose either consent answer, and quickly demonstrate the step-back and press-and-hold actions. Skip no safety transition.

### 1:45–2:25 — repair and garden

Show the trusted adult beside the child, Puppy’s apology, and the child choosing a garden plot. Say: “The flower records practice, not correctness.”

### 2:25–2:50 — parent and AI

Show the factual event summary, the AI-adapted label, the next small practice, and the private device record. Explain that the game works identically with the API removed.

### 2:50–3:00 — close

“Every child learns differently. Every parent teaches differently. The Safe Garden helps each family find a concrete way to practice together.”

## Submission checklist

- CodeBuddy usage captured.
- `npm test` passes in CodeBuddy.
- Cloud Studio public link works in a fresh browser.
- DeepSeek server secret configured, then fallback also tested without it.
- Early-bird form submitted before August 11, 12:00 Hong Kong time.
- Required event chat group joined.
- A backup screen recording and screenshots are available in case the temporary link or venue network fails.
