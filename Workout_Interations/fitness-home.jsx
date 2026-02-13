import { useState, useEffect } from "react";

// === RESORT OPTIMISM PALETTE ===
const C = {
  sun: "#F2C744",        // warm golden yellow
  sunLight: "#F7DC6F",   // lighter gold
  sunPale: "#FFF8E1",    // pale warm cream
  terra: "#D4654A",      // terracotta
  terraLight: "#E8896F", // light terracotta
  ocean: "#2B7FB5",      // ocean blue
  oceanLight: "#5DADE2", // light ocean
  sky: "#EBF5FB",        // pale sky
  sand: "#FAF0DB",       // warm sand
  cream: "#FFFDF5",      // near white warm
  charcoal: "#2C2C2C",   // deep text
  warmGray: "#8C7B6B",   // muted warm
  white: "#FFFFFF",
  green: "#27AE60",      // health green
};

// Simulated data
const userData = {
  name: "Adam",
  streak: 14,
  longestStreak: 21,
  today: "Thursday",
  raceName: "OC Marathon",
  raceDate: "2026-05-03",
  calories: { consumed: 1420, goal: 2200 },
  protein: { consumed: 118, goal: 180 },
  water: 5, // glasses
  workout: {
    title: "Run Skill Day",
    subtitle: "Drills + Zone 2 + Recovery",
    duration: "~60 min",
    sectionsComplete: 1,
    sectionsTotal: 4,
  },
  weekDays: [
    { day: "S", done: true },
    { day: "M", done: true },
    { day: "T", done: true },
    { day: "W", done: true },
    { day: "T", done: false, today: true },
    { day: "F", done: false },
    { day: "S", done: false, rest: true },
  ],
};

const getMarathonDays = () => {
  const race = new Date("2026-05-03");
  const now = new Date();
  return Math.ceil((race - now) / (1000 * 60 * 60 * 24));
};

// === GEOMETRIC SUN COMPONENT ===
const SunGraphic = ({ streak }) => {
  const rays = 12;
  const cx = 150, cy = 150, r = 60;
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ maxWidth: "280px" }}>
      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={120} fill={C.sunLight} opacity="0.15" />
      <circle cx={cx} cy={cy} r={95} fill={C.sunLight} opacity="0.25" />

      {/* Rays */}
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i * 360) / rays - 90;
        const rad = (angle * Math.PI) / 180;
        const inner = r + 14;
        const outer = r + 38;
        const width = 6;
        const perpRad = rad + Math.PI / 2;
        const dx = Math.cos(perpRad) * width;
        const dy = Math.sin(perpRad) * width;
        const x1 = cx + Math.cos(rad) * inner;
        const y1 = cy + Math.sin(rad) * inner;
        const x2 = cx + Math.cos(rad) * outer;
        const y2 = cy + Math.sin(rad) * outer;
        // Tapered ray
        return (
          <polygon
            key={i}
            points={`${x1 - dx},${y1 - dy} ${x1 + dx},${y1 + dy} ${x2 + dx * 0.3},${y2 + dy * 0.3} ${x2 - dx * 0.3},${y2 - dy * 0.3}`}
            fill={C.sun}
            opacity={0.6 + (i % 2) * 0.2}
          />
        );
      })}

      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill={C.sun} />

      {/* Inner highlight */}
      <circle cx={cx - 12} cy={cy - 12} r={r - 10} fill={C.sunLight} opacity="0.5" />

      {/* Streak number */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.charcoal} fontSize="42" fontWeight="800" fontFamily="'Outfit', sans-serif">
        {streak}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill={C.charcoal} fontSize="12" fontWeight="600" fontFamily="'Outfit', sans-serif" letterSpacing="0.12em" opacity="0.7">
        DAY STREAK
      </text>
    </svg>
  );
};

// === CIRCULAR PROGRESS ===
const CircleProgress = ({ value, max, size = 64, strokeWidth = 5, color, children }) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color + "25"} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {children}
      </div>
    </div>
  );
};

