"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Backpack,
  CalendarDays,
  Check,
  CircleDot,
  DoorOpen,
  Flower2,
  Footprints,
  Hand,
  Heart,
  Home as HomeIcon,
  Info,
  Lightbulb,
  Lock,
  Map,
  Music2,
  NotebookText,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trees,
  UserRoundCheck,
  VolumeX,
  WandSparkles,
  X,
} from "lucide-react";
import {
  aboutContent,
  advanceJourney,
  applyConstrainedAgentEnhancement,
  buildReviewedCoachCard,
  createJourneyState,
  createPracticeRecord,
  getJourneyNode,
  parsePracticeRecords,
  PRACTICE_STORAGE_KEY,
  savePracticeRecord,
  semanticPresentationMap,
  type JourneyChoice,
  type JourneyNode,
  type JourneyState,
  type Language,
  type PracticeRecord,
  type SemanticAction,
  type SupportMode,
  type DiscoveryId,
  type CoachCard,
} from "../lib/journey";

type PanelView = "home" | "journey" | "garden" | "notes" | "about";
type GamePhase = "welcome" | "explore" | "journey" | "plant" | "complete";
type AgentStatus = "idle" | "loading" | "adapted" | "fallback";

const SUPPORT_MODE_STORAGE_KEY = "safe-garden-support-mode";
const MUSIC_STORAGE_KEY = "safe-garden-music";
const PLAYER_NAME_STORAGE_KEY = "safe-garden-player-name";
const DISCOVERIES_STORAGE_KEY = "safe-garden-discoveries";

const baseCopy = {
  en: {
    brand: "The Safe Garden",
    welcomeTitle: "Ready for today’s little walk?",
    welcomeBody: "Explore the park, collect two small treasures, and practice what to do when a friend comes too close and does not stop.",
    calmLabel: "Calm mode",
    calmHint: "Less movement and no background music",
    soundLabel: "Garden sounds",
    start: "Start today’s walk",
    todaysWalk: "Today’s Walk",
    park: "Explore, practice, and grow the garden.",
    gardenTitle: "A practice flower grew",
    replay: "Practice again",
    forParents: "For Parents",
    parentWaiting: "After the trusted adult responds, your family can plant the practice seed together.",
    observedTitle: "What happened",
    completedLabel: "One practice was recorded",
    tonight: "Try this tonight",
    askAtCalmMoment: "At a calm moment, you can ask:",
    ourGarden: "Our Garden",
    keepGrowing: "Flowers mark practices completed together, not correct answers.",
    practicesRecorded: (count: number) => `${count} ${count === 1 ? "practice" : "practices"} recorded on this device`,
    home: "Home",
    journey: "Journey",
    garden: "Garden",
    notes: "Notes",
    about: "About",
    safetyCardTitle: "Safety and AI",
    progressHome: "Explore",
    progressPark: "Consent",
    progressPractice: "Safety plan",
    progressGarden: "Garden grows",
    musicOn: "Mute garden music",
    musicOff: "Play garden music",
    settings: "Settings",
    language: "简中",
    safeNote: "Practice support, not an assessment.",
    actorDog: "Puppy",
    actorPlayer: "Little Fox",
    actorAdult: "Trusted adult",
    settingsTitle: "Family settings",
    settingsIntro: "Choose a calmer, clearer way to practice together.",
    close: "Close",
    languageLabel: "Language",
    english: "English",
    chinese: "中文",
    traditionalChinese: "繁體中文",
    supportMode: "Support style",
    standardSupport: "Words + icons",
    standardSupportHint: "Balanced prompts for this practice",
    pictureSupport: "Larger picture cues",
    pictureSupportHint: "Makes action symbols easier to notice",
    on: "On",
    off: "Off",
    journeyLibrary: "Practice journeys",
    journeyLibraryIntro: "Choose one short, low-pressure situation to practice together.",
    activeJourney: "Hugs and body space",
    activeJourneyBody: "Explore, collect, practice consent and safety actions, then choose where the seed will grow.",
    continueJourney: "Continue today’s journey",
    startAgain: "Practice this journey",
    comingLater: "Coming later",
    secretJourney: "Uncomfortable secrets",
    secretJourneyBody: "Practice noticing an uncomfortable secret and telling a trusted adult.",
    familiarJourney: "Familiar people and strangers",
    familiarJourneyBody: "Look at what someone does, not only whether the person is familiar.",
    careJourney: "Care and medical visits",
    careJourneyBody: "Practice clear explanations, permission, and support during care.",
    gardenViewTitle: "Our practice garden",
    gardenViewIntro: "Each flower marks a completed family practice. It never marks a score.",
    openPlots: "Open places for future practices",
    historyTitle: "Practice notes",
    historyIntro: "A private, factual history saved only on this device.",
    noHistory: "No completed practice has been recorded yet.",
    initialChoiceSpace: "Little Fox first asked for space.",
    initialChoiceAccept: "Little Fox first accepted the hug.",
    safetyActions: (count: number) => `${count} safety steps were practiced.`,
    practiceNumber: (number: number) => `Practice ${number}`,
    today: "Today",
    defaultPlayerName: "Little Fox",
    nameTitle: "What should we call your fox?",
    nameIntro: "Choose a familiar name to make each practice feel like your family’s own story.",
    nameLabel: "Fox’s name",
    namePlaceholder: "Enter a name",
    nameHint: "You can change this later in Family settings.",
    saveName: "Begin with this name",
    nameSettingsLabel: "Fox’s name",
    updateName: "Save name",
    todayPractice: "Today’s practice",
    defaultTonightPrompt: "“Who are the adults you can ask for help?”",
    defaultParentReply: "Listen first, then thank the child for telling you.",
  },
  zh: {
    brand: "安全花园",
    welcomeTitle: "准备好今天的小小散步了吗？",
    welcomeBody: "探索公园、收集两件小发现，再练习：当朋友靠得太近而且没有停下来时，可以怎么做。",
    calmLabel: "安静模式",
    calmHint: "减少动态，并关闭背景音乐",
    soundLabel: "花园音乐",
    start: "开始今天的散步",
    todaysWalk: "今天的散步",
    park: "探索、练习，再让花园成长。",
    gardenTitle: "一朵练习花长出来了",
    replay: "再练习一次",
    forParents: "给家长",
    parentWaiting: "可信赖的大人回应后，家庭可以一起种下这次练习的种子。",
    observedTitle: "这次发生了什么",
    completedLabel: "已记录一次练习",
    tonight: "今晚试一试",
    askAtCalmMoment: "在轻松的时候，可以问：",
    ourGarden: "我们的花园",
    keepGrowing: "花代表一起练习过，不代表答对了。",
    practicesRecorded: (count: number) => `这台设备已记录 ${count} 次练习`,
    home: "首页",
    journey: "旅程",
    garden: "花园",
    notes: "记录",
    about: "关于",
    safetyCardTitle: "安全与 AI",
    progressHome: "探索",
    progressPark: "表达意愿",
    progressPractice: "安全计划",
    progressGarden: "花园成长",
    musicOn: "关闭花园音乐",
    musicOff: "播放花园音乐",
    settings: "设置",
    language: "繁體",
    safeNote: "这是练习支持，不是能力评估。",
    actorDog: "小狗",
    actorPlayer: "小狐狸",
    actorAdult: "可信赖的大人",
    settingsTitle: "家庭设置",
    settingsIntro: "选择更平静、更清晰的共同练习方式。",
    close: "关闭",
    languageLabel: "语言",
    english: "English",
    chinese: "中文",
    traditionalChinese: "繁體中文",
    supportMode: "支持方式",
    standardSupport: "文字与图标",
    standardSupportHint: "使用均衡的文字和动作提示",
    pictureSupport: "放大图片提示",
    pictureSupportHint: "让动作符号更容易被注意到",
    on: "开启",
    off: "关闭",
    journeyLibrary: "练习旅程",
    journeyLibraryIntro: "选择一个短小、低压力的生活情境，一起练习。",
    activeJourney: "拥抱与身体空间",
    activeJourneyBody: "探索和收集，再练习表达意愿、安全行动与求助，最后自己选择种植位置。",
    continueJourney: "继续今天的旅程",
    startAgain: "练习这段旅程",
    comingLater: "后续开放",
    secretJourney: "让人不舒服的秘密",
    secretJourneyBody: "练习察觉让人不舒服的秘密，并告诉可信赖的大人。",
    familiarJourney: "熟人与陌生人",
    familiarJourneyBody: "根据对方做了什么来判断，而不只看是否认识。",
    careJourney: "照护与就医",
    careJourneyBody: "练习在照护中获得清楚说明、同意与支持。",
    gardenViewTitle: "我们的练习花园",
    gardenViewIntro: "每朵花代表家庭完成过一次练习，从不代表分数。",
    openPlots: "留给未来练习的位置",
    historyTitle: "练习记录",
    historyIntro: "只保存在这台设备上的客观记录。",
    noHistory: "还没有完成并记录的练习。",
    initialChoiceSpace: "小狐狸一开始选择需要空间。",
    initialChoiceAccept: "小狐狸一开始选择接受拥抱。",
    safetyActions: (count: number) => `这次练习了 ${count} 个安全行动。`,
    practiceNumber: (number: number) => `第 ${number} 次练习`,
    today: "今天",
    defaultPlayerName: "小狐狸",
    nameTitle: "想怎么称呼小狐狸？",
    nameIntro: "取一个熟悉的名字，让每次练习更像属于这个家庭的故事。",
    nameLabel: "小狐狸的名字",
    namePlaceholder: "输入名字",
    nameHint: "之后可以在家庭设置中修改。",
    saveName: "用这个名字开始",
    nameSettingsLabel: "小狐狸的名字",
    updateName: "保存名字",
    todayPractice: "今天的练习",
    defaultTonightPrompt: "“你可以向哪些大人求助？”",
    defaultParentReply: "先听孩子说完，再谢谢孩子愿意告诉你。",
  },
} as const;

