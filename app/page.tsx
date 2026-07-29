"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Language = "en" | "zh";
type JourneyStep = "welcome" | "choice" | "response" | "safety" | "complete";
type BoundaryChoice = "yes" | "space" | null;

const copy = {
  en: {
    brand: "The Safe Garden",
    tagline: "A gentle place to practice brave words.",
    welcomeTitle: "Ready for today’s little walk?",
    welcomeBody: "Little Fox will visit the park and practice telling a friend what feels comfortable.",
    calmLabel: "Calm mode",
    calmHint: "Less movement and no background music",
    soundLabel: "Garden sounds",
    start: "Start today’s walk",
    todaysWalk: "Today’s Walk",
    park: "Let’s go to the park.",
    dogAsk: "Hi, Little Fox! May I give you a hug?",
    yes: "Yes, that’s okay.",
    space: "No, I need some space.",
    yesResponse: "Thank you for telling me. You can always change your mind.",
    noResponse: "Of course. Thank you for telling me — I’ll step back.",
    continue: "Try one more thing",
    safetyAsk: "What can you do if someone does not stop after you say no?",
    stepBack: "Step back and say “Stop.”",
    tellAdult: "Leave and tell a trusted adult.",
    safetyResponse: "That’s a safe plan: move away, use clear words, and tell someone you trust.",
    finish: "Grow our garden",
    gardenTitle: "A new flower grew!",
    gardenBody: "You practiced listening to your feelings and using clear words.",
    replay: "Practice again",
    forParents: "For Parents",
    parentWaiting: "We’ll turn today’s practice into one small idea for home.",
    observedTitle: "What we noticed",
    observedSpace: "Today, Little Fox chose to ask for space. The friend listened and stepped back.",
    observedYes: "Today, Little Fox chose a hug and heard that it is always okay to change their mind.",
    observedNeutral: "Today, Little Fox practiced making a body-boundary choice.",
    tonight: "Try this tonight",
    tonightPrompt: "“What words can you use when you want more space?”",
    parentReply: "You can respond: “Thank you for telling me. I will listen.”",
    ourGarden: "Our Garden",
    keepGrowing: "One gentle practice at a time.",
    home: "Home",
    journey: "Journey",
    garden: "Garden",
    notes: "Notes",
    progressHome: "Home",
    progressPark: "Park",
    progressPractice: "Practice",
    progressGarden: "Garden grows",
    loading: "Little friends are getting ready…",
    musicOn: "Mute garden music",
    musicOff: "Play garden music",
    settings: "Settings",
    language: "中文",
    safeNote: "Practice support, not an assessment.",
  },
  zh: {
    brand: "安全花园",
    tagline: "一个温柔练习勇敢表达的地方。",
    welcomeTitle: "准备好今天的小小散步了吗？",
    welcomeBody: "小狐狸要去公园，练习告诉朋友什么让自己感觉舒服。",
    calmLabel: "安静模式",
    calmHint: "减少动态，并关闭背景音乐",
    soundLabel: "花园音乐",
    start: "开始今天的散步",
    todaysWalk: "今天的散步",
    park: "我们一起去公园。",
    dogAsk: "你好，小狐狸！我可以抱抱你吗？",
    yes: "可以，我愿意。",
    space: "不要，我需要一点空间。",
    yesResponse: "谢谢你告诉我。你随时都可以改变主意。",
    noResponse: "当然可以。谢谢你告诉我——我会后退一步。",
    continue: "再练习一件事",
    safetyAsk: "如果你说了不要，对方还是没有停下来，可以怎么办？",
    stepBack: "后退一步，清楚地说“停”。",
    tellAdult: "离开，并告诉可信赖的大人。",
    safetyResponse: "这是安全的办法：离开、清楚表达，并告诉你信任的人。",
    finish: "让花园成长",
    gardenTitle: "一朵新花长出来了！",
    gardenBody: "你练习了感受自己的想法，也练习了清楚表达。",
    replay: "再练习一次",
    forParents: "给家长",
    parentWaiting: "练习结束后，这里会出现一个今晚就能使用的小建议。",
    observedTitle: "今天发生了什么",
    observedSpace: "今天，小狐狸选择表达需要空间；朋友听见后退了一步。",
    observedYes: "今天，小狐狸选择接受拥抱，也听见自己随时可以改变主意。",
    observedNeutral: "今天，小狐狸练习了为自己的身体边界做选择。",
    tonight: "今晚试一试",
    tonightPrompt: "“当你想要多一点空间时，可以说什么？”",
    parentReply: "家长可以回应：“谢谢你告诉我，我会认真听。”",
    ourGarden: "我们的花园",
    keepGrowing: "每次只做一个温柔的小练习。",
    home: "首页",
    journey: "旅程",
    garden: "花园",
    notes: "记录",
    progressHome: "出发",
    progressPark: "公园",
    progressPractice: "练习",
    progressGarden: "花园成长",
    loading: "小伙伴正在准备……",
    musicOn: "关闭花园音乐",
    musicOff: "播放花园音乐",
    settings: "设置",
    language: "EN",
    safeNote: "这是练习支持，不是能力评估。",
  },
} as const;

