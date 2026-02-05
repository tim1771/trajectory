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
  Zap,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CountUp } from "@/components/ui/AnimatedCounter";
import { StaggeredList, StaggeredItem, FadeInOnScroll } from "@/components/ui/StaggeredList";
import { useUserStore } from "@/stores/userStore";
import { getGreeting, getLevelFromXP } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AvatarShowcase } from "@/components/UserAvatar";
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
    <div className="space-y-8 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative"
      >
        <motion.div
          className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <p className="text-white/50 text-sm font-medium tracking-wide uppercase mb-2">
          {getGreeting()}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            {profile?.displayName || "Traveler"}
          </span>
        </h1>
        <p className="text-white/60 text-lg">
          Level <span className="text-purple-400 font-semibold">{levelInfo.level}</span> • 
          <span className="text-white/80 ml-2"><CountUp end={profile?.xpPoints || 0} duration={1.5} /> XP</span>
        </p>
      </motion.div>

      {/* Avatar Showcase */}
      <FadeInOnScroll>
        <AvatarShowcase />
      </FadeInOnScroll>

      {/* Quick Stats - Animated Cards */}
      <StaggeredList className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StaggeredItem>
          <QuickStat
            icon={<Flame className="w-5 h-5" />}
            label="Streak"
            value={profile?.currentStreak || 0}
            suffix=" days"
            color="orange"
          />
        </StaggeredItem>
        <StaggeredItem>
          <QuickStat
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Today"
            value={todayStats.completed}
            suffix={`/${todayStats.total}`}
            color="green"
            progress={(todayStats.completed / Math.max(todayStats.total, 1)) * 100}
          />
        </StaggeredItem>
        <StaggeredItem>
          <QuickStat
            icon={<Trophy className="w-5 h-5" />}
            label="Level"
            value={levelInfo.level}
            color="purple"
            progress={levelProgress}
          />
        </StaggeredItem>
        <StaggeredItem>
          <QuickStat
            icon={<Zap className="w-5 h-5" />}
            label="XP Today"
            value={todayStats.xpEarned}
            prefix="+"
            suffix=" XP"
            color="yellow"
          />
        </StaggeredItem>
      </StaggeredList>

      {/* 8 Dimensions of Wellness */}
      <FadeInOnScroll>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dimensions</span>
          </h2>
          <span className="text-white/40 text-sm">8 pillars</span>
        </div>
      </FadeInOnScroll>
      <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" staggerDelay={0.06}>
        <StaggeredItem>
          <PillarCard pillar="physical" icon={<Target className="w-5 h-5" />} title="Physical" progress={getPillarProgress("physical")} habits={habits.filter((h) => h.pillar === "physical").length} href="/dashboard/physical" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="mental" icon={<Brain className="w-5 h-5" />} title="Mental" progress={getPillarProgress("mental")} habits={habits.filter((h) => h.pillar === "mental").length} href="/dashboard/mental" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="fiscal" icon={<Wallet className="w-5 h-5" />} title="Fiscal" progress={getPillarProgress("fiscal")} habits={habits.filter((h) => h.pillar === "fiscal").length} href="/dashboard/fiscal" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="social" icon={<Users className="w-5 h-5" />} title="Social" progress={getPillarProgress("social")} habits={habits.filter((h) => h.pillar === "social").length} href="/dashboard/social" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="spiritual" icon={<SparklesIcon className="w-5 h-5" />} title="Spiritual" progress={getPillarProgress("spiritual")} habits={habits.filter((h) => h.pillar === "spiritual").length} href="/dashboard/spiritual" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="intellectual" icon={<Lightbulb className="w-5 h-5" />} title="Intellectual" progress={getPillarProgress("intellectual")} habits={habits.filter((h) => h.pillar === "intellectual").length} href="/dashboard/intellectual" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="occupational" icon={<Briefcase className="w-5 h-5" />} title="Occupational" progress={getPillarProgress("occupational")} habits={habits.filter((h) => h.pillar === "occupational").length} href="/dashboard/occupational" />
        </StaggeredItem>
        <StaggeredItem>
          <PillarCard pillar="environmental" icon={<Leaf className="w-5 h-5" />} title="Environmental" progress={getPillarProgress("environmental")} habits={habits.filter((h) => h.pillar === "environmental").length} href="/dashboard/environmental" />
        </StaggeredItem>
      </StaggeredList>

      {/* Today's Habits */}
      <FadeInOnScroll delay={0.1}>
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Today's <span className="text-purple-400">Habits</span></h2>
            <Link href="/dashboard/physical">
              <GlassButton variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </GlassButton>
            </Link>
          </div>

          {habits.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-8 h-8 text-white/40" />
              </motion.div>
              <p className="text-white/60 mb-4">No habits yet. Start building your routine!</p>
              <Link href="/dashboard/physical">
                <GlassButton variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Create First Habit
                </GlassButton>
              </Link>
            </motion.div>
          ) : (
            <StaggeredList className="space-y-3" staggerDelay={0.05}>
              {habits.slice(0, 5).map((habit) => (
                <StaggeredItem key={habit.id}>
                  <HabitItem habit={habit} />
                </StaggeredItem>
              ))}
              {habits.length > 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/dashboard/physical" className="block text-center text-purple-400 hover:text-purple-300 text-sm py-2">
                    View all {habits.length} habits →
                  </Link>
                </motion.div>
              )}
            </StaggeredList>
          )}
        </GlassCard>
      </FadeInOnScroll>

      {/* Quick Actions */}
      <FadeInOnScroll delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/coach">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <GlassCard className="flex items-center gap-4 group">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors">AI Coach</h3>
                  <p className="text-white/50 text-sm">Get personalized guidance</p>
                </div>
                <span className="text-white/30 group-hover:text-white/50 transition-colors">→</span>
              </GlassCard>
            </motion.div>
          </Link>
          <Link href="/dashboard/library">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <GlassCard className="flex items-center gap-4 group">
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/25"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors">Library</h3>
                  <p className="text-white/50 text-sm">Expand your knowledge</p>
                </div>
                <span className="text-white/30 group-hover:text-white/50 transition-colors">→</span>
              </GlassCard>
            </motion.div>
          </Link>
        </div>
      </FadeInOnScroll>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  progress,
  color = "purple",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  progress?: number;
  color?: "orange" | "green" | "purple" | "yellow";
}) {
  const colors = {
    orange: { text: "text-orange-400", bg: "bg-orange-500/20", gradient: "from-orange-500 to-amber-500" },
    green: { text: "text-green-400", bg: "bg-green-500/20", gradient: "from-green-500 to-emerald-500" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/20", gradient: "from-purple-500 to-pink-500" },
    yellow: { text: "text-yellow-400", bg: "bg-yellow-500/20", gradient: "from-yellow-500 to-orange-500" },
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-4 ${colors[color].bg} backdrop-blur-sm border border-white/10`}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Animated background glow */}
      <motion.div
        className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${colors[color].gradient} rounded-full blur-2xl opacity-40`}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className={`${colors[color].text}`}>{icon}</span>
          <span className="text-white/40 text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <div className={`text-2xl md:text-3xl font-bold ${colors[color].text}`}>
          {prefix}<CountUp end={value} duration={1.5} />{suffix}
        </div>
        {progress !== undefined && (
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${colors[color].gradient} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
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
        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 cursor-pointer group"
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated background gradient */}
        <motion.div 
          className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${gradients[pillar]} opacity-20 blur-2xl`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <motion.div 
              className={`p-2.5 rounded-xl bg-gradient-to-br ${gradients[pillar]} shadow-lg`}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              {icon}
            </motion.div>
            <ProgressRing progress={progress} size={42} strokeWidth={3} color={pillar} showLabel={false} />
          </div>

          <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-white/90">{title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-xs">
              {habits} habit{habits !== 1 ? "s" : ""}
            </p>
            <span className="text-white/30 text-lg group-hover:text-white/50 transition-colors">→</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function HabitItem({ habit }: { habit: any }) {
  const [completed, setCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
      setIsAnimating(true);
      await supabase.from("habit_completions").insert({
        habit_id: habit.id,
        user_id: user.id,
        completed_at: new Date().toISOString(),
      });
      setTimeout(() => setIsAnimating(false), 500);
    }
    
    setCompleted(!completed);
  };

  const pillarColors: Record<string, string> = {
    physical: "border-l-purple-500 bg-purple-500/5",
    mental: "border-l-pink-500 bg-pink-500/5",
    fiscal: "border-l-cyan-500 bg-cyan-500/5",
    social: "border-l-orange-500 bg-orange-500/5",
    spiritual: "border-l-violet-500 bg-violet-500/5",
    intellectual: "border-l-yellow-500 bg-yellow-500/5",
    occupational: "border-l-green-500 bg-green-500/5",
    environmental: "border-l-teal-500 bg-teal-500/5",
  };

  return (
    <motion.div
      layout
      className={`
        relative flex items-center gap-4 p-4 rounded-xl border-l-4 overflow-hidden
        ${pillarColors[habit.pillar] || "border-l-purple-500 bg-purple-500/5"}
        ${completed ? "opacity-60" : ""}
      `}
      whileTap={{ scale: 0.98 }}
    >
      {/* Success animation overlay */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 bg-green-500/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      <motion.button
        onClick={handleToggle}
        className={`
          relative w-7 h-7 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${completed
            ? "bg-green-500 border-green-500"
            : "border-white/30 hover:border-white/50 active:scale-90"
          }
        `}
        whileTap={{ scale: 0.8 }}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </motion.button>
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${completed ? "text-white/50 line-through" : "text-white"}`}>
          {habit.name}
        </div>
        <div className="text-white/40 text-xs capitalize">{habit.pillar}</div>
      </div>
      <motion.div 
        className="text-purple-400 text-sm font-medium whitespace-nowrap"
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      >
        +{habit.xpReward} XP
      </motion.div>
    </motion.div>
  );
}