const copy = {
  ...baseCopy,
  "zh-TW": {
    ...baseCopy.zh,
    brand: "安全花園",
    welcomeTitle: "準備好今天的小小散步了嗎？",
    welcomeBody: "探索公園、收集兩件小發現，再練習：當朋友靠得太近而且沒有停下來時，可以怎麼做。",
    calmLabel: "安靜模式",
    calmHint: "減少動態，並關閉背景音樂",
    soundLabel: "花園音樂",
    start: "開始今天的散步",
    todaysWalk: "今天的散步",
    park: "探索、練習，再讓花園成長。",
    gardenTitle: "一朵練習花長出來了",
    replay: "再練習一次",
    forParents: "給家長",
    parentWaiting: "可信賴的大人回應後，家庭可以一起種下這次練習的種子。",
    observedTitle: "這次發生了什麼",
    completedLabel: "已記錄一次練習",
    tonight: "今晚試一試",
    askAtCalmMoment: "在輕鬆的時候，可以問：",
    ourGarden: "我們的花園",
    keepGrowing: "花代表一起練習過，不代表答對了。",
    practicesRecorded: (count: number) => `這台裝置已記錄 ${count} 次練習`,
    home: "首頁",
    journey: "旅程",
garden: "花園",
    notes: "記錄",
    about: "關於",
    safetyCardTitle: "安全與 AI",
    progressHome: "探索",
    progressPark: "表達意願",
    progressPractice: "安全計畫",
    progressGarden: "花園成長",
    musicOn: "關閉花園音樂",
    musicOff: "播放花園音樂",
    settings: "設定",
    language: "EN",
    safeNote: "這是練習支持，不是能力評估。",
    actorDog: "小狗",
    actorPlayer: "小狐狸",
    actorAdult: "可信賴的大人",
    settingsTitle: "家庭設定",
    settingsIntro: "選擇更平靜、更清晰的共同練習方式。",
    close: "關閉",
    languageLabel: "語言",
    chinese: "簡體中文",
    traditionalChinese: "繁體中文",
    supportMode: "支持方式",
    standardSupport: "文字與圖示",
    standardSupportHint: "使用均衡的文字和動作提示",
    pictureSupport: "放大圖片提示",
    pictureSupportHint: "讓動作符號更容易被注意到",
    on: "開啟",
    off: "關閉",
    journeyLibrary: "練習旅程",
    journeyLibraryIntro: "選擇一個短小、低壓力的生活情境，一起練習。",
    activeJourney: "擁抱與身體空間",
    activeJourneyBody: "探索和收集，再練習表達意願、安全行動與求助，最後自己選擇種植位置。",
    continueJourney: "繼續今天的旅程",
    startAgain: "練習這段旅程",
    comingLater: "後續開放",
    secretJourney: "讓人不舒服的祕密",
    secretJourneyBody: "練習察覺讓人不舒服的祕密，並告訴可信賴的大人。",
    familiarJourney: "熟人與陌生人",
    familiarJourneyBody: "根據對方做了什麼來判斷，而不只看是否認識。",
    careJourney: "照護與就醫",
    careJourneyBody: "練習在照護中獲得清楚說明、同意與支持。",
    gardenViewTitle: "我們的練習花園",
    gardenViewIntro: "每朵花代表家庭完成過一次練習，從不代表分數。",
    openPlots: "留給未來練習的位置",
    historyTitle: "練習記錄",
    historyIntro: "只儲存在這台裝置上的客觀記錄。",
    noHistory: "還沒有完成並記錄的練習。",
    initialChoiceSpace: "小狐狸一開始選擇需要空間。",
    initialChoiceAccept: "小狐狸一開始選擇接受擁抱。",
    safetyActions: (count: number) => `這次練習了 ${count} 個安全行動。`,
    practiceNumber: (number: number) => `第 ${number} 次練習`,
    today: "今天",
    defaultPlayerName: "小狐狸",
    nameTitle: "想怎麼稱呼小狐狸？",
    nameIntro: "取一個熟悉的名字，讓每次練習更像屬於這個家庭的故事。",
    nameLabel: "小狐狸的名字",
    namePlaceholder: "輸入名字",
    nameHint: "之後可以在家庭設定中修改。",
    saveName: "用這個名字開始",
    nameSettingsLabel: "小狐狸的名字",
    updateName: "儲存名字",
    todayPractice: "今天的練習",
    defaultTonightPrompt: "「你可以向哪些大人求助？」",
    defaultParentReply: "先聽孩子說完，再謝謝孩子願意告訴你。",
  },
} as const;

