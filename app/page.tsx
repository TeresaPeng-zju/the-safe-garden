"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  CalendarDays,
  Check,
  DoorOpen,
  Flower2,
  Hand,
  Heart,
  Home as HomeIcon,
  Lightbulb,
  Lock,
  Map,
  Music2,
  NotebookText,
  RotateCcw,
  Settings,
  ShieldCheck,
  Trees,
  UserRoundCheck,
  VolumeX,
  X,
} from "lucide-react";
import {
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
} from "../lib/journey";

type PanelView = "home" | "journey" | "garden" | "notes";
type SupportMode = "standard" | "picture";

const SUPPORT_MODE_STORAGE_KEY = "safe-garden-support-mode";
const MUSIC_STORAGE_KEY = "safe-garden-music";

const copy = {
  en: {
    brand: "The Safe Garden",
    welcomeTitle: "Ready for today’s little walk?",
    welcomeBody: "Little Fox will practice what to do when a friend comes too close and does not stop right away.",
    calmLabel: "Calm mode",
    calmHint: "Less movement and no background music",
    soundLabel: "Garden sounds",
    start: "Start today’s walk",
    todaysWalk: "Today’s Walk",
    park: "A complete boundary practice.",
    gardenTitle: "A practice flower grew",
    replay: "Practice again",
    forParents: "For Parents",
    parentWaiting: "After the trusted adult responds, this journey will be saved as one completed practice.",
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
    progressHome: "Home",
    progressPark: "Consent",
    progressPractice: "Safety plan",
    progressGarden: "Garden grows",
    musicOn: "Mute garden music",
    musicOff: "Play garden music",
    settings: "Settings",
    language: "中文",
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
    activeJourneyBody: "Practice consent, stepping back, clear words, leaving, and asking for help.",
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
  },
  zh: {
    brand: "安全花园",
    welcomeTitle: "准备好今天的小小散步了吗？",
    welcomeBody: "小狐狸会练习：当朋友靠得太近，而且没有马上停下来时，可以怎么做。",
    calmLabel: "安静模式",
    calmHint: "减少动态，并关闭背景音乐",
    soundLabel: "花园音乐",
    start: "开始今天的散步",
    todaysWalk: "今天的散步",
    park: "一次完整的身体边界练习。",
    gardenTitle: "一朵练习花长出来了",
    replay: "再练习一次",
    forParents: "给家长",
    parentWaiting: "可信赖的大人回应后，这段旅程才会被保存为一次完成的练习。",
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
    progressHome: "出发",
    progressPark: "表达意愿",
    progressPractice: "安全计划",
    progressGarden: "花园成长",
    musicOn: "关闭花园音乐",
    musicOff: "播放花园音乐",
    settings: "设置",
    language: "EN",
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
    activeJourneyBody: "练习表达意愿、后退、清楚说出边界、离开和求助。",
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
  },
} as const;

function actorLabel(node: JourneyNode, language: Language): string {
  const t = copy[language];
  if (node.actor === "dog") return t.actorDog;
  if (node.actor === "trusted-adult") return t.actorAdult;
  return t.actorPlayer;
}

function ActionIcon({ action }: { action?: SemanticAction }) {
  if (action === "accept-contact") return <Heart />;
  if (action === "set-boundary" || action === "repeat-boundary") return <Hand />;
  if (action === "step-back") return <ArrowDownLeft />;
  if (action === "leave") return <DoorOpen />;
  if (action === "seek-help" || action === "trusted-adult-support") return <UserRoundCheck />;
  if (action === "repair") return <Check />;
  return <ArrowRight />;
}

function IllustratedCharacters({ node, reducedMotion }: { node: JourneyNode; reducedMotion: boolean }) {
  const presentation = node.id === "respect-space"
    ? "dog-boundary-step-back"
    : node.action
      ? semanticPresentationMap[node.action]
      : undefined;
  const foxPose = presentation === "fox-happy" ? "fox-happy" : presentation === "fox-step" ? "fox-step" : presentation === "fox-seek-help" ? "fox-happy" : "fox-idle";
  const dogPose = presentation === "dog-listen" ? "dog-listen" : "dog-idle";
  const usesDogActionSheet = presentation === "dog-boundary-step-back" || presentation === "dog-repair";
  const usesBubbleIdle = node.id === "ask-consent";
  const dogActionPose = presentation === "dog-boundary-step-back" ? "dog-action-back" : "dog-repair";
  const foxClass = presentation === "fox-step" ? "is-stepping" : presentation === "fox-leave" || presentation === "fox-seek-help" ? "is-leaving" : "";
  const showTrustedAdult = ["seek-help", "repair", "trusted-adult-response"].includes(node.id);
  const dogClass = [presentation === "dog-approach" ? "is-approaching" : "", showTrustedAdult ? "is-with-adult" : ""].filter(Boolean).join(" ");
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
          <span className="sprite-window dog-bubble-sprite"><img src={reducedMotion ? "/assets/dog-bubble-still.png" : "/assets/dog-bubble.webp"} alt="" /></span>
        ) : (
          <span className={`sprite-window dog-sprite ${dogPose}`}><img src="/assets/dog-2d.png" alt="" /></span>
        )}
      </div>
      {showTrustedAdult && (
        <div className={`storybook-character parent-character ${node.id === "seek-help" ? "is-arriving" : ""}`}>
          <span className="character-shadow" />
          <span className={`sprite-window parent-sprite ${parentPose}`}><img src="/assets/fox-parent.png" alt="" /></span>
        </div>
      )}
    </div>
  );
}

