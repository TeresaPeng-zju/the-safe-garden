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
  assert.match(html, /<title>The Safe Garden｜给自闭症孩子的边界练习花园<\/title>/i);
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

test("Vercel excludes source artwork without excluding public game assets", async () => {
  const vercelIgnore = await readFile(new URL("../.vercelignore", import.meta.url), "utf8");
  assert.match(vercelIgnore, /^\/assets$/m);
  assert.doesNotMatch(vercelIgnore, /^assets$/m);
});

test("ships explicit browser and touch favicons", async () => {
  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layoutSource, /icons:\s*\{/);
  assert.match(layoutSource, /\/favicon\.ico/);
  assert.match(layoutSource, /\/favicon-32x32\.png/);
  assert.match(layoutSource, /\/favicon-16x16\.png/);
  assert.match(layoutSource, /\/apple-touch-icon\.png/);
});

test("music controls play immediately and remain independent from reduced movement", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /type MusicPlaybackState = "waiting" \| "starting" \| "playing" \| "paused" \| "error"/);
  assert.match(pageSource, /const setMusicEnabled = \(next: boolean\)/);
  assert.match(pageSource, /audio\.play\(\)/);
  assert.match(pageSource, /musicWaiting: "开始散步后播放"/);
  assert.doesNotMatch(pageSource, /disabled=\{reducedMotion\}/);
  assert.match(pageSource, /const setCalmMode = \(next: boolean\) => \{\s*setReducedMotion\(next\);\s*\};/s);
  assert.equal((pageSource.match(/onChange=\{\(event\) => setMusicEnabled\(event\.target\.checked\)\}/g) ?? []).length, 2);
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
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(pageSource, /type PanelView = "home" \| "journey" \| "garden" \| "notes"/);
  assert.match(pageSource, /onClick=\{\(\) => openPanelView\("journey"\)\}/);
  assert.match(pageSource, /onClick=\{\(\) => openPanelView\("garden"\)\}/);
  assert.match(pageSource, /onClick=\{\(\) => openPanelView\("notes"\)\}/);
  assert.match(pageSource, /setSettingsOpen\(true\)/);
  assert.match(pageSource, /safe-garden-support-mode/);
  assert.match(pageSource, /"model-first"/);
  assert.match(pageSource, /records\.map\(\(record, index\)/);
  assert.match(styles, /\.panel-nav\s*\{[^}]*grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\);/s);
});

test("the parent-only about panel names the concrete person and observed need", async () => {
  const journeySource = await readFile(new URL("../lib/journey.ts", import.meta.url), "utf8");
  assert.match(journeySource, /小树（化名）/);
  assert.match(journeySource, /明显后退/);
  assert.match(journeySource, /问答测试/);
  assert.match(journeySource, /具体、视觉化、可重复且不评分/);
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
  const [routeSource, agentSource, envExample] = await Promise.all([
    readFile(new URL("../app/api/coach/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/coach-agent.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  const serverSource = `${routeSource}\n${agentSource}`;
  assert.match(serverSource, /process\.env\.DEEPSEEK_API_KEY/);
  assert.doesNotMatch(serverSource, /playerName|childName/);
  assert.match(routeSource, /reviewed-template/);
  assert.match(serverSource, /isSafeCoachEnhancement/);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_DEEPSEEK/);
});

test("garden plots preserve complete growth artwork", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.garden-plot\s*\{[^}]*aspect-ratio:\s*1;/s);
  assert.match(styles, /\.garden-plot \.growth-stage\s*\{[^}]*height:\s*100%;/s);
  assert.doesNotMatch(styles, /\.garden-plot\s*\{[^}]*height:\s*108px;/s);
  assert.match(styles, /\.garden-bed\s*\{[^}]*height:\s*148px;/s);
  assert.match(styles, /\.garden-bed \.growth-stage\s*\{[^}]*height:\s*132px;[^}]*background-size:\s*330% auto;[^}]*background-position-y:\s*43\.5%;/s);
  assert.match(styles, /\.mini-growth\.stage-flower\s*\{[^}]*growth-flower\.webp[^}]*background-size:\s*contain;/s);
  assert.match(styles, /\.history-growth\.stage-flower\s*\{[^}]*growth-flower\.webp[^}]*contain/s);
  assert.match(styles, /\.garden-plot\.completed \.growth-stage\.stage-flower\s*\{[^}]*growth-flower\.webp[^}]*contain/s);
});