const gameCopy: Record<Language, {
  questTitle: string;
  questIntro: string;
  questProgress: (count: number) => string;
  petal: string;
  stone: string;
  collectPetal: string;
  collectStone: string;
  butterfly: string;
  watchButterfly: string;
  butterflyRest: string;
  itemAdded: string;
  backpack: string;
  visitPuppy: string;
  puppyWaiting: string;
  standardShort: string;
  pictureShort: string;
  modelShort: string;
  modelSupport: string;
  modelSupportHint: string;
  modelCue: string;
  modelWatching: string;
  nowTry: string;
  holdToSay: string;
  keepHolding: string;
  choosePlot: string;
  choosePlotIntro: string;
  plantHere: string;
  seedFound: string;
  nextFocus: string;
  coachReviewed: string;
  coachLoading: string;
  coachAdapted: string;
  coachFallback: string;
  refreshCoach: string;
}> = {
  en: {
    questTitle: "Find two park treasures",
    questIntro: "Look around at your own pace. Tap a petal and a round stone, then visit Puppy’s bubbles.",
    questProgress: (count) => `${count} of 2 found`,
    petal: "Fallen petal",
    stone: "Round stone",
    collectPetal: "Pick up the fallen petal",
    collectStone: "Pick up the round stone",
    butterfly: "A resting butterfly",
    watchButterfly: "Watch the butterfly",
    butterflyRest: "The butterfly opens and closes its wings. You can just watch, as long as you like.",
    itemAdded: "Added to your walk bag",
    backpack: "Walk bag",
    visitPuppy: "Visit Puppy",
    puppyWaiting: "Puppy is blowing bubbles",
    standardShort: "Words + icons",
    pictureShort: "Large pictures",
    modelShort: "Show me first",
    modelSupport: "Show first, then try",
    modelSupportHint: "See one calm example before each action",
    modelCue: "First, watch one calm example.",
    modelWatching: "Watching the example…",
    nowTry: "Now you can try",
    holdToSay: "Press and hold: “No. Please stop.”",
    keepHolding: "Keep holding to use clear words",
    choosePlot: "Where should today’s seed grow?",
    choosePlotIntro: "Choose any open patch. The flower marks that your family practiced together.",
    plantHere: "Plant in this patch",
    seedFound: "Puppy shared the last spring treasure: a seed.",
    nextFocus: "A small next practice",
    coachReviewed: "Reviewed family guidance",
    coachLoading: "Adapting the family prompt",
    coachAdapted: "AI-adapted within reviewed safety rules",
    coachFallback: "Reviewed guidance is ready offline",
    refreshCoach: "Adapt wording again",
  },
  zh: {
    questTitle: "寻找两件公园小发现",
    questIntro: "按照自己的节奏看看周围。找到一片落下的花瓣和一颗圆石头，再去看看小狗的泡泡。",
    questProgress: (count) => `已找到 ${count}/2`,
    petal: "落下的花瓣",
 stone: "圆石头",
    collectPetal: "捡起落下的花瓣",
    collectStone: "捡起圆石头",
    butterfly: "停歇的蝴蝶",
    watchButterfly: "看看蝴蝶",
  butterflyRest: "蝴蝶轻轻地开合翅膀。你可以就这样看着，想看多久都可以。",
    itemAdded: "已放进散步小包",
    backpack: "散步小包",
    visitPuppy: "去看看小狗",
    puppyWaiting: "小狗正在吹泡泡",
    standardShort: "文字与图标",
    pictureShort: "放大图片",
    modelShort: "先示范",
    modelSupport: "先示范，再尝试",
    modelSupportHint: "每个动作前先看一次平静示范",
    modelCue: "先看一次平静的动作示范。",
    modelWatching: "正在看示范……",
    nowTry: "现在可以试一试",
    holdToSay: "按住说：“不要，请停下来。”",
    keepHolding: "继续按住，清楚地说出来",
    choosePlot: "今天的种子想种在哪里？",
    choosePlotIntro: "选择任意一块空地。花只代表这个家庭一起练习过。",
    plantHere: "把种子种在这里",
    seedFound: "小狗送来了最后一件春日发现：一颗种子。",
    nextFocus: "下一次小练习",
    coachReviewed: "经过审核的家庭提示",
    coachLoading: "正在调整家庭提示",
    coachAdapted: "AI 已在审核过的安全规则内调整措辞",
    coachFallback: "离线审核提示已准备好",
    refreshCoach: "重新调整措辞",
  },
  "zh-TW": {
    questTitle: "尋找兩件公園小發現",
    questIntro: "按照自己的節奏看看周圍。找到一片落下的花瓣和一顆圓石，再去看看小狗的泡泡。",
    questProgress: (count) => `已找到 ${count}/2`,
    petal: "落下的花瓣",
    stone: "圓石",
    collectPetal: "撿起落下的花瓣",
    collectStone: "撿起圓石",
    butterfly: "停歇的蝴蝶",
    watchButterfly: "看看蝴蝶",
    butterflyRest: "蝴蝶輕輕地開合翅膀。你可以就這樣看著，想看多久都可以。",
    itemAdded: "已放進散步小包",
    backpack: "散步小包",
    visitPuppy: "去看看小狗",
    puppyWaiting: "小狗正在吹泡泡",
    standardShort: "文字與圖示",
    pictureShort: "放大圖片",
    modelShort: "先示範",
    modelSupport: "先示範，再嘗試",
    modelSupportHint: "每個動作前先看一次平靜示範",
  modelCue: "先看一次平靜的動作示範。",
    modelWatching: "正在看示範……",
    nowTry: "現在可以試一試",
    holdToSay: "按住說：「不要，請停下來。」",
    keepHolding: "繼續按住，清楚地說出來",
    choosePlot: "今天的種子想種在哪裡？",
    choosePlotIntro: "選擇任意一塊空地。花只代表這個家庭一起練習過。",
    plantHere: "把種子種在這裡",
    seedFound: "小狗送來了最後一件春日發現：一顆種子。",
    nextFocus: "下一次小練習",
    coachReviewed: "經過審核的家庭提示",
    coachLoading: "正在調整家庭提示",
    coachAdapted: "AI 已在審核過的安全規則內調整措辭",
    coachFallback: "離線審核提示已準備好",
    refreshCoach: "重新調整措辭",
  },
};

function personalizedText(text: string, language: Language, playerName: string): string {
  const fallbackName = copy[language].defaultPlayerName;
  return text.replaceAll("Little Fox", playerName || fallbackName).replaceAll("小狐狸", playerName || fallbackName);
}

function actorLabel(node: JourneyNode, language: Language, playerName: string): string {
  const t = copy[language];
  if (node.actor === "dog") return t.actorDog;
  if (node.actor === "trusted-adult") return t.actorAdult;
  return playerName || t.defaultPlayerName;
}

function ActionIcon({ action }: { action?: SemanticAction }) {
  if (action === "accept-contact") return <Heart />;
  if (action === "set-boundary" || action === "repeat-boundary") return <Hand />;
  if (action === "step-back") return <Footprints />;
  if (action === "leave") return <DoorOpen />;
  if (action === "seek-help" || action === "trusted-adult-support") return <UserRoundCheck />;
  if (action === "repair") return <Check />;
  return <ArrowRight />;
}

function HoldToSpeakButton({
  label,
  holdingLabel,
  reducedMotion,
  onComplete,
}: {
  label: string;
  holdingLabel: string;
  reducedMotion: boolean;
  onComplete: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setHolding(false);
  };
  const begin = () => {
    if (timerRef.current || completedRef.current) return;
    setHolding(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      completedRef.current = true;
      setHolding(false);
      onComplete();
    }, reducedMotion ? 650 : 950);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <button
      className={`primary-button compact journey-continue hold-action ${holding ? "is-holding" : ""}`}
      type="button"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          begin();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") cancel();
      }}
      aria-label={label}
    >
      <span className="hold-action-progress" aria-hidden="true" />
      <Hand aria-hidden="true" />
      <span>{holding ? holdingLabel : label}</span>
    </button>
  );
}

