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
const HEIGHTS = [220,270,200,250,230,280,210,260,240,290,195,310,225,245];
const STORAGE_KEY = "optimism-pop-tuesday-v1";

type CheckState = Record<string, boolean[]>;
function loadChecks(): CheckState {
  if (typeof window === "undefined") return {};
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function saveChecks(c: CheckState) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {} }

/* ───────────────────────── EXERCISE DATA ───────────────────────── */
interface Exercise { id: string; name: string; section: string; sectionLabel: string; sets: number; detail: string; tip?: string; }

const EXERCISES: Exercise[] = [
  /* ── Warm-Up ── */
  { id: "tue-band-hip-march", name: "Band Hip Flexion March", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "8 each side", tip: "Band around foot, drive knee up to hip height with control." },
  { id: "tue-short-foot", name: "Short Foot", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "10 sec each foot", tip: "Big toe, little toe, heel down. Lift arch WITHOUT curling toes." },
  { id: "tue-band-eversion-wu", name: "Band Ankle Eversion", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "15 each side", tip: "Press outside of foot against band — targets peroneals for lateral ankle stability." },
  { id: "tue-adductor-squeeze-wu", name: "Adductor Squeeze", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "20 sec hold", tip: "Pillow or ball between knees, squeeze and hold. Protects left hip/groin." },
  /* ── Main Strength ── */
  { id: "tue-split-squat", name: "Split Squat", section: "main", sectionLabel: "Main Strength", sets: 3, detail: "10 each leg · controlled", tip: "Controlled descent, front knee tracks over toes. Protect that left ankle — stay deliberate." },
  { id: "tue-rdl", name: "RDL", section: "main", sectionLabel: "Main Strength", sets: 3, detail: "10 reps · DB or BB", tip: "Hinge at hips, soft knee bend. Feel hamstrings load. Bar/DB stays close to legs." },
  { id: "tue-cable-rotation", name: "Cable Transverse Rotation", section: "main", sectionLabel: "Main Strength", sets: 3, detail: "12 each side", tip: "Rotate from the core, arms stay extended. Hips stay square — all rotation is thoracic." },
  { id: "tue-kb-squat", name: "Wide-Knees KB Squat", section: "main", sectionLabel: "Main Strength", sets: 3, detail: "12 reps · deadlift style", tip: "Wider stance, toes out. Grip kettlebell between feet, drive up through heels." },
  { id: "tue-lateral-band", name: "Lateral Band Abduction", section: "main", sectionLabel: "Main Strength", sets: 3, detail: "12 each side", tip: "Band around ankles. Stay low in quarter squat, step sideways with control." },
  { id: "tue-hanging-knees", name: "Hanging Knees to Chest", section: "main", sectionLabel: "Main Strength", sets: 3, detail: "8 reps", tip: "Dead hang start, curl knees up toward chest. Controlled, no swinging." },
  /* ── Accessories & Correctives ── */
  { id: "tue-calf-raises", name: "Calf Raises (slow)", section: "accessories", sectionLabel: "Accessories", sets: 3, detail: "15 reps", tip: "Slow on the way up AND down. Full range — drop heel below step." },
  { id: "tue-band-eversion-acc", name: "Band Ankle Eversion", section: "accessories", sectionLabel: "Accessories", sets: 3, detail: "20 each side", tip: "Higher reps to build endurance in peroneals. Slow and controlled." },
  { id: "tue-band-hip-march-acc", name: "Band Hip Flexion March", section: "accessories", sectionLabel: "Accessories", sets: 3, detail: "12 each side" },
  { id: "tue-adductor-squeeze-acc", name: "Adductor Squeeze", section: "accessories", sectionLabel: "Accessories", sets: 2, detail: "20 sec hold" },
];

const SECTIONS = ["warmup", "main", "accessories"];
const SECTION_NAMES: Record<string, string> = { warmup: "Warm-Up", main: "Main Strength", accessories: "Accessories" };

