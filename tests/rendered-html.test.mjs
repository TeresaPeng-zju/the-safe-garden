import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders The Safe Garden experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>The Safe Garden — Practice brave words together<\/title>/i);
  assert.match(html, /The Safe Garden/);
  assert.match(html, /Little Fox will practice what to do when a friend comes too close/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships optimized game assets and social metadata", async () => {
  const requiredAssets = [
    "../public/assets/park-background.png",
    "../public/assets/fox-2d.png",
    "../public/assets/dog-2d.png",
    "../public/assets/fox-avatar.png",
    "../public/assets/dog-avatar.png",
    "../public/assets/dog-actions.png",
    "../public/assets/fox-parent.png",
    "../public/assets/dog-bubble.webp",
    "../public/assets/dog-bubble-still.png",
    "../public/assets/growth.png",
    "../public/assets/garden-music.mp3",
    "../public/og.png",
  ];

  await Promise.all(requiredAssets.map((path) => access(new URL(path, import.meta.url))));
  const [fox, dog] = await Promise.all([
    stat(new URL("../public/assets/fox-2d.png", import.meta.url)),
    stat(new URL("../public/assets/dog-2d.png", import.meta.url)),
  ]);
  assert.ok(fox.size < 5_000_000, "fox sprite sheet should remain web-sized");
  assert.ok(dog.size < 5_000_000, "dog sprite sheet should remain web-sized");
});

test("uses artwork and icon components instead of emoji UI", async () => {
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(`${pageSource}\n${styles}`, /[🌱💡✋⚙✿♫]/u);
  assert.match(pageSource, /fox-avatar\.png/);
  assert.match(styles, /dog-avatar\.png/);
  assert.match(pageSource, /growth-icon/);
});