function Speaker({ node, language }: { node: JourneyNode; language: Language }) {
  if (node.actor === "trusted-adult") {
    return <span className="speaker-dot trusted-adult-avatar" aria-hidden="true" />;
  }
  if (node.actor === "player") {
    return <span className="speaker-dot fox-dialogue-avatar" aria-hidden="true" />;
  }
  return <span className="speaker-dot dog-avatar" aria-hidden="true" title={actorLabel(node, language)} />;
}

function JourneyDialogue({
  node,
  language,
  onAdvance,
}: {
  node: JourneyNode;
  language: Language;
  onAdvance: (choiceId?: JourneyChoice["id"]) => void;
}) {
  const isChoice = node.kind === "choice";
  return (
    <div className={`dialogue journey-dialogue kind-${node.kind}`} role={isChoice ? "group" : undefined} aria-label={node.text[language]}>
      <div className={`speech-bubble ${node.actor === "trusted-adult" ? "adult-bubble" : ""}`}>
        <Speaker node={node} language={language} />
        <div className="speech-content">
          <small>{actorLabel(node, language)}</small>
          <span>{node.text[language]}</span>
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
      ) : (
        <button className="primary-button compact journey-continue" type="button" onClick={() => onAdvance()}>
          {node.cta?.[language]}
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
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [completedRecord, setCompletedRecord] = useState<PracticeRecord | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [panelView, setPanelView] = useState<PanelView>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportMode, setSupportMode] = useState<SupportMode>("standard");
  const [hydrated, setHydrated] = useState(false);
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
      setRecords(parsePracticeRecords(window.localStorage.getItem(PRACTICE_STORAGE_KEY)));
      if (savedCalm === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setReducedMotion(true);
        setMusicOn(false);
      }
      if (savedLanguage === "zh" || savedLanguage === "en") setLanguage(savedLanguage);
      if (savedSupportMode === "standard" || savedSupportMode === "picture") setSupportMode(savedSupportMode);
      if (savedCalm !== "true" && (savedMusic === "true" || savedMusic === "false")) setMusicOn(savedMusic === "true");
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
    if (node.kind !== "ending" || recordedJourneyRef.current === journey.journeyId) return;
    const record = createPracticeRecord(journey);
    recordedJourneyRef.current = journey.journeyId;
    setCompletedRecord(record);
    setRecords((current) => {
      const next = savePracticeRecord(current, record);
      window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [journey, node.kind]);

  const coachCard = useMemo(() => {
    const record = completedRecord ?? records[0];
    if (!record) return null;
    const fallback = buildReviewedCoachCard(record, language);
    return applyConstrainedAgentEnhancement(fallback, null);
  }, [completedRecord, records, language]);

  const startJourney = async () => {
    setStarted(true);
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

  const handleAdvance = (choiceId?: JourneyChoice["id"]) => {
    setJourney((current) => advanceJourney(current, choiceId));
  };

  const restart = () => {
    const next = createJourneyState();
    recordedJourneyRef.current = null;
    setCompletedRecord(null);
    setJourney(next);
    setStarted(true);
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
    else setStarted(true);
    setSettingsOpen(false);
    setPanelView("home");
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const formatPracticeDate = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return t.today;
    return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
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

  const progressIndex = !started ? 0 : node.kind === "ending" ? 3 : ["ask-consent", "respect-accept", "respect-space"].includes(node.id) ? 1 : 2;
  const progressItems = [
    { icon: <HomeIcon />, label: t.progressHome },
    { icon: <Trees />, label: t.progressPark },
    { icon: <ShieldCheck />, label: t.progressPractice },
    { icon: <span className="growth-icon stage-sprout" />, label: t.progressGarden },
  ];

  return (
    <main className={`app-shell ${reducedMotion ? "reduced-motion" : ""} ${supportMode === "picture" ? "picture-support" : ""}`}>
      <audio ref={audioRef} src="/assets/garden-music.mp3" loop preload="metadata" />

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
              <button type="button" onClick={() => setLanguage(language === "en" ? "zh" : "en")} aria-label="Change language">
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
              <p className="welcome-copy">{t.welcomeBody}</p>
              <div className="support-settings">
                <label className="setting-row">
                  <span><strong>{t.calmLabel}</strong><small>{t.calmHint}</small></span>
                  <input type="checkbox" checked={reducedMotion} onChange={(event) => setCalmMode(event.target.checked)} />
                  <span className="switch" aria-hidden="true" />
                </label>
                <label className="setting-row">
                  <span><strong>{t.soundLabel}</strong><small>{musicOn ? "On" : "Off"}</small></span>
                  <input type="checkbox" checked={musicOn} disabled={reducedMotion} onChange={(event) => setMusicOn(event.target.checked)} />
                  <span className="switch" aria-hidden="true" />
                </label>
              </div>
              <button className="primary-button" type="button" onClick={startJourney}>{t.start}<ArrowRight aria-hidden="true" /></button>
              <p className="safety-note">{t.safeNote}</p>
            </div>
          </div>
        )}

        {started && node.kind !== "ending" && <JourneyDialogue node={node} language={language} onAdvance={handleAdvance} />}

        {node.kind === "ending" && (
          <div className="completion-overlay" role="dialog" aria-labelledby="garden-title">
            <div className="completion-card">
              <div className="growth-sprite" aria-hidden="true"><img src="/assets/growth.png" alt="" /></div>
              <p className="eyebrow">{t.ourGarden}</p>
              <h2 id="garden-title">{t.gardenTitle}</h2>
              <p>{node.text[language]}</p>
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
          <div><strong>Little Fox</strong><span>{language === "en" ? "Today’s practice" : "今天的练习"}</span></div>
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
                <h3>{t.languageLabel}</h3>
                <div className="segmented-control">
                  <button type="button" className={language === "en" ? "selected" : ""} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>{t.english}</button>
                  <button type="button" className={language === "zh" ? "selected" : ""} aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>{t.chinese}</button>
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
              </div>
              <div className="settings-group setting-toggles">
                <label className="setting-row"><span><strong>{t.calmLabel}</strong><small>{t.calmHint}</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setCalmMode(event.target.checked)} /><span className="switch" aria-hidden="true" /></label>
                <label className="setting-row"><span><strong>{t.soundLabel}</strong><small>{musicOn ? t.on : t.off}</small></span><input type="checkbox" checked={musicOn} disabled={reducedMotion} onChange={() => void toggleMusic()} /><span className="switch" aria-hidden="true" /></label>
              </div>
            </section>
          ) : panelView === "home" ? (
            <>
          <section className="coach-card observation-card">
            <div className="card-title"><span className="title-growth stage-sprout" aria-hidden="true" /><h2>{node.kind === "ending" ? t.observedTitle : t.forParents}</h2></div>
            {node.kind === "ending" && coachCard ? (
              <><strong className="gentle-success">{t.completedLabel}</strong><p>{coachCard.observation}</p></>
            ) : <p>{t.parentWaiting}</p>}
            <div className={`mini-growth ${node.kind === "ending" ? "stage-flower bloomed" : "stage-sprout"}`} aria-hidden="true" />
          </section>

          <section className="coach-card tonight-card">
            <div className="card-title"><Lightbulb aria-hidden="true" /><h2>{t.tonight}</h2></div>
            <p>{t.askAtCalmMoment}</p>
            <blockquote>{coachCard?.tonightPrompt ?? (language === "en" ? "“Who are the adults you can ask for help?”" : "“你可以向哪些大人求助？”")}</blockquote>
            <p className="parent-reply">{coachCard?.parentReply ?? (language === "en" ? "Listen first, then thank the child for telling you." : "先听孩子说完，再谢谢孩子愿意告诉你。")}</p>
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
                  <span className={`garden-plot ${index < Math.min(records.length, 8) ? "completed" : "open"}`} key={index}>
                    <span className={`growth-stage ${index < Math.min(records.length, 8) ? "stage-flower" : "stage-seed"}`} />
                  </span>
                ))}
              </div>
              <div className="garden-summary"><strong>{t.practicesRecorded(records.length)}</strong><span>{t.openPlots}: {Math.max(0, 8 - records.length)}</span></div>
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
                      <div><strong>{t.practiceNumber(records.length - index)}</strong><span className="history-date"><CalendarDays aria-hidden="true" />{formatPracticeDate(record.completedAt)}</span><p>{record.initialConsent === "space" ? t.initialChoiceSpace : t.initialChoiceAccept} {t.safetyActions(safetyActionCount(record))}</p></div>
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
        </nav>
      </aside>
    </main>
  );
}
