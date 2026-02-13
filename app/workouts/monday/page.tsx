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
const HEIGHTS = [220,270,200,250,230,280,210,260,240,290];
const STORAGE_KEY = "optimism-pop-monday-v1";

type CheckState = Record<string, boolean[]>;
function loadChecks(): CheckState {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function saveChecks(c: CheckState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {} }

/* ───────────────────────── EXERCISE DATA ───────────────────────── */
interface Exercise { id: string; name: string; section: string; sectionLabel: string; sets: number; detail: string; tip?: string; }

const EXERCISES: Exercise[] = [
  /* ── Cardio ── */
  { id: "mon-bike", name: "Zone 2 Bike", section: "cardio", sectionLabel: "Cardio", sets: 1, detail: "60 min · Zone 2", tip: "Steady effort, conversation pace. Keep cadence 80–90 RPM if possible." },
  /* ── Complex 1: Pull then Push ── */
  { id: "mon-rows", name: "Rows", section: "complex-1", sectionLabel: "Complex 1", sets: 4, detail: "12 reps · your choice", tip: "Cable, barbell, or dumbbell rows. Full range of motion, squeeze at top." },
  { id: "mon-bench", name: "Bench Press", section: "complex-1", sectionLabel: "Complex 1", sets: 4, detail: "12 reps · bar or DB", tip: "Control the descent, press through the full range. Keep shoulder blades pinched." },
  { id: "mon-crunches-1", name: "Crunches", section: "complex-1", sectionLabel: "Complex 1", sets: 4, detail: "20 reps", tip: "Slow and controlled. Focus on the contraction, not speed." },
  /* ── Complex 2 ── */
  { id: "mon-pulldowns", name: "Lat Pull-Downs", section: "complex-2", sectionLabel: "Complex 2", sets: 4, detail: "10 reps", tip: "Lean back slightly, pull to upper chest. Squeeze lats at bottom." },
  { id: "mon-shoulder-press", name: "Shoulder Press", section: "complex-2", sectionLabel: "Complex 2", sets: 4, detail: "10 reps", tip: "Press overhead fully. Keep core tight, don't arch excessively." },
  { id: "mon-plank-squeeze", name: "Plank Squeeze", section: "complex-2", sectionLabel: "Complex 2", sets: 4, detail: "10 sec hold", tip: "Hold plank position and actively squeeze every muscle. Full body tension." },
  /* ── Finishers ── */
  { id: "mon-dead-hang", name: "Dead Hang", section: "finishers", sectionLabel: "Finishers", sets: 1, detail: "Max time", tip: "Grip the bar, relax shoulders, breathe. Go as long as you can." },
  { id: "mon-chest-stretch", name: "Chest Stretch", section: "finishers", sectionLabel: "Finishers", sets: 1, detail: "30–45 sec", tip: "Doorway or wall stretch. Open up after all the pressing work." },
  { id: "mon-foam-roll-legs", name: "Leg Foam Roll", section: "finishers", sectionLabel: "Finishers", sets: 1, detail: "3 min · all areas", tip: "Roll quads, hamstrings, calves, IT band. Prep for tomorrow's lower day." },
];

const SECTIONS = ["cardio", "complex-1", "complex-2", "finishers"];
const SECTION_NAMES: Record<string, string> = { cardio: "Cardio", "complex-1": "Complex 1", "complex-2": "Complex 2", finishers: "Finishers" };

/* ───────────────────────── SVG ART ───────────────────────── */
function ExerciseSVG({ id }: { id: string }) {
  const s = `0 0 200 200`;
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: s, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" as const };

  switch (id) {
    case "mon-bike":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/>
        <circle cx="60" cy="130" r="40" fill="none" stroke={C.yellow} strokeWidth="5"/><circle cx="140" cy="130" r="40" fill="none" stroke={C.yellow} strokeWidth="5"/>
        <line x1="60" y1="130" x2="100" y2="80" stroke={C.white} strokeWidth="4"/><line x1="100" y1="80" x2="140" y2="130" stroke={C.white} strokeWidth="4"/>
        <line x1="100" y1="80" x2="120" y2="60" stroke={C.white} strokeWidth="3"/><circle cx="120" cy="55" r="8" fill={C.red} stroke={C.black} strokeWidth="2"/>
        <line x1="85" y1="85" x2="115" y2="75" stroke={C.red} strokeWidth="3"/></svg>);
    case "mon-rows":
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/>
        <rect x="20" y="80" width="160" height="12" rx="6" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <rect x="10" y="60" width="30" height="52" rx="4" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <rect x="160" y="60" width="30" height="52" rx="4" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <polygon points="85,140 100,120 115,140" fill={C.black}/><line x1="100" y1="140" x2="100" y2="170" stroke={C.black} strokeWidth="4"/></svg>);
    case "mon-bench":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/>
        <rect x="0" y="160" width="200" height="40" fill={C.black}/>
        <rect x="30" y="100" width="140" height="10" rx="5" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <rect x="15" y="85" width="25" height="40" rx="4" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <rect x="160" y="85" width="25" height="40" rx="4" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <rect x="60" y="120" width="80" height="40" rx="6" fill={C.blue} stroke={C.black} strokeWidth="3"/></svg>);
    case "mon-crunches-1":
      return (<svg {...common}><rect width="200" height="200" fill={C.yellow}/>
        <rect x="0" y="150" width="200" height="50" fill={C.black}/>
        <ellipse cx="100" cy="120" rx="40" ry="20" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <circle cx="100" cy="80" r="16" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="96" x2="100" y2="120" stroke={C.black} strokeWidth="4"/>
        <path d="M 80 110 Q 100 90 120 110" fill="none" stroke={C.blue} strokeWidth="3"/></svg>);
    case "mon-pulldowns":
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/>
        <rect x="40" y="10" width="120" height="10" rx="5" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="20" x2="100" y2="80" stroke={C.black} strokeWidth="3"/>
        <line x1="60" y1="20" x2="60" y2="60" stroke={C.yellow} strokeWidth="3"/>
        <line x1="140" y1="20" x2="140" y2="60" stroke={C.yellow} strokeWidth="3"/>
        <circle cx="100" cy="100" r="16" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="116" x2="100" y2="160" stroke={C.black} strokeWidth="4"/>
        <line x1="100" y1="130" x2="60" y2="60" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="130" x2="140" y2="60" stroke={C.black} strokeWidth="3"/></svg>);
    case "mon-shoulder-press":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/>
        <rect x="0" y="170" width="200" height="30" fill={C.black}/>
        <circle cx="100" cy="60" r="16" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="76" x2="100" y2="140" stroke={C.black} strokeWidth="4"/>
        <line x1="60" y1="30" x2="100" y2="90" stroke={C.white} strokeWidth="5"/>
        <line x1="140" y1="30" x2="100" y2="90" stroke={C.white} strokeWidth="5"/>
        <rect x="50" y="20" width="20" height="14" rx="4" fill={C.red} stroke={C.black} strokeWidth="2"/>
        <rect x="130" y="20" width="20" height="14" rx="4" fill={C.red} stroke={C.black} strokeWidth="2"/></svg>);
    case "mon-plank-squeeze":
      return (<svg {...common}><rect width="200" height="200" fill={C.green}/>
        <rect x="0" y="150" width="200" height="50" fill={C.yellow}/>
        <line x1="0" y1="150" x2="200" y2="150" stroke={C.black} strokeWidth="3"/>
        <line x1="30" y1="130" x2="170" y2="130" stroke={C.white} strokeWidth="14"/>
        <line x1="30" y1="130" x2="170" y2="130" stroke={C.black} strokeWidth="4"/>
        <circle cx="30" cy="130" r="8" fill={C.red} stroke={C.black} strokeWidth="2"/>
        <circle cx="170" cy="130" r="8" fill={C.red} stroke={C.black} strokeWidth="2"/>
        <line x1="30" y1="138" x2="30" y2="150" stroke={C.black} strokeWidth="3"/>
        <line x1="170" y1="138" x2="170" y2="150" stroke={C.black} strokeWidth="3"/></svg>);
    case "mon-dead-hang":
      return (<svg {...common}><rect width="200" height="200" fill={C.black}/>
        <rect x="30" y="20" width="140" height="12" rx="6" fill={C.white} stroke={C.white} strokeWidth="2"/>
        <line x1="100" y1="32" x2="100" y2="60" stroke={C.yellow} strokeWidth="4"/>
        <circle cx="100" cy="75" r="14" fill={C.red} stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="89" x2="100" y2="150" stroke={C.yellow} strokeWidth="4"/>
        <line x1="100" y1="150" x2="85" y2="185" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="150" x2="115" y2="185" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="60" x2="75" y2="32" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="60" x2="125" y2="32" stroke={C.yellow} strokeWidth="3"/></svg>);
    case "mon-chest-stretch":
      return (<svg {...common}><rect width="200" height="200" fill={C.yellow}/>
        <rect x="0" y="0" width="30" height="200" fill={C.black}/>
        <circle cx="100" cy="80" r="14" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="94" x2="100" y2="150" stroke={C.black} strokeWidth="4"/>
        <line x1="100" y1="110" x2="30" y2="80" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="110" x2="170" y2="80" stroke={C.black} strokeWidth="3"/>
        <circle cx="170" cy="80" r="6" fill={C.blue} stroke={C.black} strokeWidth="2"/></svg>);
    case "mon-foam-roll-legs":
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/>
        <rect x="25" y="60" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <rect x="25" y="100" width="150" height="24" rx="12" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <rect x="25" y="140" width="150" height="24" rx="12" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="80" y1="175" x2="120" y2="175" stroke={C.black} strokeWidth="5"/>
        <polygon points="92,183 100,198 108,183" fill={C.black}/></svg>);
    default:
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/><circle cx="100" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3"/></svg>);
  }
}

/* ───────────────────────── RACE COUNTDOWN ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function MondayWorkoutPage() {
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

  return (
    <div style={{ background: C.yellow, minHeight: "100vh", fontFamily, paddingBottom: allDone ? 80 : 20 }}>
      <header style={{ background: C.yellow, borderBottom: `4px solid ${C.black}`, padding: "16px 16px 12px" }}>
        <Link href="/workouts" style={{ textDecoration: "none", color: C.black, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>&#8592; Workouts</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>Monday</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: "2px 0 0", fontFamily }}>Cross-Train + Upper A</p>
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
