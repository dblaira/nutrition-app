"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Lightbulb, StickyNote, Trophy } from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  tip?: string;
}

interface Section {
  name: string;
  note?: string;
  exercises: Exercise[];
}

interface DayPlan {
  label: string;
  title: string;
  sections: Section[];
}

interface CheckState {
  [dayLabel: string]: {
    sets: { [exerciseKey: string]: boolean[] };
    notes: string;
    collapsedSections: { [sectionName: string]: boolean };
  };
}

// ─── Workout Data ────────────────────────────────────────────────────────────

const PRE_RUN_ACTIVATION: Exercise[] = [
  { name: "Knee to Wall Dorsiflexion Rocks", sets: 1, reps: "10 per side", tip: "Drive knee forward over toes toward wall, keep heel down" },
  { name: "Ankle Circles", sets: 1, reps: "10 each direction per side" },
  { name: "Eversion Isometric Hold", sets: 2, reps: "15 sec", tip: "Press outside of foot against wall, targets peroneal muscles" },
  { name: "Short Foot Holds", sets: 2, reps: "10 sec each side", tip: "Press big toe, little toe, heel into ground, lift arch WITHOUT curling toes" },
  { name: "Standing Hip Flexor March Hold", sets: 2, reps: "10 sec", tip: "Drive knee to hip height, keep pelvis level" },
  { name: "Side Lying Adduction Raises", sets: 1, reps: "8 each side", tip: "Top leg crossed over, lift bottom leg up" },
  { name: "Single Leg Balance", sets: 2, reps: "20 sec each side" },
  { name: "Single Leg RDL Reach (bodyweight)", sets: 1, reps: "5 each side, slow" },
];