function ExplorationLayer({
  language,
  discovered,
  onDiscover,
onVisitPuppy,
}: {
  language: Language;
  discovered: DiscoveryId[];
  onDiscover: (item: DiscoveryId) => void;
  onVisitPuppy: () => void;
}) {
  const g = gameCopy[language];
  const ready = discovered.length >= 2;
  const [lastAdded, setLastAdded] = useState<DiscoveryId | null>(null);
  const [butterflyOpen, setButterflyOpen] = useState(false);

  const handleDiscover = (item: DiscoveryId) => {
    if (discovered.includes(item)) return;
    onDiscover(item);
    setLastAdded(item);
  };

  return (
    <div className="exploration-layer">
  <section className="quest-card" aria-live="polite">
        <div className="quest-heading"><Backpack aria-hidden="true" /><div><strong>{g.questTitle}</strong><span>{g.questProgress(discovered.length)}</span></div></div>
      <p>{g.questIntro}</p>
   <div className="backpack-items" aria-label={g.backpack}>
          <span className={discovered.includes("petal") ? "found" : ""}><Flower2 aria-hidden="true" />{g.petal}</span>
          <span className={discovered.includes("stone") ? "found" : ""}><CircleDot aria-hidden="true" />{g.stone}</span>
        </div>
        {lastAdded && (
          <p className="quest-feedback" aria-live="polite"><Check aria-hidden="true" />{g.itemAdded}: {lastAdded === "petal" ? g.petal : g.stone}</p>
     )}
      </section>

      <button
  type="button"
        className={`world-hotspot item-hotspot petal-hotspot ${discovered.includes("petal") ? "is-found" : ""}`}
        onClick={() => handleDiscover("petal")}
      disabled={discovered.includes("petal")}
      aria-label={g.collectPetal}
      ><img className="hotspot-art" src="/assets/explore-petal.webp" alt="" aria-hidden="true" /></button>
      <button
        type="button"
        className={`world-hotspot item-hotspot stone-hotspot ${discovered.includes("stone") ? "is-found" : ""}`}
        onClick={() => handleDiscover("stone")}
        disabled={discovered.includes("stone")}
        aria-label={g.collectStone}
      ><img className="hotspot-art" src="/assets/explore-stone.webp" alt="" aria-hidden="true" /></button>
      <button
    type="button"
      className={`world-hotspot item-hotspot butterfly-hotspot ${butterflyOpen ? "is-watching" : ""}`}
    onClick={() => setButterflyOpen((open) => !open)}
        aria-label={g.watchButterfly}
        aria-pressed={butterflyOpen}
      ><span className="hotspot-art butterfly-sprite" aria-hidden="true" /></button>
      {butterflyOpen && (
<div className="butterfly-note" role="note">{g.butterflyRest}</div>
      )}
      <button
        type="button"
        className={`world-hotspot puppy-hotspot ${ready ? "is-ready" : ""}`}
    onClick={onVisitPuppy}
  disabled={!ready}
        aria-label={ready ? g.visitPuppy : g.puppyWaiting}
      ><Sparkles aria-hidden="true" /><span>{ready ? g.visitPuppy : g.puppyWaiting}</span></button>
  </div>
  );
}

function IllustratedCharacters({ node, reducedMotion }: { node: JourneyNode; reducedMotion: boolean }) {
  const presentation = node.id === "respect-space"
    ? "dog-boundary-step-back"
    : node.action
      ? semanticPresentationMap[node.action]
      : undefined;
  const foxPose = presentation === "fox-happy" ? "fox-happy" : presentation === "fox-step" ? "fox-step" : presentation === "fox-seek-help" ? "fox-help" : "fox-idle";
  const dogPose = presentation === "dog-listen" ? "dog-listen" : "dog-idle";
  const usesDogActionSheet = presentation === "dog-boundary-step-back" || presentation === "dog-repair";
  const usesBubbleIdle = node.id === "ask-consent";
  const dogActionPose = presentation === "dog-boundary-step-back" ? "dog-action-back" : "dog-repair";
  const isSupportedScene = ["seek-help", "repair", "trusted-adult-response"].includes(node.id);
  const foxClass = presentation === "fox-step"
    ? "is-stepping"
    : presentation === "fox-leave"
      ? "is-leaving"
      : node.id === "seek-help"
        ? "is-seeking-help"
        : isSupportedScene
          ? "is-supported"
          : "";
  const showTrustedAdult = ["seek-help", "repair", "trusted-adult-response"].includes(node.id);
  const dogClass = [presentation === "dog-approach" ? "is-approaching" : "", isSupportedScene ? "is-kept-back" : ""].filter(Boolean).join(" ");
  const parentPose = node.id === "repair" ? "parent-protect" : node.id === "trusted-adult-response" ? "parent-reassure" : "parent-listen";

  return (
    <div className="storybook-characters" aria-hidden="true">
      <div className={`storybook-character fox-character ${foxClass}`}>
        <span className="character-shadow" />
        <span className={`sprite-window fox-sprite ${foxPose}`}><img src="/assets/fox-2d.png" alt="" /></span>
      </div>
      <div className={`storybook-character dog-character ${dogClass}`}>
        <span className="character-shadow" />
        {usesDogActionSheet ? (
          <span className={`sprite-window dog-action-sprite ${dogActionPose}`}><img src="/assets/dog-actions.png" alt="" /></span>
        ) : usesBubbleIdle ? (
          <span className={`sprite-window dog-bubble-sprite ${reducedMotion ? "is-still" : ""}`}><img src="/assets/dog-bubble-still.png" alt="" /></span>
        ) : (
          <span className={`sprite-window dog-sprite ${dogPose}`}><img src="/assets/dog-2d.png" alt="" /></span>
        )}
      </div>
      {showTrustedAdult && (
        <div className={`storybook-character parent-character is-near-fox ${node.id === "seek-help" ? "is-arriving" : ""}`}>
          <span className="character-shadow" />
          <span className={`sprite-window parent-sprite ${parentPose}`}><img src="/assets/fox-parent.png" alt="" /></span>
        </div>
      )}
    </div>
  );
}

function Speaker({ node, language, playerName }: { node: JourneyNode; language: Language; playerName: string }) {
  if (node.actor === "trusted-adult") {
    return <span className="speaker-dot trusted-adult-avatar" aria-hidden="true" />;
  }
  if (node.actor === "player") {
    return <span className="speaker-dot fox-dialogue-avatar" aria-hidden="true" />;
  }
  return <span className="speaker-dot dog-avatar" aria-hidden="true" title={actorLabel(node, language, playerName)} />;
}

