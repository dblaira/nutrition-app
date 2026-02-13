"use client";

import { useState, useEffect, useCallback } from "react";

/* ───────────────────────── PALETTE ───────────────────────── */
const C = {
  blue: "#0047AB",
  yellow: "#F5C518",
  red: "#CC2936",
  white: "#FFFFFF",
  black: "#1A1A1A",
  orange: "#E8751A",
  green: "#1B8C4E",
  teal: "#008080",
} as const;

/* ───────────────────────── FONTS ───────────────────────── */
const fontFamily = `var(--font-outfit), 'Avenir Next', 'Helvetica Neue', sans-serif`;

/* ───────────────────────── HEIGHTS ───────────────────────── */
const HEIGHTS = [220,270,200,250,230,280,210,260,240,290,195,310,225,245,205,265,235];

/* ───────────────────────── STORAGE ───────────────────────── */
const STORAGE_KEY = "optimism-pop-v1";

type CheckState = Record<string, boolean[]>;

function loadChecks(): CheckState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveChecks(c: CheckState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {}
}

/* ───────────────────────── EXERCISE DATA ───────────────────────── */
interface Exercise {
  id: string;
  name: string;
  section: string;
  sectionLabel: string;
  sets: number;
  detail: string;
  tip?: string;
}

const EXERCISES: Exercise[] = [
  { id: "wall-dorsiflexion", name: "Wall Dorsiflexion", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "10 per side", tip: "Drive knee over toes toward wall, heel stays down" },
  { id: "ankle-circles", name: "Ankle Circles", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "10 each direction" },
  { id: "eversion-hold", name: "Eversion Hold", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "15 sec hold", tip: "Press outside of foot against wall \u2014 targets peroneals" },
  { id: "short-foot", name: "Short Foot", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "10 sec each side", tip: "Big toe, little toe, heel down. Lift arch WITHOUT curling toes" },
  { id: "hip-flexor-march", name: "Hip Flexor March", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "10 sec hold", tip: "Knee to hip height, pelvis level" },
  { id: "adduction-raises", name: "Adduction Raises", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "8 each side", tip: "Top leg crossed over, lift bottom leg" },
  { id: "sl-balance", name: "SL Balance", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "20 sec each" },
  { id: "sl-rdl-reach", name: "SL RDL Reach", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "5 each, slow" },
  { id: "a-skip", name: "A Skip", section: "drills", sectionLabel: "Drills", sets: 2, detail: "2 \u00d7 20m", tip: "Easy rhythm. Knee up, quick hop. Relaxed" },
  { id: "b-skip", name: "B Skip", section: "drills", sectionLabel: "Drills", sets: 2, detail: "2 \u00d7 20m", tip: "Smooth knee drive. DON\u2019T reach. Pulls back under" },
  { id: "high-knees", name: "High Knees", section: "drills", sectionLabel: "Drills", sets: 2, detail: "2 \u00d7 10 sec", tip: 'Quick contacts, NOT max height. "Hot coals"' },
  { id: "easy-run", name: "Easy Run", section: "run", sectionLabel: "Run", sets: 1, detail: "Zone 2 \u00b7 30\u201340 min", tip: "Conversation pace. If you can\u2019t talk, slow down" },
  { id: "cooldown-walk", name: "Cooldown Walk", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "3\u20135 min" },
  { id: "foam-roll-quads", name: "Foam Roll Quads", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "45s each" },
  { id: "foam-roll-calves", name: "Foam Roll Calves", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "45s each" },
  { id: "hip-flexor-stretch", name: "Hip Flexor Stretch", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "30\u201345s hold" },
  { id: "calf-stretch", name: "Calf Stretch", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "30\u201345s hold" },
];

const SECTIONS = ["pre-run", "drills", "run", "recovery"];
const SECTION_NAMES: Record<string, string> = { "pre-run": "Activation", drills: "Drills", run: "Run", recovery: "Recovery" };

