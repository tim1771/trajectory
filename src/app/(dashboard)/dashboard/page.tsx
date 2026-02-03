"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Brain,
  Wallet,
  Users,
  Sparkles as SparklesIcon,
  Lightbulb,
  Briefcase,
  Leaf,
  Flame,
  TrendingUp,
  CheckCircle2,
  Plus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useUserStore } from "@/stores/userStore";
import { getGreeting, getLevelFromXP } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { WellnessPillar } from "@/types";

export default function DashboardPage() {
  const { profile, habits, setHabits } = useUserStore();
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    xpEarned: 0,
  });

  useEffect(() => {
    const fetchHabits = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("user_id", user.id)
        .eq("archived", false);

      if (habitsData) {
        const today = new Date().toISOString().split("T")[0];
        const formattedHabits = habitsData.map((h: any) => ({
          id: h.id,
          userId: h.user_id,
          pillar: h.pillar,
          name: h.name,
          description: h.description,
          frequency: h.frequency,
          targetDays: h.target_days,
          xpReward: h.xp_reward,
          archived: h.archived,
          completions: h.habit_completions || [],
        }));
        setHabits(formattedHabits);

        // Calculate today's stats
        const todayCompletions = formattedHabits.filter((h: any) =>
          h.completions.some((c: any) => c.completed_at.startsWith(today))
        );
        setTodayStats({
          completed: todayCompletions.length,
          total: formattedHabits.length,
          xpEarned: todayCompletions.reduce((sum: number, h: any) => sum + h.xpReward, 0),
        });
      }
    };

    fetchHabits();
  }, [setHabits]);

  const levelInfo = profile ? getLevelFromXP(profile.xpPoints) : { level: 1, currentXP: 0, nextLevelXP: 100 };
  const levelProgress = (levelInfo.currentXP / levelInfo.nextLevelXP) * 100;

  // Calculate pillar progress
  const getPillarProgress = (pillar: string) => {
    const pillarHabits = habits.filter((h) => h.pillar === pillar);
    if (pillarHabits.length === 0) return 0;
    
    const today = new Date().toISOString().split("T")[0];
    const completed = pillarHabits.filter((h) =>
      h.completions.some((c: any) => c.completed_at?.startsWith(today))
    ).length;
    
    return Math.round((completed / pillarHabits.length) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {getGreeting()}, {profile?.displayName || "Traveler"}
        </h1>
        <p className="text-white/60">
          Here's your progress for today. Keep up the momentum!
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="Current Streak"
          value={`${profile?.currentStreak || 0} days`}
          trend={profile?.currentStreak ? "+1" : undefined}
        />
        <QuickStat
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          label="Today's Habits"
          value={`${todayStats.completed}/${todayStats.total}`}
          progress={(todayStats.completed / Math.max(todayStats.total, 1)) * 100}
        />
        <QuickStat
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          label="Level Progress"
          value={`Level ${levelInfo.level}`}
          progress={levelProgress}
        />
        <QuickStat
          icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
          label="XP Today"
          value={`+${todayStats.xpEarned} XP`}
        />
      </div>

      {/* 8 Dimensions of Wellness */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">8 Dimensions of Wellness</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PillarCard
            pillar="physical"
            icon={<Target className="w-5 h-5" />}
            title="Physical"
            progress={getPillarProgress("physical")}
            habits={habits.filter((h) => h.pillar === "physical").length}
            href="/dashboard/physical"
          />
          <PillarCard
            pillar="mental"
            icon={<Brain className="w-5 h-5" />}
            title="Mental"
            progress={getPillarProgress("mental")}
            habits={habits.filter((h) => h.pillar === "mental").length}
            href="/dashboard/mental"
          />
          <PillarCard
            pillar="fiscal"
            icon={<Wallet className="w-5 h-5" />}
            title="Fiscal"
            progress={getPillarProgress("fiscal")}
            habits={habits.filter((h) => h.pillar === "fiscal").length}
            href="/dashboard/fiscal"
          />
          <PillarCard
            pillar="social"
            icon={<Users className="w-5 h-5" />}
            title="Social"
            progress={getPillarProgress("social")}
            habits={habits.filter((h) => h.pillar === "social").length}
            href="/dashboard/social"
          />
          <PillarCard
            pillar="spiritual"
            icon={<SparklesIcon className="w-5 h-5" />}
            title="Spiritual"
            progress={getPillarProgress("spiritual")}
            habits={habits.filter((h) => h.pillar === "spiritual").length}
            href="/dashboard/spiritual"
          />
          <PillarCard
            pillar="intellectual"
            icon={<Lightbulb className="w-5 h-5" />}
            title="Intellectual"
            progress={getPillarProgress("intellectual")}
            habits={habits.filter((h) => h.pillar === "intellectual").length}
            href="/dashboard/intellectual"
          />
          <PillarCard
            pillar="occupational"
            icon={<Briefcase className="w-5 h-5" />}
            title="Occupational"
            progress={getPillarProgress("occupational")}
            habits={habits.filter((h) => h.pillar === "occupational").length}
            href="/dashboard/occupational"
          />
          <PillarCard
            pillar="environmental"
            icon={<Leaf className="w-5 h-5" />}
            title="Environmental"
            progress={getPillarProgress("environmental")}
            habits={habits.filter((h) => h.pillar === "environmental").length}
            href="/dashboard/environmental"
          />
        </div>
      </div>

      {/* Today's Habits */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Today's Habits</h2>
          <Link href="/dashboard/physical">
            <GlassButton variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Habit
            </GlassButton>
          </Link>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Target className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 mb-4">No habits yet. Start building your routine!</p>
            <Link href="/dashboard/physical">
              <GlassButton variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create First Habit
              </GlassButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.slice(0, 5).map((habit) => (
              <HabitItem key={habit.id} habit={habit} />
            ))}
            {habits.length > 5 && (
              <Link href="/dashboard/physical" className="block text-center text-purple-400 hover:text-purple-300 text-sm py-2">
                View all {habits.length} habits
              </Link>
            )}
          </div>
        )}
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/coach">
          <GlassCard hover className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Chat with AI Coach</h3>
              <p className="text-white/60 text-sm">Get personalized guidance</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/dashboard/library">
          <GlassCard hover className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Required Reading</h3>
              <p className="text-white/60 text-sm">Expand your knowledge</p>
            </div>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  trend,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  progress?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <span className="text-white/60 text-sm">{label}</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-white">{value}</span>
          {trend && (
            <span className="text-green-400 text-sm">{trend}</span>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function PillarCard({
  pillar,
  icon,
  title,
  progress,
  habits,
  href,
}: {
  pillar: WellnessPillar;
  icon: React.ReactNode;
  title: string;
  progress: number;
  habits: number;
  href: string;
}) {
  const gradients: Record<WellnessPillar, string> = {
    physical: "from-[#667eea] to-[#764ba2]",
    mental: "from-[#f093fb] to-[#f5576c]",
    fiscal: "from-[#4facfe] to-[#00f2fe]",
    social: "from-[#f97316] to-[#fb923c]",
    spiritual: "from-[#8b5cf6] to-[#a78bfa]",
    intellectual: "from-[#eab308] to-[#fbbf24]",
    occupational: "from-[#22c55e] to-[#4ade80]",
    environmental: "from-[#14b8a6] to-[#2dd4bf]",
  };

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -3 }}
        transition={{ duration: 0.2 }}
      >
        <GlassCard className="relative overflow-hidden p-4">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradients[pillar]} opacity-20 blur-2xl`} />
          
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradients[pillar]}`}>
              {icon}
            </div>
            <ProgressRing progress={progress} size={44} strokeWidth={3} color={pillar} showLabel={false} />
          </div>

          <h3 className="text-base font-semibold text-white mb-0.5">{title}</h3>
          <p className="text-white/60 text-xs">
            {habits} habit{habits !== 1 ? "s" : ""} • {progress}%
          </p>
        </GlassCard>
      </motion.div>
    </Link>
  );
}

