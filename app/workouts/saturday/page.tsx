"use client";

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

/* ───────────────────────── RACE COUNTDOWN ───────────────────────── */
function daysToRace(): number {
  const race = new Date("2026-05-03T00:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((race.getTime() - now.getTime()) / 86400000));
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function SaturdayRestPage() {
  return (
    <div style={{ background: C.yellow, minHeight: "100vh", fontFamily }}>
      {/* HEADER */}
      <header style={{ background: C.yellow, borderBottom: `4px solid ${C.black}`, padding: "16px 16px 12px" }}>
        <Link href="/workouts" style={{ textDecoration: "none", color: C.black, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          &#8592; Workouts
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: 0, fontFamily }}>Saturday</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.black, margin: "2px 0 0", fontFamily }}>Rest Day</p>
          </div>
          <div style={{
            background: C.black, borderRadius: 999, padding: "6px 14px",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.yellow, fontFamily, lineHeight: 1 }}>{daysToRace()}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: C.white, fontFamily, letterSpacing: 1, textTransform: "uppercase" }}>DAYS TO RACE</span>
          </div>
        </div>
      </header>

      {/* REST DAY CONTENT */}
      <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* Sun SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
          <rect width="200" height="200" fill={C.yellow} rx="20" />
          <circle cx="100" cy="100" r="50" fill={C.white} stroke={C.black} strokeWidth="3" />
          <circle cx="100" cy="100" r="30" fill={C.yellow} stroke={C.black} strokeWidth="2" />
          {/* Rays */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const x1 = 100 + Math.cos(angle) * 55;
            const y1 = 100 + Math.sin(angle) * 55;
            const x2 = 100 + Math.cos(angle) * 75;
            const y2 = 100 + Math.sin(angle) * 75;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.black} strokeWidth="4" strokeLinecap="round" />;
          })}
          {/* Face */}
          <circle cx="88" cy="92" r="4" fill={C.black} />
          <circle cx="112" cy="92" r="4" fill={C.black} />
          <path d="M 85 110 Q 100 125 115 110" fill="none" stroke={C.black} strokeWidth="3" strokeLinecap="round" />
        </svg>

        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: C.black, margin: "0 0 8px", fontFamily }}>
            Recovery Day
          </h2>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.black, margin: "0 0 24px", fontFamily, opacity: 0.6, lineHeight: 1.5 }}>
            Your body builds strength while it rests. Today is part of the program — not a day off from it.
          </p>
        </div>

        {/* Recovery suggestions */}
        <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "💤", label: "Sleep 8+ hours", desc: "Growth hormone peaks during deep sleep" },
            { icon: "💧", label: "Hydrate well", desc: "Target 80–100 oz of water today" },
            { icon: "🧘", label: "Light stretching", desc: "10 min gentle mobility if you feel tight" },
            { icon: "🍳", label: "Eat to recover", desc: "Hit your protein target — muscles are rebuilding" },
            { icon: "📵", label: "Mental rest", desc: "Reduce screen time, get outside" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: C.white, borderRadius: 14,
                border: `3px solid ${C.black}`, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.yellow, border: `3px solid ${C.black}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.black, fontFamily }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.black, fontFamily, opacity: 0.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational footer */}
        <div style={{
          marginTop: 16, background: C.black, borderRadius: 14,
          padding: "16px 20px", maxWidth: 360, width: "100%",
          border: `3px solid ${C.black}`,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.yellow, fontFamily, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
            &ldquo;The body does not get stronger during the workout. It gets stronger during the recovery.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