/* ───────────────────────── SVG ART ───────────────────────── */
function ExerciseSVG({ id }: { id: string }) {
  const s = `0 0 200 200`;
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: s, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" as const };

  switch (id) {
    case "wall-dorsiflexion":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.yellow} />
          <rect x="100" y="0" width="100" height="200" fill={C.black} />
          <rect x="100" y="150" width="100" height="50" fill={C.white} />
          <polygon points="60,180 90,140 110,160 80,200" fill={C.red} stroke={C.black} strokeWidth="3" />
          <path d="M 70 160 Q 50 130 80 120" fill="none" stroke={C.yellow} strokeWidth="5" />
          <line x1="100" y1="0" x2="100" y2="200" stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "ankle-circles":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <circle cx="100" cy="100" r="80" fill="none" stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="80" fill={C.yellow} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="58" fill={C.blue} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="36" fill={C.red} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="16" fill={C.white} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "eversion-hold":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.orange} />
          <rect x="160" y="0" width="40" height="200" fill={C.black} />
          <circle cx="100" cy="100" r="55" fill={C.white} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="35" fill={C.red} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="16" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <line x1="10" y1="80" x2="45" y2="80" stroke={C.black} strokeWidth="4" />
          <line x1="10" y1="100" x2="50" y2="100" stroke={C.black} strokeWidth="4" />
          <line x1="10" y1="120" x2="45" y2="120" stroke={C.black} strokeWidth="4" />
        </svg>
      );
    case "short-foot":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.yellow} />
          <rect x="0" y="160" width="200" height="40" fill={C.white} />
          <line x1="0" y1="160" x2="200" y2="160" stroke={C.black} strokeWidth="3" />
          <ellipse cx="100" cy="140" rx="60" ry="20" fill={C.red} stroke={C.black} strokeWidth="3" />
          <circle cx="70" cy="160" r="5" fill={C.black} />
          <circle cx="100" cy="160" r="5" fill={C.black} />
          <circle cx="130" cy="160" r="5" fill={C.black} />
          <line x1="100" y1="130" x2="100" y2="90" stroke={C.black} strokeWidth="4" />
          <polygon points="92,98 100,80 108,98" fill={C.black} />
        </svg>
      );
    case "hip-flexor-march":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <rect x="20" y="120" width="24" height="70" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <rect x="55" y="100" width="24" height="90" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <rect x="90" y="80" width="24" height="110" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <rect x="125" y="60" width="24" height="130" fill={C.red} stroke={C.black} strokeWidth="2" />
          <rect x="160" y="40" width="24" height="150" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <ellipse cx="32" cy="115" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="67" cy="95" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="102" cy="75" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="137" cy="55" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="172" cy="35" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "adduction-raises":
      return (
        <svg {...common}>
          <rect width="200" height="80" fill={C.white} />
          <rect x="0" y="80" width="200" height="120" fill={C.blue} />
          <line x1="0" y1="80" x2="200" y2="80" stroke={C.black} strokeWidth="3" />
          <polygon points="10,120 50,80 90,120 70,160 30,160" fill={C.teal} stroke={C.black} strokeWidth="3" />
          <circle cx="160" cy="50" r="28" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "sl-balance":
      return (
        <svg {...common}>
          <rect width="200" height="100" fill={C.white} />
          <rect x="0" y="100" width="200" height="100" fill={C.yellow} />
          <line x1="0" y1="100" x2="200" y2="100" stroke={C.black} strokeWidth="5" />
          <circle cx="100" cy="55" r="16" fill={C.red} stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="71" x2="100" y2="130" stroke={C.black} strokeWidth="4" />
          <line x1="100" y1="90" x2="65" y2="75" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="90" x2="135" y2="75" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="130" x2="100" y2="170" stroke={C.black} strokeWidth="3" />
          <circle cx="65" cy="75" r="5" fill={C.red} stroke={C.black} strokeWidth="2" />
          <circle cx="135" cy="75" r="5" fill={C.red} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "sl-rdl-reach":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.yellow} />
          <path d="M 30 180 Q 60 140 80 160 Q 100 180 120 120 Q 140 60 170 30" fill="none" stroke={C.white} strokeWidth="18" />
          <path d="M 30 180 Q 60 140 80 160 Q 100 180 120 120 Q 140 60 170 30" fill="none" stroke={C.black} strokeWidth="4" />
          <circle cx="120" cy="105" r="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <line x1="120" y1="113" x2="120" y2="140" stroke={C.black} strokeWidth="3" />
          <line x1="120" y1="125" x2="105" y2="115" stroke={C.black} strokeWidth="2" />
          <line x1="120" y1="125" x2="135" y2="115" stroke={C.black} strokeWidth="2" />
          <line x1="120" y1="140" x2="110" y2="160" stroke={C.black} strokeWidth="2" />
          <line x1="120" y1="140" x2="130" y2="155" stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "a-skip":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.red} />
          <rect x="0" y="175" width="200" height="25" fill={C.black} />
          <path d="M 10 170 Q 30 130 50 170" fill="none" stroke={C.yellow} strokeWidth="5" />
          <path d="M 50 170 Q 70 120 90 170" fill="none" stroke={C.yellow} strokeWidth="5" />
          <path d="M 90 170 Q 110 110 130 170" fill="none" stroke={C.yellow} strokeWidth="5" />
          <path d="M 130 170 Q 150 120 170 170" fill="none" stroke={C.yellow} strokeWidth="5" />
          <path d="M 170 170 Q 190 130 200 170" fill="none" stroke={C.yellow} strokeWidth="5" />
          <circle cx="160" cy="35" r="25" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "b-skip":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.teal} />
          <rect x="0" y="0" width="200" height="20" fill={C.black} />
          <rect x="0" y="180" width="200" height="20" fill={C.black} />
          <path d="M 0 100 Q 25 50 50 100 Q 75 150 100 100 Q 125 50 150 100 Q 175 150 200 100" fill="none" stroke={C.yellow} strokeWidth="7" />
          <path d="M 0 110 Q 25 150 50 110 Q 75 70 100 110 Q 125 150 150 110 Q 175 70 200 110" fill="none" stroke={C.white} strokeWidth="4" />
        </svg>
      );
    case "high-knees":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.orange} />
          <rect x="0" y="170" width="200" height="30" fill={C.black} />
          <line x1="0" y1="170" x2="200" y2="170" stroke={C.black} strokeWidth="3" />
          <ellipse cx="30" cy="110" rx="14" ry="30" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <ellipse cx="70" cy="90" rx="14" ry="35" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="110" cy="100" rx="14" ry="32" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <ellipse cx="150" cy="85" rx="14" ry="38" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="185" cy="105" rx="14" ry="30" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <circle cx="30" cy="165" r="7" fill={C.red} stroke={C.black} strokeWidth="2" />
          <circle cx="70" cy="165" r="7" fill={C.red} stroke={C.black} strokeWidth="2" />
          <circle cx="110" cy="165" r="7" fill={C.red} stroke={C.black} strokeWidth="2" />
          <circle cx="150" cy="165" r="7" fill={C.red} stroke={C.black} strokeWidth="2" />
          <circle cx="185" cy="165" r="7" fill={C.red} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "easy-run":
      return (
        <svg {...common}>
          <rect width="200" height="100" fill={C.white} />
          <rect x="0" y="100" width="200" height="100" fill={C.blue} />
          <line x1="0" y1="100" x2="200" y2="100" stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="60" fill={C.orange} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="40" fill={C.red} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="20" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "cooldown-walk":
      return (
        <svg {...common}>
          <rect width="200" height="120" fill={C.blue} />
          <rect x="0" y="120" width="200" height="80" fill={C.yellow} />
          <line x1="0" y1="120" x2="200" y2="120" stroke={C.black} strokeWidth="3" />
          <line x1="80" y1="50" x2="80" y2="120" stroke={C.black} strokeWidth="4" />
          <path d="M 40 50 Q 80 10 120 50" fill={C.red} stroke={C.black} strokeWidth="3" />
          <path d="M 40 50 Q 80 20 120 50" fill={C.white} stroke={C.black} strokeWidth="2" />
          <circle cx="155" cy="40" r="22" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "foam-roll-quads":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.green} />
          <rect x="25" y="50" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3" />
          <rect x="25" y="90" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3" />
          <rect x="25" y="130" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3" />
          <line x1="80" y1="170" x2="120" y2="170" stroke={C.black} strokeWidth="5" />
          <polygon points="92,178 100,195 108,178" fill={C.black} />
        </svg>
      );
    case "foam-roll-calves":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <rect x="55" y="20" width="28" height="160" rx="14" fill={C.white} stroke={C.black} strokeWidth="3" />
          <rect x="117" y="20" width="28" height="160" rx="14" fill={C.white} stroke={C.black} strokeWidth="3" />
          <line x1="45" y1="60" x2="155" y2="60" stroke={C.yellow} strokeWidth="4" />
          <line x1="45" y1="95" x2="155" y2="95" stroke={C.yellow} strokeWidth="4" />
          <line x1="45" y1="130" x2="155" y2="130" stroke={C.yellow} strokeWidth="4" />
          <line x1="45" y1="160" x2="155" y2="160" stroke={C.yellow} strokeWidth="4" />
        </svg>
      );
    case "hip-flexor-stretch":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.yellow} />
          <polygon points="100,20 30,170 170,170" fill={C.white} stroke={C.black} strokeWidth="3" />
          <polygon points="100,55 55,150 145,150" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <circle cx="100" cy="40" r="14" fill={C.red} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "calf-stretch":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <rect x="20" y="150" width="32" height="30" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="52" y="130" width="32" height="50" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="84" y="110" width="32" height="70" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="116" y="90" width="32" height="90" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="148" y="70" width="32" height="110" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <circle cx="165" cy="35" r="20" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <circle cx="100" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
  }
}

