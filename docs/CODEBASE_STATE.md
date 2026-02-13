# Nutrition App — Codebase State

Last updated: January 22, 2026

---

## Architecture

- **Framework:** Next.js 14 (App Router)
- **Auth + Database:** Supabase (Postgres with Row Level Security)
- **Styling:** Tailwind CSS with CSS custom properties (HSL-based design tokens)
- **AI:** Anthropic SDK (`@anthropic-ai/sdk` — claude-sonnet-4-20250514)
- **Icons:** Lucide React
- **Utilities:** clsx + tailwind-merge (via `cn()` helper in `lib/utils.ts`)
- **Fonts:** Inter (body), Outfit (display/headings)
- **Deployment:** Vercel at `nutrition-app-bay.vercel.app`
- **Repository:** github.com/dblaira/nutrition-app (main branch, auto-deploys)

---

## File Inventory

### Root Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tailwind.config.ts` | Tailwind theme with custom design tokens |
| `tsconfig.json` | TypeScript config with `@/*` path alias |
| `middleware.ts` | Supabase session refresh on every request |
| `next.config.mjs` | Next.js config (minimal) |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |
| `.eslintrc.json` | ESLint config |
| `.cursorrules` | AI agent guidelines (summary version) |

### App Pages

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Server Component | Main dashboard. Shows remaining calories (ring), macro breakdown, quick action buttons (Log Food, Workouts, Burn Calories), and recent food activity. Fetches from Supabase. |
| `/login` | `app/login/page.tsx` | Client Component | Email/password login and signup form. |
| `/login` | `app/login/actions.ts` | Server Actions | `login()` and `signup()` functions using Supabase Auth. |
| `/log-food` | `app/log-food/page.tsx` | Client Component | Food search with meal selector (Breakfast/Lunch/Dinner/Snack). Searches foods table and logs entries via server actions. |
| `/log-food` | `app/log-food/actions.ts` | Server Actions | `searchFoods(term)` — searches foods table. `logFood(formData)` — creates meal + meal_entry records. |
| `/workouts` | `app/workouts/page.tsx` | Client Component | Standalone workout tracker. 17 exercises across 4 sections (Activation, Drills, Run, Recovery). Masonry layout, focus mode, localStorage persistence. Bold pop-art visual style. |
| `/auth/callback` | `app/auth/callback/route.ts` | Route Handler | OAuth callback for Supabase auth. |
| `/api/webhooks/activity` | `app/api/webhooks/activity/route.ts` | API Route | Webhook for Apple Health activity data (planned). |

### Layout and Styles

| File | Description |
|------|-------------|
| `app/layout.tsx` | Root layout. Loads Inter + Outfit fonts, sets dark mode class, applies font CSS variables. |
| `app/globals.css` | Design tokens via CSS custom properties (light + dark). Includes `.glass` and `.glass-card` utility classes. Dark theme is primary. |

### Utilities

| File | Description |
|------|-------------|
| `lib/utils.ts` | `cn()` — merges Tailwind classes using clsx + tailwind-merge |
| `utils/supabase/server.ts` | Server-side Supabase client factory (uses Next.js cookies) |
| `utils/supabase/client.ts` | Browser-side Supabase client factory |
| `utils/supabase/admin.ts` | Admin Supabase client (bypasses RLS, uses service role key) |
| `utils/supabase/middleware.ts` | `updateSession()` — refreshes auth session in middleware |

### Database

| File | Description |
|------|-------------|
| `supabase/schema.sql` | Full schema with RLS policies |
| `supabase/seed.sql` | Seed data (if any) |

### Cursor Rules (AI Agent Context)

| File | Description |
|------|-------------|
| `.cursor/rules/GUIDELINES.mdc` | Decision-making priorities, Bitter Lesson philosophy, workflow rules |
| `.cursor/rules/CONVENTIONS.mdc` | Technical standards, naming, error handling, API design |
| `.cursor/rules/BUILDER_PROFILE.mdc` | Adam's ENTJ profile, cognitive aptitudes, communication preferences |
| `.cursor/rules/PRODUCT_CONTEXT.mdc` | Product vision, target customer, brand philosophy, feature evaluation |

---

## Database Schema (Supabase)

### Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | User profiles with nutrition goals (calorie_goal, protein_goal, carbs_goal, fat_goal) | Yes |
| `foods` | Global + user-custom foods. Columns: name, brand, calories, protein, carbs, fat, serving_size | Yes |
| `meals` | Meal slots per day per user (Breakfast, Lunch, Dinner, Snack). Unique on (user_id, date, name) | Yes |
| `meal_entries` | Food items within a meal. Links meal_id to food_id with quantity multiplier | Yes |
| `supplements` | Supplement inventory per user (name, brand, default_dosage, current_stock) | Yes |
| `supplement_logs` | Timestamped supplement intake logs | Yes |
| `daily_activity` | Apple Health data per day (active_calories, steps). Unique on (user_id, date) | Yes |

### Default Goals
- Calories: 2,400
- Protein: 150g
- Carbs: 250g
- Fat: 80g

---

## Current State: What's Built

### Working
- Auth flow (login, signup, session refresh)
- Dashboard with daily calorie/macro tracking
- Food search and logging (Supabase-backed)
- Workouts page (localStorage, self-contained)
- Dark theme with glass-card design system
- Vercel deployment with auto-deploy from main

### Partially Built
- Dashboard calorie ring (basic, not the planned battery redesign)
- Recent activity feed (works but basic)

### Not Yet Built
- Battery fuel gauge dashboard (designed, not implemented)
- Macro-blend color signaling system
- Supplement tracking UI
- Apple Health integration (schema exists, webhook stubbed)
- AI-powered insights and suggestions
- Cross-domain synthesis with Understood suite
- Weight tracking UI
- Historical data views (30-day trends, etc.)

---

## Key Dependencies

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

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```