const WORKOUT_DAYS: DayPlan[] = [
  {
    label: "Sun",
    title: "10mi Run, Zone 2 + Pre-Run Activation + Post-Run Recovery",
    sections: [
      {
        name: "Pre-Run Activation",
        note: "8-10 min",
        exercises: [...PRE_RUN_ACTIVATION],
      },
      {
        name: "Main Run",
        exercises: [
          { name: "Zone 2 Run", sets: 1, reps: "10 miles", tip: "First mile at Zone 1, then stay in Zone 2 for all 10" },
        ],
      },
      {
        name: "Post-Run Recovery",
        exercises: [
          { name: "Cooldown Walk", sets: 1, reps: "3-5 minutes" },
          { name: "Foam Roll: Quads, Calves, Glutes, IT Band", sets: 1, reps: "complete" },
          { name: "Static Stretch: Hip Flexor, Calf, Adductor", sets: 1, reps: "complete" },
        ],
      },
    ],
  },
  {
    label: "Mon",
    title: "Zone 2 Bike 60min + Upper Strength A (Pull/Push)",
    sections: [
      {
        name: "Zone 2 Cardio",
        exercises: [
          { name: "Zone 2 Bike", sets: 1, reps: "60 minutes" },
        ],
      },
      {
        name: "Complex 1 — Pull then Push",
        note: "30 sec break between rounds",
        exercises: [
          { name: "Rows (your choice)", sets: 4, reps: "12" },
          { name: "Bench Press (bar or DB)", sets: 4, reps: "12" },
          { name: "Crunches", sets: 4, reps: "20" },
        ],
      },
      {
        name: "Complex 2 — Pull/Push",
        note: "30 sec break between rounds",
        exercises: [
          { name: "Lat Pulldowns", sets: 4, reps: "10" },
          { name: "Shoulder Press", sets: 4, reps: "10" },
          { name: "Plank Squeeze", sets: 4, reps: "10 sec hold" },
        ],
      },
      {
        name: "Finisher",
        exercises: [
          { name: "Max Time Dead Hang", sets: 1, reps: "max hold" },
          { name: "Chest Stretch", sets: 1, reps: "30-45 sec" },
          { name: "Leg Foam Roll", sets: 1, reps: "3 minutes" },
        ],
      },
    ],
  },
  {
    label: "Tue",
    title: "Lower Strength A — Main Lower Day + Correctives",
    sections: [
      {
        name: "Warm-Up / Activation",
        note: "5 min",
        exercises: [
          { name: "Knee to Wall Dorsiflexion Rocks", sets: 1, reps: "10 per side" },
          { name: "Ankle Circles", sets: 1, reps: "10 each direction per side" },
          { name: "Standing Hip Flexor March Hold", sets: 2, reps: "10 sec" },
        ],
      },
      {
        name: "Main Strength",
        note: "Protect left lateral ankle and left hip/groin",
        exercises: [
          { name: "Sumo Squat (DB or Goblet)", sets: 3, reps: "12", tip: "Wide stance, toes out 30-45°, drive knees over toes, slow descent" },
          { name: "Reverse Lunges", sets: 3, reps: "10 each side", tip: "Step back not forward, keep torso upright" },
          { name: "Step Ups (moderate height)", sets: 3, reps: "10 each side", tip: "Drive through heel, don't push off back foot" },
          { name: "Romanian Deadlift (DB)", sets: 3, reps: "10", tip: "Hinge at hips, soft knees, weights close to legs" },
          { name: "Lateral Band Walks", sets: 3, reps: "15 each direction", tip: "Band around ankles, stay low in quarter squat" },
          { name: "Hanging Knees to Chest", sets: 3, reps: "8", tip: "Control movement, no swinging" },
        ],
      },
      {
        name: "Accessories & Correctives",
        exercises: [
          { name: "Calf Raises (slow)", sets: 3, reps: "15", tip: "Slow up AND down, full ROM" },
          { name: "Band Ankle Eversion", sets: 3, reps: "20 each side" },
          { name: "Band Hip Flexion March", sets: 3, reps: "12 each side" },
          { name: "Adductor Squeeze", sets: 2, reps: "20 sec hold" },
        ],
      },
    ],
  },
  {
    label: "Wed",
    title: "Zone 2 Cardio (Bike 60min OR Run 40min) + Upper Strength B",
    sections: [
      {
        name: "Cardio Option A — Bike",
        exercises: [
          { name: "Zone 2 Bike", sets: 1, reps: "60 minutes" },
        ],
      },
      {
        name: "Cardio Option B — Run",
        note: "Use pre-run warmup below if running",
        exercises: [
          { name: "Zone 2 Run", sets: 1, reps: "40 minutes" },
        ],
      },
      {
        name: "Pre-Run Warmup (only if running)",
        exercises: [...PRE_RUN_ACTIVATION],
      },
      {
        name: "Complex 1 — Isolation",
        note: "15 sec break between rounds",
        exercises: [
          { name: "Cable Tricep Extension", sets: 3, reps: "12" },
          { name: "Dumbbell Bicep Curls", sets: 3, reps: "12" },
          { name: "Floor Reverse Crunches", sets: 3, reps: "10", tip: "Lift hips by curling pelvis up, control lowering" },
        ],
      },
      {
        name: "Complex 2 — Unilateral Cable Work",
        note: "15 sec break, big staggered stance",
        exercises: [
          { name: "Single Arm Cable Push", sets: 3, reps: "10 each side" },
          { name: "Single Arm Cable Pull", sets: 3, reps: "10 each side" },
        ],
      },
      {
        name: "Finisher",
        exercises: [
          { name: "Max Time Dead Hang", sets: 1, reps: "max hold" },
          { name: "Chest Stretch", sets: 1, reps: "30-45 sec" },
          { name: "Leg Foam Roll", sets: 1, reps: "3 minutes" },
        ],
      },
    ],
  },
  {
    label: "Thu",
    title: "Run Skill Day — Drills + Zone 2 Run + Recovery",
    sections: [
      {
        name: "Pre-Run Activation",
        note: "8-10 min — same ankle + hip routine",
        exercises: [...PRE_RUN_ACTIVATION],
      },
      {
        name: "Skill Warm-Up Drills",
        note: "5-6 min total, walk back between sets",
        exercises: [
          { name: "A Skip", sets: 2, reps: "20 meters", tip: "Easy rhythm, drive knee up with quick hop, relaxed" },
          { name: "B Skip", sets: 2, reps: "20 meters", tip: "Smooth knee drive, DO NOT reach, leg extends naturally then pulls back under" },
          { name: "High Knees", sets: 2, reps: "10 seconds", tip: "Quick ground contacts, NOT max height, think \"hot coals\"" },
        ],
      },
      {
        name: "Main Run",
        exercises: [
          { name: "Zone 2 Easy Run", sets: 1, reps: "30-40 minutes total", tip: "Keep truly easy, conversation pace" },
        ],
      },
      {
        name: "Post-Run Recovery",
        note: "8-12 min",
        exercises: [
          { name: "Cooldown Walk", sets: 1, reps: "3-5 minutes" },
          { name: "Foam Roll: Quads 45s each + Calves 45s each", sets: 1, reps: "complete" },
          { name: "Static Holds: Hip Flexor 30-45s + Calf 30-45s", sets: 1, reps: "complete" },
        ],
      },
    ],
  },
  { label: "Fri", title: "Coming Soon", sections: [] },
  { label: "Sat", title: "Coming Soon", sections: [] },
];