function HabitItem({ habit }: { habit: any }) {
  const [completed, setCompleted] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const isCompletedToday = habit.completions?.some(
      (c: any) => c.completed_at?.startsWith(today)
    );
    setCompleted(isCompletedToday);
  }, [habit.completions, today]);

  const handleToggle = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    if (!completed) {
      await supabase.from("habit_completions").insert({
        habit_id: habit.id,
        user_id: user.id,
        completed_at: new Date().toISOString(),
      });
    }
    
    setCompleted(!completed);
  };

  const pillarColors: Record<string, string> = {
    physical: "border-l-purple-500",
    mental: "border-l-pink-500",
    fiscal: "border-l-cyan-500",
    social: "border-l-orange-500",
    spiritual: "border-l-violet-500",
    intellectual: "border-l-yellow-500",
    occupational: "border-l-green-500",
    environmental: "border-l-teal-500",
  };

  return (
    <motion.div
      layout
      className={`
        flex items-center gap-4 p-4 rounded-xl bg-white/5 border-l-4
        ${pillarColors[habit.pillar] || "border-l-purple-500"}
        ${completed ? "opacity-60" : ""}
      `}
    >
      <button
        onClick={handleToggle}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${completed
            ? "bg-green-500 border-green-500"
            : "border-white/30 hover:border-white/50"
          }
        `}
      >
        {completed && <CheckCircle2 className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-1">
        <div className={`font-medium ${completed ? "text-white/60 line-through" : "text-white"}`}>
          {habit.name}
        </div>
        <div className="text-white/40 text-sm capitalize">{habit.pillar}</div>
      </div>
      <div className="text-purple-400 text-sm">+{habit.xpReward} XP</div>
    </motion.div>
  );
}
