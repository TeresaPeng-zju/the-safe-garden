"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  Check,
  DoorOpen,
  Flower2,
  Hand,
  Heart,
  Home as HomeIcon,
  Lightbulb,
  Map,
  Music2,
  NotebookText,
  RotateCcw,
  Settings,
  ShieldCheck,
  Trees,
  UserRoundCheck,
  VolumeX,
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
  const recordedJourneyRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const node = getJourneyNode(journey.nodeId);
  const t = copy[language];

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      const savedCalm = window.localStorage.getItem("safe-garden-calm");
      const savedLanguage = window.localStorage.getItem("safe-garden-language") as Language | null;
      setRecords(parsePracticeRecords(window.localStorage.getItem(PRACTICE_STORAGE_KEY)));
      if (savedCalm === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setReducedMotion(true);
        setMusicOn(false);
      }
      if (savedLanguage === "zh" || savedLanguage === "en") setLanguage(savedLanguage);
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("safe-garden-calm", String(reducedMotion));
    if (reducedMotion) {
      audioRef.current?.pause();
    }
  }, [reducedMotion]);

  useEffect(() => {
    window.localStorage.setItem("safe-garden-language", language);
  }, [language]);

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

  const progressIndex = !started ? 0 : node.kind === "ending" ? 3 : ["ask-consent", "respect-accept", "respect-space"].includes(node.id) ? 1 : 2;
  const progressItems = [
    { icon: <HomeIcon />, label: t.progressHome },
    { icon: <Trees />, label: t.progressPark },
    { icon: <ShieldCheck />, label: t.progressPractice },
    { icon: <span className="growth-icon stage-sprout" />, label: t.progressGarden },
  ];

  return (
    <main className={`app-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <audio ref={audioRef} src="/assets/garden-music.mp3" loop preload="metadata" />

      <section className="story-stage" aria-label={t.todaysWalk}>
        <div className="park-background" />
        <div className="paper-haze" />
        <IllustratedCharacters node={node} reducedMotion={reducedMotion} />

        <header className="stage-header">
          <div className="today-card">
            <span className="flower-mark" aria-hidden="true"><Flower2 /></span>
            <div><strong>{t.todaysWalk}</strong><span>{t.park}</span></div>
          </div>
          <div className="garden-shortcut" aria-label={t.ourGarden}>
            <span className="growth-icon stage-sprout" aria-hidden="true" /><small>{t.ourGarden}</small>
          </div>
        </header>

        <div className="stage-tools">
          <button type="button" onClick={toggleMusic} aria-label={musicOn ? t.musicOn : t.musicOff} title={musicOn ? t.musicOn : t.musicOff}>
            {musicOn ? <Music2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "zh" : "en")} aria-label="Change language">
            {t.language}
          </button>
        </div>

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

      <aside className={`parent-panel ${node.kind === "ending" ? "mobile-visible" : ""}`} aria-label={t.forParents}>
        <header className="profile-header">
          <div className="profile-avatar"><img className="profile-avatar-image" src="/assets/fox-avatar.png" alt="" /></div>
          <div><strong>Little Fox</strong><span>{language === "en" ? "Today’s practice" : "今天的练习"}</span></div>
          <button type="button" aria-label={t.settings} onClick={() => setCalmMode(!reducedMotion)}><Settings aria-hidden="true" /></button>
        </header>

        <div className="panel-scroll">
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
        </div>

        <nav className="panel-nav" aria-label="Parent navigation">
          <button className="active" type="button"><HomeIcon aria-hidden="true" />{t.home}</button>
          <button type="button"><Map aria-hidden="true" />{t.journey}</button>
          <button type="button"><Flower2 aria-hidden="true" />{t.garden}</button>
          <button type="button"><NotebookText aria-hidden="true" />{t.notes}</button>
        </nav>
      </aside>
    </main>
  );
}
