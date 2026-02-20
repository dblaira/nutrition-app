# iOS Shortcuts for Quick Logging

These shortcuts POST to your intake webhook at:
```
https://nutrition-app-bay.vercel.app/api/webhooks/intake
```

All shortcuts use Bearer token auth with your `ACTIVITY_API_KEY` environment variable.

---

## Shortcut 1: Log Water (16oz)

**Name:** "Water"
**Icon:** Droplet, blue

### Actions:
1. **URL** — `https://nutrition-app-bay.vercel.app/api/webhooks/intake`
2. **Get Contents of URL**
   - Method: POST
   - Headers:
     - `Authorization`: `Bearer YOUR_API_KEY_HERE`
     - `Content-Type`: `application/json`
   - Request Body (JSON):
     ```json
     {
       "email": "your@email.com",
       "type": "water",
       "amount_oz": 16,
       "source_app": "shortcut"
     }
     ```
3. **Show Notification** — "Logged 16oz water"

### Variant: Ask for amount
Replace step 2's `amount_oz` with an **Ask for Input** (Number) action, stored in a variable.

---

## Shortcut 2: Log Espresso

**Name:** "Espresso"
**Icon:** Cup, brown

### Actions:
1. **URL** — `https://nutrition-app-bay.vercel.app/api/webhooks/intake`
2. **Get Contents of URL**
   - Method: POST
   - Headers:
     - `Authorization`: `Bearer YOUR_API_KEY_HERE`
     - `Content-Type`: `application/json`
   - Request Body (JSON):
     ```json
     {
       "email": "your@email.com",
       "type": "caffeine",
       "caffeine_source": "espresso",
       "amount_mg": 63,
       "source_app": "shortcut"
     }
     ```
3. **Show Notification** — "Logged espresso (63mg)"

---

## Shortcut 3: Log Coffee (12oz)

**Name:** "Coffee"
**Icon:** Cup, brown

Same as Espresso but with:
```json
{
  "email": "your@email.com",
  "type": "caffeine",
  "caffeine_source": "coffee_12oz",
  "amount_mg": 140,
  "source_app": "shortcut"
}
```

---

## Shortcut 4: Morning Supplements

**Name:** "Morning Stack"
**Icon:** Pill, green

### Actions:
1. **URL** — `https://nutrition-app-bay.vercel.app/api/webhooks/intake`
2. **Get Contents of URL**
   - Method: POST
   - Headers:
     - `Authorization`: `Bearer YOUR_API_KEY_HERE`
     - `Content-Type`: `application/json`
   - Request Body (JSON):
     ```json
     {
       "email": "your@email.com",
       "type": "supplement",
       "time_of_day": "morning",
       "source_app": "shortcut"
     }
     ```
3. **Show Notification** — "Morning supplements logged"

---

## Shortcut 5: Pre-Workout Caffeine

**Name:** "Pre-WO"
**Icon:** Lightning, orange

```json
{
  "email": "your@email.com",
  "type": "caffeine",
  "caffeine_source": "pre_workout",
  "amount_mg": 200,
  "source_app": "shortcut"
}
```

---

## Setup Tips

1. **Add to Home Screen** — In Shortcuts, tap the three dots on each shortcut → Add to Home Screen. This gives you one-tap buttons on your phone.

2. **Apple Watch** — Shortcuts appear automatically on Apple Watch if they're favorited. Open Shortcuts on your phone → long press the shortcut → tap "Add to Watch."

3. **Automation** — You can trigger these automatically:
   - "When I arrive at the gym" → Log pre-workout caffeine
   - "Every day at 7am" → Log morning supplements
   - Go to Automations tab → Create Personal Automation → choose trigger

4. **Replace YOUR_API_KEY_HERE** with the value of your `ACTIVITY_API_KEY` env var.

5. **Replace your@email.com** with your actual login email for the app.
