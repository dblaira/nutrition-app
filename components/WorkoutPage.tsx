"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SetTimer from "./SetTimer";
import FormModal from "./FormModal";
import VoiceControl from "./VoiceControl";
import { parseTimeFromDetail, getSmartRestSeconds } from "@/lib/parse-time";

/* ───────────────────────── PALETTE ───────────────────────── */
export const C = {
  blue: "#0047AB",
  yellow: "#F5C518",
  red: "#CC2936",
  white: "#FFFFFF",
  black: "#1A1A1A",
  orange: "#E8751A",
  green: "#1B8C4E",
  teal: "#008080",
} as const;

export const fontFamily = `var(--font-outfit), 'Avenir Next', 'Helvetica Neue', sans-serif`;

/* ───────────────────────── TYPES ───────────────────────── */
export interface Exercise {
  id: string;
  name: string;
  section: string;
  sectionLabel: string;
  sets: number;
  detail: string;
  tip?: string;
  formUrl?: string;
  restSeconds?: number;
}

type CheckState = Record<string, boolean[]>;

interface WorkoutPageProps {
  exercises: Exercise[];
  sections: string[];
  sectionNames: Record<string, string>;
  storageKey: string;
  heights: number[];
  art: React.ComponentType<{ id: string }>;
  title: string;
  subtitle: string;
}

/* ───────────────────────── STORAGE ───────────────────────── */
function loadChecks(key: string): CheckState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveChecks(key: string, c: CheckState) {
  try {
    localStorage.setItem(key, JSON.stringify(c));
  } catch {}
}

/* ───────────────────────── WEIGHT STORAGE ───────────────────────── */
type WeightState = Record<string, number>;

function weightKey(storageKey: string): string {
  return `${storageKey}-weights`;
}

function loadWeights(storageKey: string): WeightState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(weightKey(storageKey));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWeights(storageKey: string, w: WeightState) {
  try {
    localStorage.setItem(weightKey(storageKey), JSON.stringify(w));
  } catch {}
}

function loadLastWeights(storageKey: string): WeightState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(weightKey(storageKey) + "-last");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/* ───────────────────────── NOTES STORAGE ───────────────────────── */
type NotesState = Record<string, string>;

function notesKey(storageKey: string): string {
  return `${storageKey}-notes`;
}

function loadNotes(storageKey: string): NotesState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(notesKey(storageKey));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(storageKey: string, n: NotesState) {
  try {
    localStorage.setItem(notesKey(storageKey), JSON.stringify(n));
  } catch {}
}

