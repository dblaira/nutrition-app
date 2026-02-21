# Push Notification Kit

Portable push notification system extracted from the Understood (news-journal) app.
Drop these files into any Next.js 14 + Supabase app to get working push notifications.

---

## What's Included (and ready to use)

| Layer | Files | Status |
|-------|-------|--------|
| Service Worker | `public/sw.js` | Needs your notification actions |
| React Provider + Hook | `components/push-notification-provider.tsx` | Drop-in ready |
| Permission Prompt | `components/push-permission-prompt.tsx` | Needs your copy + colors |
| Subscribe/Unsubscribe API | `app/api/push/subscribe/route.ts`, `unsubscribe/route.ts` | Drop-in ready |
| Test Notification API | `app/api/push/test/route.ts` | Needs your app name + test message |
| Device List API | `app/api/push/devices/route.ts` | Drop-in ready |
| Notification Preferences API | `app/api/user/notification-preferences/route.ts` | Drop-in ready |
| Settings UI | `components/notification-settings.tsx` | Needs your design system |
| Database Migration | `migration.sql` | Drop-in ready |
| Supabase Server Client | `lib/supabase/server.ts` | Reference — use your app's existing one |

---

## What's NOT Included (and why)

### 1. Notification Response Tracking

**Original files:** `app/api/notifications/response/route.ts`, `app/api/notifications/history/route.ts`, `components/notification-history.tsx`

**Why excluded:** These track how users respond to notifications ("This landed", "Snooze", "Opened") and update counters on an `entries` table. The response tracking is tightly coupled to the journal app's data model:

- It references an `entries` table with `landed_count`, `snooze_count`, `snoozed_until` columns
- It uses `connection_id` as a foreign key to `entries`
- The history API joins `notification_responses` with `entries` to show content previews

**What you'd build instead:** A response tracking system tied to YOUR data model. For a fitness app, this might mean tracking responses to workout reminders, meal logging nudges, or streak notifications — each updating your own tables (workouts, meals, etc.) instead of entries.

### 2. Smart Scheduling / Cron Job

**Original file:** `app/api/cron/evaluate-connections/route.ts`

**Why excluded:** This is the "brain" that decides WHAT to notify about and WHEN. It's 100% app-specific:

- Scores journal "connections" by priority, staleness, and response ratio
- Selects the single best connection to surface at each time window
- Uses `surface_conditions` JSONB field specific to journal entries

**What you'd build instead:** A cron job that evaluates YOUR app's notification triggers — missed workout streaks, upcoming meals, hydration reminders, daily check-in prompts, etc. The STRUCTURE (cron hits endpoint → evaluates users → checks time windows → sends notification) is the same, but the scoring logic is entirely yours.

### 3. Send-Connection API

**Original file:** `app/api/push/send-connection/route.ts`

**Why excluded:** Sends a notification for a specific journal "connection" entry. It reads from the `entries` table and constructs notification content from journal-specific fields (`headline`, `content`, `connection_type`).

**What you'd build instead:** A send API that constructs notifications from YOUR content — workout names, meal plans, achievement milestones, etc.

### 4. Notification History UI

**Original file:** `components/notification-history.tsx`

**Why excluded:** Displays journal-specific history with connection types like "Identity Anchor", "Pattern Interrupt", "Validated Principle". The UI labels, colors, and data shape are all journal-specific.

**What you'd build instead:** A history component showing your fitness notification types — workout reminders sent, meals logged via notification, streaks maintained, etc.

### 5. Entry-Level Tracking Columns

**Original migration:** Adds `surface_count`, `landed_count`, `snooze_count`, `snoozed_until`, `last_surfaced_at` to the `entries` table.

**Why excluded:** These columns belong on the journal's `entries` table. Your fitness app would add equivalent tracking to whatever tables you're notifying about.

---

## Setup Steps

### 1. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

This gives you a public key and a private key. Add them as environment variables.

### 2. Environment Variables

Add to `.env.local` (and Vercel dashboard for production):

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

Your app should already have these from Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Run the SQL Migration

Copy `migration.sql` and run it in your Supabase SQL Editor. This creates:
- `push_subscriptions` table (stores device endpoints and keys)
- `user_notification_preferences` table (stores preferred notification times)
- RLS policies for both

### 4. Install the npm Package

```bash
npm install web-push
npm install -D @types/web-push
```

### 5. Copy Files Into Your App

```
your-fitness-app/
├── public/
│   └── sw.js                              ← from this kit
├── components/
│   ├── push-notification-provider.tsx      ← from this kit (drop-in)
│   ├── push-permission-prompt.tsx          ← from this kit (update copy + colors)
│   └── notification-settings.tsx           ← from this kit (update design)
├── app/
│   └── api/
│       ├── push/
│       │   ├── subscribe/route.ts          ← from this kit (drop-in)
│       │   ├── unsubscribe/route.ts        ← from this kit (drop-in)
│       │   ├── test/route.ts               ← from this kit (update app name + message)
│       │   └── devices/route.ts            ← from this kit (drop-in)
│       └── user/
│           └── notification-preferences/
│               └── route.ts                ← from this kit (drop-in)
└── lib/
    └── supabase/
        └── server.ts                       ← use your existing one, or copy the template
```

### 6. Wire Into Your Layout

In your root `layout.tsx`:

```tsx
import { PushNotificationProvider } from '@/components/push-notification-provider'
import { PushPermissionPrompt } from '@/components/push-permission-prompt'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PushNotificationProvider>
          {children}
          <PushPermissionPrompt />
        </PushNotificationProvider>
      </body>
    </html>
  )
}
```

### 7. Add Settings Page

On whatever settings/profile page you have:

```tsx
import { NotificationSettings } from '@/components/notification-settings'

export default function SettingsPage() {
  return <NotificationSettings />
}
```

---

## What You'll Build Next (app-specific)

After the kit is installed, you still need:

1. **A "send notification" API** — takes your fitness data and pushes it to users
2. **A cron job** — evaluates when users should get nudged (missed workout, meal time, etc.)
3. **Response tracking** — if you want to track what users do with notifications
4. **Notification content** — the actual messages (workout reminders, streak alerts, etc.)

The kit gives you all the plumbing. You supply the content and the triggers.

---

## Architecture Diagram

```
User's Browser                    Your Server                     Supabase
─────────────                    ───────────                     ────────
                                                               
sw.js ◄──── push event ──── web-push library                  
  │                              │                              
  │ click/action                 │ reads subscriptions          
  │                              │         │                    
  ▼                              ▼         ▼                    
/api/notifications/response   /api/push/subscribe ──► push_subscriptions
  (YOU BUILD THIS)            (included in kit)       (included in kit)
                                                               
                              /api/cron/your-trigger            
                              (YOU BUILD THIS)                  
                                │                              
                                │ evaluates users              
                                │ sends via web-push           
                                ▼                              
                              push_subscriptions ──► user devices
```
