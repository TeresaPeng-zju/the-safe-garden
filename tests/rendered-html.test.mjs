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
  assert.match(html, /Explore the park, collect two small treasures/);
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

test("parent navigation and family settings are functional", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /type PanelView = "home" \| "journey" \| "garden" \| "notes"/);
  assert.match(pageSource, /onClick=\{\(\) => openPanelView\("journey"\)\}/);
  assert.match(pageSource, /onClick=\{\(\) => openPanelView\("garden"\)\}/);
  assert.match(pageSource, /onClick=\{\(\) => openPanelView\("notes"\)\}/);
  assert.match(pageSource, /setSettingsOpen\(true\)/);
  assert.match(pageSource, /safe-garden-support-mode/);
  assert.match(pageSource, /"model-first"/);
  assert.match(pageSource, /records\.map\(\(record, index\)/);
});

test("the finished game loop includes exploration, physical actions, and garden placement", async () => {
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(pageSource, /function ExplorationLayer/);
  assert.match(pageSource, /collectDiscovery/);
  assert.match(pageSource, /HoldToSpeakButton/);
  assert.match(pageSource, /plantPractice/);
  assert.match(styles, /\.world-hotspot/);
  assert.match(styles, /\.planting-grid/);
});

test("DeepSeek is server-side, anonymous, constrained, and safely optional", async () => {
  const [routeSource, envExample] = await Promise.all([
    readFile(new URL("../app/api/coach/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(routeSource, /process\.env\.DEEPSEEK_API_KEY/);
  assert.doesNotMatch(routeSource, /playerName|childName/);
  assert.match(routeSource, /reviewed-template/);
  assert.match(routeSource, /isSafeCoachEnhancement/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_DEEPSEEK/);
});

test("garden plots preserve complete growth artwork", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.garden-plot\s*\{[^}]*aspect-ratio:\s*1;/s);
  assert.match(styles, /\.garden-plot \.growth-stage\s*\{[^}]*height:\s*100%;/s);
  assert.doesNotMatch(styles, /\.garden-plot\s*\{[^}]*height:\s*108px;/s);
});

test("the help scene places the child beside the listening adult", async () => {
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(pageSource, /presentation === "fox-seek-help" \? "fox-help"/);
  assert.match(pageSource, /node\.id === "seek-help"\s*\? "is-seeking-help"/s);
  assert.match(pageSource, /isSupportedScene \? "is-kept-back"/);
  assert.match(styles, /\.fox-help img \{ left: -200%; top: -100%; \}/);
  assert.match(styles, /\.parent-character\.is-near-fox/);
});

test("calm mode stops motion instead of accelerating infinite animation", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.reduced-motion \*::after \{ animation: none !important; transition: none !important;/);
  assert.doesNotMatch(styles, /\.reduced-motion \*::after \{[^}]*animation-duration:\s*\.01ms/s);
});

test("first-time naming is persisted and personalized throughout the journey", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /const PLAYER_NAME_STORAGE_KEY = "safe-garden-player-name"/);
  assert.match(pageSource, /setNameSetupOpen\(!savedPlayerName\)/);
  assert.match(pageSource, /window\.localStorage\.setItem\(PLAYER_NAME_STORAGE_KEY, nextName\)/);
  assert.match(pageSource, /personalizedText\(node\.text\[language\], language, playerName\)/);
  assert.match(pageSource, /<strong>\{playerName \|\| t\.defaultPlayerName\}<\/strong>/);
  assert.match(pageSource, /defaultPlayerName: "小狐狸"/);
});

test("language controls include persisted Traditional Chinese", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /savedLanguage === "zh-TW"/);
  assert.match(pageSource, /onClick=\{\(\) => setLanguage\("zh-TW"\)\}>繁體<\/button>/);
  assert.match(pageSource, /traditionalChinese: "繁體中文"/);
  assert.match(pageSource, /language === "zh-TW" \? "zh-TW" : "en"/);
});
