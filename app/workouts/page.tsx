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

// ─── Theme Colors ────────────────────────────────────────────────────────────

const C = {
  bg: "#ece5d8",
  cardLight: "#ffffff",
  cardDark: "#1a1a1a",
  textDark: "#1a1a1a",
  textOnDark: "#f0e8d8",
  muted: "#8a7e6e",
  mutedOnDark: "#a09080",
  accent: "#9b1b30",
  green: "#4a8c3f",
  border: "#d4cbbf",
  notesBg: "#faf8f4",
} as const;

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

const serif = "Georgia, 'Times New Roman', serif";

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
    <div style={{ backgroundColor: C.bg, fontFamily: serif, minHeight: "100vh" }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          backgroundColor: C.cardDark,
          borderBottom: `3px solid ${C.accent}`,
          padding: "1.25rem 1.5rem 0",
        }}
      >
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link
                href="/"
                style={{
                  color: C.textOnDark,
                  padding: "0.25rem",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.15s",
                }}
              >
                <ArrowLeft size={22} />
              </Link>
              <div>
                <h1 style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 700, color: C.textOnDark, margin: 0, letterSpacing: "-0.01em" }}>
                  Understood.
                </h1>
                <p style={{ fontFamily: serif, fontSize: "0.8rem", color: C.mutedOnDark, margin: "0.125rem 0 0", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Marathon Training Program
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: serif, fontSize: "2rem", fontWeight: 700, color: C.accent, lineHeight: 1 }}>
                {daysRemaining}
              </div>
              <div style={{ fontSize: "0.65rem", color: C.mutedOnDark, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.125rem" }}>
                days to race
              </div>
              <div style={{ fontSize: "0.65rem", color: C.mutedOnDark, letterSpacing: "0.04em" }}>
                ({weeksRemaining} weeks)
              </div>
            </div>
          </div>

          {/* Day Tabs inside header */}
          <div style={{ display: "flex", gap: "0.25rem", overflowX: "auto", paddingBottom: "0" }}>
            {WORKOUT_DAYS.map((day, idx) => {
              const stats = getDayStats(day, state[day.label]);
              const isToday = idx === getTodayDayIndex();
              const isSelected = idx === selectedDay;
              return (
                <button
                  key={day.label}
                  onClick={() => setSelectedDay(idx)}
                  style={{
                    fontFamily: serif,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "3.75rem",
                    padding: "0.5rem 0.75rem 0.625rem",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    fontSize: "0.8rem",
                    fontWeight: isSelected ? 700 : 500,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    backgroundColor: isSelected ? C.accent : "transparent",
                    color: isSelected ? "#ffffff" : C.mutedOnDark,
                  }}
                >
                  <span style={{ fontSize: "0.65rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {FULL_DAY_NAMES[idx].slice(0, 3)}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{day.label}</span>
                  {day.sections.length > 0 && (
                    <div style={{ width: "100%", marginTop: "0.25rem", height: "2px", borderRadius: "1px", backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "1px",
                          transition: "width 0.3s",
                          width: `${stats.pct}%`,
                          backgroundColor: isSelected ? "#ffffff" : C.accent,
                        }}
                      />
                    </div>
                  )}
                  {isToday && (
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "9999px",
                        marginTop: "0.2rem",
                        backgroundColor: isSelected ? "#ffffff" : C.accent,
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
      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "1.5rem 1rem 8rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Day Title + Progress Card */}
          <div
            style={{
              backgroundColor: C.cardLight,
              border: `1px solid ${C.border}`,
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
            }}
          >
            <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: "1.25rem", color: C.textDark, margin: 0 }}>
              {FULL_DAY_NAMES[selectedDay]}
            </h2>
            <p style={{ fontFamily: serif, fontSize: "0.875rem", color: C.muted, margin: "0.25rem 0 0" }}>
              {currentDay.title}
            </p>
            {!isComingSoon && (
              <div style={{ marginTop: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.375rem" }}>
                  <span style={{ color: C.muted }}>Progress</span>
                  <span style={{ fontWeight: 600, color: C.accent }}>
                    {dayStats.checked}/{dayStats.total} sets — {dayStats.pct}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", borderRadius: "3px", backgroundColor: "#e0d8cc", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "3px",
                      transition: "width 0.5s ease-out",
                      width: `${dayStats.pct}%`,
                      backgroundColor: dayStats.pct === 100 ? C.green : C.accent,
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
                backgroundColor: C.cardLight,
                border: `1px solid ${C.border}`,
                borderRadius: "0.75rem",
                padding: "3rem 1.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏗️</div>
              <p style={{ fontFamily: serif, fontSize: "1.125rem", color: C.muted }}>Coming soon</p>
              <p style={{ fontFamily: serif, fontSize: "0.875rem", color: C.muted, marginTop: "0.25rem" }}>
                This day&apos;s workout will be added as your trainer sends it.
              </p>
            </div>
          )}

          {/* ── Sections ──────────────────────────────────────────────────────── */}
          {!isComingSoon && currentDay.sections.map((section, sectionIdx) => {
            const isCollapsed = dayState?.collapsedSections?.[section.name] ?? false;
            const sectionStats = getSectionStats(section, sectionIdx, dayState);
            const sectionComplete = sectionStats.checked === sectionStats.total && sectionStats.total > 0;
            const borderColor = sectionComplete ? C.green : C.accent;

            return (
              <div
                key={section.name}
                style={{
                  backgroundColor: C.cardLight,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.name)}
                  style={{
                    fontFamily: serif,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem 1.25rem",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8f5ef"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{ color: C.muted }}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: "0.95rem", color: C.textDark, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {section.name}
                      </h3>
                      {sectionComplete && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: "0.65rem",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                            backgroundColor: `${C.green}20`,
                            color: C.green,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Complete
                        </span>
                      )}
                    </div>
                    {section.note && (
                      <p style={{ fontFamily: serif, fontSize: "0.75rem", color: C.muted, margin: "0.2rem 0 0" }}>{section.note}</p>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: C.muted, flexShrink: 0, fontWeight: 500 }}>
                    {sectionStats.checked}/{sectionStats.total}
                  </span>
                </button>

                {/* Exercises */}
                {!isCollapsed && (
                  <div style={{ padding: "0 1.25rem 1rem" }}>
                    {section.exercises.map((exercise, exerciseIdx) => {
                      const key = exerciseKey(sectionIdx, exerciseIdx);
                      const checks = dayState?.sets?.[key] || Array(exercise.sets).fill(false);
                      const allDone = checks.every(Boolean);
                      const tipKey = `${dayKey}-${key}`;
                      const tipExpanded = expandedTips.has(tipKey);
                      const isDarkRow = exerciseIdx % 2 === 1;

                      return (
                        <div
                          key={key}
                          style={{
                            borderRadius: "0.5rem",
                            padding: "0.75rem 0.875rem",
                            marginBottom: "0.375rem",
                            transition: "background-color 0.15s",
                            backgroundColor: allDone
                              ? `${C.green}12`
                              : isDarkRow
                                ? C.cardDark
                                : "transparent",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  fontFamily: serif,
                                  fontWeight: 500,
                                  fontSize: "0.875rem",
                                  margin: 0,
                                  color: allDone
                                    ? C.green
                                    : isDarkRow
                                      ? C.textOnDark
                                      : C.textDark,
                                  textDecoration: allDone ? "line-through" : "none",
                                  textDecorationColor: allDone ? `${C.green}60` : undefined,
                                }}
                              >
                                {exercise.name}
                              </p>
                              <p
                                style={{
                                  fontFamily: serif,
                                  fontSize: "0.75rem",
                                  color: isDarkRow ? C.mutedOnDark : C.muted,
                                  margin: "0.125rem 0 0",
                                }}
                              >
                                {exercise.sets > 1 ? `${exercise.sets} × ${exercise.reps}` : exercise.reps}
                              </p>
                            </div>

                            {/* Set Buttons */}
                            <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                              {Array.from({ length: exercise.sets }, (_, setIdx) => (
                                <button
                                  key={setIdx}
                                  onClick={() => toggleSet(sectionIdx, exerciseIdx, setIdx)}
                                  style={{
                                    fontFamily: serif,
                                    width: "2rem",
                                    height: "2rem",
                                    borderRadius: "0.375rem",
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    border: checks[setIdx] ? "none" : `1.5px solid ${isDarkRow ? "rgba(255,255,255,0.15)" : C.border}`,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    backgroundColor: checks[setIdx] ? C.accent : isDarkRow ? "rgba(255,255,255,0.07)" : "#f5f0e8",
                                    color: checks[setIdx] ? "#ffffff" : isDarkRow ? C.mutedOnDark : C.muted,
                                  }}
                                  title={`Set ${setIdx + 1}`}
                                >
                                  {checks[setIdx] ? "✓" : setIdx + 1}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tip */}
                          {exercise.tip && (
                            <div style={{ marginTop: "0.5rem" }}>
                              <button
                                onClick={() => toggleTip(tipKey)}
                                style={{
                                  fontFamily: serif,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.375rem",
                                  fontSize: "0.7rem",
                                  color: C.accent,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  transition: "opacity 0.15s",
                                }}
                              >
                                <Lightbulb size={12} />
                                <span>{tipExpanded ? "Hide tip" : "Coaching cue"}</span>
                              </button>
                              {tipExpanded && (
                                <p
                                  style={{
                                    fontFamily: serif,
                                    fontSize: "0.75rem",
                                    fontStyle: "italic",
                                    color: isDarkRow ? C.mutedOnDark : C.muted,
                                    margin: "0.375rem 0 0 1.125rem",
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
                backgroundColor: C.cardLight,
                border: `1px solid ${C.border}`,
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: C.muted, marginBottom: "0.625rem" }}>
                <StickyNote size={15} />
                <span style={{ fontFamily: serif, fontSize: "0.85rem", fontWeight: 600 }}>Session Notes</span>
              </div>
              <textarea
                style={{
                  fontFamily: serif,
                  width: "100%",
                  backgroundColor: C.notesBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  fontSize: "0.85rem",
                  color: C.textDark,
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                }}
                rows={3}
                placeholder="How did today's session feel? Any pain, energy level, weight used..."
                value={dayState?.notes || ""}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
              />
            </div>
          )}

          {/* ── Week Overview ──────────────────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: C.cardDark,
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Trophy size={17} color={C.accent} />
              <h3 style={{ fontFamily: serif, fontWeight: 600, fontSize: "0.95rem", color: C.textOnDark, margin: 0 }}>
                Week Overview
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.375rem" }}>
              {WORKOUT_DAYS.map((day, idx) => {
                const stats = getDayStats(day, state[day.label]);
                const isToday = idx === getTodayDayIndex();
                const noWorkout = day.sections.length === 0;
                const isSelected = idx === selectedDay;
                return (
                  <button
                    key={day.label}
                    onClick={() => setSelectedDay(idx)}
                    style={{
                      fontFamily: serif,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "0.5rem 0.25rem",
                      borderRadius: "0.5rem",
                      border: isSelected ? `1.5px solid ${C.accent}` : "1.5px solid transparent",
                      backgroundColor: isSelected ? "rgba(155, 27, 48, 0.12)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        marginBottom: "0.25rem",
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? C.textOnDark : C.mutedOnDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {day.label}
                    </span>
                    {noWorkout ? (
                      <div
                        style={{
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.7rem", color: C.mutedOnDark }}>—</span>
                      </div>
                    ) : (
                      <div style={{ position: "relative", width: "2rem", height: "2rem" }}>
                        <svg viewBox="0 0 36 36" style={{ width: "2rem", height: "2rem", transform: "rotate(-90deg)" }}>
                          <circle
                            cx="18" cy="18" r="15"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18" cy="18" r="15"
                            fill="none"
                            stroke={stats.pct === 100 ? C.green : C.accent}
                            strokeWidth="3"
                            strokeDasharray={`${stats.pct * 0.9425} 94.25`}
                            strokeLinecap="round"
                            style={{ transition: "all 0.5s" }}
                          />
                        </svg>
                        <span
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            color: stats.pct === 100 ? C.green : C.textOnDark,
                          }}
                        >
                          {stats.pct > 0 ? `${stats.pct}` : "0"}
                        </span>
                      </div>
                    )}
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
