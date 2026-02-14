"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { C, fontFamily } from "./WorkoutPage";

/* ───────────────────────── AUDIO ───────────────────────── */
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playChime(count: 1 | 2 = 1) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  // Resume context (needed after user gesture on iOS)
  if (ctx.state === "suspended") ctx.resume();

  for (let i = 0; i < count; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.35 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.35);
    osc.stop(ctx.currentTime + i * 0.35 + 0.25);
  }
}

/* ───────────────────────── TIMER STATES ───────────────────────── */
type TimerPhase = "ready" | "active" | "rest" | "done";

interface SetTimerProps {
  /** Duration for this exercise in seconds */
  exerciseSeconds: number;
  /** Rest period in seconds */
  restSeconds: number;
  /** Current set index (0-based) */
  currentSet: number;
  /** Total sets */
  totalSets: number;
  /** Called when exercise phase completes for a set */
  onSetComplete?: () => void;
}

export default function SetTimer({
  exerciseSeconds,
  restSeconds,
  currentSet,
  totalSets,
  onSetComplete,
}: SetTimerProps) {
  const [phase, setPhase] = useState<TimerPhase>("ready");
  const [remaining, setRemaining] = useState(exerciseSeconds);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when set changes
  useEffect(() => {
    setPhase("ready");
    setRemaining(exerciseSeconds);
    setPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [currentSet, exerciseSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTick = useCallback(
    (duration: number, onComplete: () => void) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRemaining(duration);
      setPaused(false);

      let timeLeft = duration;
      intervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setRemaining(timeLeft);
        if (timeLeft <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
        }
      }, 1000);
    },
    [],
  );

  const startExercise = useCallback(() => {
    // Ensure audio context is created via user gesture
    getAudioCtx();
    setPhase("active");
    startTick(exerciseSeconds, () => {
      playChime(1);
      onSetComplete?.();
      // If more sets remain, go to rest
      if (currentSet < totalSets - 1) {
        setPhase("rest");
        startTick(restSeconds, () => {
          playChime(2);
          setPhase("done");
        });
      } else {
        setPhase("done");
      }
    });
  }, [exerciseSeconds, restSeconds, currentSet, totalSets, startTick, onSetComplete]);

  const togglePause = useCallback(() => {
    if (phase === "ready" || phase === "done") return;
    if (paused) {
      // Resume
      const currentPhaseSeconds = remaining;
      const isRest = phase === "rest";
      startTick(currentPhaseSeconds, () => {
        if (isRest) {
          playChime(2);
          setPhase("done");
        } else {
          playChime(1);
          onSetComplete?.();
          if (currentSet < totalSets - 1) {
            setPhase("rest");
            startTick(restSeconds, () => {
              playChime(2);
              setPhase("done");
            });
          } else {
            setPhase("done");
          }
        }
      });
      setPaused(false);
    } else {
      // Pause
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPaused(true);
    }
  }, [phase, paused, remaining, restSeconds, currentSet, totalSets, startTick, onSetComplete]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("ready");
    setRemaining(exerciseSeconds);
    setPaused(false);
  }, [exerciseSeconds]);

  /* ── Format time ── */
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins}:${secs.toString().padStart(2, "0")}`
    : `${secs}`;

  const isWarning = (phase === "rest" && remaining <= 10) || (phase === "active" && remaining <= 3);

  /* ── Phase label ── */
  let label = "";
  if (phase === "ready") label = "TAP TO START";
  else if (phase === "active") label = paused ? "PAUSED" : "GO";
  else if (phase === "rest") label = paused ? "PAUSED" : "REST";
  else label = currentSet < totalSets - 1 ? "SET DONE — TAP FOR NEXT" : "COMPLETE";

  /* ── Colors ── */
  let bg: string = C.yellow;
  let textColor: string = C.black;
  if (phase === "active") { bg = C.green; textColor = C.white; }
  if (phase === "rest") { bg = C.blue; textColor = C.white; }
  if (isWarning) { bg = C.red; textColor = C.white; }
  if (phase === "done") { bg = C.black; textColor = C.yellow; }

  return (
    <button
      onClick={() => {
        if (phase === "ready") startExercise();
        else if (phase === "done") reset();
        else togglePause();
      }}
      style={{
        width: "100%",
        border: `3px solid ${C.black}`,
        borderRadius: 16,
        padding: "20px 16px",
        background: bg,
        cursor: "pointer",
        fontFamily,
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transition: "background 0.3s ease",
      }}
    >
      {/* Countdown */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: textColor,
          lineHeight: 1,
          fontFamily,
          animation: isWarning ? "pulse 0.5s ease-in-out infinite alternate" : "none",
        }}
      >
        {display}
      </div>
      {/* Phase label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: textColor,
          opacity: 0.8,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          fontFamily,
        }}
      >
        {label}
      </div>
      {/* Set indicator */}
      {totalSets > 1 && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: textColor,
            opacity: 0.5,
            marginTop: 4,
            fontFamily,
          }}
        >
          Set {currentSet + 1} of {totalSets}
        </div>
      )}
      {/* Inline animation keyframes */}
      <style>{`
        @keyframes pulse {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }
      `}</style>
    </button>
  );
}