test("exploration labels avoid the fox and the bubble dog keeps one body scale", async () => {
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(styles, /\.petal-hotspot\s*\{[^}]*left:\s*38%;[^}]*bottom:\s*29%;/s);
  assert.doesNotMatch(styles, /\.petal-hotspot\s*\{[^}]*left:\s*33%;/s);
  assert.match(pageSource, /dog-bubble-sprite[^\n]*dog-bubble-still\.png/);
  assert.doesNotMatch(pageSource, /reducedMotion\s*\?\s*"\/assets\/dog-bubble-still\.png"\s*:\s*"\/assets\/dog-bubble\.webp"/);
  assert.match(styles, /@keyframes bubbleDrift/);
  assert.match(styles, /\.quest-card\s*\{[^}]*top:\s*220px;/s);
  assert.match(styles, /@media \(max-width:\s*760px\)[\s\S]*\.quest-card\s*\{[^}]*top:\s*158px;/s);
});

test("exploration objects use generated picture-book artwork instead of text pills", async () => {
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  for (const asset of ["explore-petal.webp", "explore-stone.webp"]) {
    assert.match(pageSource, new RegExp(`/assets/${asset}`));
  }
  assert.match(styles, /\/assets\/explore-butterfly-frames\.webp/);
  assert.match(styles, /\.world-hotspot\.item-hotspot\s*\{[^}]*background:\s*transparent;/s);
  assert.match(styles, /\.hotspot-art\s*\{[^}]*object-fit:\s*contain;/s);
  assert.doesNotMatch(pageSource, /<Flower2 aria-hidden="true" \/><span>\{g\.petal\}<\/span>/);
  assert.doesNotMatch(pageSource, /<CircleDot aria-hidden="true" \/><span>\{g\.stone\}<\/span>/);
  assert.match(styles, /\.butterfly-sprite\s*\{[^}]*background-size:\s*300% 100%;[^}]*animation:\s*butterflyWingFrames 2\.8s steps\(1, end\) infinite alternate;/s);
  assert.match(styles, /@keyframes butterflyWingFrames/);
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

test("a restrained parent-side About entry explains who the product serves", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  // The About view exists as a parent-panel view, not in the child game.
  assert.match(pageSource, /type PanelView = "home" \| "journey" \| "garden" \| "notes" \| "about"/);
  assert.match(pageSource, /openPanelView\("about"\)/);
  assert.match(pageSource, /aboutContent\[language\]/);
  // The child game phases never include an about screen.
  assert.doesNotMatch(pageSource, /GamePhase = [^;]*about/);
});

test("exploration includes an optional non-scored interaction and clear collection feedback", async () => {
  const [pageSource, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  // Optional butterfly interaction that does not affect the safety story.
  assert.match(pageSource, /butterfly-hotspot/);
  assert.match(pageSource, /watchButterfly/);
  // It must not count toward discoveries or unlock the safety journey.
  assert.match(pageSource, /const ready = discovered\.length >= 2/);
  // Restrained collection feedback rather than a celebration or "correct".
  assert.match(pageSource, /quest-feedback/);
  assert.match(pageSource, /itemAdded/);
  assert.match(styles, /\.butterfly-hotspot/);
});

test("picture support enlarges cues in the exploration layer too", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.picture-support \.world-hotspot/);
});

test("show-first mode plays a demonstration before the child acts", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /runDemonstration/);
  assert.match(pageSource, /modelWatching/);
  // Calm mode resolves the demonstration without motion.
  assert.match(pageSource, /if \(reducedMotion\) \{\s*settle\(\);/s);
});

test("discoveries and garden placement are persisted and never overlap", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /DISCOVERIES_STORAGE_KEY = "safe-garden-discoveries"/);
  assert.match(pageSource, /localStorage\.setItem\(DISCOVERIES_STORAGE_KEY/);
  // Garden plots are derived from records with de-duplicated plots.
  assert.match(pageSource, /const plantedPlots = useMemo/);
  assert.match(pageSource, /taken\.add/);
});

test("the interface never shows scores, correctness, or ability wording", async () => {
  const [pageSource, styles, journeySource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../lib/journey.ts", import.meta.url), "utf8"),
  ]);
  const combined = `${pageSource}\n${styles}\n${journeySource}`;
  assert.doesNotMatch(combined, /[🌱💡✋⚙✿♫🏆⭐✅❌]/u);
  // No leaderboard, streak, XP, coins, or ability-level UI copy.
  assert.doesNotMatch(pageSource, /leaderboard|\bstreak\b|\bXP\b|排行榜|连续签到|連續簽到|正确率|正確率|能力等级|能力等級/i);
});
