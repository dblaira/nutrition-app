"use client";

import { useState, useEffect } from "react";
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

/* ───────────────────────── DAY CONFIGS ───────────────────────── */
interface DayConfig {
  key: string;
  label: string;
  type: string;
  subtitle: string;
  sections: string[];
  storageKey: string | null;
  accent: string;
}

const DAYS: DayConfig[] = [
  { key: "sunday", label: "Sunday", type: "Long Run", subtitle: "10mi Zone 2 + Recovery", sections: ["Activation", "Run", "Recovery"], storageKey: "optimism-pop-sunday-v1", accent: C.orange },
  { key: "monday", label: "Monday", type: "Cross-Train + Upper A", subtitle: "Bike + Push/Pull Complex", sections: ["Cardio", "Complex 1", "Complex 2", "Finishers"], storageKey: "optimism-pop-monday-v1", accent: C.blue },
  { key: "tuesday", label: "Tuesday", type: "Lower Strength A", subtitle: "Squats · RDLs · Rotations", sections: ["Warm-Up", "Main Strength", "Accessories"], storageKey: "optimism-pop-tuesday-v1", accent: C.red },
  { key: "wednesday", label: "Wednesday", type: "Cross-Train + Upper B", subtitle: "Bike/Run + Push/Pull", sections: ["Cardio", "Push/Pull A", "Push/Pull B", "Finishers"], storageKey: "optimism-pop-wednesday-v1", accent: C.teal },
  { key: "thursday", label: "Thursday", type: "Run Skill Day", subtitle: "Drills + Zone 2 + Recovery", sections: ["Activation", "Drills", "Run", "Recovery"], storageKey: "optimism-pop-v1", accent: C.yellow },
  { key: "friday", label: "Friday", type: "Lower Strength B", subtitle: "Goblet Squat · SL RDL · Correctives", sections: ["Warm-Up", "Group 1", "Group 2", "Correctives"], storageKey: "optimism-pop-friday-v1", accent: C.green },
  { key: "saturday", label: "Saturday", type: "Rest Day", subtitle: "Recovery & Restoration", sections: [], storageKey: null, accent: C.white },
];

const WEEK_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

/* ───────────────────────── HELPERS ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

function getTodayIndex(): number {
  return new Date().getDay();
}

/* ───────────────────────── MAIN ───────────────────────── */
export default function WorkoutsLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    const s: Record<string, boolean> = {};
    DAYS.forEach((d) => {
      if (d.storageKey) {
        try {
          const raw = localStorage.getItem(d.storageKey);
          if (raw) {
            const checks = JSON.parse(raw);
            if (Object.keys(checks).length > 0) {
              s[d.key] = true;
            }
          }
        } catch {}
      }
    });
    setStarted(s);
  }, []);

  const todayIdx = getTodayIndex();
  const todayDay = DAYS[todayIdx];

  if (!mounted) {
    return <div style={{ background: C.yellow, minHeight: "100vh" }} />;
  }

  return (
    <div style={{ background: C.yellow, minHeight: "100vh", fontFamily, paddingBottom: 40 }}>
      {/* ── HEADER ── */}
      <header style={{ padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: C.black, margin: 0, fontFamily, letterSpacing: -0.5 }}>Training Week</h1>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.black, margin: "4px 0 0", fontFamily, opacity: 0.6 }}>OC Marathon Program</p>
          </div>
          <div style={{
            background: C.black, borderRadius: 999, padding: "6px 14px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.yellow, fontFamily, lineHeight: 1 }}>{daysToRace()}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: C.white, fontFamily, letterSpacing: 1, textTransform: "uppercase" }}>DAYS TO RACE</span>
          </div>
        </div>

        {/* ── WEEK STRIP ── */}
        <div style={{
          display: "flex", gap: 6, marginTop: 16, justifyContent: "center",
          background: C.white, borderRadius: 999, padding: "8px 12px",
          border: `3px solid ${C.black}`,
        }}>
          {WEEK_LETTERS.map((letter, i) => {
            const isToday = i === todayIdx;
            const isRest = i === 6;
            const hasStarted = started[DAYS[i].key];
            return (
              <div
                key={i}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, fontFamily,
                  background: isToday ? C.red : hasStarted ? C.green : "transparent",
                  color: isToday || hasStarted ? C.white : isRest ? C.black + "40" : C.black,
                  border: isToday ? `3px solid ${C.black}` : isRest ? `2px dashed ${C.black}30` : `2px solid transparent`,
                  transition: "all 0.2s",
                }}
              >
                {hasStarted && !isToday ? "\u2713" : letter}
              </div>
            );
          })}
        </div>
      </header>

      {/* ── TODAY CARD (HERO) ── */}
      <div style={{ padding: "0 12px" }}>
        <Link href={`/workouts/${todayDay.key}`} style={{ textDecoration: "none" }}>
          <div style={{
            background: C.black, borderRadius: 18, padding: "24px 20px",
            border: `4px solid ${C.black}`, position: "relative", overflow: "hidden",
            marginBottom: 12, cursor: "pointer",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: todayDay.accent, opacity: 0.15 }} />
            <div style={{ position: "absolute", right: 20, bottom: -20, width: 80, height: 80, borderRadius: "50%", background: C.yellow, opacity: 0.08 }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.yellow, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontFamily }}>
                TODAY
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: C.white, margin: "0 0 4px", fontFamily }}>{todayDay.label}</h2>
              <p style={{ fontSize: 18, fontWeight: 700, color: C.white, margin: "0 0 4px", fontFamily, opacity: 0.9 }}>{todayDay.type}</p>
              <p style={{ fontSize: 13, color: C.white, margin: 0, fontFamily, opacity: 0.5 }}>{todayDay.subtitle}</p>

              {todayDay.sections.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                  {todayDay.sections.map((sec) => (
                    <span key={sec} style={{
                      padding: "4px 10px", borderRadius: 999,
                      background: C.white + "18", color: C.white,
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 0.5, fontFamily,
                    }}>
                      {sec}
                    </span>
                  ))}
                </div>
              )}

              <div style={{
                marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.yellow, fontFamily }}>
                  {started[todayDay.key] ? "Continue workout" : "Start workout"} &rarr;
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* ── OTHER DAY CARDS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAYS.filter((_, i) => i !== todayIdx).map((day) => {
            const isRest = day.key === "saturday";
            return (
              <Link key={day.key} href={`/workouts/${day.key}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: C.white, borderRadius: 14,
                  border: `3px solid ${C.black}`, padding: "14px 16px",
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "transform 0.1s",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: isRest ? C.black + "20" : day.accent,
                        border: `2px solid ${C.black}`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.black, fontFamily }}>{day.label}</span>
                      {started[day.key] && (
                        <span style={{
                          background: C.green, color: C.white,
                          fontSize: 9, fontWeight: 700, padding: "2px 8px",
                          borderRadius: 999, textTransform: "uppercase", letterSpacing: 0.5,
                        }}>
                          Started
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.black, margin: 0, fontFamily, opacity: 0.7 }}>{day.type}</p>
                    <p style={{ fontSize: 11, color: C.black, margin: "2px 0 0", fontFamily, opacity: 0.4 }}>{day.subtitle}</p>
                  </div>
                  <div style={{ fontSize: 20, color: C.black, fontWeight: 700, marginLeft: 12, opacity: 0.3 }}>&rarr;</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
