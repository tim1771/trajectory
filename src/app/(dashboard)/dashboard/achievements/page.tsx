"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Target,
  Brain,
  Wallet,
  BookOpen,
  Star,
  Zap,
  Crown,
  Lock,
  Medal,
  Award,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useUserStore } from "@/stores/userStore";
import type { Achievement } from "@/types";

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: "streak-3",
    key: "streak_3",
    name: "Getting Started",
    description: "Complete a 3-day streak",
    icon: "flame",
    xpReward: 50,
    pillar: null,
  },
  {
    id: "streak-7",
    key: "streak_7",
    name: "Week Warrior",
    description: "Complete a 7-day streak",
    icon: "flame",
    xpReward: 100,
    pillar: null,
  },
  {
    id: "streak-30",
    key: "streak_30",
    name: "Monthly Master",
    description: "Complete a 30-day streak",
    icon: "flame",
    xpReward: 300,
    pillar: null,
  },
  {
    id: "streak-100",
    key: "streak_100",
    name: "Century Champion",
    description: "Complete a 100-day streak",
    icon: "crown",
    xpReward: 1000,
    pillar: null,
  },
  // Physical achievements
  {
    id: "physical-first",
    key: "physical_first",
    name: "First Steps",
    description: "Complete your first physical habit",
    icon: "target",
    xpReward: 25,
    pillar: "physical",
  },
  {
    id: "physical-10",
    key: "physical_10",
    name: "Fitness Enthusiast",
    description: "Complete 10 physical habits",
    icon: "target",
    xpReward: 100,
    pillar: "physical",
  },
  {
    id: "physical-50",
    key: "physical_50",
    name: "Fitness Devotee",
    description: "Complete 50 physical habits",
    icon: "medal",
    xpReward: 250,
    pillar: "physical",
  },
  // Mental achievements
  {
    id: "mental-first",
    key: "mental_first",
    name: "Mind Opener",
    description: "Complete your first mental wellness habit",
    icon: "brain",
    xpReward: 25,
    pillar: "mental",
  },
  {
    id: "mental-10",
    key: "mental_10",
    name: "Mindfulness Practitioner",
    description: "Complete 10 mental wellness habits",
    icon: "brain",
    xpReward: 100,
    pillar: "mental",
  },
  {
    id: "mental-50",
    key: "mental_50",
    name: "Inner Peace Seeker",
    description: "Complete 50 mental wellness habits",
    icon: "medal",
    xpReward: 250,
    pillar: "mental",
  },
  // Fiscal achievements
  {
    id: "fiscal-first",
    key: "fiscal_first",
    name: "Financial Awareness",
    description: "Complete your first financial habit",
    icon: "wallet",
    xpReward: 25,
    pillar: "fiscal",
  },
  {
    id: "fiscal-10",
    key: "fiscal_10",
    name: "Money Manager",
    description: "Complete 10 financial habits",
    icon: "wallet",
    xpReward: 100,
    pillar: "fiscal",
  },
  {
    id: "fiscal-50",
    key: "fiscal_50",
    name: "Financial Freedom Fighter",
    description: "Complete 50 financial habits",
    icon: "medal",
    xpReward: 250,
    pillar: "fiscal",
  },
  // Reading achievements
  {
    id: "reader-first",
    key: "reader_first",
    name: "Knowledge Seeker",
    description: "Complete your first required reading",
    icon: "book",
    xpReward: 30,
    pillar: null,
  },
  {
    id: "reader-5",
    key: "reader_5",
    name: "Avid Reader",
    description: "Complete 5 required readings",
    icon: "book",
    xpReward: 100,
    pillar: null,
  },
  // Level achievements
  {
    id: "level-5",
    key: "level_5",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "star",
    xpReward: 100,
    pillar: null,
  },
  {
    id: "level-10",
    key: "level_10",
    name: "Shining Bright",
    description: "Reach Level 10",
    icon: "star",
    xpReward: 200,
    pillar: null,
  },
  {
    id: "level-25",
    key: "level_25",
    name: "Excellence Achieved",
    description: "Reach Level 25",
    icon: "award",
    xpReward: 500,
    pillar: null,
  },
  // Balance achievement
  {
    id: "balanced",
    key: "balanced",
    name: "Perfectly Balanced",
    description: "Complete habits from all 3 pillars in one day",
    icon: "zap",
    xpReward: 75,
    pillar: null,
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  target: Target,
  brain: Brain,
  wallet: Wallet,
  book: BookOpen,
  star: Star,
  zap: Zap,
  crown: Crown,
  medal: Medal,
  award: Award,
};

export default function AchievementsPage() {
  const { profile } = useUserStore();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  // Simulate some unlocked achievements based on profile
  const unlockedIds = new Set<string>();
  if (profile) {
    if (profile.currentStreak >= 3) unlockedIds.add("streak-3");
    if (profile.currentStreak >= 7) unlockedIds.add("streak-7");
    if (profile.currentStreak >= 30) unlockedIds.add("streak-30");
    if (profile.level >= 5) unlockedIds.add("level-5");
    if (profile.level >= 10) unlockedIds.add("level-10");
  }

  const achievementsWithStatus = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
  }));

  const filteredAchievements = achievementsWithStatus.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  const unlockedCount = achievementsWithStatus.filter((a) => a.unlocked).length;
  const totalXPEarned = achievementsWithStatus
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const pillarColors = {
    physical: "from-[#667eea] to-[#764ba2]",
    mental: "from-[#f093fb] to-[#f5576c]",
    fiscal: "from-[#4facfe] to-[#00f2fe]",
    null: "from-purple-500 to-pink-500",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Achievements
        </h1>
        <p className="text-white/60 mt-2">
          Unlock achievements as you progress on your journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Achievements Unlocked</div>
          <div className="text-2xl font-bold text-white">
            {unlockedCount}
            <span className="text-lg text-white/40">/{ACHIEVEMENTS.length}</span>
          </div>
          <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">XP from Achievements</div>
          <div className="text-2xl font-bold text-yellow-400">
            {totalXPEarned} XP
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Next Achievement</div>
          <div className="text-lg font-medium text-white">
            {achievementsWithStatus.find((a) => !a.unlocked)?.name || "All unlocked!"}
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "unlocked", "locked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === f
                ? "bg-yellow-500/30 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const Icon = iconMap[achievement.icon] || Trophy;
          const gradientClass = achievement.pillar 
            ? pillarColors[achievement.pillar] 
            : pillarColors.null;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <GlassCard
                className={`relative overflow-hidden ${!achievement.unlocked ? "opacity-50" : ""}`}
              >
                {/* Glow effect for unlocked */}
                {achievement.unlocked && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10`} />
                )}

                <div className="relative flex items-start gap-4">
                  <div
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                      ${achievement.unlocked
                        ? `bg-gradient-to-br ${gradientClass}`
                        : "bg-white/10"
                      }
                    `}
                  >
                    {achievement.unlocked ? (
                      <Icon className="w-7 h-7 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-white/60 text-sm mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${achievement.unlocked ? "text-yellow-400" : "text-white/40"}`}>
                        +{achievement.xpReward} XP
                      </span>
                      {achievement.pillar && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 capitalize">
                          {achievement.pillar}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
