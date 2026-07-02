# Trajectory Pro

Trajectory Pro is an AI-native goal coach that turns vague ambitions into SMART goals, milestones, process habits, first actions, and weekly review loops.

The product is repositioned from a broad wellness tracker into a goal-achievement system:

- **AI goal-breakdown engine**: converts natural-language goals into structured, editable plans.
- **Outcome + process model**: every goal separates the measurable outcome from the daily/weekly habits that move it.
- **Weekly review ritual**: the retention loop connects daily actions to long-term outcomes.
- **Forgiving streaks**: two automatic freezes, "don't miss twice," and earn-back mechanics.
- **Premium dark-first UI**: refined surfaces, restrained gradients, and mobile-first PWA behavior.

## Tech Stack

- **Framework**: Next.js App Router
- **Styling**: Tailwind CSS
- **Backend**: Supabase Auth/Postgres, with a local-first browser fallback so auth still works while Supabase is paused/unavailable
- **AI**: Groq API for goal breakdown and coaching
- **State**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Hosting**: Netlify

## Key routes

- `/` — repositioned Trajectory Pro marketing page
- `/dashboard/goals` — AI goal-breakdown builder
- `/dashboard` — user dashboard
- `/dashboard/coach` — AI coach
- `/dashboard/insights` — analytics/insights

## Pricing direction

- **Free**: up to 3 active goals, basic habit tracking, Trajectory Score, capped AI coaching, 2 forgiving streak freezes.
- **Pro Monthly**: CA$9.99/mo.
- **Pro Annual**: CA$59.99/yr, promoted as best value.

## Local development

```bash
npm install
npm run dev
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

Planned monetization variables:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Build

```bash
npm run build
```
