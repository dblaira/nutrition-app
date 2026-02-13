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
const HEIGHTS = [220,270,200,250,230,280,210,260,240,290,195,310,225,245,205,265,235,220,250,230];

/* ───────────────────────── STORAGE ───────────────────────── */
const STORAGE_KEY = "optimism-pop-friday-v1";

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
  /* ── Warm-Up ── */
  { id: "fri-short-foot", name: "Short Foot Holds", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "10 sec each foot", tip: "Press big toe, little toe, and heel into the ground, then lightly lift your arch by pulling the ball of your foot toward your heel WITHOUT curling your toes." },
  { id: "fri-band-eversion", name: "Band Ankle Eversion", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "15 each side", tip: "Press outside of foot against resistance \u2014 targets peroneals for lateral ankle stability." },
  { id: "fri-adductor-squeeze", name: "Adductor Squeeze", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "20 sec hold" },
  { id: "fri-band-hip-march-wu", name: "Band Hip Flexion March", section: "warmup", sectionLabel: "Warm-Up", sets: 2, detail: "8 each side" },

  /* ── Main Work: Group 1 ── */
  { id: "fri-goblet-squat", name: "Goblet Squat", section: "main-1", sectionLabel: "Main \u2014 Group 1", sets: 3, detail: "12 reps \u00b7 slow tempo", tip: "Controlled descent, chest up, knees tracking over toes. 3 sec down, 1 sec pause at bottom. This is tissue capacity work, not max effort." },
  { id: "fri-sl-rdl", name: "Single-Leg RDL", section: "main-1", sectionLabel: "Main \u2014 Group 1", sets: 3, detail: "8 each side \u00b7 light", tip: "Hinge at hips, slight knee bend, feel the stretch in hamstrings. Keep weight close to your leg." },
  { id: "fri-pallof-press", name: "Pallof Press", section: "main-1", sectionLabel: "Main \u2014 Group 1", sets: 3, detail: "10 each side", tip: "Press hands straight out from chest, resist the cable pulling you into rotation. Keep hips square." },

  /* ── Main Work: Group 2 ── */
  { id: "fri-reverse-lunge", name: "Reverse Lunge to Balance", section: "main-2", sectionLabel: "Main \u2014 Group 2", sets: 3, detail: "8 each leg", tip: "Step back into lunge, then drive knee up and hold 2 seconds at top. Proprioceptive challenge that feeds running mechanics." },
  { id: "fri-lateral-band-walk-main", name: "Lateral Band Walks", section: "main-2", sectionLabel: "Main \u2014 Group 2", sets: 3, detail: "12 each side", tip: "Band around ankles or just above knees. Stay low in quarter squat, step sideways with control." },
  { id: "fri-side-plank-dip", name: "Side Plank Hip Dip", section: "main-2", sectionLabel: "Main \u2014 Group 2", sets: 2, detail: "10 each side", tip: "From side plank, lower hip toward floor and drive back up. Targets lateral hip stabilizers." },

  /* ── Correctives & Accessories ── */
  { id: "fri-band-eversion-corr", name: "Band Eversion", section: "correctives", sectionLabel: "Correctives", sets: 2, detail: "15\u201320 each side" },
  { id: "fri-calf-raises", name: "Calf Raises (slow)", section: "correctives", sectionLabel: "Correctives", sets: 3, detail: "12\u201315 reps", tip: "Go slow on the way up AND down. Full range of motion \u2014 drop the heel below the step." },
  { id: "fri-tib-raises", name: "Tibialis Raises", section: "correctives", sectionLabel: "Correctives", sets: 3, detail: "15\u201320 reps", tip: "Lean back against wall, heels 6\u20138 inches from baseboard. Lift the balls of your feet toward your shins. Slow and controlled." },
  { id: "fri-sl-balance", name: "Single Leg Balance", section: "correctives", sectionLabel: "Correctives", sets: 2, detail: "20\u201330 sec each" },
  { id: "fri-band-hip-march-corr", name: "Band Hip Flexion March", section: "correctives", sectionLabel: "Correctives", sets: 2, detail: "8\u201312 each side" },
  { id: "fri-adduction-raises", name: "Side Lying Adduction", section: "correctives", sectionLabel: "Correctives", sets: 2, detail: "10\u201315 each side", tip: "Top leg crossed over, lift bottom leg with control." },
  { id: "fri-lateral-band-walk-corr", name: "Lateral Band Walk", section: "correctives", sectionLabel: "Correctives", sets: 2, detail: "10\u201315 steps each way" },
];

