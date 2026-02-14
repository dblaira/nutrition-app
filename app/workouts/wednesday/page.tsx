"use client";

import WorkoutPage, { C, fontFamily, type Exercise } from "@/components/WorkoutPage";

const HEIGHTS = [220, 270, 200, 250, 230, 280, 210, 260, 240];
const STORAGE_KEY = "optimism-pop-wednesday-v1";

/* ───────────────────────── EXERCISE DATA ───────────────────────── */
const EXERCISES: Exercise[] = [
  /* ── Cardio ── */
  { id: "wed-cardio", name: "Zone 2 Cardio", section: "cardio", sectionLabel: "Cardio", sets: 1, detail: "60 min bike OR 40 min run", tip: "If running: do the pre-run warm-up first (dorsiflexion rocks, ankle circles, eversion hold, short foot, hip flexor march, adduction raises, SL balance, SL RDL reach)." },
  /* ── Push/Pull A ── */
  { id: "wed-tricep-ext", name: "Cable Tricep Extension", section: "upper-1", sectionLabel: "Push/Pull A", sets: 3, detail: "12 reps", tip: "Keep elbows tucked, extend fully. Squeeze at the bottom." },
  { id: "wed-bicep-curls", name: "Dumbbell Bicep Curls", section: "upper-1", sectionLabel: "Push/Pull A", sets: 3, detail: "12 reps", tip: "Full range of motion. Control the descent — don't swing." },
  { id: "wed-reverse-crunches", name: "Floor Reverse Crunches", section: "upper-1", sectionLabel: "Push/Pull A", sets: 3, detail: "10 reps", tip: "Curl hips off the ground, bringing knees toward chest. Lower with control." },
  /* ── Push/Pull B ── */
  { id: "wed-uni-chest-press", name: "Cable Uni Chest Press", section: "upper-2", sectionLabel: "Push/Pull B", sets: 3, detail: "12 each side", tip: "Big stagger stance. Press from chest, one arm at a time. Core stays engaged to resist rotation." },
  { id: "wed-uni-row", name: "Cable Uni Row", section: "upper-2", sectionLabel: "Push/Pull B", sets: 3, detail: "12 each side", tip: "Same stagger stance. Pull to ribcage, squeeze the shoulder blade. Don't rotate." },
  /* ── Finishers ── */
  { id: "wed-crunches", name: "Crunches", section: "finishers", sectionLabel: "Finishers", sets: 1, detail: "40 reps", tip: "Slow and controlled. Quality over speed." },
  { id: "wed-pullups", name: "Pull-Ups", section: "finishers", sectionLabel: "Finishers", sets: 2, detail: "Max reps", tip: "Full range. If you can't get 5+, use a band for assistance. Dead hang start, chin over bar." },
  { id: "wed-pushups", name: "Push-Ups", section: "finishers", sectionLabel: "Finishers", sets: 2, detail: "Max reps", tip: "Chest to floor, full lockout at top. Keep body straight." },
];

const SECTIONS = ["cardio", "upper-1", "upper-2", "finishers"];
const SECTION_NAMES: Record<string, string> = { cardio: "Cardio", "upper-1": "Push/Pull A", "upper-2": "Push/Pull B", finishers: "Finishers" };