function JourneyDialogue({
  node,
  language,
  playerName,
  supportMode,
  reducedMotion,
  demonstrated,
  onDemonstrate,
  onAdvance,
}: {
  node: JourneyNode;
  language: Language;
  playerName: string;
  supportMode: SupportMode;
  reducedMotion: boolean;
  demonstrated: boolean;
  onDemonstrate: () => void;
  onAdvance: (choiceId?: JourneyChoice["id"]) => void;
}) {
  const isChoice = node.kind === "choice";
  const dialogueText = personalizedText(node.text[language], language, playerName);
  const g = gameCopy[language];
  const needsDemonstration = supportMode === "model-first" && node.kind === "action" && !demonstrated;
  const [watching, setWatching] = useState(false);

  // In show-first mode, tapping the cue plays one calm demonstration preview
  // before the child is asked to act. Calm mode resolves it without motion.
  const runDemonstration = () => {
    if (watching) return;
    setWatching(true);
 const settle = () => {
      setWatching(false);
      onDemonstrate();
    };
    if (reducedMotion) {
      settle();
    } else {
      window.setTimeout(settle, 1400);
    }
  };

  return (
    <div className={`dialogue journey-dialogue kind-${node.kind}`} role={isChoice ? "group" : undefined} aria-label={dialogueText}>
      <div className={`speech-bubble ${node.actor === "trusted-adult" ? "adult-bubble" : ""}`}>
        <Speaker node={node} language={language} playerName={playerName} />
        <div className="speech-content">
      <small>{actorLabel(node, language, playerName)}</small>
          <span>{dialogueText}</span>
        </div>
      </div>
      {node.choices ? (
        <div className="choice-stack">
          {node.choices.map((choice) => (
 <button type="button" onClick={() => onAdvance(choice.id)} key={choice.id}>
              <span className={`choice-icon ${choice.id === "accept" ? "heart" : "hand"}`} aria-hidden="true"><ActionIcon action={choice.action} /></span>
              {choice.label[language]}
     </button>
          ))}
        </div>
      ) : needsDemonstration ? (
<button className={`primary-button compact journey-continue model-first-action ${watching ? "is-demonstrating" : ""}`} type="button" onClick={runDemonstration} disabled={watching} aria-live="polite">
          <span className="demo-icon" aria-hidden="true"><ActionIcon action={node.action} /></span>
        <span>{watching ? g.modelWatching : g.modelCue}</span>
        </button>
      ) : node.action === "repeat-boundary" ? (
        <HoldToSpeakButton label={g.holdToSay} holdingLabel={g.keepHolding} reducedMotion={reducedMotion} onComplete={() => onAdvance()} />
      ) : (
<button className="primary-button compact journey-continue" type="button" onClick={() => onAdvance()}>
          {supportMode === "model-first" && node.kind === "action" ? g.nowTry : node.cta?.[language]}
   <ActionIcon action={node.action} />
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [journey, setJourney] = useState<JourneyState>(() => createJourneyState());
  const [started, setStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>("welcome");
  const [discoveries, setDiscoveries] = useState<DiscoveryId[]>([]);
  const [demonstratedNodes, setDemonstratedNodes] = useState<string[]>([]);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [completedRecord, setCompletedRecord] = useState<PracticeRecord | null>(null);
  const [agentCoach, setAgentCoach] = useState<CoachCard | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [panelView, setPanelView] = useState<PanelView>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportMode, setSupportMode] = useState<SupportMode>("standard");
  const [hydrated, setHydrated] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [nameSetupOpen, setNameSetupOpen] = useState(false);
  const recordedJourneyRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const node = getJourneyNode(journey.nodeId);
  const t = copy[language];

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      const savedCalm = window.localStorage.getItem("safe-garden-calm");
      const savedLanguage = window.localStorage.getItem("safe-garden-language") as Language | null;
      const savedSupportMode = window.localStorage.getItem(SUPPORT_MODE_STORAGE_KEY) as SupportMode | null;
      const savedMusic = window.localStorage.getItem(MUSIC_STORAGE_KEY);
   const savedPlayerName = window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY)?.trim() ?? "";
   const savedDiscoveries = window.localStorage.getItem(DISCOVERIES_STORAGE_KEY);
      setRecords(parsePracticeRecords(window.localStorage.getItem(PRACTICE_STORAGE_KEY)));
      if (savedDiscoveries) {
        try {
  const parsed = JSON.parse(savedDiscoveries);
       if (Array.isArray(parsed)) {
   setDiscoveries(parsed.filter((item): item is DiscoveryId => item === "petal" || item === "stone"));
          }
        } catch {
       // ignore malformed discovery cache
        }
      }
      if (savedCalm === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setReducedMotion(true);
        setMusicOn(false);
      }
      if (savedLanguage === "zh" || savedLanguage === "zh-TW" || savedLanguage === "en") setLanguage(savedLanguage);
      if (savedSupportMode === "standard" || savedSupportMode === "picture" || savedSupportMode === "model-first") setSupportMode(savedSupportMode);
      if (savedCalm !== "true" && (savedMusic === "true" || savedMusic === "false")) setMusicOn(savedMusic === "true");
      setPlayerName(savedPlayerName);
      setNameDraft(savedPlayerName);
      setNameSetupOpen(!savedPlayerName);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("safe-garden-calm", String(reducedMotion));
    if (reducedMotion) {
      audioRef.current?.pause();
    }
  }, [reducedMotion, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("safe-garden-language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : language === "zh-TW" ? "zh-TW" : "en";
  }, [language, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SUPPORT_MODE_STORAGE_KEY, supportMode);
  }, [supportMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(MUSIC_STORAGE_KEY, String(musicOn));
  }, [musicOn, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
  window.localStorage.setItem(DISCOVERIES_STORAGE_KEY, JSON.stringify(discoveries));
  }, [discoveries, hydrated]);

  const reviewedCoachCard = useMemo(() => {
    const record = completedRecord ?? records[0];
    if (!record) return null;
    return buildReviewedCoachCard(record, language);
  }, [completedRecord, records, language]);

  const coachCard = agentCoach ?? reviewedCoachCard;

  const requestAgentCoach = async (record: PracticeRecord, signal?: AbortSignal) => {
    const fallback = buildReviewedCoachCard(record, language);
    setAgentCoach(fallback);
    setAgentStatus("loading");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          language,
          supportMode,
          initialConsent: record.initialConsent,
          actions: record.events.map((event) => event.action),
        }),
      });
      const payload = await response.json() as { ok?: boolean; candidate?: Parameters<typeof applyConstrainedAgentEnhancement>[1] };
      const next = applyConstrainedAgentEnhancement(fallback, payload.ok ? payload.candidate : null);
      setAgentCoach(next);
      setAgentStatus(next.source === "constrained-agent" ? "adapted" : "fallback");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setAgentCoach(fallback);
      setAgentStatus("fallback");
    }
  };

  useEffect(() => {
    if (!completedRecord) return;
    const controller = new AbortController();
    const task = window.setTimeout(() => void requestAgentCoach(completedRecord, controller.signal), 0);
    return () => {
      window.clearTimeout(task);
      controller.abort();
    };
    // support mode and language intentionally produce a fresh bounded adaptation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedRecord, language, supportMode]);

  const startJourney = async () => {
    setStarted(true);
    setGamePhase("explore");
    if (musicOn && audioRef.current) {
      audioRef.current.volume = 0.28;
      try { await audioRef.current.play(); } catch { setMusicOn(false); }
    }
  };

  const toggleMusic = async () => {
    const next = !musicOn;
    setMusicOn(next);
    if (!audioRef.current) return;
    if (next) {
      audioRef.current.volume = 0.28;
      try { await audioRef.current.play(); } catch { setMusicOn(false); }
    } else {
      audioRef.current.pause();
    }
  };

  const setCalmMode = (next: boolean) => {
    setReducedMotion(next);
    if (next) setMusicOn(false);
  };

  const savePlayerName = () => {
    const nextName = nameDraft.trim().slice(0, 16);
    if (!nextName) return;
    setPlayerName(nextName);
    setNameDraft(nextName);
    setNameSetupOpen(false);
    window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, nextName);
  };

  const cycleLanguage = () => {
    setLanguage(language === "en" ? "zh" : language === "zh" ? "zh-TW" : "en");
  };

  const handleAdvance = (choiceId?: JourneyChoice["id"]) => {
    const next = advanceJourney(journey, choiceId);
    setJourney(next);
    if (getJourneyNode(next.nodeId).kind === "ending") setGamePhase("plant");
  };

  const collectDiscovery = (item: DiscoveryId) => {
    setDiscoveries((current) => current.includes(item) ? current : [...current, item]);
  };

  const beginBoundaryPractice = () => {
    if (discoveries.length < 2) return;
    setGamePhase("journey");
  };

  const plantPractice = (gardenPlot: number) => {
    if (node.kind !== "ending" || recordedJourneyRef.current === journey.journeyId) return;
    const record = createPracticeRecord(journey, new Date().toISOString(), {
      discoveries,
      gardenPlot,
      supportMode,
    });
    recordedJourneyRef.current = journey.journeyId;
    setCompletedRecord(record);
    setAgentCoach(null);
    setRecords((current) => {
      const next = savePracticeRecord(current, record);
      window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setGamePhase("complete");
  };

  const restart = () => {
    const next = createJourneyState();
    recordedJourneyRef.current = null;
    setCompletedRecord(null);
    setAgentCoach(null);
    setAgentStatus("idle");
    setDiscoveries([]);
    setDemonstratedNodes([]);
    setJourney(next);
    setStarted(true);
    setGamePhase("explore");
  };

  const openPanelView = (view: PanelView) => {
    setSettingsOpen(false);
    setPanelView(view);
    window.setTimeout(() => {
      document.querySelector(".parent-panel")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }, 0);
  };

  const openSettings = () => {
    setSettingsOpen(true);
    window.setTimeout(() => {
      document.querySelector(".parent-panel")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    }, 0);
  };

  const launchJourney = () => {
    if (node.kind === "ending") restart();
    else {
      setStarted(true);
      setGamePhase(discoveries.length >= 2 ? "journey" : "explore");
    }
    setSettingsOpen(false);
    setPanelView("home");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const formatPracticeDate = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return t.today;
    return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : language === "zh-TW" ? "zh-TW" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const safetyActionCount = (record: PracticeRecord) => new Set(
    record.events
      .map((event) => event.action)
      .filter((action) => ["step-back", "repeat-boundary", "leave", "seek-help"].includes(action)),
  ).size;
  // Build the garden purely from persisted records. Records that stored an
  // explicit chosen plot keep it; older records without one are placed into the
  // first remaining open plot so nothing overlaps or is overwritten.
  const plantedPlots = useMemo(() => {
    const taken = new Set<number>();
for (const record of records) {
      if (typeof record.gardenPlot === "number" && !taken.has(record.gardenPlot)) {
 taken.add(record.gardenPlot);
      }
    }
    for (const record of records) {
      if (typeof record.gardenPlot === "number") continue;
      for (let plot = 0; plot < 8; plot += 1) {
      if (!taken.has(plot)) {
 taken.add(plot);
      break;
   }
}
    }
    return taken;
  }, [records]);
  const gardenIsFull = plantedPlots.size >= 8;

  const progressIndex = gamePhase === "welcome" || gamePhase === "explore"
    ? 0
    : gamePhase === "plant" || gamePhase === "complete"
      ? 3
      : ["ask-consent", "respect-accept", "respect-space"].includes(node.id) ? 1 : 2;
  const progressItems = [
    { icon: <HomeIcon />, label: t.progressHome },
    { icon: <Trees />, label: t.progressPark },
    { icon: <ShieldCheck />, label: t.progressPractice },
    { icon: <span className="growth-icon stage-sprout" />, label: t.progressGarden },
  ];

  return (
    <main className={`app-shell ${reducedMotion ? "reduced-motion" : ""} ${supportMode === "picture" ? "picture-support" : ""}`}>
      <audio ref={audioRef} src="/assets/garden-music.mp3" loop preload="metadata" />

      {hydrated && nameSetupOpen && (
        <div className="name-onboarding" role="dialog" aria-modal="true" aria-labelledby="name-title">
          <form className="name-card" onSubmit={(event) => { event.preventDefault(); savePlayerName(); }}>
            <div className="name-language" aria-label={t.languageLabel}>
              <button type="button" className={language === "en" ? "selected" : ""} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
              <button type="button" className={language === "zh" ? "selected" : ""} aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>简体</button>
              <button type="button" className={language === "zh-TW" ? "selected" : ""} aria-pressed={language === "zh-TW"} onClick={() => setLanguage("zh-TW")}>繁體</button>
            </div>
            <div className="name-avatar"><img src="/assets/fox-avatar.png" alt="" /></div>
            <p className="eyebrow">{t.brand}</p>
            <h1 id="name-title">{t.nameTitle}</h1>
            <p className="name-intro">{t.nameIntro}</p>
            <label className="name-field">
              <span>{t.nameLabel}</span>
              <input autoFocus autoComplete="off" maxLength={16} value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder={t.namePlaceholder} />
            </label>
            <button className="primary-button name-submit" type="submit" disabled={!nameDraft.trim()}>{t.saveName}<ArrowRight aria-hidden="true" /></button>
            <p className="name-hint">{t.nameHint}</p>
          </form>
        </div>
      )}

      <section className="story-stage" aria-label={t.todaysWalk}>
        <div className="park-background" />
        <div className="paper-haze" />
        <IllustratedCharacters node={node} reducedMotion={reducedMotion} />

        <header className="stage-header">
          <div className="stage-left-stack">
            <div className="today-card">
              <span className="flower-mark" aria-hidden="true"><Flower2 /></span>
              <div><strong>{t.todaysWalk}</strong><span>{t.park}</span></div>
            </div>
            <div className="stage-tools">
              <button type="button" onClick={toggleMusic} aria-label={musicOn ? t.musicOn : t.musicOff} title={musicOn ? t.musicOn : t.musicOff}>
                {musicOn ? <Music2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
              </button>
              <button type="button" onClick={cycleLanguage} aria-label="Change language">
                {t.language}
              </button>
            </div>
          </div>
          <button className="garden-shortcut" type="button" onClick={() => openPanelView("garden")} aria-label={t.ourGarden}>
            <span className="growth-icon stage-sprout" aria-hidden="true" /><small>{t.ourGarden}</small>
          </button>
        </header>

        {!started && (
          <div className="welcome-overlay" role="dialog" aria-labelledby="welcome-title">
            <div className="welcome-card">
              <span className="welcome-sprout" aria-hidden="true"><span className="growth-icon stage-sprout" /></span>
              <p className="eyebrow">{t.brand}</p>
              <h1 id="welcome-title">{t.welcomeTitle}</h1>
              <p className="welcome-copy">{personalizedText(t.welcomeBody, language, playerName)}</p>
              <div className="support-settings">
                <label className="setting-row">
                  <span><strong>{t.calmLabel}</strong><small>{t.calmHint}</small></span>
                  <input type="checkbox" checked={reducedMotion} onChange={(event) => setCalmMode(event.target.checked)} />
                  <span className="switch" aria-hidden="true" />
                </label>
                <label className="setting-row">
                  <span><strong>{t.soundLabel}</strong><small>{musicOn ? t.on : t.off}</small></span>
                  <input type="checkbox" checked={musicOn} disabled={reducedMotion} onChange={(event) => setMusicOn(event.target.checked)} />
                  <span className="switch" aria-hidden="true" />
                </label>
              </div>
              <div className="welcome-support-picker" aria-label={t.supportMode}>
                <button type="button" className={supportMode === "standard" ? "selected" : ""} aria-pressed={supportMode === "standard"} onClick={() => setSupportMode("standard")}><NotebookText aria-hidden="true" /><span>{gameCopy[language].standardShort}</span></button>
                <button type="button" className={supportMode === "picture" ? "selected" : ""} aria-pressed={supportMode === "picture"} onClick={() => setSupportMode("picture")}><Flower2 aria-hidden="true" /><span>{gameCopy[language].pictureShort}</span></button>
                <button type="button" className={supportMode === "model-first" ? "selected" : ""} aria-pressed={supportMode === "model-first"} onClick={() => setSupportMode("model-first")}><WandSparkles aria-hidden="true" /><span>{gameCopy[language].modelShort}</span></button>
              </div>
              <button className="primary-button" type="button" onClick={startJourney}>{t.start}<ArrowRight aria-hidden="true" /></button>
              <p className="safety-note">{t.safeNote}</p>
            </div>
          </div>
        )}

        {gamePhase === "explore" && (
          <ExplorationLayer language={language} discovered={discoveries} onDiscover={collectDiscovery} onVisitPuppy={beginBoundaryPractice} />
        )}

        {gamePhase === "journey" && node.kind !== "ending" && (
          <JourneyDialogue
            node={node}
            language={language}
            playerName={playerName}
            supportMode={supportMode}
            reducedMotion={reducedMotion}
            demonstrated={demonstratedNodes.includes(node.id)}
            onDemonstrate={() => setDemonstratedNodes((current) => current.includes(node.id) ? current : [...current, node.id])}
            onAdvance={handleAdvance}
          />
        )}

        {gamePhase === "plant" && node.kind === "ending" && (
          <div className="completion-overlay plant-overlay" role="dialog" aria-labelledby="plant-title">
            <div className="completion-card planting-card">
              <div className="seed-gift" aria-hidden="true"><span className="growth-icon stage-seed" /><Sparkles /></div>
              <p className="eyebrow">{gameCopy[language].seedFound}</p>
              <h2 id="plant-title">{gameCopy[language].choosePlot}</h2>
              <p>{gameCopy[language].choosePlotIntro}</p>
              <div className="planting-grid">
                {Array.from({ length: 8 }, (_, index) => (
                  <button type="button" key={index} className={plantedPlots.has(index) ? "occupied" : ""} disabled={!gardenIsFull && plantedPlots.has(index)} onClick={() => plantPractice(index)} aria-label={`${gameCopy[language].plantHere} ${index + 1}`}>
                    <span className="growth-stage stage-seed" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gamePhase === "complete" && node.kind === "ending" && (
          <div className="completion-overlay" role="dialog" aria-labelledby="garden-title">
            <div className="completion-card">
              <div className="growth-sprite" aria-hidden="true"><img src="/assets/growth.png" alt="" /></div>
              <p className="eyebrow">{t.ourGarden}</p>
              <h2 id="garden-title">{t.gardenTitle}</h2>
              <p>{personalizedText(node.text[language], language, playerName)}</p>
              <div className="completion-actions">
                <button className="primary-button" type="button" onClick={restart}>{t.replay}<RotateCcw aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        )}

        <nav className="journey-progress" aria-label="Journey progress">
          <div className="progress-intro"><span>{language === "en" ? "Today’s" : "今天的"}</span><strong>{t.journey}</strong></div>
          {progressItems.map((item, index) => (
            <div className={`progress-step ${index <= progressIndex ? "active" : ""}`} key={item.label}>
              <span className="progress-icon" aria-hidden="true">{item.icon}</span>
              <small>{item.label}</small>
            </div>
          ))}
        </nav>
      </section>

      <aside className={`parent-panel ${node.kind === "ending" || panelView !== "home" || settingsOpen ? "mobile-visible" : ""}`} aria-label={t.forParents}>
        <header className="profile-header">
          <div className="profile-avatar"><img className="profile-avatar-image" src="/assets/fox-avatar.png" alt="" /></div>
          <div><strong>{playerName || t.defaultPlayerName}</strong><span>{t.todayPractice}</span></div>
          <button type="button" aria-label={t.settings} aria-expanded={settingsOpen} onClick={openSettings}><Settings aria-hidden="true" /></button>
        </header>

        <div className="panel-scroll">
          {settingsOpen ? (
            <section className="settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title">
              <header className="settings-sheet-header">
                <div><p className="panel-eyebrow">{t.brand}</p><h2 id="settings-title">{t.settingsTitle}</h2></div>
                <button className="settings-close" type="button" onClick={() => setSettingsOpen(false)} aria-label={t.close}><X aria-hidden="true" /></button>
              </header>
              <p className="panel-intro">{t.settingsIntro}</p>
              <div className="settings-group">
                <h3>{t.nameSettingsLabel}</h3>
                <form className="settings-name-form" onSubmit={(event) => { event.preventDefault(); savePlayerName(); }}>
                  <input maxLength={16} value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} aria-label={t.nameSettingsLabel} />
                  <button type="submit" disabled={!nameDraft.trim()}>{t.updateName}</button>
                </form>
              </div>
              <div className="settings-group">
                <h3>{t.languageLabel}</h3>
                <div className="segmented-control">
                  <button type="button" className={language === "en" ? "selected" : ""} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{t.english}</button>
                  <button type="button" className={language === "zh" ? "selected" : ""} aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>{t.chinese}</button>
                  <button type="button" className={language === "zh-TW" ? "selected" : ""} aria-pressed={language === "zh-TW"} onClick={() => setLanguage("zh-TW")}>{t.traditionalChinese}</button>
                </div>
              </div>
              <div className="settings-group">
                <h3>{t.supportMode}</h3>
                <button className={`support-option ${supportMode === "standard" ? "selected" : ""}`} type="button" aria-pressed={supportMode === "standard"} onClick={() => setSupportMode("standard")}>
                  <span className="support-option-icon"><NotebookText aria-hidden="true" /></span><span><strong>{t.standardSupport}</strong><small>{t.standardSupportHint}</small></span><Check aria-hidden="true" />
                </button>
                <button className={`support-option ${supportMode === "picture" ? "selected" : ""}`} type="button" aria-pressed={supportMode === "picture"} onClick={() => setSupportMode("picture")}>
                  <span className="support-option-icon"><Flower2 aria-hidden="true" /></span><span><strong>{t.pictureSupport}</strong><small>{t.pictureSupportHint}</small></span><Check aria-hidden="true" />
                </button>
                <button className={`support-option ${supportMode === "model-first" ? "selected" : ""}`} type="button" aria-pressed={supportMode === "model-first"} onClick={() => setSupportMode("model-first")}>
                  <span className="support-option-icon"><WandSparkles aria-hidden="true" /></span><span><strong>{gameCopy[language].modelSupport}</strong><small>{gameCopy[language].modelSupportHint}</small></span><Check aria-hidden="true" />
                </button>
              </div>
              <div className="settings-group setting-toggles">
                <label className="setting-row"><span><strong>{t.calmLabel}</strong><small>{t.calmHint}</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setCalmMode(event.target.checked)} /><span className="switch" aria-hidden="true" /></label>
                <label className="setting-row"><span><strong>{t.soundLabel}</strong><small>{musicOn ? t.on : t.off}</small></span><input type="checkbox" checked={musicOn} disabled={reducedMotion} onChange={() => void toggleMusic()} /><span className="switch" aria-hidden="true" /></label>
              </div>
            </section>
          ) : panelView === "home" ? (
            <>
          <section className="coach-card observation-card">
            <div className="card-title"><span className="title-growth stage-sprout" aria-hidden="true" /><h2>{gamePhase === "complete" ? t.observedTitle : t.forParents}</h2></div>
            {gamePhase === "complete" && coachCard ? (
              <><strong className="gentle-success">{t.completedLabel}</strong><p>{personalizedText(coachCard.observation, language, playerName)}</p></>
            ) : <p>{t.parentWaiting}</p>}
            <div className={`mini-growth ${gamePhase === "complete" ? "stage-flower bloomed" : "stage-sprout"}`} aria-hidden="true" />
          </section>

          <section className="coach-card tonight-card">
            <div className="card-title"><Lightbulb aria-hidden="true" /><h2>{t.tonight}</h2></div>
            {gamePhase === "complete" && (
              <div className={`coach-source source-${agentStatus}`} aria-live="polite">
                <WandSparkles aria-hidden="true" />
                <span>{agentStatus === "loading" ? gameCopy[language].coachLoading : agentStatus === "adapted" ? gameCopy[language].coachAdapted : agentStatus === "fallback" ? gameCopy[language].coachFallback : gameCopy[language].coachReviewed}</span>
              </div>
            )}
            <p>{t.askAtCalmMoment}</p>
            <blockquote>{coachCard?.tonightPrompt ?? t.defaultTonightPrompt}</blockquote>
            <p className="parent-reply">{coachCard?.parentReply ?? t.defaultParentReply}</p>
            {coachCard && gamePhase === "complete" && (
      <div className="next-focus"><strong>{gameCopy[language].nextFocus}</strong><p>{coachCard.nextFocus}</p></div>
      )}
     {gamePhase === "complete" && (
       <button className="safety-boundary-chip" type="button" onClick={() => openPanelView("about")}>
      <ShieldCheck aria-hidden="true" />
  <span>{aboutContent[language].safetyWording}</span>
  <Info aria-hidden="true" />
        </button>
            )}
            {completedRecord && gamePhase === "complete" && agentStatus !== "loading" && (
              <button className="coach-refresh" type="button" onClick={() => void requestAgentCoach(completedRecord)}><WandSparkles aria-hidden="true" />{gameCopy[language].refreshCoach}</button>
            )}
          </section>

          <section className="coach-card garden-card">
            <div className="card-title"><span className="title-growth stage-leaf" aria-hidden="true" /><h2>{t.ourGarden}</h2></div>
            <p>{t.keepGrowing}</p>
            <div className="garden-bed" aria-label="Garden growth progress">
              {["stage-seed", "stage-sprout", "stage-leaf", "stage-flower"].map((stageClass, index) => (
                <span key={stageClass} className={`growth-stage ${stageClass} ${records.length > 0 && index === 3 ? "flower-grown" : ""}`} />
              ))}
            </div>
            <p className="practice-record-count">{t.practicesRecorded(records.length)}</p>
          </section>

          <p className="panel-disclaimer">{t.safeNote}</p>
            </>
          ) : panelView === "journey" ? (
            <section className="panel-view" aria-labelledby="journey-library-title">
              <p className="panel-eyebrow">{t.todaysWalk}</p>
              <h2 id="journey-library-title">{t.journeyLibrary}</h2>
              <p className="panel-intro">{t.journeyLibraryIntro}</p>
              <article className="journey-library-card active-journey">
                <span className="journey-card-icon"><Hand aria-hidden="true" /></span>
                <div><strong>{t.activeJourney}</strong><p>{t.activeJourneyBody}</p></div>
                <button className="panel-primary-action" type="button" onClick={launchJourney}>{started && node.kind !== "ending" ? t.continueJourney : t.startAgain}<ArrowRight aria-hidden="true" /></button>
              </article>
              {[
                [t.secretJourney, t.secretJourneyBody],
                [t.familiarJourney, t.familiarJourneyBody],
                [t.careJourney, t.careJourneyBody],
              ].map(([title, body]) => (
                <article className="journey-library-card future-journey" key={title}>
                  <span className="journey-card-icon"><Lock aria-hidden="true" /></span>
                  <div><strong>{title}</strong><p>{body}</p><small>{t.comingLater}</small></div>
                </article>
              ))}
            </section>
          ) : panelView === "garden" ? (
            <section className="panel-view" aria-labelledby="garden-view-title">
              <p className="panel-eyebrow">{t.keepGrowing}</p>
              <h2 id="garden-view-title">{t.gardenViewTitle}</h2>
              <p className="panel-intro">{t.gardenViewIntro}</p>
              <div className="garden-view-bed" aria-label={t.practicesRecorded(records.length)}>
                {Array.from({ length: 8 }, (_, index) => (
                  <span className={`garden-plot ${plantedPlots.has(index) ? "completed" : "open"}`} key={index}>
                    <span className={`growth-stage ${plantedPlots.has(index) ? "stage-flower" : "stage-seed"}`} />
                  </span>
                ))}
              </div>
      <div className="garden-summary"><strong>{t.practicesRecorded(records.length)}</strong><span>{t.openPlots}: {Math.max(0, 8 - plantedPlots.size)}</span></div>
       <p className="panel-disclaimer">{t.safeNote}</p>
       </section>
   ) : panelView === "about" ? (
  <section className="panel-view about-view" aria-labelledby="about-title">
         <p className="panel-eyebrow">{aboutContent[language].eyebrow}</p>
          <h2 id="about-title">{aboutContent[language].title}</h2>
          <div className="origin-card">
            <strong>{aboutContent[language].originTitle}</strong>
            <p>{aboutContent[language].originStory}</p>
          </div>
     <ul className="about-list">
    <li><UserRoundCheck aria-hidden="true" /><span>{aboutContent[language].forWho}</span></li>
              <li><Heart aria-hidden="true" /><span>{aboutContent[language].needs}</span></li>
          <li><ShieldCheck aria-hidden="true" /><span>{aboutContent[language].practiceNotAssessment}</span></li>
         <li><Trees aria-hidden="true" /><span>{aboutContent[language].alongside}</span></li>
         </ul>
        <div className="safety-flow-card">
           <div className="card-title"><ShieldCheck aria-hidden="true" /><h3>{aboutContent[language].safetyTitle}</h3></div>
         <ol className="safety-flow">
      <li><span className="safety-step-index" aria-hidden="true">1</span>{aboutContent[language].safetyEngine}</li>
     <li><span className="safety-step-index" aria-hidden="true">2</span>{aboutContent[language].safetyWording}</li>
      <li><span className="safety-step-index" aria-hidden="true">3</span>{aboutContent[language].safetyFallback}</li>
    </ol>
 </div>
    <p className="panel-disclaimer">{t.safeNote}</p>
            </section>
   ) : (
            <section className="panel-view" aria-labelledby="history-title">
              <p className="panel-eyebrow">{t.safeNote}</p>
              <h2 id="history-title">{t.historyTitle}</h2>
              <p className="panel-intro">{t.historyIntro}</p>
              {records.length === 0 ? <div className="history-empty"><NotebookText aria-hidden="true" /><p>{t.noHistory}</p></div> : (
                <div className="history-list">
                  {records.map((record, index) => (
                    <article className="history-entry" key={record.id}>
                      <span className="history-growth stage-flower" aria-hidden="true" />
                      <div><strong>{t.practiceNumber(records.length - index)}</strong><span className="history-date"><CalendarDays aria-hidden="true" />{formatPracticeDate(record.completedAt)}</span><p>{personalizedText(record.initialConsent === "space" ? t.initialChoiceSpace : t.initialChoiceAccept, language, playerName)} {t.safetyActions(safetyActionCount(record))}</p></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <nav className="panel-nav" aria-label="Parent navigation">
          <button className={panelView === "home" && !settingsOpen ? "active" : ""} aria-current={panelView === "home" && !settingsOpen ? "page" : undefined} onClick={() => openPanelView("home")} type="button"><HomeIcon aria-hidden="true" />{t.home}</button>
          <button className={panelView === "journey" && !settingsOpen ? "active" : ""} aria-current={panelView === "journey" && !settingsOpen ? "page" : undefined} onClick={() => openPanelView("journey")} type="button"><Map aria-hidden="true" />{t.journey}</button>
          <button className={panelView === "garden" && !settingsOpen ? "active" : ""} aria-current={panelView === "garden" && !settingsOpen ? "page" : undefined} onClick={() => openPanelView("garden")} type="button"><Flower2 aria-hidden="true" />{t.garden}</button>
   <button className={panelView === "notes" && !settingsOpen ? "active" : ""} aria-current={panelView === "notes" && !settingsOpen ? "page" : undefined} onClick={() => openPanelView("notes")} type="button"><NotebookText aria-hidden="true" />{t.notes}</button>
          <button className={panelView === "about" && !settingsOpen ? "active" : ""} aria-current={panelView === "about" && !settingsOpen ? "page" : undefined} onClick={() => openPanelView("about")} type="button"><Info aria-hidden="true" />{t.about}</button>
        </nav>
      </aside>
    </main>
  );
}
