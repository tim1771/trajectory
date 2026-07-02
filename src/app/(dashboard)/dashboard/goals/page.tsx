"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, Loader2, ShieldAlert, Sparkles, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

type Plan = {
  smart_goal: string;
  identity_statement: string;
  outcome_metric: string;
  target_date: string;
  milestones: string[];
  process_habits: string[];
  first_action: string;
  risks: string[];
  mitigations: string[];
};

const starterPlan: Plan = {
  smart_goal: "Run a comfortable 5K by October 15 by training 3 days per week and increasing distance gradually.",
  identity_statement: "I am becoming the kind of person who keeps promises to my future self.",
  outcome_metric: "Distance completed and weekly training consistency",
  target_date: "October 15",
  milestones: ["Walk/run 2 km without stopping", "Complete 3 training weeks", "Run 4 km comfortably", "Finish a full 5K"],
  process_habits: ["Train Monday, Wednesday, and Saturday", "Log one recovery note after each run"],
  first_action: "Schedule the first 20-minute walk/run block for tomorrow.",
  risks: ["Starting too hard", "Missing one workout and quitting"],
  mitigations: ["Use a beginner pace", "Apply the don't-miss-twice rule"],
};

export default function GoalsPage() {
  const [goal, setGoal] = useState("I want to get in better shape and have more energy");
  const [plan, setPlan] = useState<Plan>(starterPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/goals/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not build plan");
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#171A21]/90 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-100">
            <Sparkles className="h-4 w-4" /> AI goal breakdown engine
          </div>
          <h1 className="text-3xl font-black text-white md:text-5xl">Turn a vague ambition into a finishable plan.</h1>
          <p className="mt-4 text-lg leading-8 text-white/60">
            This is the new Trajectory core loop: SMART outcome, identity statement, milestones, process habits, risks, mitigations, and the first action.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <GlassCard className="h-fit">
          <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-white/40">Your ambition</label>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="min-h-[180px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-white outline-none transition placeholder:text-white/30 focus:border-indigo-400/50"
            placeholder="Example: I want to save money, get fit, change careers, or write a book..."
          />
          <GlassButton variant="primary" className="mt-4 w-full justify-center" onClick={buildPlan} disabled={loading || goal.trim().length === 0}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? "Building plan..." : "Build SMART plan"}
          </GlassButton>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            AI proposes. You decide. Every field should stay editable before saving a final goal.
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="mb-4 flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-300" />
              <h2 className="text-2xl font-bold text-white">SMART goal</h2>
            </div>
            <p className="text-lg leading-8 text-white/80">{plan.smart_goal}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info label="Outcome metric" value={plan.outcome_metric} />
              <Info label="Target date" value={plan.target_date} icon={<Calendar className="h-4 w-4" />} />
            </div>
            <div className="mt-4 rounded-2xl bg-indigo-400/10 p-4 text-indigo-100">
              {plan.identity_statement}
            </div>
          </GlassCard>

          <div className="grid gap-6 md:grid-cols-2">
            <ListCard title="Milestones" items={plan.milestones} />
            <ListCard title="Process habits" items={plan.process_habits} />
          </div>

          <GlassCard>
            <div className="mb-3 flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-emerald-300" />
              <h3 className="text-xl font-bold text-white">First action</h3>
            </div>
            <p className="text-white/75">{plan.first_action}</p>
          </GlassCard>

          <div className="grid gap-6 md:grid-cols-2">
            <ListCard title="Risks" items={plan.risks} icon="risk" />
            <ListCard title="Mitigations" items={plan.mitigations} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">{icon}{label}</p>
      <p className="text-white/80">{value}</p>
    </div>
  );
}

function ListCard({ title, items, icon }: { title: string; items: string[]; icon?: "risk" }) {
  return (
    <GlassCard>
      <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>
      <ul className="space-y-3">
        {(items || []).map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-white/70">
            {icon === "risk" ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}
            {item}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