/* ───────────────────────── SVG ART ───────────────────────── */
function ExerciseSVG({ id }: { id: string }) {
  const s = `0 0 200 200`;
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: s, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" as const };

  switch (id) {
    case "wed-cardio":
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/>
        <rect x="0" y="0" width="100" height="200" fill={C.blue}/>
        <line x1="0" y1="100" x2="100" y2="100" stroke={C.black} strokeWidth="3"/>
        <circle cx="35" cy="130" r="30" fill="none" stroke={C.black} strokeWidth="3"/>
        <circle cx="65" cy="130" r="30" fill="none" stroke={C.black} strokeWidth="3"/>
        <line x1="35" y1="130" x2="50" y2="85" stroke={C.black} strokeWidth="3"/>
        <line x1="50" y1="85" x2="65" y2="130" stroke={C.black} strokeWidth="3"/>
        <circle cx="50" cy="55" r="12" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="50" y1="67" x2="50" y2="85" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="50" cy="95" rx="15" ry="18" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="50" y1="113" x2="35" y2="160" stroke={C.black} strokeWidth="3"/>
        <line x1="50" y1="113" x2="65" y2="160" stroke={C.black} strokeWidth="3"/>
        <path d="M 130 50 Q 145 35 160 50" fill="none" stroke={C.black} strokeWidth="3"/>
        <path d="M 130 80 Q 145 65 160 80" fill="none" stroke={C.black} strokeWidth="3"/>
        <path d="M 130 110 Q 145 95 160 110" fill="none" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="145" cy="140" rx="25" ry="18" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <text x="100" y="105" textAnchor="middle" fill={C.yellow} fontSize="18" fontWeight="800" fontFamily={fontFamily}>OR</text></svg>);
    case "wed-tricep-ext":
      return (<svg {...common}><rect width="200" height="200" fill={C.blue}/>
        <rect x="160" y="0" width="40" height="200" fill={C.black}/>
        <line x1="160" y1="85" x2="115" y2="85" stroke={C.red} strokeWidth="3"/>
        <circle cx="95" cy="55" r="14" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="95" y1="69" x2="95" y2="120" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="95" cy="145" rx="20" ry="22" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="80" y1="120" x2="80" y2="85" stroke={C.black} strokeWidth="3"/>
        <line x1="110" y1="120" x2="110" y2="85" stroke={C.black} strokeWidth="3"/>
        <line x1="95" y1="167" x2="80" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="95" y1="167" x2="110" y2="195" stroke={C.black} strokeWidth="3"/>
        <polygon points="90,85 95,75 100,85" fill={C.black}/></svg>);
    case "wed-bicep-curls":
      return (<svg {...common}><rect width="200" height="200" fill={C.orange}/>
        <rect x="0" y="172" width="200" height="28" fill={C.black}/>
        <circle cx="100" cy="50" r="14" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="64" x2="100" y2="115" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="100" cy="140" rx="22" ry="20" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="160" x2="80" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="160" x2="120" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="75" y1="95" x2="60" y2="95" stroke={C.black} strokeWidth="3"/>
        <line x1="125" y1="95" x2="140" y2="95" stroke={C.black} strokeWidth="3"/>
        <rect x="52" y="75" width="18" height="22" rx="4" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <rect x="130" y="75" width="18" height="22" rx="4" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <polygon points="88,95 100,80 112,95" fill={C.black}/></svg>);
    case "wed-reverse-crunches":
      return (<svg {...common}><rect width="200" height="200" fill={C.yellow}/>
        <rect x="0" y="155" width="200" height="45" fill={C.black}/>
        <circle cx="100" cy="75" r="14" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="89" x2="100" y2="115" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="100" cy="140" rx="45" ry="18" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <path d="M 75 140 Q 85 115 100 125 Q 115 135 125 140" fill="none" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="158" x2="80" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="158" x2="120" y2="195" stroke={C.black} strokeWidth="3"/>
        <polygon points="92,155 100,135 108,155" fill={C.black}/></svg>);
    case "wed-uni-chest-press":
      return (<svg {...common}><rect width="200" height="200" fill={C.green}/>
        <rect x="0" y="0" width="35" height="200" fill={C.black}/>
        <line x1="35" y1="100" x2="95" y2="100" stroke={C.red} strokeWidth="3"/>
        <circle cx="115" cy="65" r="14" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="115" y1="79" x2="115" y2="125" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="115" cy="150" rx="18" ry="22" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="115" y1="100" x2="95" y2="100" stroke={C.black} strokeWidth="3"/>
        <line x1="115" y1="172" x2="100" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="115" y1="172" x2="135" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="130" y1="79" x2="155" y2="75" stroke={C.black} strokeWidth="3"/>
        <polygon points="148,72 160,78 148,84" fill={C.black}/></svg>);
    case "wed-uni-row":
      return (<svg {...common}><rect width="200" height="200" fill={C.red}/>
        <rect x="165" y="0" width="35" height="200" fill={C.black}/>
        <line x1="165" y1="100" x2="105" y2="100" stroke={C.yellow} strokeWidth="3"/>
        <circle cx="85" cy="65" r="14" fill={C.yellow} stroke={C.black} strokeWidth="3"/>
        <line x1="85" y1="79" x2="85" y2="125" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="85" cy="150" rx="18" ry="22" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="85" y1="100" x2="105" y2="100" stroke={C.black} strokeWidth="3"/>
        <line x1="85" y1="172" x2="70" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="85" y1="172" x2="100" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="40" y1="75" x2="65" y2="79" stroke={C.black} strokeWidth="3"/>
        <polygon points="52,72 40,78 52,84" fill={C.black}/></svg>);
    case "wed-crunches":
      return (<svg {...common}><rect width="200" height="200" fill={C.yellow}/>
        <rect x="0" y="155" width="200" height="45" fill={C.black}/>
        <circle cx="100" cy="75" r="14" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="89" x2="100" y2="115" stroke={C.black} strokeWidth="3"/>
        <ellipse cx="100" cy="135" rx="40" ry="18" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="153" x2="80" y2="195" stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="153" x2="120" y2="195" stroke={C.black} strokeWidth="3"/>
        <path d="M 85 115 Q 100 95 115 115" fill="none" stroke={C.black} strokeWidth="3"/>
        <text x="100" y="180" textAnchor="middle" fill={C.yellow} fontSize="32" fontWeight="800" fontFamily={fontFamily}>40</text></svg>);
    case "wed-pullups":
      return (<svg {...common}><rect width="200" height="200" fill={C.black}/>
        <rect x="35" y="18" width="130" height="14" rx="7" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="32" x2="100" y2="55" stroke={C.yellow} strokeWidth="3"/>
        <circle cx="100" cy="75" r="14" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="89" x2="100" y2="130" stroke={C.yellow} strokeWidth="3"/>
        <ellipse cx="100" cy="155" rx="18" ry="18" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="32" x2="75" y2="18" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="32" x2="125" y2="18" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="130" x2="82" y2="185" stroke={C.yellow} strokeWidth="3"/>
        <line x1="100" y1="130" x2="118" y2="185" stroke={C.yellow} strokeWidth="3"/>
        <polygon points="92,55 100,40 108,55" fill={C.black}/></svg>);
    case "wed-pushups":
      return (<svg {...common}><rect width="200" height="200" fill={C.green}/>
        <rect x="0" y="155" width="200" height="45" fill={C.yellow}/>
        <circle cx="100" cy="95" r="14" fill={C.red} stroke={C.black} strokeWidth="3"/>
        <line x1="100" y1="109" x2="100" y2="135" stroke={C.black} strokeWidth="3"/>
        <rect x="80" y="135" width="40" height="10" rx="4" fill={C.white} stroke={C.black} strokeWidth="3"/>
        <line x1="40" y1="135" x2="100" y2="135" stroke={C.black} strokeWidth="3"/>
        <line x1="160" y1="135" x2="100" y2="135" stroke={C.black} strokeWidth="3"/>
        <line x1="40" y1="135" x2="35" y2="155" stroke={C.black} strokeWidth="3"/>
        <line x1="40" y1="145" x2="35" y2="155" stroke={C.black} strokeWidth="3"/>
        <line x1="160" y1="135" x2="165" y2="155" stroke={C.black} strokeWidth="3"/>
        <line x1="160" y1="145" x2="165" y2="155" stroke={C.black} strokeWidth="3"/></svg>);
    default:
      return (<svg {...common}><rect width="200" height="200" fill={C.teal}/><circle cx="100" cy="100" r="50" fill={C.yellow} stroke={C.black} strokeWidth="3"/></svg>);
  }
}

export default function WednesdayWorkoutPage() {
  return (
    <WorkoutPage
      exercises={EXERCISES}
      sections={SECTIONS}
      sectionNames={SECTION_NAMES}
      storageKey={STORAGE_KEY}
      heights={HEIGHTS}
      art={ExerciseSVG}
      title="Wednesday"
      subtitle="Cross-Train + Upper B"
    />
  );
}
