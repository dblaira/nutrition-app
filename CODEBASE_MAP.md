# Nutrition App — Codebase Map

Transfer document for AI coding agents. Last updated: Jan 22, 2026.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 14 (App Router) | Server Components by default |
| **Language** | TypeScript (strict) | |
| **Styling** | Tailwind CSS 3.4 | Dark mode first, CSS variable tokens |
| **Database** | Supabase (Postgres) | Auth + DB, Row Level Security |
| **Auth** | Supabase SSR | Cookie-based sessions via middleware |
| **AI** | Anthropic SDK (`@anthropic-ai/sdk`) | Available but not yet deeply integrated |
| **Icons** | Lucide React | |
| **Fonts** | Outfit (display) + Inter (body) | Loaded via `next/font/google` |
| **Deployment** | Vercel | `nutrition-app-bay.vercel.app` |
| **Repository** | `github.com/dblaira/nutrition-app` | Branch: `main` |

---

## Directory Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout: fonts, dark theme, metadata
│   ├── globals.css             # Tailwind + CSS variable tokens (light/dark)
│   ├── page.tsx                # Dashboard (Server Component)
│   ├── log-food/
│   │   ├── page.tsx            # Food search & logging (Client Component)
│   │   └── actions.ts          # Server Actions: searchFoods(), logFood()
│   ├── workouts/
│   │   └── page.tsx            # Workout tracker (Client Component, localStorage)
│   ├── login/
│   │   ├── page.tsx            # Login/signup form (Client Component)
│   │   └── actions.ts          # Server Actions: login(), signup()
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler
│   └── api/
│       └── webhooks/
│           └── activity/
│               └── route.ts    # Apple Health webhook endpoint (planned)
├── lib/
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── utils/
│   └── supabase/
│       ├── server.ts           # Server-side Supabase client (cookies)
│       ├── client.ts           # Browser-side Supabase client
│       ├── admin.ts            # Admin client (bypasses RLS, service role key)
│       └── middleware.ts       # Session refresh for Next.js middleware
├── middleware.ts               # Auth session refresh on every request
├── supabase/
│   ├── schema.sql              # Full database schema with RLS policies
│   └── seed.sql                # 10 common foods for the foods table
├── tailwind.config.ts          # Theme: colors, fonts, border-radius tokens
├── next.config.mjs
├── tsconfig.json
├── package.json
└── .cursorrules                # AI agent guidelines (summary + pointers)
```

---

## Pages — Detailed Breakdown

### `/` — Dashboard (Server Component)

**File:** `app/page.tsx`

**What it does:**
1. Checks auth via Supabase — redirects to `/login` if unauthenticated
2. Fetches or lazy-creates user profile from `profiles` table
3. Queries today's meals with nested `meal_entries` -> `foods` joins
4. Calculates consumed totals (calories, protein, carbs, fat)
5. Computes remaining = (goal + burned) - consumed
6. Renders dashboard with calorie circle, macro breakdown, quick actions, recent activity

**Data sources:** `profiles`, `meals`, `meal_entries`, `foods` (all via Supabase)

**Quick actions:** Log Food (`/log-food`), Workouts (`/workouts`), Burn Calories (placeholder)

**Key values:**
- Default goals: 2,400 cal / 150g protein / 250g carbs / 80g fat
- `burned` is hardcoded to 0 (daily_activity integration planned)

---

### `/log-food` — Food Logging (Client Component)

**Files:** `app/log-food/page.tsx`, `app/log-food/actions.ts`

**What it does:**
1. Meal selector: Breakfast / Lunch / Dinner / Snack
2. Search input triggers `searchFoods()` server action (queries `foods` table via ilike)
3. Results display as cards with name, brand, calories, macro summary
4. "+" button submits `logFood()` server action

**`logFood()` flow:**
1. Gets authenticated user
2. Upserts a `meals` row for (user_id, today's date, meal name)
3. Inserts a `meal_entries` row linking meal_id + food_id with quantity 1.0
4. Redirects back to `/` (dashboard)

---

### `/workouts` — Workout Tracker (Client Component)

**File:** `app/workouts/page.tsx`

**What it does:**
- Tracks a running workout program (race prep for May 3, 2026)
- 17 exercises across 4 sections: Activation (8), Drills (3), Run (1), Recovery (5)
- Custom SVG art per exercise
- Two modes: Browse (masonry grid) and Focus (full-screen single exercise)
- Set completion tracking with checkmark toggle
- Section completion pills and overall progress bar
- Race countdown in header

**Data persistence:** localStorage only (key: `optimism-pop-v1`)

**Visual identity:** Bold "Optimism Pop" style — yellow/blue/red/black palette, heavy 3px black borders, inline styles (no Tailwind). Completely self-contained; does not use the app's CSS variable system.

**Not yet integrated with:** Supabase, shared components, or the app's Tailwind theme.

---

### `/login` — Authentication

**Files:** `app/login/page.tsx`, `app/login/actions.ts`

**What it does:**
- Email + password form with Sign In / Sign Up buttons
- Server actions call `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()`
- Redirects to `/` on success, shows error message on failure

---

## Authentication Flow

```
Browser Request
    │
    ▼
