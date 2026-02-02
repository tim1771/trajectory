# Trajectory

A premium holistic wellness PWA that helps users optimize their physical, mental, and fiscal health through AI-powered personalization, gamification, and evidence-based guidance.

## Features

- **Three Wellness Pillars**: Physical, Mental, and Fiscal health tracking
- **AI Coach**: Groq-powered personalized guidance and coaching
- **Habit Tracking**: Daily habit tracking with streaks and XP rewards
- **Required Reading**: Curated content from reputable sources (Harvard Health, NIH, etc.)
- **Gamification**: XP system, levels, achievements, and streaks
- **Beautiful UI**: Glassmorphism design with smooth animations
- **PWA Support**: Installable on mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom glassmorphism system
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **AI**: Groq API (Llama 3.3 70B)
- **State**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Groq API key

### Installation

1. Clone the repository and install dependencies:

```bash
cd trajectory
npm install
```

2. Copy the environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `GROQ_API_KEY` - Your Groq API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key (for subscriptions)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

3. Set up your Supabase database:

Run the migration in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   └── ui/                # Glassmorphism UI components
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── groq/              # Groq AI client
│   └── gamification/      # XP, achievements, streaks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## Subscription Tiers

### Free Tier
- Basic habit tracking
- 3 goals per pillar
- 10 AI coach messages/day
- 5 reading articles
- Basic progress stats

### Premium ($9.99/month)
- Unlimited habits and goals
- Unlimited AI coaching
- Full reading library
- Advanced analytics
- 3 streak freezes/month
- Data export

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License.