function ModelStage({ step, reducedMotion, onReady }: { step: JourneyStep; reducedMotion: boolean; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepRef = useRef(step);
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4.5, 4.5, 2.8, -2.8, 0.1, 100);
    camera.position.set(0, 0.2, 10);

    scene.add(new THREE.HemisphereLight(0xfff5da, 0x66845c, 2.7));
    const sunlight = new THREE.DirectionalLight(0xffefd0, 3.2);
    sunlight.position.set(-3, 7, 8);
    scene.add(sunlight);

    const foxRoot = new THREE.Group();
    const dogRoot = new THREE.Group();
    foxRoot.position.set(-1.65, -2.2, 0.5);
    dogRoot.position.set(0.75, -1.45, 0);
    scene.add(foxRoot, dogRoot);

    const loader = new GLTFLoader();
    let disposed = false;

    const addModel = async (url: string, root: THREE.Group, targetHeight: number, facing: number) => {
      const gltf = await loader.loadAsync(url);
      if (disposed) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = targetHeight / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      model.rotation.y = facing;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = false;
          object.receiveShadow = false;
          const material = object.material as THREE.MeshStandardMaterial;
          if (material) {
            material.roughness = Math.max(material.roughness ?? 0.8, 0.72);
            material.metalness = 0;
          }
        }
      });
      root.add(model);
    };

    Promise.all([
      addModel("/assets/fox.glb", foxRoot, 1.95, -0.22),
      addModel("/assets/dog.glb", dogRoot, 1.55, 0.15),
    ]).then(() => {
      if (!disposed) onReady();
    }).catch(() => {
      if (!disposed) onReady();
    });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      renderer.setSize(width, height, false);
      const aspect = width / Math.max(height, 1);
      const viewHeight = 5.6;
      camera.left = -(viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    resize();

    const clock = new THREE.Clock();
    let animationId = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const calm = reducedRef.current;
      const currentStep = stepRef.current;
      const foxTargetX = currentStep === "safety" ? -1.95 : -1.65;
      const dogTargetX = currentStep === "response" ? 1.15 : 0.75;
      foxRoot.position.x += (foxTargetX - foxRoot.position.x) * 0.055;
      dogRoot.position.x += (dogTargetX - dogRoot.position.x) * 0.055;
      if (!calm) {
        foxRoot.position.y = -2.2 + Math.sin(elapsed * 2.1) * 0.035;
        dogRoot.position.y = -1.45 + Math.sin(elapsed * 1.8 + 1.2) * 0.028;
      }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material as THREE.Material;
          material?.dispose();
        }
      });
    };
  }, [onReady]);

  return <canvas ref={canvasRef} className="model-canvas" aria-hidden="true" />;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [step, setStep] = useState<JourneyStep>("welcome");
  const [choice, setChoice] = useState<BoundaryChoice>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [modelsReady, setModelsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = copy[language];

  useEffect(() => {
    const savedCalm = window.localStorage.getItem("safe-garden-calm");
    const savedLanguage = window.localStorage.getItem("safe-garden-language") as Language | null;
    if (savedCalm === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
      setMusicOn(false);
    }
    if (savedLanguage === "zh" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("safe-garden-calm", String(reducedMotion));
    if (reducedMotion) {
      setMusicOn(false);
      audioRef.current?.pause();
    }
  }, [reducedMotion]);

  useEffect(() => {
    window.localStorage.setItem("safe-garden-language", language);
  }, [language]);

  const handleReady = useCallback(() => setModelsReady(true), []);

  const startJourney = async () => {
    setStep("choice");
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

  const chooseBoundary = (nextChoice: Exclude<BoundaryChoice, null>) => {
    setChoice(nextChoice);
    setStep("response");
  };

  const restart = () => {
    setChoice(null);
    setStep("choice");
  };

  const progressIndex = step === "welcome" ? 0 : step === "choice" ? 1 : step === "response" || step === "safety" ? 2 : 3;

  return (
    <main className={`app-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <audio ref={audioRef} src="/assets/garden-music.mp3" loop preload="metadata" />

      <section className="story-stage" aria-label={t.todaysWalk}>
        <div className="park-background" />
        <div className="paper-haze" />
        <ModelStage step={step} reducedMotion={reducedMotion} onReady={handleReady} />
        <div className="fox-shadow" aria-hidden="true" />
        <div className="dog-shadow" aria-hidden="true" />

        {!modelsReady && <div className="loading-pill"><span className="loading-seed">●</span>{t.loading}</div>}

        <header className="stage-header">
          <div className="today-card">
            <span className="flower-mark" aria-hidden="true">✿</span>
            <div><strong>{t.todaysWalk}</strong><span>{t.park}</span></div>
          </div>
          <button className="garden-shortcut" type="button" onClick={() => setStep("complete")} aria-label={t.ourGarden}>
            <span aria-hidden="true">🌱</span><small>{t.ourGarden}</small>
          </button>
        </header>

        <div className="stage-tools">
          <button type="button" onClick={toggleMusic} aria-label={musicOn ? t.musicOn : t.musicOff} title={musicOn ? t.musicOn : t.musicOff}>
            {musicOn ? "♫" : "♩̸"}
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "zh" : "en")} aria-label="Change language">
            {t.language}
          </button>
        </div>

        {step === "welcome" && (
          <div className="welcome-overlay" role="dialog" aria-labelledby="welcome-title">
            <div className="welcome-card">
              <span className="welcome-sprout" aria-hidden="true">🌱</span>
              <p className="eyebrow">{t.brand}</p>
              <h1 id="welcome-title">{t.welcomeTitle}</h1>
              <p className="welcome-copy">{t.welcomeBody}</p>
              <div className="support-settings">
                <label className="setting-row">
                  <span><strong>{t.calmLabel}</strong><small>{t.calmHint}</small></span>
                  <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />
                  <span className="switch" aria-hidden="true" />
                </label>
                <label className="setting-row">
                  <span><strong>{t.soundLabel}</strong><small>{musicOn ? "On" : "Off"}</small></span>
                  <input type="checkbox" checked={musicOn} disabled={reducedMotion} onChange={(event) => setMusicOn(event.target.checked)} />
                  <span className="switch" aria-hidden="true" />
                </label>
              </div>
              <button className="primary-button" type="button" onClick={startJourney}>{t.start}<span aria-hidden="true">→</span></button>
              <p className="safety-note">{t.safeNote}</p>
            </div>
          </div>
        )}

        {step === "choice" && (
          <div className="dialogue dialogue-choice" role="group" aria-label={t.dogAsk}>
            <div className="speech-bubble dog-bubble"><span className="speaker-dot dog-avatar" aria-hidden="true" />{t.dogAsk}</div>
            <div className="choice-stack">
              <button type="button" onClick={() => chooseBoundary("yes")}><span className="choice-icon heart" aria-hidden="true">♥</span>{t.yes}</button>
              <button type="button" onClick={() => chooseBoundary("space")}><span className="choice-icon hand" aria-hidden="true">✋</span>{t.space}</button>
            </div>
          </div>
        )}

        {step === "response" && (
          <div className="dialogue response-dialogue" aria-live="polite">
            <div className="speech-bubble dog-bubble positive"><span aria-hidden="true">✓</span>{choice === "space" ? t.noResponse : t.yesResponse}</div>
            <button className="primary-button compact" type="button" onClick={() => setStep("safety")}>{t.continue}<span aria-hidden="true">→</span></button>
          </div>
        )}

        {step === "safety" && (
          <div className="dialogue safety-dialogue" role="group" aria-label={t.safetyAsk}>
            <div className="speech-bubble coach-bubble"><span aria-hidden="true">💡</span>{t.safetyAsk}</div>
            <div className="choice-stack safety-choices">
              <button type="button" onClick={() => setStep("complete")}><span className="choice-icon" aria-hidden="true">↙</span>{t.stepBack}</button>
              <button type="button" onClick={() => setStep("complete")}><span className="choice-icon" aria-hidden="true">⌂</span>{t.tellAdult}</button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="completion-overlay" role="dialog" aria-labelledby="garden-title">
            <div className="completion-card">
              <div className="growth-sprite" aria-hidden="true"><img src="/assets/growth.png" alt="" /></div>
              <p className="eyebrow">{t.ourGarden}</p>
              <h2 id="garden-title">{t.gardenTitle}</h2>
              <p>{t.gardenBody}</p>
              <div className="completion-actions">
                <button className="primary-button" type="button" onClick={restart}>{t.replay}<span aria-hidden="true">↻</span></button>
              </div>
            </div>
          </div>
        )}

        <nav className="journey-progress" aria-label="Journey progress">
          <div className="progress-intro"><span>{language === "en" ? "Today’s" : "今天的"}</span><strong>{t.journey}</strong></div>
          {[{ icon: "⌂", label: t.progressHome }, { icon: "♣", label: t.progressPark }, { icon: "●", label: t.progressPractice }, { icon: "🌱", label: t.progressGarden }].map((item, index) => (
            <div className={`progress-step ${index <= progressIndex ? "active" : ""}`} key={item.label}>
              <span className="progress-icon" aria-hidden="true">{item.icon}</span>
              <small>{item.label}</small>
            </div>
          ))}
        </nav>
      </section>

      <aside className={`parent-panel ${step === "complete" ? "mobile-visible" : ""}`} aria-label={t.forParents}>
        <header className="profile-header">
          <div className="profile-avatar"><div className="fox-avatar-crop"><img src="/assets/fox-2d.png" alt="" /></div></div>
          <div><strong>Little Fox</strong><span>{language === "en" ? "Today’s practice" : "今天的练习"}</span></div>
          <button type="button" aria-label={t.settings} onClick={() => setReducedMotion(!reducedMotion)}>⚙</button>
        </header>

        <div className="panel-scroll">
          <section className="coach-card observation-card">
            <div className="card-title"><span aria-hidden="true">🌱</span><h2>{step === "complete" ? t.observedTitle : t.forParents}</h2></div>
            {step === "complete" ? (
              <><strong className="gentle-success">{language === "en" ? "A gentle practice completed" : "完成了一次温柔的练习"}</strong><p>{choice === "space" ? t.observedSpace : choice === "yes" ? t.observedYes : t.observedNeutral}</p></>
            ) : <p>{t.parentWaiting}</p>}
            <div className={`mini-flower ${step === "complete" ? "bloomed" : ""}`} aria-hidden="true">{step === "complete" ? "🌸" : "🌱"}</div>
          </section>

          <section className="coach-card tonight-card">
            <div className="card-title"><span aria-hidden="true">💡</span><h2>{t.tonight}</h2></div>
            <p>{language === "en" ? "At a calm moment, you can ask:" : "在轻松的时候，可以问："}</p>
            <blockquote>{t.tonightPrompt}</blockquote>
            <p className="parent-reply">{t.parentReply}</p>
          </section>

          <section className="coach-card garden-card">
            <div className="card-title"><span aria-hidden="true">🌳</span><h2>{t.ourGarden}</h2></div>
            <p>{t.keepGrowing}</p>
            <div className="garden-bed" aria-label="Garden growth progress">
              {[0, 1, 2, 3].map((index) => <span key={index} className={step === "complete" && index === 3 ? "flower-grown" : ""}>{index === 3 && step === "complete" ? "🌸" : index < 2 ? "🌱" : "🌿"}</span>)}
            </div>
          </section>

          <p className="panel-disclaimer">{t.safeNote}</p>
        </div>

        <nav className="panel-nav" aria-label="Parent navigation">
          <button className="active" type="button"><span aria-hidden="true">⌂</span>{t.home}</button>
          <button type="button"><span aria-hidden="true">☘</span>{t.journey}</button>
          <button type="button"><span aria-hidden="true">✿</span>{t.garden}</button>
          <button type="button"><span aria-hidden="true">▤</span>{t.notes}</button>
        </nav>
      </aside>
    </main>
  );
}
