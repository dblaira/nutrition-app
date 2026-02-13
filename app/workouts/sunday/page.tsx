"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

const fontFamily = `var(--font-outfit), 'Avenir Next', 'Helvetica Neue', sans-serif`;
const HEIGHTS = [220,270,200,250,230,280,210,260,240,290,195,310];
const STORAGE_KEY = "optimism-pop-sunday-v1";

type CheckState = Record<string, boolean[]>;
function loadChecks(): CheckState {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function saveChecks(c: CheckState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {} }

/* ───────────────────────── EXERCISE DATA ───────────────────────── */
interface Exercise { id: string; name: string; section: string; sectionLabel: string; sets: number; detail: string; tip?: string; }

const EXERCISES: Exercise[] = [
  /* ── Pre-Run Activation ── */
  { id: "sun-dorsiflexion", name: "Dorsiflexion Rocks", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "10 per side", tip: "Knee to wall — drive knee over toes, heel stays down" },
  { id: "sun-ankle-circles", name: "Ankle Circles", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "10 each direction per side" },
  { id: "sun-eversion-hold", name: "Eversion Isometric", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "15 sec hold", tip: "Press outside of foot against wall — targets peroneals" },
  { id: "sun-short-foot", name: "Short Foot Holds", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "10 sec each side", tip: "Press big toe, little toe, and heel into the ground, then lightly lift your arch by pulling the ball of your foot toward your heel WITHOUT curling your toes." },
  { id: "sun-hip-flexor-march", name: "Hip Flexor March Hold", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "10 sec each side", tip: "Knee to hip height, pelvis stays level" },
  { id: "sun-adduction-raises", name: "Side Lying Adduction", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "8 each side", tip: "Top leg crossed over, lift bottom leg with control" },
  { id: "sun-sl-balance", name: "Single Leg Balance", section: "pre-run", sectionLabel: "Activation", sets: 2, detail: "20 sec each side" },
  { id: "sun-sl-rdl-reach", name: "SL RDL Reach", section: "pre-run", sectionLabel: "Activation", sets: 1, detail: "5 each side, slow", tip: "Bodyweight only — hinge at hips, reach forward" },
  /* ── Run ── */
  { id: "sun-10mi-run", name: "10 Mile Run", section: "run", sectionLabel: "Run", sets: 1, detail: "Zone 2 · Start mile 1 at Zone 1", tip: "First mile Zone 1 easy. Then diligently stay in Zone 2 for the remaining 9 miles. Conversation pace." },
  /* ── Recovery ── */
  { id: "sun-walk", name: "Cooldown Walk", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "3–5 min" },
  { id: "sun-foam-roll", name: "Foam Roll", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "Quads · Calves · Glutes · IT Band", tip: "Spend 45–60 seconds per area. Roll slowly, pause on tender spots." },
  { id: "sun-static-stretch", name: "Static Stretch", section: "recovery", sectionLabel: "Recovery", sets: 1, detail: "Hip Flexor · Calf · Adductor", tip: "Hold each stretch 30–45 seconds. Breathe and relax into it." },
];

const SECTIONS = ["pre-run", "run", "recovery"];
const SECTION_NAMES: Record<string, string> = { "pre-run": "Activation", run: "Run", recovery: "Recovery" };

/* ───────────────────────── SVG ART ───────────────────────── */
function ExerciseSVG({ id }: { id: string }) {
  const s = `0 0 200 200`;
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: s, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" as const };

  switch (id) {
    case "sun-dorsiflexion":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/><rect x="100" y="0" width="100" height="200" fill={C.black}/><rect x="100" y="150" width="100" height="50" fill={C.white}/><polygon points="60,180 90,140 110,160 80,200" fill={C.yellow} stroke={C.black} strokeWidth="3"/><path d="M 70 160 Q 50 130 80 120" fill="none" stroke={C.white} strokeWidth="5"/><line x1="100" y1="0" x2="100" y2="200" stroke={C.black} strokeWidth="3"/></svg>);
    case "sun-ankle-circles":
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/><circle cx="100" cy="100" r="80" fill={C.yellow} stroke={C.black} strokeWidth="3"/><circle cx="100" cy="100" r="58" fill={C.teal} stroke={C.black} strokeWidth="3"/><circle cx="100" cy="100" r="36" fill={C.orange} stroke={C.black} strokeWidth="3"/><circle cx="100" cy="100" r="16" fill={C.white} stroke={C.black} strokeWidth="2"/></svg>);
    case "sun-eversion-hold":
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/><rect x="160" y="0" width="40" height="200" fill={C.black}/><circle cx="90" cy="100" r="55" fill={C.white} stroke={C.black} strokeWidth="3"/><circle cx="90" cy="100" r="35" fill={C.orange} stroke={C.black} strokeWidth="3"/><circle cx="90" cy="100" r="16" fill={C.yellow} stroke={C.black} strokeWidth="2"/><line x1="10" y1="80" x2="35" y2="80" stroke={C.black} strokeWidth="4"/><line x1="10" y1="100" x2="40" y2="100" stroke={C.black} strokeWidth="4"/><line x1="10" y1="120" x2="35" y2="120" stroke={C.black} strokeWidth="4"/></svg>);
    case "sun-short-foot":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/><rect x="0" y="160" width="200" height="40" fill={C.white}/><line x1="0" y1="160" x2="200" y2="160" stroke={C.black} strokeWidth="3"/><ellipse cx="100" cy="140" rx="60" ry="20" fill={C.red} stroke={C.black} strokeWidth="3"/><circle cx="70" cy="160" r="5" fill={C.black}/><circle cx="100" cy="160" r="5" fill={C.black}/><circle cx="130" cy="160" r="5" fill={C.black}/><line x1="100" y1="130" x2="100" y2="90" stroke={C.black} strokeWidth="4"/><polygon points="92,98 100,80 108,98" fill={C.black}/></svg>);
    case "sun-hip-flexor-march":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/><rect x="20" y="120" width="24" height="70" fill={C.yellow} stroke={C.black} strokeWidth="2"/><rect x="55" y="100" width="24" height="90" fill={C.yellow} stroke={C.black} strokeWidth="2"/><rect x="90" y="80" width="24" height="110" fill={C.yellow} stroke={C.black} strokeWidth="2"/><rect x="125" y="60" width="24" height="130" fill={C.orange} stroke={C.black} strokeWidth="2"/><rect x="160" y="40" width="24" height="150" fill={C.yellow} stroke={C.black} strokeWidth="2"/></svg>);
    case "sun-adduction-raises":
      return (<svg {...common}><rect width="200" height="80" fill={C.white}/><rect x="0" y="80" width="200" height="120" fill={C.blue}/><line x1="0" y1="80" x2="200" y2="80" stroke={C.black} strokeWidth="3"/><polygon points="10,120 50,80 90,120 70,160 30,160" fill={C.teal} stroke={C.black} strokeWidth="3"/><circle cx="160" cy="50" r="28" fill={C.orange} stroke={C.black} strokeWidth="3"/></svg>);
    case "sun-sl-balance":
      return (<svg {...common}><rect width="200" height="100" fill={C.white}/><rect x="0" y="100" width="200" height="100" fill={C.orange}/><line x1="0" y1="100" x2="200" y2="100" stroke={C.black} strokeWidth="5"/><circle cx="100" cy="55" r="16" fill={C.red} stroke={C.black} strokeWidth="3"/><line x1="100" y1="71" x2="100" y2="130" stroke={C.black} strokeWidth="4"/><line x1="100" y1="90" x2="65" y2="75" stroke={C.black} strokeWidth="3"/><line x1="100" y1="90" x2="135" y2="75" stroke={C.black} strokeWidth="3"/><line x1="100" y1="130" x2="100" y2="170" stroke={C.black} strokeWidth="3"/></svg>);
    case "sun-sl-rdl-reach":
      return (<svg {...common}><rect width="200" height="200" fill={C.yellow}/><path d="M 30 180 Q 60 140 80 160 Q 100 180 120 120 Q 140 60 170 30" fill="none" stroke={C.white} strokeWidth="18"/><path d="M 30 180 Q 60 140 80 160 Q 100 180 120 120 Q 140 60 170 30" fill="none" stroke={C.black} strokeWidth="4"/><circle cx="120" cy="105" r="8" fill={C.orange} stroke={C.black} strokeWidth="2"/><line x1="120" y1="113" x2="120" y2="140" stroke={C.black} strokeWidth="3"/><line x1="120" y1="140" x2="110" y2="160" stroke={C.black} strokeWidth="2"/><line x1="120" y1="140" x2="130" y2="155" stroke={C.black} strokeWidth="2"/></svg>);
    case "sun-10mi-run":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/><rect x="0" y="170" width="200" height="30" fill={C.black}/><path d="M 0 140 Q 20 120 40 140 Q 60 160 80 130 Q 100 100 120 130 Q 140 160 160 120 Q 180 80 200 110" fill="none" stroke={C.yellow} strokeWidth="8"/><circle cx="40" cy="40" r="30" fill={C.yellow} stroke={C.black} strokeWidth="3"/><text x="40" y="48" textAnchor="middle" fill={C.black} fontSize="24" fontWeight="800" fontFamily={fontFamily}>10</text></svg>);
    case "sun-walk":
      return (<svg {...common}><rect width="200" height="120" fill={C.teal}/><rect x="0" y="120" width="200" height="80" fill={C.yellow}/><line x1="0" y1="120" x2="200" y2="120" stroke={C.black} strokeWidth="3"/><circle cx="155" cy="40" r="22" fill={C.yellow} stroke={C.black} strokeWidth="3"/><path d="M 40 50 Q 80 10 120 50" fill={C.white} stroke={C.black} strokeWidth="3"/></svg>);
    case "sun-foam-roll":
      return (<svg {...common}><rect width="200" height="200" fill={C.green}/><rect x="25" y="50" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3"/><rect x="25" y="90" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3"/><rect x="25" y="130" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3"/><line x1="80" y1="170" x2="120" y2="170" stroke={C.black} strokeWidth="5"/><polygon points="92,178 100,195 108,178" fill={C.black}/></svg>);
    case "sun-static-stretch":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/><polygon points="100,20 30,170 170,170" fill={C.white} stroke={C.black} strokeWidth="3"/><polygon points="100,55 55,150 145,150" fill={C.blue} stroke={C.black} strokeWidth="2"/><circle cx="100" cy="40" r="14" fill={C.orange} stroke={C.black} strokeWidth="3"/></svg>);
    default:
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/><circle cx="100" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3"/></svg>);
  }
}