const SECTIONS = ["warmup", "main-1", "main-2", "correctives"];
const SECTION_NAMES: Record<string, string> = { warmup: "Warm-Up", "main-1": "Group 1", "main-2": "Group 2", correctives: "Correctives" };

/* ───────────────────────── SVG ART ───────────────────────── */
function ExerciseSVG({ id }: { id: string }) {
  const s = `0 0 200 200`;
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: s, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" as const };

  switch (id) {
    /* ── Warm-Up ── */
    case "fri-short-foot":
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
    case "fri-band-eversion":
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
    case "fri-adductor-squeeze":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.teal} />
          <circle cx="80" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3" />
          <circle cx="120" cy="100" r="50" fill={C.red} stroke={C.black} strokeWidth="3" />
          <rect x="85" y="70" width="30" height="60" rx="10" fill={C.white} stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="60" x2="100" y2="140" stroke={C.black} strokeWidth="3" strokeDasharray="6 4" />
        </svg>
      );
    case "fri-band-hip-march-wu":
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

    /* ── Main Work: Group 1 ── */
    case "fri-goblet-squat":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.red} />
          <rect x="0" y="160" width="200" height="40" fill={C.black} />
          <rect x="70" y="50" width="60" height="110" rx="8" fill={C.yellow} stroke={C.black} strokeWidth="3" />
          <rect x="85" y="30" width="30" height="30" rx="4" fill={C.white} stroke={C.black} strokeWidth="3" />
          <line x1="70" y1="80" x2="45" y2="95" stroke={C.black} strokeWidth="4" />
          <line x1="130" y1="80" x2="155" y2="95" stroke={C.black} strokeWidth="4" />
          <rect x="75" y="160" width="20" height="30" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <rect x="105" y="160" width="20" height="30" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <polygon points="90,10 100,0 110,10" fill={C.yellow} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "fri-sl-rdl":
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
          <line x1="120" y1="140" x2="145" y2="125" stroke={C.black} strokeWidth="2" />
          <rect x="100" y="155" width="25" height="8" rx="4" fill={C.blue} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "fri-pallof-press":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <rect x="170" y="0" width="30" height="200" fill={C.black} />
          <line x1="170" y1="100" x2="100" y2="100" stroke={C.yellow} strokeWidth="5" />
          <circle cx="100" cy="70" r="14" fill={C.red} stroke={C.black} strokeWidth="3" />
          <rect x="88" y="84" width="24" height="50" rx="4" fill={C.white} stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="84" x2="100" y2="100" stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="6" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <line x1="100" y1="134" x2="88" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="134" x2="112" y2="170" stroke={C.black} strokeWidth="3" />
        </svg>
      );

    /* ── Main Work: Group 2 ── */
    case "fri-reverse-lunge":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.green} />
          <rect x="0" y="170" width="200" height="30" fill={C.black} />
          <circle cx="100" cy="40" r="16" fill={C.yellow} stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="56" x2="100" y2="110" stroke={C.black} strokeWidth="4" />
          <line x1="100" y1="80" x2="70" y2="65" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="80" x2="130" y2="65" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="110" x2="75" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="110" x2="130" y2="145" stroke={C.black} strokeWidth="3" />
          <line x1="130" y1="145" x2="140" y2="170" stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="25" r="5" fill={C.red} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "fri-lateral-band-walk-main":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.orange} />
          <rect x="0" y="170" width="200" height="30" fill={C.black} />
          <line x1="30" y1="130" x2="170" y2="130" stroke={C.yellow} strokeWidth="6" />
          <circle cx="50" cy="130" r="18" fill={C.white} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="130" r="18" fill={C.red} stroke={C.black} strokeWidth="3" />
          <circle cx="150" cy="130" r="18" fill={C.white} stroke={C.black} strokeWidth="3" />
          <polygon points="170,95 185,110 170,125" fill={C.black} />
          <polygon points="30,95 15,110 30,125" fill={C.black} />
          <line x1="50" y1="148" x2="50" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="148" x2="100" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="150" y1="148" x2="150" y2="170" stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "fri-side-plank-dip":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.blue} />
          <rect x="0" y="160" width="200" height="40" fill={C.yellow} />
          <line x1="0" y1="160" x2="200" y2="160" stroke={C.black} strokeWidth="3" />
          <line x1="40" y1="160" x2="160" y2="100" stroke={C.white} strokeWidth="14" />
          <line x1="40" y1="160" x2="160" y2="100" stroke={C.black} strokeWidth="4" />
          <circle cx="40" cy="160" r="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <circle cx="160" cy="100" r="12" fill={C.red} stroke={C.black} strokeWidth="3" />
          <path d="M 100 120 Q 100 145 100 155" fill="none" stroke={C.yellow} strokeWidth="4" strokeDasharray="5 5" />
          <polygon points="95,150 100,162 105,150" fill={C.yellow} />
        </svg>
      );

    /* ── Correctives & Accessories ── */
    case "fri-band-eversion-corr":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.teal} />
          <rect x="0" y="0" width="40" height="200" fill={C.black} />
          <circle cx="110" cy="100" r="55" fill={C.white} stroke={C.black} strokeWidth="3" />
          <circle cx="110" cy="100" r="35" fill={C.orange} stroke={C.black} strokeWidth="3" />
          <circle cx="110" cy="100" r="16" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <line x1="155" y1="80" x2="190" y2="80" stroke={C.black} strokeWidth="4" />
          <line x1="155" y1="100" x2="190" y2="100" stroke={C.black} strokeWidth="4" />
          <line x1="155" y1="120" x2="190" y2="120" stroke={C.black} strokeWidth="4" />
        </svg>
      );
    case "fri-calf-raises":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.red} />
          <rect x="0" y="140" width="200" height="20" fill={C.black} />
          <rect x="65" y="60" width="30" height="80" rx="6" fill={C.white} stroke={C.black} strokeWidth="3" />
          <rect x="105" y="60" width="30" height="80" rx="6" fill={C.white} stroke={C.black} strokeWidth="3" />
          <polygon points="65,140 80,110 95,140" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <polygon points="105,140 120,110 135,140" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <line x1="100" y1="170" x2="100" y2="195" stroke={C.white} strokeWidth="4" />
          <polygon points="92,188 100,200 108,188" fill={C.white} />
        </svg>
      );
    case "fri-tib-raises":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.yellow} />
          <rect x="160" y="0" width="40" height="200" fill={C.black} />
          <line x1="160" y1="0" x2="160" y2="200" stroke={C.black} strokeWidth="3" />
          <circle cx="80" cy="60" r="14" fill={C.red} stroke={C.black} strokeWidth="3" />
          <line x1="80" y1="74" x2="80" y2="130" stroke={C.black} strokeWidth="4" />
          <line x1="80" y1="130" x2="60" y2="180" stroke={C.black} strokeWidth="3" />
          <line x1="80" y1="130" x2="100" y2="180" stroke={C.black} strokeWidth="3" />
          <line x1="80" y1="100" x2="150" y2="85" stroke={C.black} strokeWidth="3" />
          <polygon points="55,175 65,190 50,190" fill={C.blue} stroke={C.black} strokeWidth="2" />
          <polygon points="95,175 105,190 90,190" fill={C.blue} stroke={C.black} strokeWidth="2" />
          <polygon points="48,185 55,175 62,185" fill={C.blue} />
          <polygon points="88,185 95,175 102,185" fill={C.blue} />
        </svg>
      );
    case "fri-sl-balance":
      return (
        <svg {...common}>
          <rect width="200" height="100" fill={C.white} />
          <rect x="0" y="100" width="200" height="100" fill={C.blue} />
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
    case "fri-band-hip-march-corr":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.green} />
          <rect x="20" y="120" width="24" height="70" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="55" y="100" width="24" height="90" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="90" y="80" width="24" height="110" fill={C.white} stroke={C.black} strokeWidth="2" />
          <rect x="125" y="60" width="24" height="130" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          <rect x="160" y="40" width="24" height="150" fill={C.white} stroke={C.black} strokeWidth="2" />
          <ellipse cx="32" cy="115" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="67" cy="95" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="102" cy="75" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="137" cy="55" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
          <ellipse cx="172" cy="35" rx="15" ry="8" fill={C.red} stroke={C.black} strokeWidth="2" />
        </svg>
      );
    case "fri-adduction-raises":
      return (
        <svg {...common}>
          <rect width="200" height="80" fill={C.white} />
          <rect x="0" y="80" width="200" height="120" fill={C.orange} />
          <line x1="0" y1="80" x2="200" y2="80" stroke={C.black} strokeWidth="3" />
          <line x1="30" y1="130" x2="170" y2="130" stroke={C.black} strokeWidth="3" />
          <line x1="30" y1="130" x2="30" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="170" y1="130" x2="170" y2="100" stroke={C.black} strokeWidth="3" />
          <polygon points="162,105 170,90 178,105" fill={C.black} />
          <circle cx="100" cy="50" r="24" fill={C.yellow} stroke={C.black} strokeWidth="3" />
        </svg>
      );
    case "fri-lateral-band-walk-corr":
      return (
        <svg {...common}>
          <rect width="200" height="200" fill={C.yellow} />
          <rect x="0" y="170" width="200" height="30" fill={C.black} />
          <line x1="20" y1="120" x2="180" y2="120" stroke={C.red} strokeWidth="6" />
          <circle cx="40" cy="120" r="16" fill={C.white} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="120" r="16" fill={C.blue} stroke={C.black} strokeWidth="3" />
          <circle cx="160" cy="120" r="16" fill={C.white} stroke={C.black} strokeWidth="3" />
          <polygon points="175,90 190,105 175,120" fill={C.black} />
          <polygon points="25,90 10,105 25,120" fill={C.black} />
          <line x1="40" y1="136" x2="40" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="100" y1="136" x2="100" y2="170" stroke={C.black} strokeWidth="3" />
          <line x1="160" y1="136" x2="160" y2="170" stroke={C.black} strokeWidth="3" />
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
export default function FridayWorkoutPage() {
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
                ← Previous
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
                Next →
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
                Done →
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
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>Friday</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: "2px 0 0", fontFamily }}>Lower Strength B</p>
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
            const sectionExercises = EXERCISES.map((e, i) => ({ e, i })).filter(({ e }) => e.section === s);
            const firstIncomplete = sectionExercises.find(({ e }) => !isExDone(e));
            const target = firstIncomplete ? firstIncomplete.i : sectionExercises[0]?.i ?? 0;
            return (
              <button
                key={s}
                onClick={() => { setFocusIdx(target); setShowTip(false); }}
                style={{
                  padding: "5px 12px", borderRadius: 999,
                  border: `3px solid ${C.black}`,
                  background: done ? C.green : C.white,
                  color: done ? C.white : C.black,
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: 0.5, fontFamily, cursor: "pointer",
                }}
              >
                {SECTION_NAMES[s]}
              </button>
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
          WORKOUT COMPLETE — YOU CRUSHED IT
        </div>
      )}
    </div>
  );
}