/* ───────────────────────── RACE COUNTDOWN ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function WorkoutPage({
  exercises,
  sections,
  sectionNames,
  storageKey,
  heights,
  art: Art,
  title,
  subtitle,
}: WorkoutPageProps) {
  const [checks, setChecks] = useState<CheckState>({});
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formModalUrl, setFormModalUrl] = useState<string | null>(null);
  const [weights, setWeights] = useState<WeightState>({});
  const [lastWeights, setLastWeights] = useState<WeightState>({});
  const [notes, setNotes] = useState<NotesState>({});

  useEffect(() => {
    setChecks(loadChecks(storageKey));
    setWeights(loadWeights(storageKey));
    setLastWeights(loadLastWeights(storageKey));
    setNotes(loadNotes(storageKey));
    setMounted(true);
  }, [storageKey]);

  const updateWeight = useCallback(
    (id: string, value: number) => {
      setWeights((prev) => {
        const next = { ...prev, [id]: value };
        saveWeights(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const updateNote = useCallback(
    (id: string, value: string) => {
      setNotes((prev) => {
        const next = { ...prev, [id]: value };
        saveNotes(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const toggle = useCallback(
    (id: string, setIdx: number) => {
      setChecks((prev) => {
        const arr = [...(prev[id] || [])];
        arr[setIdx] = !arr[setIdx];
        const next = { ...prev, [id]: arr };
        saveChecks(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const isSetDone = (id: string, setIdx: number) =>
    !!(checks[id] && checks[id][setIdx]);

  const isExDone = (ex: Exercise) => {
    const arr = checks[ex.id];
    if (!arr) return false;
    for (let i = 0; i < ex.sets; i++) if (!arr[i]) return false;
    return true;
  };

  const isSectionDone = (section: string) =>
    exercises.filter((e) => e.section === section).every(isExDone);

  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = exercises.reduce((s, e) => {
    let c = 0;
    for (let i = 0; i < e.sets; i++) if (isSetDone(e.id, i)) c++;
    return s + c;
  }, 0);
  const progress = totalSets > 0 ? doneSets / totalSets : 0;
  const allDone = progress >= 1;

  // Archive weights as "last session" when workout completes
  useEffect(() => {
    if (allDone && Object.keys(weights).length > 0) {
      try {
        localStorage.setItem(weightKey(storageKey) + "-last", JSON.stringify(weights));
      } catch {}
    }
  }, [allDone, weights, storageKey]);

  /* ── Masonry layout ── */
  const col1: number[] = [];
  const col2: number[] = [];
  let h1 = 0;
  let h2 = 0;
  exercises.forEach((_, i) => {
    if (h1 <= h2) {
      col1.push(i);
      h1 += heights[i % heights.length] + 12;
    } else {
      col2.push(i);
      h2 += heights[i % heights.length] + 12;
    }
  });

  if (!mounted) {
    return <div style={{ background: C.yellow, minHeight: "100vh" }} />;
  }

  /* ───── FOCUS MODE ───── */
  if (focusIdx !== null) {
    const ex = exercises[focusIdx];
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: C.white,
          zIndex: 100,
          fontFamily,
          overflow: "auto",
        }}
      >
        {/* Art area */}
        <div
          style={{
            position: "relative",
            height: "42vh",
            borderBottom: `4px solid ${C.black}`,
            overflow: "hidden",
          }}
        >
          <Art id={ex.id} />
          {/* Back button */}
          <button
            onClick={() => setFocusIdx(null)}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: C.white,
              border: `3px solid ${C.black}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 22,
              fontWeight: 800,
              color: C.black,
            }}
            aria-label="Back"
          >
            &#8592;
          </button>
          {/* Section pill + voice control */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <VoiceControl
              callbacks={{
                onDone: () => {
                  // Find first incomplete set and toggle it
                  for (let i = 0; i < ex.sets; i++) {
                    if (!isSetDone(ex.id, i)) {
                      toggle(ex.id, i);
                      break;
                    }
                  }
                },
                onNext: () => {
                  if (focusIdx !== null && focusIdx < exercises.length - 1) {
                    setFocusIdx(focusIdx + 1);
                  }
                },
                onPrev: () => {
                  if (focusIdx !== null && focusIdx > 0) {
                    setFocusIdx(focusIdx - 1);
                  }
                },
                onWeight: (lbs: number) => {
                  updateWeight(ex.id, lbs);
                },
                onNote: (text: string) => {
                  const current = notes[ex.id] || "";
                  const updated = current ? current + " | " + text : text;
                  updateNote(ex.id, updated);
                },
              }}
            />
            <div
              style={{
                background: C.black,
                color: C.yellow,
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontFamily,
              }}
            >
              {ex.sectionLabel}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 20px 120px" }}>
          <h2
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: C.black,
              margin: 0,
              fontFamily,
            }}
          >
            {ex.name}
          </h2>
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: C.black,
              margin: "6px 0 24px",
              fontFamily,
            }}
          >
            {ex.detail}
          </p>

          {/* Set buttons */}
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            {Array.from({ length: ex.sets }).map((_, si) => {
              const done = isSetDone(ex.id, si);
              return (
                <button
                  key={si}
                  onClick={() => toggle(ex.id, si)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    border: `3px solid ${C.black}`,
                    background: done ? C.red : C.yellow,
                    color: done ? C.white : C.black,
                    fontSize: done ? 28 : 18,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {done ? "\u2713" : `Set ${si + 1}`}
                </button>
              );
            })}
          </div>

          {/* ── Weight Input (Phase 5) ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              width: "100%",
            }}
          >
            <button
              onClick={() => {
                const current = weights[ex.id] || lastWeights[ex.id] || 0;
                if (current >= 5) updateWeight(ex.id, current - 5);
              }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                border: `3px solid ${C.black}`,
                background: C.white,
                fontSize: 28,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily,
                color: C.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              &minus;
            </button>
            <div
              style={{
                flex: 1,
                height: 56,
                borderRadius: 14,
                border: `3px solid ${C.black}`,
                background: weights[ex.id] ? C.yellow : C.white,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily,
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => {
                const input = prompt(
                  "Enter weight (lbs):",
                  String(weights[ex.id] || lastWeights[ex.id] || ""),
                );
                if (input !== null && !isNaN(Number(input)) && input.trim() !== "") {
                  updateWeight(ex.id, Number(input));
                }
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: C.black,
                  lineHeight: 1,
                }}
              >
                {weights[ex.id] || lastWeights[ex.id] || 0} lbs
              </span>
              {!weights[ex.id] && lastWeights[ex.id] && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.black,
                    opacity: 0.5,
                  }}
                >
                  Last session
                </span>
              )}
            </div>
            <button
              onClick={() => {
                const current = weights[ex.id] || lastWeights[ex.id] || 0;
                updateWeight(ex.id, current + 5);
              }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                border: `3px solid ${C.black}`,
                background: C.white,
                fontSize: 28,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily,
                color: C.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>

          {/* ── Notes — quality / completion comments ── */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.black,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
                fontFamily,
              }}
            >
              Notes
            </div>
            <textarea
              value={notes[ex.id] || ""}
              onChange={(e) => updateNote(ex.id, e.target.value)}
              placeholder="Quality, form cues, incomplete reps..."
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 14,
                border: `3px solid ${C.black}`,
                background: notes[ex.id] ? C.yellow : C.white,
                padding: "14px 16px",
                fontSize: 18,
                fontWeight: 600,
                fontFamily,
                color: C.black,
                resize: "vertical",
                outline: "none",
                lineHeight: 1.4,
              }}
            />
          </div>

          {/* ── Timer — auto-loaded for timed exercises (Phase 2) ── */}
          {(() => {
            const parsedTime = parseTimeFromDetail(ex.detail);
            if (!parsedTime) return null;
            const rest = ex.restSeconds ?? getSmartRestSeconds(ex.section);
            // Find first incomplete set
            let activeSet = 0;
            for (let i = 0; i < ex.sets; i++) {
              if (!isSetDone(ex.id, i)) { activeSet = i; break; }
              if (i === ex.sets - 1) activeSet = i;
            }
            return (
              <SetTimer
                exerciseSeconds={parsedTime}
                restSeconds={rest}
                currentSet={activeSet}
                totalSets={ex.sets}
                onSetComplete={() => toggle(ex.id, activeSet)}
              />
            );
          })()}

          {/* ── Coaching Cue — always visible, large, full width (Phase 1) ── */}
          {ex.tip && (
            <div
              style={{
                background: C.white,
                borderLeft: `4px solid ${C.blue}`,
                borderRadius: 0,
                padding: "16px 20px",
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.45,
                color: C.black,
                fontFamily,
                marginBottom: 20,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {ex.tip}
            </div>
          )}

          {/* ── Form Reference Link (Phase 4) ── */}
          {ex.formUrl && (
            <button
              onClick={() => setFormModalUrl(ex.formUrl!)}
              style={{
                background: C.orange,
                color: C.black,
                border: `3px solid ${C.black}`,
                borderRadius: 12,
                padding: "14px 20px",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily,
                marginBottom: 20,
                width: "100%",
                textAlign: "center",
              }}
            >
              Watch Form
            </button>
          )}

          {/* Form Modal Overlay */}
          {formModalUrl && (
            <FormModal url={formModalUrl} onClose={() => setFormModalUrl(null)} />
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {focusIdx > 0 && (
              <button
                onClick={() => setFocusIdx(focusIdx - 1)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 12,
                  border: `3px solid ${C.black}`,
                  background: C.white,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily,
                  color: C.black,
                }}
              >
                &larr; Previous
              </button>
            )}
            {focusIdx < exercises.length - 1 ? (
              <button
                onClick={() => setFocusIdx(focusIdx + 1)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 12,
                  border: `3px solid ${C.black}`,
                  background: C.white,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily,
                  color: C.black,
                }}
              >
                Next &rarr;
              </button>
            ) : (
              <button
                onClick={() => setFocusIdx(null)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 12,
                  border: `3px solid ${C.black}`,
                  background: C.green,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily,
                  color: C.white,
                }}
              >
                Done &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ───── BROWSE MODE ───── */
  return (
    <div
      style={{
        background: C.yellow,
        minHeight: "100vh",
        fontFamily,
        paddingBottom: allDone ? 80 : 20,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: C.yellow,
          borderBottom: `4px solid ${C.black}`,
          padding: "16px 16px 12px",
        }}
      >
        <Link
          href="/workouts"
          style={{
            textDecoration: "none",
            color: C.black,
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 6,
          }}
        >
          &#8592; Workouts
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: C.black,
                margin: 0,
                fontFamily,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.black,
                margin: "2px 0 0",
                fontFamily,
              }}
            >
              {subtitle}
            </p>
          </div>
          {/* Race countdown pill */}
          <div
            style={{
              background: C.black,
              borderRadius: 999,
              padding: "6px 14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: C.yellow,
                fontFamily,
                lineHeight: 1,
              }}
            >
              {daysToRace()}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: C.white,
                fontFamily,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              DAYS TO RACE
            </span>
          </div>
        </div>

        {/* Section pills */}
        <div
          style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
        >
          {sections.map((s) => {
            const done = isSectionDone(s);
            const sectionExercises = exercises
              .map((e, i) => ({ e, i }))
              .filter(({ e }) => e.section === s);
            const firstIncomplete = sectionExercises.find(
              ({ e }) => !isExDone(e),
            );
            const target = firstIncomplete
              ? firstIncomplete.i
              : sectionExercises[0]?.i ?? 0;
            return (
              <button
                key={s}
                onClick={() => setFocusIdx(target)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: `3px solid ${C.black}`,
                  background: done ? C.green : C.white,
                  color: done ? C.white : C.black,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontFamily,
                  cursor: "pointer",
                }}
              >
                {sectionNames[s]}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 10,
            height: 8,
            borderRadius: 4,
            border: `3px solid ${C.black}`,
            background: C.white,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: allDone ? C.green : C.red,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </header>

      {/* MASONRY GRID */}
      <div style={{ display: "flex", gap: 12, padding: "12px 12px 0" }}>
        {[col1, col2].map((col, ci) => (
          <div
            key={ci}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {col.map((idx) => {
              const ex = exercises[idx];
              const h = heights[idx % heights.length];
              const done = isExDone(ex);
              return (
                <button
                  key={ex.id}
                  onClick={() => setFocusIdx(idx)}
                  style={{
                    position: "relative",
                    height: h,
                    border: `3px solid ${C.black}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    filter: done ? "saturate(0.3)" : "none",
                    display: "block",
                    width: "100%",
                    padding: 0,
                    background: C.black,
                    textAlign: "left" as const,
                  }}
                >
                  {/* SVG art */}
                  <div style={{ position: "absolute", inset: 0 }}>
                    <Art id={ex.id} />
                  </div>
                  {/* Bottom bar */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: C.black,
                      padding: "8px 10px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: C.yellow,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontFamily,
                      }}
                    >
                      {ex.sectionLabel}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: C.white,
                        fontFamily,
                        lineHeight: 1.15,
                        margin: "2px 0 4px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {ex.name}
                      {notes[ex.id] && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: C.orange,
                            flexShrink: 0,
                          }}
                          title="Has notes"
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: C.white,
                          fontFamily,
                          fontWeight: 600,
                        }}
                      >
                        {ex.detail}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          marginLeft: "auto",
                        }}
                      >
                        {Array.from({ length: ex.sets }).map((_, si) => (
                          <div
                            key={si}
                            style={{
                              width: 10,
                              height: 10,
                              border: `2px solid ${C.black}`,
                              background: isSetDone(ex.id, si)
                                ? C.yellow
                                : C.white,
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
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: C.green,
            borderTop: `4px solid ${C.black}`,
            padding: "14px 20px",
            textAlign: "center",
            fontSize: 18,
            fontWeight: 800,
            color: C.white,
            fontFamily,
            zIndex: 50,
          }}
        >
          WORKOUT COMPLETE — YOU CRUSHED IT
        </div>
      )}
    </div>
  );
}
