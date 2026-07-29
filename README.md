# The Safe Garden

A gentle parent-and-child practice game for body boundaries, communication, and everyday safety. The first journey follows Little Fox to the park, where a friendly puppy asks for a hug and respects the child’s answer. The experience ends with a concrete parent coaching card and a new flower in the family garden.

## Included in this version

- English and Chinese content
- Responsive child journey and parent coaching panel
- Two optimized GLB characters over a storybook park
- Consent and safety practice with non-punitive feedback
- Calm mode, reduced motion, and optional background music
- Device-local preferences
- Social sharing metadata and artwork

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate the production build

```bash
npm test
```

The original source assets remain under `assets/`. Web-ready copies live under `public/assets/`; the source GLB files are preserved unchanged and are not served directly.

## Product safety boundary

This prototype supports guided practice. It does not assess, diagnose, investigate disclosures, or determine whether a child has mastered a safety skill. Child-facing scenario text should remain reviewed and bounded; future AI integration belongs in parent-facing adaptation and coaching.
