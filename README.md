# The Safe Garden

A low-pressure parent-and-child exploration game for body boundaries, communication, and everyday safety. The first journey follows a named fox through a park treasure hunt, a consent-and-safety story, a short sequence of concrete actions, and a child-chosen planting moment. The experience ends with a factual parent coaching card and a persistent family garden.

It began with Xiaoshu (a pseudonym), an autistic primary-school child the creator met while volunteering. After he stepped back from an unwanted hug but could not quickly explain it in words, repeated verbal teaching became a test. The product turns that specific need into concrete, visual, repeatable practice without scoring the child.

## Included in this version

- English, Simplified Chinese, and Traditional Chinese content
- Responsive child journey and parent coaching panel
- A trilingual, parent-side "About this practice" panel that explains who the product serves without labelling the child in the game
- Illustrated 2D character poses with calm, low-stimulation motion over a storybook park
- A complete game loop: explore, collect, an optional non-scored butterfly moment, interact, act, plant, and return
- Consent and safety practice with non-punitive feedback
- Three support styles: words + icons, larger pictures, and show-first with a calm demonstration before each action
- Calm mode, reduced motion, optional background music, and first-time character naming
- Device-local preferences, including saved discoveries and a non-overlapping family garden
- Optional server-side DeepSeek adaptation for parent wording with a reviewed offline fallback
- Public Streamable HTTP MCP endpoint with one typed, bounded coaching tool at `/api/mcp`
- Social sharing metadata and artwork

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional constrained AI coach

The complete game works without an API. To enable the parent-facing wording adaptation locally, copy `.env.example` to `.env.local`, add your DeepSeek key, and restart the development server. The key remains on the server. Only an anonymous structured practice summary is sent; the child-facing safety sequence and factual observation never come from the model.

## Validate the production build

```bash
npm test
```

The original source assets remain under `assets/`. Web-ready copies live under `public/assets/`; the experimental source GLB files are preserved locally but are no longer served or loaded by the game.

For the competition handoff, see `docs/CODEBUDDY_HANDOFF.md` and `docs/SUBMISSION.md`.

## Product safety boundary

This prototype supports guided practice. It does not assess, diagnose, investigate disclosures, or determine whether a child has mastered a safety skill. Child-facing scenario text remains reviewed and deterministic.

The optional model can only adapt three parent-facing fields — `tonightPrompt`, `parentReply`, and `nextFocus`. The factual `observation` always comes from the reviewed template and can never be overwritten, even by a response that returns extra keys. The DeepSeek key is read only from `process.env.DEEPSEEK_API_KEY` on the server, is never exposed with a `NEXT_PUBLIC_` prefix, and is never sent to or logged on the client. Each request is same-origin checked, size-limited, and reduced to an anonymous whitelist (language, support style, initial consent choice, and practiced semantic actions) — no names, contact details, or free text are ever sent. Rejected, unavailable, slow, or malformed output falls back to reviewed local guidance, and children never interact with an open-ended chatbot.