/* ───────────────────────── SVG ART ───────────────────────── */
function ExerciseSVG({ id }: { id: string }) {
  const s = `0 0 200 200`;
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: s, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" as const };

  switch (id) {
    case "tue-band-hip-march":
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/><rect x="20" y="120" width="24" height="70" fill={C.white} stroke={C.black} strokeWidth="2"/><rect x="55" y="100" width="24" height="90" fill={C.white} stroke={C.black} strokeWidth="2"/><rect x="90" y="80" width="24" height="110" fill={C.white} stroke={C.black} strokeWidth="2"/><rect x="125" y="60" width="24" height="130" fill={C.yellow} stroke={C.black} strokeWidth="2"/><rect x="160" y="40" width="24" height="150" fill={C.white} stroke={C.black} strokeWidth="2"/><ellipse cx="32" cy="115" rx="15" ry="8" fill={C.yellow} stroke={C.black} strokeWidth="2"/><ellipse cx="67" cy="95" rx="15" ry="8" fill={C.yellow} stroke={C.black} strokeWidth="2"/><ellipse cx="102" cy="75" rx="15" ry="8" fill={C.yellow} stroke={C.black} strokeWidth="2"/><ellipse cx="137" cy="55" rx="15" ry="8" fill={C.yellow} stroke={C.black} strokeWidth="2"/><ellipse cx="172" cy="35" rx="15" ry="8" fill={C.yellow} stroke={C.black} strokeWidth="2"/></svg>);
    case "tue-short-foot":
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/><rect x="0" y="160" width="200" height="40" fill={C.white}/><line x1="0" y1="160" x2="200" y2="160" stroke={C.black} strokeWidth="3"/><ellipse cx="100" cy="140" rx="60" ry="20" fill={C.yellow} stroke={C.black} strokeWidth="3"/><circle cx="70" cy="160" r="5" fill={C.black}/><circle cx="100" cy="160" r="5" fill={C.black}/><circle cx="130" cy="160" r="5" fill={C.black}/><line x1="100" y1="130" x2="100" y2="90" stroke={C.black} strokeWidth="4"/><polygon points="92,98 100,80 108,98" fill={C.black}/></svg>);
    case "tue-band-eversion-wu":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/><rect x="160" y="0" width="40" height="200" fill={C.black}/><circle cx="90" cy="100" r="55" fill={C.white} stroke={C.black} strokeWidth="3"/><circle cx="90" cy="100" r="35" fill={C.red} stroke={C.black} strokeWidth="3"/><circle cx="90" cy="100" r="16" fill={C.yellow} stroke={C.black} strokeWidth="2"/></svg>);
    case "tue-adductor-squeeze-wu":
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/><circle cx="80" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3"/><circle cx="120" cy="100" r="50" fill={C.red} stroke={C.black} strokeWidth="3"/><rect x="85" y="70" width="30" height="60" rx="10" fill={C.white} stroke={C.black} strokeWidth="3"/><line x1="100" y1="60" x2="100" y2="140" stroke={C.black} strokeWidth="3" strokeDasharray="6 4"/></svg>);
    case "tue-split-squat":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/><rect x="0" y="170" width="200" height="30" fill={C.black}/>
        <circle cx="100" cy="40" r="16" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="56" x2="100" y2="110" stroke={C.black} strokeWidth="4"/>
        <line x1="100" y1="80" x2="70" y2="65" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="80" x2="130" y2="65" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="110" x2="70" y2="170" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="110" x2="130" y2="145" stroke={C.black} strokeWidth="3"/>
        <line x1="130" y1="145" x2="140" y2="170" stroke={C.black} strokeWidth="3"/></svg>);
    case "tue-rdl":
      return (<svg {...common}><rect width="200" height="200" fill={C.yellow}/>
        <rect x="0" y="170" width="200" height="30" fill={C.black}/>
        <rect x="30" y="100" width="140" height="10" rx="5" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <rect x="15" y="85" width="25" height="40" rx="4" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <rect x="160" y="85" width="25" height="40" rx="4" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <circle cx="100" cy="60" r="14" fill={C.blue} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="74" x2="100" y2="100" stroke={C.black} strokeWidth="4"/></svg>);
    case "tue-cable-rotation":
      return (<svg {...common}><rect width="200" height="200" fill={C.green}/>
        <rect x="170" y="0" width="30" height="200" fill={C.black}/>
        <circle cx="100" cy="80" r="14" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="94" x2="100" y2="150" stroke={C.black} strokeWidth="4"/>
        <line x1="170" y1="100" x2="100" y2="100" stroke={C.red} strokeWidth="5"/>
        <path d="M 60 80 Q 40 100 60 120" fill="none" stroke={C.yellow} strokeWidth="4"/>
        <polygon points="55,115 65,125 55,125" fill={C.yellow}/></svg>);
    case "tue-kb-squat":
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/>
        <rect x="0" y="160" width="200" height="40" fill={C.black}/>
        <circle cx="100" cy="50" r="14" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <rect x="85" y="64" width="30" height="50" rx="4" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="85" y1="90" x2="55" y2="110" stroke={C.black} strokeWidth="3"/>
        <line x1="115" y1="90" x2="145" y2="110" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="114" x2="75" y2="160" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="114" x2="125" y2="160" stroke={C.black} strokeWidth="3"/>
        <rect x="88" y="120" width="24" height="30" rx="6" fill={C.orange} stroke={C.black} strokeWidth="3"/></svg>);
    case "tue-lateral-band":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/>
        <rect x="0" y="170" width="200" height="30" fill={C.black}/>
        <line x1="30" y1="130" x2="170" y2="130" stroke={C.yellow} strokeWidth="6"/>
        <circle cx="50" cy="130" r="18" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <circle cx="100" cy="130" r="18" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <circle cx="150" cy="130" r="18" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <polygon points="170,95 185,110 170,125" fill={C.black}/>
        <polygon points="30,95 15,110 30,125" fill={C.black}/></svg>);
    case "tue-hanging-knees":
      return (<svg {...common}><rect width="200" height="200" fill={C.black}/>
        <rect x="30" y="20" width="140" height="12" rx="6" fill={C.white} stroke={C.white} strokeWidth="2"/>
        <line x1="100" y1="32" x2="100" y2="60" stroke={C.yellow} strokeWidth="4"/>
        <circle cx="100" cy="75" r="14" fill={C.red} stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="89" x2="100" y2="130" stroke={C.yellow} strokeWidth="4"/>
        <path d="M 100 130 Q 80 150 85 170" fill="none" stroke={C.yellow} strokeWidth="3"/>
        <path d="M 100 130 Q 120 150 115 170" fill="none" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="60" x2="75" y2="32" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="60" x2="125" y2="32" stroke={C.yellow} strokeWidth="3"/></svg>);
    case "tue-calf-raises":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/>
        <rect x="0" y="140" width="200" height="20" fill={C.black}/>
        <rect x="65" y="60" width="30" height="80" rx="6" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <rect x="105" y="60" width="30" height="80" rx="6" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <polygon points="65,140 80,110 95,140" fill={C.yellow} stroke={C.black} strokeWidth="2"/>
        <polygon points="105,140 120,110 135,140" fill={C.yellow} stroke={C.black} strokeWidth="2"/>
        <line x1="100" y1="170" x2="100" y2="195" stroke={C.white} strokeWidth="4"/>
        <polygon points="92,188 100,200 108,188" fill={C.white}/></svg>);
    case "tue-band-eversion-acc":
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/>
        <rect x="0" y="0" width="40" height="200" fill={C.black}/>
        <circle cx="110" cy="100" r="55" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <circle cx="110" cy="100" r="35" fill={C.orange} stroke={C.black} strokeWidth="3"/>
        <circle cx="110" cy="100" r="16" fill={C.yellow} stroke={C.black} strokeWidth="2"/></svg>);
    case "tue-band-hip-march-acc":
      return (<svg {...common}><rect width="200" height="200" fill={C.green}/>
        <rect x="20" y="120" width="24" height="70" fill={C.white} stroke={C.black} strokeWidth="2"/>
        <rect x="55" y="100" width="24" height="90" fill={C.white} stroke={C.black} strokeWidth="2"/>
        <rect x="90" y="80" width="24" height="110" fill={C.white} stroke={C.black} strokeWidth="2"/>
        <rect x="125" y="60" width="24" height="130" fill={C.yellow} stroke={C.black} strokeWidth="2"/>
        <rect x="160" y="40" width="24" height="150" fill={C.white} stroke={C.black} strokeWidth="2"/></svg>);
    case "tue-adductor-squeeze-acc":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/>
        <circle cx="80" cy="100" r="45" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <circle cx="120" cy="100" r="45" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <rect x="88" y="75" width="24" height="50" rx="8" fill={C.white} stroke={C.black} strokeWidth="3"/></svg>);
    default:
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/><circle cx="100" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3"/></svg>);
  }
}

/* ───────────────────────── RACE COUNTDOWN ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function TuesdayWorkoutPage() {
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
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>Tuesday</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: "2px 0 0", fontFamily }}>Lower Strength A</p>
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