// === MAIN APP ===
export default function App() {
  const [time, setTime] = useState(new Date());
  const marathonDays = getMarathonDays();
  const d = userData;
  const calPct = Math.round((d.calories.consumed / d.calories.goal) * 100);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.sun} 0%, ${C.sunLight} 35%, ${C.sand} 55%, ${C.cream} 100%)`,
      fontFamily: "'Outfit', 'Avenir Next', 'Helvetica Neue', sans-serif",
      overflowX: "hidden",
    }}>
      {/* === TOP BAR === */}
      <div style={{
        padding: "16px 20px 0",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: "28px", fontWeight: 800, color: C.charcoal,
            letterSpacing: "-0.02em",
          }}>
            Optimism.
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: C.charcoal, opacity: 0.55, fontWeight: 500 }}>
            {getGreeting()}, {d.name}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: "11px", fontWeight: 700, color: C.terra, letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            {d.raceName}
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: C.charcoal, lineHeight: 1 }}>
            {marathonDays}
          </div>
          <div style={{ fontSize: "10px", color: C.charcoal, opacity: 0.5, fontWeight: 600 }}>
            days to race
          </div>
        </div>
      </div>

      {/* === STREAK HERO === */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px 20px 0",
      }}>
        <SunGraphic streak={d.streak} />

        {/* This week dots */}
        <div style={{
          display: "flex", gap: "8px", marginTop: "-8px",
          background: C.charcoal + "12", borderRadius: "20px", padding: "8px 16px",
        }}>
          {d.weekDays.map((wd, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700,
                background: wd.done ? C.terra : wd.today ? C.white : "transparent",
                color: wd.done ? C.white : wd.today ? C.charcoal : C.charcoal + "60",
                border: wd.today && !wd.done ? `2px solid ${C.terra}` : wd.rest ? `1.5px dashed ${C.charcoal}30` : "2px solid transparent",
                transition: "all 0.3s",
              }}>
                {wd.done ? "✓" : wd.day}
              </div>
            </div>
          ))}
        </div>
        <p style={{
          margin: "8px 0 0", fontSize: "12px", color: C.charcoal, opacity: 0.5,
          fontWeight: 500,
        }}>
          Longest streak: {d.longestStreak} days
        </p>
      </div>

      {/* === CARDS AREA === */}
      <div style={{ padding: "20px 16px 40px", maxWidth: "480px", margin: "0 auto" }}>

        {/* --- NUTRITION CARD --- */}
        <div style={{
          background: C.white, borderRadius: "20px", padding: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          marginBottom: "14px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: C.charcoal }}>
              Nutrition
            </h2>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: C.ocean,
              background: C.ocean + "12", borderRadius: "10px", padding: "4px 10px",
              cursor: "pointer",
            }}>
              Log food →
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Calorie ring */}
            <CircleProgress value={d.calories.consumed} max={d.calories.goal} size={80} strokeWidth={7} color={C.terra}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: C.charcoal }}>{calPct}%</span>
              <span style={{ fontSize: "9px", color: C.warmGray, fontWeight: 600 }}>of goal</span>
            </CircleProgress>

            {/* Macro bars */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: C.charcoal }}>Calories</span>
                  <span style={{ color: C.warmGray, fontWeight: 500 }}>{d.calories.consumed} / {d.calories.goal}</span>
                </div>
                <div style={{ height: "6px", background: C.sand, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${calPct}%`, height: "100%", background: C.terra, borderRadius: "3px", transition: "width 0.4s" }} />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: C.charcoal }}>Protein</span>
                  <span style={{ color: C.warmGray, fontWeight: 500 }}>{d.protein.consumed}g / {d.protein.goal}g</span>
                </div>
                <div style={{ height: "6px", background: C.sand, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.round((d.protein.consumed / d.protein.goal) * 100)}%`, height: "100%", background: C.ocean, borderRadius: "3px", transition: "width 0.4s" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, color: C.charcoal }}>Water</span>
                  <span style={{ color: C.warmGray, fontWeight: 500 }}>{d.water} / 8 glasses</span>
                </div>
                <div style={{ display: "flex", gap: "3px" }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} style={{
                      flex: 1, height: "6px", borderRadius: "3px",
                      background: i < d.water ? C.oceanLight : C.sand,
                      transition: "background 0.2s",
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TODAY'S WORKOUT CARD --- */}
        <div style={{
          background: C.charcoal, borderRadius: "20px", padding: "20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          marginBottom: "14px", cursor: "pointer",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circle */}
          <div style={{
            position: "absolute", right: "-20px", top: "-20px",
            width: "120px", height: "120px", borderRadius: "50%",
            background: C.terra, opacity: 0.12,
          }} />
          <div style={{
            position: "absolute", right: "10px", top: "10px",
            width: "60px", height: "60px", borderRadius: "50%",
            background: C.sun, opacity: 0.08,
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{
                  fontSize: "10px", fontWeight: 700, color: C.sun, letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: "4px",
                }}>
                  {d.today}'s Training
                </div>
                <h3 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700, color: C.cream }}>
                  {d.workout.title}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: C.cream, opacity: 0.6 }}>
                  {d.workout.subtitle}
                </p>
              </div>
              <div style={{
                background: C.terra, borderRadius: "12px", padding: "8px 14px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: C.white }}>
                  {d.workout.sectionsComplete}/{d.workout.sectionsTotal}
                </div>
                <div style={{ fontSize: "9px", color: C.white, opacity: 0.8, fontWeight: 600 }}>
                  sections
                </div>
              </div>
            </div>

            {/* Mini progress */}
            <div style={{ marginTop: "14px", display: "flex", gap: "4px" }}>
              {Array.from({ length: d.workout.sectionsTotal }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: "4px", borderRadius: "2px",
                  background: i < d.workout.sectionsComplete ? C.sun : C.cream + "20",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>

            <div style={{
              marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: "12px", color: C.cream, opacity: 0.5 }}>
                ~{d.workout.duration}
              </span>
              <span style={{
                fontSize: "12px", fontWeight: 700, color: C.sun,
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                Continue workout →
              </span>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS ROW --- */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          {[
            { label: "Supplements", icon: "💊", bg: C.ocean + "15", color: C.ocean },
            { label: "Measurements", icon: "📏", bg: C.terra + "15", color: C.terra },
            { label: "Activity", icon: "⌚", bg: C.green + "15", color: C.green },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1, background: C.white, borderRadius: "16px", padding: "14px 10px",
              textAlign: "center", cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: item.bg, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 6px", fontSize: "16px",
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: C.charcoal }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* --- MOMENTUM STRIP --- */}
        <div style={{
          background: C.white, borderRadius: "20px", padding: "18px 20px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700, color: C.charcoal }}>
            This Month
          </h3>
          <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
            {Array.from({ length: 28 }, (_, i) => {
              const isCompleted = i < 12;
              const isToday = i === 12;
              const isFuture = i > 12;
              return (
                <div key={i} style={{
                  width: "calc(14.28% - 3px)", aspectRatio: "1", borderRadius: "4px",
                  background: isCompleted ? C.sun : isToday ? C.terra : C.sand,
                  opacity: isFuture ? 0.4 : 1,
                  transition: "all 0.2s",
                }} />
              );
            })}
          </div>
          <div style={{
            marginTop: "12px", display: "flex", justifyContent: "space-between",
            fontSize: "12px", color: C.warmGray,
          }}>
            <span>12 of 28 days complete</span>
            <span style={{ fontWeight: 700, color: C.terra }}>43%</span>
          </div>
        </div>
      </div>

      {/* === BOTTOM NAV === */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: C.white, borderTop: `1px solid ${C.sand}`,
        padding: "8px 0 28px", /* extra bottom for notch */
        display: "flex", justifyContent: "center", gap: "0",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
      }}>
        {[
          { icon: "☀️", label: "Home", active: true },
          { icon: "🍽", label: "Nutrition", active: false },
          { icon: "🏋️", label: "Training", active: false },
          { icon: "📊", label: "Progress", active: false },
        ].map((tab, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center", cursor: "pointer", padding: "4px 0",
          }}>
            <div style={{ fontSize: "20px", marginBottom: "2px" }}>{tab.icon}</div>
            <div style={{
              fontSize: "10px", fontWeight: 700,
              color: tab.active ? C.terra : C.warmGray,
              letterSpacing: "0.02em",
            }}>
              {tab.label}
            </div>
            {tab.active && (
              <div style={{
                width: "4px", height: "4px", borderRadius: "50%",
                background: C.terra, margin: "3px auto 0",
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
