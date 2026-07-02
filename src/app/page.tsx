"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CheckCircle2,
  LineChart,
  Sparkles,
  Target,
  Trophy,
  Wand2,
} from "lucide-react";
import Link from "next/link";

const pillars = [
  {
    icon: Wand2,
    title: "AI goal breakdown",
    body: "Turn a fuzzy ambition into a SMART goal, milestones, weekly habits, risks, mitigations, and the next action to take today.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly review ritual",
    body: "A Sunday reset connects what happened this week to what you should change next week, so progress becomes a rhythm instead of a guilt trip.",
  },
  {
    icon: LineChart,
    title: "Trajectory Score",
    body: "One glanceable score combines consistency, recency, milestone progress, and outcome movement so users know whether they are actually on pace.",
  },
];

const processSteps = [
  "Name the ambition in plain English",
  "Clarify the metric and target date",
  "Choose starter process habits",
  "Commit to the first action",
];

const pricing = [
  {
    name: "Free",
    price: "CA$0",
    features: ["3 active goals", "Core habit tracking", "Basic Trajectory Score", "Capped AI coaching", "2 forgiving streak freezes"],
  },
  {
    name: "Pro Annual",
    price: "CA$59.99/yr",
    featured: true,
    features: ["Unlimited goals and habits", "Full weekly reviews", "AI journaling reflections", "Templates and cited lessons", "Advanced progress analytics"],
  },
  {
    name: "Pro Monthly",
    price: "CA$9.99/mo",
    features: ["Everything in Pro", "Unlimited AI coaching", "Data export", "Priority nudges", "Billing portal access"],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0E1116] text-white">
      <section className="relative px-6 py-8 md:px-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[140px]" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-glow">
              <Sparkles className="h-5 w-5" />
            </div>
            Trajectory
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full border border-white/10 px-5 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white sm:block">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0E1116] transition hover:bg-white/90">
              Start free
            </Link>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-100">
              <Brain className="h-4 w-4" />
              AI-native goal coaching, not another checkbox app
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
              Turn ambitions into plans you actually finish.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              Trajectory Pro breaks vague goals into SMART outcomes, weekly process habits, and a Sunday review ritual that keeps daily actions connected to long-term results.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-4 font-semibold shadow-glow transition hover:scale-[1.01]">
                Build my first plan
                <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link href="#system" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white">
                See the system
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="rounded-full bg-white/5 px-3 py-1">Free tier</span>
              <span className="rounded-full bg-white/5 px-3 py-1">CA$9.99/mo Pro</span>
              <span className="rounded-full bg-white/5 px-3 py-1">CA$59.99/yr annual</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.15 }} className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 to-violet-500/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#171A21]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-3xl border border-white/10 bg-[#0E1116] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Trajectory Score</p>
                    <p className="text-5xl font-black">82</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">On pace</div>
                </div>
                <div className="space-y-4">
                  <GoalPreview title="Run a 5K by October 15" progress="64%" note="3 process habits logged this week" />
                  <GoalPreview title="Save CA$5,000 emergency fund" progress="38%" note="Weekly review suggests +CA$35/week" />
                  <GoalPreview title="Finish portfolio case study" progress="71%" note="Next action: write results section" />
                </div>
                <div className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-violet-100">
                    <Sparkles className="h-4 w-4" /> Weekly AI insight
                  </div>
                  <p className="text-sm leading-6 text-slate-300">
                    Your highest-consistency weeks start with a Monday 20-minute planning block. Keep that habit and reduce Wednesday workload by one task.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="system" className="border-y border-white/10 bg-[#121621] px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">The wedge</p>
            <h2 className="text-3xl font-black md:text-5xl">Solve the input problem before tracking anything.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Most goal apps wait for users to create a good plan. Trajectory teaches the method while building the plan: outcome metric, target date, process habits, milestones, risks, and a first action.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{pillar.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#171A21] p-8">
            <div className="mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-300" />
              <h2 className="text-3xl font-black">First-session activation</h2>
            </div>
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl bg-white/[0.04] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-200">{index + 1}</div>
                  <span className="text-slate-200">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#171A21] p-8">
            <div className="mb-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-amber-300" />
              <h2 className="text-3xl font-black">Forgiving retention</h2>
            </div>
            <ul className="space-y-4 text-slate-300">
              {[
                "Two automatic streak freezes — helpful, not punitive.",
                "Don't miss twice copy that preserves momentum after a bad day.",
                "Earn Back restores a broken streak by completing an extra action.",
                "Milestone celebrations at 7, 30, and 100 days with reduced-motion fallbacks.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black md:text-5xl">Premium, CAD-anchored pricing</h2>
            <p className="mt-4 text-slate-400">A useful free tier, annual plan promoted, and Pro features tied to the weekly review loop.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pricing.map((tier) => (
              <div key={tier.name} className={`rounded-[2rem] border p-6 ${tier.featured ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/10 bg-white/[0.04]"}`}>
                <div className="mb-5 flex items-baseline justify-between">
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  {tier.featured && <span className="rounded-full bg-indigo-400/20 px-3 py-1 text-xs text-indigo-100">Best value</span>}
                </div>
                <p className="mb-6 text-3xl font-black">{tier.price}</p>
                <ul className="space-y-3 text-sm text-slate-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function GoalPreview({ title, progress, note }: { title: string; progress: string; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-100">{title}</h3>
        <span className="text-sm font-bold text-indigo-200">{progress}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: progress }} />
      </div>
      <p className="mt-2 text-sm text-slate-400">{note}</p>
    </div>
  );
}