const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const STORAGE_KEY = "workouts-check-state";

// ─── Resort Optimism Theme ──────────────────────────────────────────────────

const C = {
  goldTop: "#F2C744",
  goldMid: "#F7DC6F",
  sand: "#FAF0DB",
  cream: "#FFFDF5",
  cardWhite: "#FFFFFF",
  cardDark: "#2C2C2C",
  terracotta: "#D4654A",
  ocean: "#2B7FB5",
  gold: "#F2C744",
  green: "#27AE60",
  textDark: "#2C2C2C",
  textOnDark: "#FFFDF5",
  muted: "#8C7B6B",
  mutedOnDark: "#c4b8a8",
} as const;

const font = "var(--font-outfit), 'Avenir Next', 'Helvetica Neue', sans-serif";
const cardShadow = "0 4px 24px rgba(0,0,0,0.06)";
const cardRadius = "20px";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMarathonCountdown(): number {
  const raceDay = new Date("2026-05-03T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((raceDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getTodayDayIndex(): number {
  return new Date().getDay();
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function exerciseKey(sectionIdx: number, exerciseIdx: number): string {
  return `${sectionIdx}-${exerciseIdx}`;
}

function getInitialState(): CheckState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function getDayStats(day: DayPlan, dayState?: CheckState[string]) {
  let total = 0;
  let checked = 0;
  day.sections.forEach((section, si) => {
    section.exercises.forEach((ex, ei) => {
      total += ex.sets;
      if (dayState?.sets) {
        const key = exerciseKey(si, ei);
        const arr = dayState.sets[key];
        if (arr) {
          checked += arr.filter(Boolean).length;
        }
      }
    });
  });
  return { total, checked, pct: total === 0 ? 0 : Math.round((checked / total) * 100) };
}

function getSectionStats(section: Section, sectionIdx: number, dayState?: CheckState[string]) {
  let total = 0;
  let checked = 0;
  section.exercises.forEach((ex, ei) => {
    total += ex.sets;
    if (dayState?.sets) {
      const key = exerciseKey(sectionIdx, ei);
      const arr = dayState.sets[key];
      if (arr) {
        checked += arr.filter(Boolean).length;
      }
    }
  });
  return { total, checked };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex);
  const [state, setState] = useState<CheckState>(getInitialState);
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentDay = WORKOUT_DAYS[selectedDay];
  const dayKey = currentDay.label;
  const dayState = state[dayKey];

  const toggleSet = useCallback((sectionIdx: number, exerciseIdx: number, setIdx: number) => {
    setState((prev) => {
      const dk = WORKOUT_DAYS[selectedDay].label;
      const dayData = prev[dk] || { sets: {}, notes: "", collapsedSections: {} };
      const key = exerciseKey(sectionIdx, exerciseIdx);
      const exercise = WORKOUT_DAYS[selectedDay].sections[sectionIdx].exercises[exerciseIdx];
      const current = dayData.sets[key] || Array(exercise.sets).fill(false);
      const updated = [...current];
      updated[setIdx] = !updated[setIdx];
      return {
        ...prev,
        [dk]: {
          ...dayData,
          sets: { ...dayData.sets, [key]: updated },
        },
      };
    });
  }, [selectedDay]);

  const toggleSection = useCallback((sectionName: string) => {
    setState((prev) => {
      const dk = WORKOUT_DAYS[selectedDay].label;
      const dayData = prev[dk] || { sets: {}, notes: "", collapsedSections: {} };
      return {
        ...prev,
        [dk]: {
          ...dayData,
          collapsedSections: {
            ...dayData.collapsedSections,
            [sectionName]: !dayData.collapsedSections?.[sectionName],
          },
        },
      };
    });
  }, [selectedDay]);

  const toggleTip = useCallback((key: string) => {
    setExpandedTips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const setNotes = useCallback((value: string) => {
    setState((prev) => {
      const dk = WORKOUT_DAYS[selectedDay].label;
      const dayData = prev[dk] || { sets: {}, notes: "", collapsedSections: {} };
      return {
        ...prev,
        [dk]: { ...dayData, notes: value },
      };
    });
  }, [selectedDay]);

  const dayStats = getDayStats(currentDay, dayState);
  const daysRemaining = getMarathonCountdown();
  const weeksRemaining = Math.floor(daysRemaining / 7);
  const isComingSoon = currentDay.sections.length === 0;

  return (
    <div
      style={{
        fontFamily: font,
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.goldTop} 0%, ${C.goldMid} 20%, ${C.sand} 50%, ${C.cream} 100%)`,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{ padding: "24px 20px 0" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/"
                style={{
                  color: C.textDark,
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.15s",
                  backgroundColor: "rgba(255,255,255,0.5)",
                }}
              >
                <ArrowLeft size={22} />
              </Link>
              <div>
                <h1 style={{ fontFamily: font, fontSize: "28px", fontWeight: 800, color: C.textDark, margin: 0, letterSpacing: "-0.02em" }}>
                  Optimism.
                </h1>
                <p style={{ fontFamily: font, fontSize: "15px", color: C.muted, margin: "2px 0 0" }}>
                  {getGreeting()}, Adam
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: font, fontSize: "13px", fontWeight: 700, color: C.terracotta, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                OC Marathon
              </div>
              <div style={{ fontFamily: font, fontSize: "36px", fontWeight: 800, color: C.textDark, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {daysRemaining}
              </div>
              <div style={{ fontSize: "13px", color: C.muted }}>
                days ({weeksRemaining}w)
              </div>
            </div>
          </div>

          {/* Day Tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "16px" }}>
            {WORKOUT_DAYS.map((day, idx) => {
              const stats = getDayStats(day, state[day.label]);
              const isToday = idx === getTodayDayIndex();
              const isSelected = idx === selectedDay;
              return (
                <button
                  key={day.label}
                  onClick={() => setSelectedDay(idx)}
                  style={{
                    fontFamily: font,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "52px",
                    minHeight: "48px",
                    padding: "8px 14px 10px",
                    borderRadius: "9999px",
                    fontSize: "16px",
                    fontWeight: isSelected ? 700 : 500,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor: isSelected ? C.terracotta : "rgba(255,255,255,0.55)",
                    color: isSelected ? "#ffffff" : C.textDark,
                    boxShadow: isSelected ? "0 4px 16px rgba(212,101,74,0.35)" : "none",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "16px" }}>{day.label}</span>
                  {/* Progress dot */}
                  <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
                    {day.sections.length > 0 ? (
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "9999px",
                          backgroundColor: stats.pct === 100
                            ? C.green
                            : stats.pct > 0
                              ? (isSelected ? "rgba(255,255,255,0.7)" : C.terracotta)
                              : (isSelected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.12)"),
                          transition: "all 0.3s",
                        }}
                      />
                    ) : (
                      <div style={{ width: "6px", height: "6px" }} />
                    )}
                  </div>
                  {isToday && !isSelected && (
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "9999px",
                        backgroundColor: C.terracotta,
                        marginTop: "1px",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "0 16px 120px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Day Title + Progress Card */}
          <div
            style={{
              backgroundColor: C.cardWhite,
              borderRadius: cardRadius,
              boxShadow: cardShadow,
              padding: "24px",
            }}
          >
            <h2 style={{ fontFamily: font, fontWeight: 800, fontSize: "24px", color: C.textDark, margin: 0, letterSpacing: "-0.02em" }}>
              {FULL_DAY_NAMES[selectedDay]}
            </h2>
            <p style={{ fontFamily: font, fontSize: "15px", color: C.muted, margin: "4px 0 0" }}>
              {currentDay.title}
            </p>
            {!isComingSoon && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", marginBottom: "8px" }}>
                  <span style={{ color: C.muted, fontWeight: 500 }}>Progress</span>
                  <span style={{ fontWeight: 700, color: C.terracotta }}>
                    {dayStats.checked}/{dayStats.total} sets — {dayStats.pct}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", borderRadius: "4px", backgroundColor: C.sand, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "4px",
                      transition: "width 0.5s ease-out",
                      width: `${dayStats.pct}%`,
                      backgroundColor: dayStats.pct === 100 ? C.green : C.terracotta,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Coming Soon */}
          {isComingSoon && (
            <div
              style={{
                backgroundColor: C.cardWhite,
                borderRadius: cardRadius,
                boxShadow: cardShadow,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏖️</div>
              <p style={{ fontFamily: font, fontSize: "20px", fontWeight: 700, color: C.textDark, letterSpacing: "-0.02em" }}>Coming soon</p>
              <p style={{ fontFamily: font, fontSize: "15px", color: C.muted, marginTop: "4px" }}>
                This day&apos;s workout will be added as your trainer sends it.
              </p>
            </div>
          )}

          {/* ── Sections ──────────────────────────────────────────────────────── */}
          {!isComingSoon && currentDay.sections.map((section, sectionIdx) => {
            const isCollapsed = dayState?.collapsedSections?.[section.name] ?? false;
            const sectionStats = getSectionStats(section, sectionIdx, dayState);
            const sectionComplete = sectionStats.checked === sectionStats.total && sectionStats.total > 0;
            const borderColor = sectionComplete ? C.green : C.terracotta;
            const isDarkSection = sectionIdx % 2 === 1;
            const cardBg = isDarkSection ? C.cardDark : C.cardWhite;
            const textColor = isDarkSection ? C.textOnDark : C.textDark;
            const mutedColor = isDarkSection ? C.mutedOnDark : C.muted;

            return (
              <div
                key={section.name}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: cardRadius,
                  boxShadow: cardShadow,
                  borderLeft: `4px solid ${borderColor}`,
                  overflow: "hidden",
                }}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.name)}
                  style={{
                    fontFamily: font,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "20px 24px",
                    minHeight: "44px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 0.15s",
                  }}
                >
                  <div style={{ color: mutedColor, flexShrink: 0 }}>
                    {isCollapsed ? <ChevronRight size={22} /> : <ChevronDown size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: "22px", color: textColor, margin: 0, letterSpacing: "-0.02em" }}>
                        {section.name}
                      </h3>
                      {sectionComplete && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: "12px",
                            padding: "3px 10px",
                            borderRadius: "9999px",
                            backgroundColor: `${C.green}22`,
                            color: C.green,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Complete
                        </span>
                      )}
                    </div>
                    {section.note && (
                      <p style={{ fontFamily: font, fontSize: "14px", color: mutedColor, margin: "4px 0 0" }}>{section.note}</p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: isDarkSection ? C.gold : C.terracotta,
                      flexShrink: 0,
                      fontWeight: 700,
                      backgroundColor: isDarkSection ? "rgba(242,199,68,0.15)" : "rgba(212,101,74,0.1)",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    {sectionStats.checked}/{sectionStats.total}
                  </span>
                </button>

                {/* Exercises */}
                {!isCollapsed && (
                  <div style={{ padding: "0 24px 20px" }}>
                    {section.exercises.map((exercise, exerciseIdx) => {
                      const key = exerciseKey(sectionIdx, exerciseIdx);
                      const checks = dayState?.sets?.[key] || Array(exercise.sets).fill(false);
                      const allDone = checks.every(Boolean);
                      const tipKey = `${dayKey}-${key}`;
                      const tipExpanded = expandedTips.has(tipKey);
                      const isAltRow = exerciseIdx % 2 === 1;

                      // For dark sections, alt rows are lighter; for light sections, alt rows are dark
                      const rowBg = allDone
                        ? `${C.green}14`
                        : isDarkSection
                          ? (isAltRow ? "rgba(255,255,255,0.06)" : "transparent")
                          : (isAltRow ? C.cardDark : "transparent");
                      const rowText = allDone
                        ? C.green
                        : (isDarkSection
                          ? (isAltRow ? C.textOnDark : C.textOnDark)
                          : (isAltRow ? C.textOnDark : C.textDark));
                      const rowMuted = isDarkSection
                        ? C.mutedOnDark
                        : (isAltRow ? C.mutedOnDark : C.muted);

                      return (
                        <div
                          key={key}
                          style={{
                            borderRadius: "14px",
                            padding: "16px 16px",
                            marginBottom: "8px",
                            transition: "background-color 0.15s",
                            backgroundColor: rowBg,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  fontFamily: font,
                                  fontWeight: 600,
                                  fontSize: "18px",
                                  margin: 0,
                                  color: rowText,
                                  textDecoration: allDone ? "line-through" : "none",
                                  textDecorationColor: allDone ? `${C.green}80` : undefined,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {exercise.name}
                              </p>
                              <p
                                style={{
                                  fontFamily: font,
                                  fontSize: "15px",
                                  color: rowMuted,
                                  margin: "3px 0 0",
                                }}
                              >
                                {exercise.sets > 1 ? `${exercise.sets} × ${exercise.reps}` : exercise.reps}
                              </p>
                            </div>

                            {/* Set Buttons */}
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              {Array.from({ length: exercise.sets }, (_, setIdx) => {
                                const isChecked = checks[setIdx];
                                const btnBg = isChecked
                                  ? C.terracotta
                                  : (isAltRow && !isDarkSection)
                                    ? "rgba(255,255,255,0.12)"
                                    : C.sand;
                                const btnColor = isChecked
                                  ? "#ffffff"
                                  : (isAltRow && !isDarkSection)
                                    ? C.mutedOnDark
                                    : C.textDark;
                                const btnBorder = isChecked
                                  ? "none"
                                  : (isAltRow && !isDarkSection)
                                    ? "1.5px solid rgba(255,255,255,0.15)"
                                    : (isDarkSection ? "1.5px solid rgba(255,255,255,0.12)" : `1.5px solid ${C.sand}`);
                                return (
                                  <button
                                    key={setIdx}
                                    onClick={() => toggleSet(sectionIdx, exerciseIdx, setIdx)}
                                    style={{
                                      fontFamily: font,
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "10px",
                                      fontSize: "18px",
                                      fontWeight: 700,
                                      border: btnBorder,
                                      cursor: "pointer",
                                      transition: "all 0.15s",
                                      backgroundColor: btnBg,
                                      color: btnColor,
                                      boxShadow: isChecked ? "0 2px 8px rgba(212,101,74,0.3)" : "none",
                                    }}
                                    title={`Set ${setIdx + 1}`}
                                  >
                                    {isChecked ? "✓" : setIdx + 1}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Tip */}
                          {exercise.tip && (
                            <div style={{ marginTop: "10px" }}>
                              <button
                                onClick={() => toggleTip(tipKey)}
                                style={{
                                  fontFamily: font,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  fontSize: "15px",
                                  color: C.ocean,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  fontWeight: 600,
                                  minHeight: "44px",
                                  transition: "opacity 0.15s",
                                }}
                              >
                                <Lightbulb size={16} />
                                <span>{tipExpanded ? "Hide tip" : "Coaching cue"}</span>
                              </button>
                              {tipExpanded && (
                                <p
                                  style={{
                                    fontFamily: font,
                                    fontSize: "15px",
                                    fontStyle: "italic",
                                    color: rowMuted,
                                    margin: "4px 0 0 22px",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {exercise.tip}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Session Notes ──────────────────────────────────────────────────── */}
          {!isComingSoon && (
            <div
              style={{
                backgroundColor: C.cardWhite,
                borderRadius: cardRadius,
                boxShadow: cardShadow,
                padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: C.muted, marginBottom: "12px" }}>
                <StickyNote size={18} />
                <span style={{ fontFamily: font, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>Session Notes</span>
              </div>
              <textarea
                style={{
                  fontFamily: font,
                  width: "100%",
                  backgroundColor: C.sand,
                  border: "2px solid transparent",
                  borderRadius: "16px",
                  padding: "16px",
                  fontSize: "16px",
                  color: C.textDark,
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                rows={3}
                placeholder="How did today's session feel? Any pain, energy level, weight used..."
                value={dayState?.notes || ""}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.terracotta; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
              />
            </div>
          )}

          {/* ── Week Overview ──────────────────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: C.cardWhite,
              borderRadius: cardRadius,
              boxShadow: cardShadow,
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Trophy size={20} color={C.terracotta} />
              <h3 style={{ fontFamily: font, fontWeight: 700, fontSize: "20px", color: C.textDark, margin: 0, letterSpacing: "-0.02em" }}>
                Week Overview
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {WORKOUT_DAYS.map((day, idx) => {
                const stats = getDayStats(day, state[day.label]);
                const isToday = idx === getTodayDayIndex();
                const noWorkout = day.sections.length === 0;
                const isSelected = idx === selectedDay;
                const isPast = idx < getTodayDayIndex();

                // Square color logic
                let squareBg = `${C.sand}66`; // future: sand 40% opacity
                if (noWorkout) {
                  squareBg = `${C.sand}66`;
                } else if (stats.pct === 100) {
                  squareBg = C.gold;
                } else if (isToday) {
                  squareBg = C.terracotta;
                } else if (isPast && stats.pct > 0) {
                  squareBg = `${C.gold}88`;
                }

                const squareText = (isToday && stats.pct < 100) || stats.pct === 100
                  ? "#ffffff"
                  : C.textDark;

                return (
                  <button
                    key={day.label}
                    onClick={() => setSelectedDay(idx)}
                    style={{
                      fontFamily: font,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 4px",
                      borderRadius: "12px",
                      border: isSelected ? `2px solid ${C.terracotta}` : "2px solid transparent",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: isToday ? 800 : 500,
                        color: isToday ? C.terracotta : C.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {day.label}
                    </span>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: squareBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s",
                      }}
                    >
                      {noWorkout ? (
                        <span style={{ fontSize: "14px", color: C.muted }}>—</span>
                      ) : (
                        <span style={{ fontSize: "13px", fontWeight: 800, color: squareText }}>
                          {stats.pct}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
