# CodeBuddy and Cloud Studio handoff

This project is ready to import into CodeBuddy as an existing Node/Next.js repository.

## Use CodeBuddy meaningfully

Do not only open the repository and deploy it. Ask CodeBuddy to complete and verify a small real task so the sponsored-product usage is visible in the project history. A suitable final task is:

> Review The Safe Garden as a competition web game. Preserve the deterministic child-safety state machine and all existing artwork. Verify the exploration hotspots, press-and-hold boundary action, garden placement, three support modes, and English/Simplified Chinese/Traditional Chinese copy. Run `npm test`, fix only genuine failures, then deploy the working project to Cloud Studio.

Keep screenshots of:

1. The CodeBuddy task and resulting code diff.
2. The successful `npm test` output.
3. The Cloud Studio deployment success and public preview address.

## Exact CodeBuddy deployment prompt

Paste this into CodeBuddy after opening the repository:

> Prepare The Safe Garden for the CodeBuddy hackathon submission. Use Node.js 24 as declared by `.nvmrc` and `package.json`. Preserve the deterministic child-safety state machine, the constrained parent-facing AI boundary, and all existing artwork. Run `npm install`, `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build:vercel`. Fix only genuine failures. Then use the Cloud Studio deployment entrance to deploy this full-stack Next.js game and return the public temporary preview URL. Do not expose `DEEPSEEK_API_KEY`; the reviewed offline fallback must remain fully playable without it.

The repository includes server routes at `/api/coach` and `/api/mcp`, so do not convert it into a static-only export. Cloud Studio should run the existing application with Node.js 24.

## Local and Cloud Studio configuration

- Runtime: Node.js 22.13 or newer.
- Install: `npm install`
- Development: `npm run dev`
- Validation: `npm test`
- Optional AI environment variables:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_MODEL=deepseek-v4-flash`

The DeepSeek key must be a server-side secret. Never rename it with a `NEXT_PUBLIC_` prefix and never paste it into client code.

## Cloud Studio acceptance test

After deployment, use the public link in a fresh private browser window and verify:

1. First visit asks for a fox name.
2. English, Simplified Chinese, and Traditional Chinese all switch correctly.
3. The park opens with two optional discoveries rather than a quiz.
4. Puppy becomes available after both discoveries are collected.
5. Both initial consent choices are respected.
6. Step back, press-and-hold clear words, leave, and seek help complete in order.
7. The adult stays beside the child and Puppy stops and apologizes.
8. A garden plot can be selected without cropping the flower artwork.
9. The parent card remains factual; the AI source label changes to adapted only when the API succeeds.
10. With the API key removed, the same journey still completes and shows reviewed guidance.
11. Refreshing preserves the chosen name, settings, flowers, and practice record on that device.

Cloud Studio preview links are temporary. Generate and retest the final submission link close to the submission time.