/* ───────────────────────── RACE COUNTDOWN ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function SundayWorkoutPage() {
  const [checks, setChecks] = useState<CheckState>({});
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setChecks(loadChecks()); setMounted(true); }, []);

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
  const isExDone = (ex: Exercise) => { const arr = checks[ex.id]; if (!arr) return false; for (let i = 0; i < ex.sets; i++) if (!arr[i]) return false; return true; };
  const isSectionDone = (section: string) => EXERCISES.filter((e) => e.section === section).every(isExDone);

  const totalSets = EXERCISES.reduce((s, e) => s + e.sets, 0);
  const doneSets = EXERCISES.reduce((s, e) => { let c = 0; for (let i = 0; i < e.sets; i++) if (isSetDone(e.id, i)) c++; return s + c; }, 0);
  const progress = totalSets > 0 ? doneSets / totalSets : 0;
  const allDone = progress >= 1;

  const col1: number[] = []; const col2: number[] = []; let h1 = 0; let h2 = 0;
  EXERCISES.forEach((_, i) => { if (h1 <= h2) { col1.push(i); h1 += HEIGHTS[i % HEIGHTS.length] + 12; } else { col2.push(i); h2 += HEIGHTS[i % HEIGHTS.length] + 12; } });

  if (!mounted) return <div style={{ background: C.yellow, minHeight: "100vh" }} />;

  /* ───── FOCUS MODE ───── */
  if (focusIdx !== null) {
    const ex = EXERCISES[focusIdx];
    return (
      <div style={{ position: "fixed", inset: 0, background: C.white, zIndex: 100, fontFamily, overflow: "auto" }}>
        <div style={{ position: "relative", height: "42vh", borderBottom: `4px solid ${C.black}`, overflow: "hidden" }}>
          <ExerciseSVG id={ex.id} />
          <button onClick={() => { setFocusIdx(null); setShowTip(false); }} style={{ position: "absolute", top: 16, left: 16, width: 48, height: 48, borderRadius: "50%", background: C.white, border: `3px solid ${C.black}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, fontWeight: 800, color: C.black }} aria-label="Back">&#8592;</button>
          <div style={{ position: "absolute", top: 16, right: 16, background: C.black, color: C.yellow, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, fontFamily }}>{ex.sectionLabel}</div>
        </div>
        <div style={{ padding: "24px 20px 120px" }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>{ex.name}</h2>
          <p style={{ fontSize: 20, fontWeight: 600, color: C.black, margin: "6px 0 24px", fontFamily }}>{ex.detail}</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            {Array.from({ length: ex.sets }).map((_, si) => { const done = isSetDone(ex.id, si); return (
              <button key={si} onClick={() => toggle(ex.id, si)} style={{ width: 72, height: 72, borderRadius: 14, border: `3px solid ${C.black}`, background: done ? C.red : C.yellow, color: done ? C.white : C.black, fontSize: done ? 28 : 18, fontWeight: 800, cursor: "pointer", fontFamily, display: "flex", alignItems: "center", justifyContent: "center" }}>{done ? "\u2713" : `Set ${si + 1}`}</button>
            ); })}
          </div>
          {ex.tip && (<button onClick={() => setShowTip((p) => !p)} style={{ background: C.blue, color: C.white, border: `3px solid ${C.black}`, borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily, marginBottom: 10, width: "100%", textAlign: "left" }}>{showTip ? "\u25B2 Hide Cue" : "\u25BC Coaching Cue"}</button>)}
          {showTip && ex.tip && (<div style={{ background: C.white, border: `3px solid ${C.blue}`, borderRadius: 10, padding: "12px 16px", fontSize: 15, color: C.black, fontFamily, marginBottom: 16 }}>{ex.tip}</div>)}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {focusIdx > 0 && (<button onClick={() => { setFocusIdx(focusIdx - 1); setShowTip(false); }} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `3px solid ${C.black}`, background: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, color: C.black }}>&larr; Previous</button>)}
            {focusIdx < EXERCISES.length - 1 ? (
              <button onClick={() => { setFocusIdx(focusIdx + 1); setShowTip(false); }} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `3px solid ${C.black}`, background: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, color: C.black }}>Next &rarr;</button>
            ) : (
              <button onClick={() => { setFocusIdx(null); setShowTip(false); }} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `3px solid ${C.black}`, background: C.green, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily, color: C.white }}>Done &rarr;</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ───── BROWSE MODE ───── */
  return (
    <div style={{ background: C.yellow, minHeight: "100vh", fontFamily, paddingBottom: allDone ? 80 : 20 }}>
      <header style={{ background: C.yellow, borderBottom: `4px solid ${C.black}`, padding: "16px 16px 12px" }}>
        <Link href="/workouts" style={{ textDecoration: "none", color: C.black, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>&#8592; Workouts</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>Sunday</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: "2px 0 0", fontFamily }}>Long Run Day</p>
          </div>
          <div style={{ background: C.black, borderRadius: 999, padding: "6px 14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.yellow, fontFamily, lineHeight: 1 }}>{daysToRace()}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: C.white, fontFamily, letterSpacing: 1, textTransform: "uppercase" }}>DAYS TO RACE</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {SECTIONS.map((s) => {
            const done = isSectionDone(s);
            const sectionExercises = EXERCISES.map((e, i) => ({ e, i })).filter(({ e }) => e.section === s);
            const firstIncomplete = sectionExercises.find(({ e }) => !isExDone(e));
            const target = firstIncomplete ? firstIncomplete.i : sectionExercises[0]?.i ?? 0;
            return (<button key={s} onClick={() => { setFocusIdx(target); setShowTip(false); }} style={{ padding: "5px 12px", borderRadius: 999, border: `3px solid ${C.black}`, background: done ? C.green : C.white, color: done ? C.white : C.black, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, fontFamily, cursor: "pointer" }}>{SECTION_NAMES[s]}</button>);
          })}
        </div>
        <div style={{ marginTop: 10, height: 8, borderRadius: 4, border: `3px solid ${C.black}`, background: C.white, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: allDone ? C.green : C.red, transition: "width 0.3s ease" }} />
        </div>
      </header>
      <div style={{ display: "flex", gap: 12, padding: "12px 12px 0" }}>
        {[col1, col2].map((col, ci) => (
          <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {col.map((idx) => { const ex = EXERCISES[idx]; const h = HEIGHTS[idx % HEIGHTS.length]; const done = isExDone(ex); return (
              <button key={ex.id} onClick={() => setFocusIdx(idx)} style={{ position: "relative", height: h, border: `3px solid ${C.black}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", filter: done ? "saturate(0.3)" : "none", display: "block", width: "100%", padding: 0, background: C.black, textAlign: "left" }}>
                <div style={{ position: "absolute", inset: 0 }}><ExerciseSVG id={ex.id} /></div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.black, padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.yellow, textTransform: "uppercase", letterSpacing: 1, fontFamily }}>{ex.sectionLabel}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily, lineHeight: 1.15, margin: "2px 0 4px" }}>{ex.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: C.white, fontFamily, fontWeight: 600 }}>{ex.detail}</span>
                    <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                      {Array.from({ length: ex.sets }).map((_, si) => (<div key={si} style={{ width: 10, height: 10, border: `2px solid ${C.black}`, background: isSetDone(ex.id, si) ? C.yellow : C.white }} />))}
                    </div>
                  </div>
                </div>
              </button>
            ); })}
          </div>
        ))}
      </div>
      {allDone && (<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.green, borderTop: `4px solid ${C.black}`, padding: "14px 20px", textAlign: "center", fontSize: 18, fontWeight: 800, color: C.white, fontFamily, zIndex: 50 }}>WORKOUT COMPLETE — YOU CRUSHED IT</div>)}
    </div>
  );
}