middleware.ts
    │ calls updateSession() from utils/supabase/middleware.ts
    │ refreshes Supabase auth cookies on every request
    │
    ▼
Server Component (e.g., app/page.tsx)
    │ creates server client via utils/supabase/server.ts
    │ calls supabase.auth.getUser()
    │ if no user → redirect("/login")
    │
    ▼
Authenticated page renders
```

---

## Database Schema

### Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User settings, nutrition goals | Yes — own profile only |
| `foods` | Global + user-custom food items | Yes — all can read, users insert own |
| `meals` | Meal slots per day (Breakfast, Lunch, etc.) | Yes — own meals only |
| `meal_entries` | Food items within a meal (with quantity) | Yes — via meal ownership |
| `supplements` | Supplement inventory | Yes — own supplements only |
| `supplement_logs` | When supplements were taken | Yes — own logs only |
| `daily_activity` | Steps, active calories (Apple Health) | Yes — own activity only |

### Key Relationships

```
profiles (1) ← user_id → (many) meals
meals (1) ← meal_id → (many) meal_entries
foods (1) ← food_id → (many) meal_entries
profiles (1) ← user_id → (many) supplements
supplements (1) ← supplement_id → (many) supplement_logs
profiles (1) ← user_id → (many) daily_activity
```

### Profiles Columns (Goal Defaults)

| Column | Default |
|--------|---------|
| `calorie_goal` | 2400 |
| `protein_goal` | 150 |
| `carbs_goal` | 250 |
| `fat_goal` | 80 |

### Foods Table

Columns: `id`, `created_by` (null = global), `name`, `brand`, `calories`, `protein`, `carbs`, `fat`, `serving_size`, `created_at`

### Meals Table

Unique constraint: `(user_id, date, name)` — one Breakfast per user per day.

### Seed Data

10 common foods seeded: Egg, Oatmeal, Chicken Breast, White Rice, Banana, Whey Protein, Avocado, Almonds, Greek Yogurt, Salmon.

---

## Styling System

### CSS Variables (globals.css)

Dark mode tokens (the active theme):

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `240 10% 3.9%` | Zinc 950 |
| `--foreground` | `0 0% 98%` | Near white |
| `--primary` | `142 70% 50%` | Emerald 500 |
| `--secondary` | `240 3.7% 15.9%` | Dark zinc |
| `--muted-foreground` | `240 5% 64.9%` | Subdued text |
| `--border` | `240 3.7% 15.9%` | Subtle borders |
| `--destructive` | `0 62.8% 30.6%` | Error red |

### Utility Classes

- `.glass` — `bg-white/5 backdrop-blur-lg border border-white/10`
- `.glass-card` — `bg-card/50 backdrop-blur-xl border border-border/50 shadow-xl`

### Tailwind Config

- Custom font families: `font-sans` (Inter), `font-display` (Outfit)
- HSL-based color system mapped to CSS variables
- Border radius token: `--radius: 0.75rem`

---

## What Exists vs What's Planned

| Feature | Status | Data Source |
|---------|--------|-------------|
| Auth (login/signup) | Working | Supabase Auth |
| Dashboard (today's stats) | Working | Supabase (meals, foods, profiles) |
| Food search + logging | Working | Supabase (foods, meals, meal_entries) |
| Workouts | Working (standalone) | localStorage only |
| Supplements tracking | Schema only | No UI yet |
| Daily activity (Apple Health) | Schema + webhook endpoint | Not wired up |
| AI-powered insights | SDK installed | Not yet built |
| Cross-domain synthesis | Conceptual | Part of Understood suite vision |

---

## Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.70.1",
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.84.0",
  "clsx": "^2.1.1",
  "lucide-react": "^0.554.0",
  "next": "14.2.33",
  "react": "^18",
  "react-dom": "^18",
  "sharp": "^0.34.5",
  "tailwind-merge": "^3.4.0",
  "zod": "^4.1.13"
}
```

| Package | Purpose |
|---------|---------|
| `@supabase/ssr` + `@supabase/supabase-js` | Database, auth, server/client/admin clients |
| `@anthropic-ai/sdk` | AI integration (available, not deeply used yet) |
| `clsx` + `tailwind-merge` | Class name composition (`cn()` utility) |
| `lucide-react` | Icon library |
| `sharp` | Image optimization (Next.js) |
| `zod` | Schema validation (available, not widely used yet) |

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access (server-side only) |
| `ANTHROPIC_API_KEY` | Anthropic SDK (assumed) |

---

## Active Design Exploration

The app is in an active design and experimentation phase. The workouts page was built in Claude Code with a distinct visual identity ("Optimism Pop" — bold colors, heavy borders, SVG art). The dashboard currently uses a different aesthetic (dark zinc, glassmorphism, emerald accents). Visual unification is in progress — the workouts direction is closer to the target.
