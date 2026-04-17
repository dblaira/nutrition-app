# SAVY Pitch Facade — Sleep (2026-04-17)

Investor-facing marketing facade for the Sleep feature. Built over one session
on 2026-04-17 and reverted out of the main `dblaira.github.io` repo per user
request. Preserved here for possible reuse in a separate repo.

## What this is

A fully self-contained Next.js App Router page at `/pitch/sleep` styled after
`understood.app` (dark editorial hero, beige band, white band, crimson accents,
Playfair Display + Inter), populated entirely with hardcoded "Quiet Climb" mock
data. No Supabase, no real hooks, no shared state with the rest of the app.

Plus a tiny `pitchMode` helper that silently rewrites known real routes to
their `/pitch/*` counterparts across every nav surface so the demo feels
seamless from the iPhone homescreen icon.

## Contents

```
savy-pitch-facade/
├── README.md                                   you are here
├── src/
│   ├── app/pitch/sleep/page.tsx                the facade page (client component)
│   └── lib/pitchMode.ts                        PITCH_MODE flag + pitchHref() helper
├── patches/
│   ├── SandboxHome.patch                       diff to rewrite home-grid card links
│   └── SavyMobileMenu.patch                    diff to rewrite hamburger links + add "My Logs"
└── git-patches/
    ├── 0001-Add-pitch-sleep-investor-facade...patch    original commit
    └── 0002-Fix-facade-nav-hamburger-opens-menu...patch original commit
```

## How to drop it into a new Next.js App Router repo

Prerequisites: Tailwind + globals.css with these CSS variables already defined
(or inline them):

- `--crimson: #DC143C`
- `.content-width` class maxing at ~720px
- Playfair Display and Inter loaded globally
- A `SavyMobileMenu` component and a `useAuth` hook (or stub them — the facade
  page imports them only for the header hamburger)

### 1. Copy the source files

```bash
cp -r src/app/pitch   <target-repo>/src/app/pitch
cp src/lib/pitchMode.ts  <target-repo>/src/lib/pitchMode.ts
```

### 2. Wire up the nav rewrites (optional — only if you want nav surfaces
to silently route to the facade)

Apply the patches against the target repo's SandboxHome and SavyMobileMenu:

```bash
cd <target-repo>
git apply /Users/adamblair/Developer/savy-pitch-facade/patches/SandboxHome.patch
git apply /Users/adamblair/Developer/savy-pitch-facade/patches/SavyMobileMenu.patch
```

Or hand-merge — the changes are tiny:

- **SandboxHome**: import `pitchHref` from `@/lib/pitchMode`, wrap `card.href`
  with `pitchHref(card.href)` on the home-grid card anchor
- **SavyMobileMenu**: import `pitchHref`, compute `const target =
  pitchHref(item.href)` inside the map, pass `href={target}` to Link; also adds
  a "My Logs" section with direct real-route links (Sleep / Mood / Nutrition)

### 3. Toggle the mode

`src/lib/pitchMode.ts`:

```ts
export const PITCH_MODE = true;   // nav → facade for investor demos
// export const PITCH_MODE = false; // nav → real routes for daily use
```

Real routes (e.g. `/sleep`) stay reachable by typing the URL directly
regardless of `PITCH_MODE`.

## Design decisions worth keeping

- **Three tonal bands** on the page: black (hero + stats), beige `#E8E2D8`
  (chart), white (Latest Nights + By Range). Matches the Understood palette
  exactly — values pulled from their live CSS.
- **Mock data layer** is a single `DEMO_SCORES` array of `{ date, score }`
  pairs. Labels and descriptions derive from a canonical `SLEEP_RATINGS` table
  via `ratingFor(score)`, so every 8 renders identically without copy-paste.
- **Interactivity is visual-only**: range pills toggle active state, the FAB
  opens a log sheet that flashes "✓ Logged" and dismisses without persisting.
  The `View Full Report →` CTA is an in-page anchor to the chart.
- **FacadeHeader** is bespoke (not `SavySiteHeader`) because the live header's
  hamburger routes into real app pages. The facade header's hamburger opens
  `SavyMobileMenu` for navigation, the `SAVY.` wordmark links to `/`.

## Known friction from today's session

- The "My Logs" nav section at the bottom of `SavyMobileMenu` was user-reported
  as "doesn't work" just before the revert. Root cause wasn't investigated;
  possibly a styling/touch-target issue on mobile Safari. Worth a second look
  if reused.

## Canonical narrative (the data the facade ships with)

- 14-night climb from a low of 3 back up to 8
- 7-day avg: 7.1
- Lift since low: +5.0
- Last night: 8 ("Very Good")
- Headline: "The Quiet Climb"
- No scores of 9 or 10 anywhere — deliberately honest/earned

## Context

- Source repo: `dblaira/dblaira.github.io` (deploys to `www.savy.sh` via
  Vercel)
- Session-ending state: reverted at commit `113726e` on 2026-04-17
- Original commits preserved in `git-patches/` if you want to replay them
  identically into a new repo
