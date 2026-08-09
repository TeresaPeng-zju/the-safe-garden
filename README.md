# The Safe Garden

A low-pressure parent-and-child exploration game for body boundaries, communication, and everyday safety. The first journey follows a named fox through a park treasure hunt, a consent-and-safety story, a short sequence of concrete actions, and a child-chosen planting moment. The experience ends with a factual parent coaching card and a persistent family garden.

## Included in this version

- English, Simplified Chinese, and Traditional Chinese content
- Responsive child journey and parent coaching panel
- Illustrated 2D character poses with calm, low-stimulation motion over a storybook park
- A complete game loop: explore, collect, interact, act, plant, and return
- Consent and safety practice with non-punitive feedback
- Three support styles: words + icons, larger pictures, and show-first prompting
- Calm mode, reduced motion, optional background music, and first-time character naming
- Device-local preferences
- Optional server-side DeepSeek adaptation for parent wording with a reviewed offline fallback
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

This prototype supports guided practice. It does not assess, diagnose, investigate disclosures, or determine whether a child has mastered a safety skill. Child-facing scenario text remains reviewed and deterministic. The optional model can only adapt three parent-facing fields, and rejected, unavailable, or slow output falls back to reviewed local guidance.