/* ───────────────────────── RACE COUNTDOWN ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function WorkoutsPage() {
  const [checks, setChecks] = useState<CheckState>({});
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChecks(loadChecks());
    setMounted(true);
  }, []);

  const toggle = useCallback((id: string, setIdx: number) => {
    setChecks((prev) => {
      const arr = [...(prev[id] || [])];
      arr[setIdx] = !arr[setIdx];
      const next = { ...prev, [id]: arr };
      saveChecks(next);
      return next;
    });
  }, []);

  const isSetDone = (id: string, setIdx: number) => !!(checks[id] && checks[id][setIdx]);
  const isExDone = (ex: Exercise) => {
    const arr = checks[ex.id];
    if (!arr) return false;
    for (let i = 0; i < ex.sets; i++) if (!arr[i]) return false;
    return true;
  };
  const isSectionDone = (section: string) => EXERCISES.filter((e) => e.section === section).every(isExDone);

  const totalSets = EXERCISES.reduce((s, e) => s + e.sets, 0);
  const doneSets = EXERCISES.reduce((s, e) => {
    let c = 0;
    for (let i = 0; i < e.sets; i++) if (isSetDone(e.id, i)) c++;
    return s + c;
  }, 0);
  const progress = totalSets > 0 ? doneSets / totalSets : 0;
  const allDone = progress >= 1;

  /* ── Masonry layout ── */
  const col1: number[] = [];
  const col2: number[] = [];
  let h1 = 0;
  let h2 = 0;
  EXERCISES.forEach((_, i) => {
    if (h1 <= h2) {
      col1.push(i);
      h1 += HEIGHTS[i % HEIGHTS.length] + 12;
    } else {
      col2.push(i);
      h2 += HEIGHTS[i % HEIGHTS.length] + 12;
    }
  });

  if (!mounted) {
    return <div style={{ background: C.yellow, minHeight: "100vh" }} />;
  }

  /* ───── FOCUS MODE ───── */
  if (focusIdx !== null) {
    const ex = EXERCISES[focusIdx];
    return (
      <div style={{ position: "fixed", inset: 0, background: C.white, zIndex: 100, fontFamily, overflow: "auto" }}>
        {/* Art area */}
        <div style={{ position: "relative", height: "42vh", borderBottom: `4px solid ${C.black}`, overflow: "hidden" }}>
          <ExerciseSVG id={ex.id} />
          {/* Back button */}
          <button
            onClick={() => { setFocusIdx(null); setShowTip(false); }}
            style={{
              position: "absolute", top: 16, left: 16, width: 48, height: 48,
              borderRadius: "50%", background: C.white, border: `3px solid ${C.black}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 22, fontWeight: 800, color: C.black,
            }}
            aria-label="Back"
          >
            &#8592;
          </button>
          {/* Section pill */}
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: C.black, color: C.yellow,
            padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1, fontFamily,
          }}>
            {ex.sectionLabel}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 20px 120px" }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>{ex.name}</h2>
          <p style={{ fontSize: 20, fontWeight: 600, color: C.black, margin: "6px 0 24px", fontFamily }}>{ex.detail}</p>

          {/* Set buttons */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            {Array.from({ length: ex.sets }).map((_, si) => {
              const done = isSetDone(ex.id, si);
              return (
                <button
                  key={si}
                  onClick={() => toggle(ex.id, si)}
                  style={{
                    width: 72, height: 72, borderRadius: 14,
                    border: `3px solid ${C.black}`,
                    background: done ? C.red : C.yellow,
                    color: done ? C.white : C.black,
                    fontSize: done ? 28 : 18, fontWeight: 800,
                    cursor: "pointer", fontFamily,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {done ? "\u2713" : `Set ${si + 1}`}
                </button>
              );
            })}
          </div>

          {/* Coaching cue */}
          {ex.tip && (
            <button
              onClick={() => setShowTip((p) => !p)}
              style={{
                background: C.blue, color: C.white, border: `3px solid ${C.black}`,
                borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily, marginBottom: 10, width: "100%", textAlign: "left",
              }}
            >
              {showTip ? "\u25B2 Hide Cue" : "\u25BC Coaching Cue"}
            </button>
          )}
          {showTip && ex.tip && (
            <div style={{
              background: C.white, border: `3px solid ${C.blue}`, borderRadius: 10,
              padding: "12px 16px", fontSize: 15, color: C.black, fontFamily, marginBottom: 16,
            }}>
              {ex.tip}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {focusIdx > 0 && (
              <button
                onClick={() => { setFocusIdx(focusIdx - 1); setShowTip(false); }}
                style={{
                  flex: 1, padding: "14px 0", borderRadius: 12,
                  border: `3px solid ${C.black}`, background: C.white,
                  fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, color: C.black,
                }}
              >
                \u2190 Previous
              </button>
            )}
            {focusIdx < EXERCISES.length - 1 ? (
              <button
                onClick={() => { setFocusIdx(focusIdx + 1); setShowTip(false); }}
                style={{
                  flex: 1, padding: "14px 0", borderRadius: 12,
                  border: `3px solid ${C.black}`, background: C.white,
                  fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, color: C.black,
                }}
              >
                Next \u2192
              </button>
            ) : (
              <button
                onClick={() => { setFocusIdx(null); setShowTip(false); }}
                style={{
                  flex: 1, padding: "14px 0", borderRadius: 12,
                  border: `3px solid ${C.black}`, background: C.green,
                  fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, color: C.white,
                }}
              >
                Done \u2192
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ───── BROWSE MODE ───── */
  return (
    <div style={{ background: C.yellow, minHeight: "100vh", fontFamily, paddingBottom: allDone ? 80 : 20 }}>
      {/* HEADER */}
      <header style={{ background: C.yellow, borderBottom: `4px solid ${C.black}`, padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>Thursday</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: "2px 0 0", fontFamily }}>Run Skill Day</p>
          </div>
          {/* Race countdown pill */}
          <div style={{
            background: C.black, borderRadius: 999, padding: "6px 14px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.yellow, fontFamily, lineHeight: 1 }}>{daysToRace()}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: C.white, fontFamily, letterSpacing: 1, textTransform: "uppercase" }}>DAYS TO RACE</span>
          </div>
        </div>

        {/* Section pills */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {SECTIONS.map((s) => {
            const done = isSectionDone(s);
            return (
              <div
                key={s}
                style={{
                  padding: "5px 12px", borderRadius: 999,
                  border: `3px solid ${C.black}`,
                  background: done ? C.green : C.white,
                  color: done ? C.white : C.black,
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: 0.5, fontFamily,
                }}
              >
                {SECTION_NAMES[s]}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 10, height: 8, borderRadius: 4,
          border: `3px solid ${C.black}`, background: C.white, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: allDone ? C.green : C.red,
            transition: "width 0.3s ease",
          }} />
        </div>
      </header>

      {/* MASONRY GRID */}
      <div style={{ display: "flex", gap: 12, padding: "12px 12px 0" }}>
        {[col1, col2].map((col, ci) => (
          <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {col.map((idx) => {
              const ex = EXERCISES[idx];
              const h = HEIGHTS[idx % HEIGHTS.length];
              const done = isExDone(ex);
              return (
                <button
                  key={ex.id}
                  onClick={() => setFocusIdx(idx)}
                  style={{
                    position: "relative", height: h,
                    border: `3px solid ${C.black}`, borderRadius: 14,
                    overflow: "hidden", cursor: "pointer",
                    filter: done ? "saturate(0.3)" : "none",
                    display: "block", width: "100%", padding: 0,
                    background: C.black,
                    textAlign: "left",
                  }}
                >
                  {/* SVG art */}
                  <div style={{ position: "absolute", inset: 0 }}>
                    <ExerciseSVG id={ex.id} />
                  </div>
                  {/* Bottom bar */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: C.black, padding: "8px 10px 10px",
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.yellow, textTransform: "uppercase", letterSpacing: 1, fontFamily }}>
                      {ex.sectionLabel}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily, lineHeight: 1.15, margin: "2px 0 4px" }}>
                      {ex.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: C.white, fontFamily, fontWeight: 600 }}>{ex.detail}</span>
                      <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                        {Array.from({ length: ex.sets }).map((_, si) => (
                          <div
                            key={si}
                            style={{
                              width: 10, height: 10,
                              border: `2px solid ${C.black}`,
                              background: isSetDone(ex.id, si) ? C.yellow : C.white,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* COMPLETION BANNER */}
      {allDone && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: C.green, borderTop: `4px solid ${C.black}`,
          padding: "14px 20px", textAlign: "center",
          fontSize: 18, fontWeight: 800, color: C.white, fontFamily, zIndex: 50,
        }}>
          WORKOUT COMPLETE \u2014 YOU CRUSHED IT
        </div>
      )}
    </div>
  );
}
