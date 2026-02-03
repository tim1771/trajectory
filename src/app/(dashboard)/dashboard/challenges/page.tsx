"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Brain,
  Wallet,
  Users as UsersIcon,
  Sparkles,
  Lightbulb,
  Briefcase,
  Leaf,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/lib/supabase/client";
import type { WellnessPillar } from "@/types";

interface Challenge {
  id: string;
  title: string;
  description: string;
  pillar: WellnessPillar | null;
  targetType: string;
  targetValue: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  participants: number;
  userProgress: number;
  isCompleted: boolean;
}

export default function ChallengesPage() {
  const { profile } = useUserStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get active challenges
    const today = new Date().toISOString().split("T")[0];
    const { data: challengesData } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("active", true)
      .gte("end_date", today)
      .order("start_date", { ascending: false });

    if (challengesData && challengesData.length > 0) {
      // Get participation data
      const challengeIds = challengesData.map((c: any) => c.id);
      
      const { data: participantsData } = await supabase
        .from("challenge_participants")
        .select("challenge_id, progress, completed")
        .eq("user_id", user.id)
        .in("challenge_id", challengeIds);

      // Count total participants per challenge
      const { data: countsData } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .in("challenge_id", challengeIds);

      const participantCounts: Record<string, number> = {};
      countsData?.forEach((p: any) => {
        participantCounts[p.challenge_id] = (participantCounts[p.challenge_id] || 0) + 1;
      });

      const userParticipation = new Map(
        participantsData?.map((p: any) => [p.challenge_id, p]) || []
      );

      setChallenges(
        challengesData.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          pillar: c.pillar,
          targetType: c.target_type,
          targetValue: c.target_value,
          xpReward: c.xp_reward,
          startDate: c.start_date,
          endDate: c.end_date,
          participants: participantCounts[c.id] || 0,
          userProgress: userParticipation.get(c.id)?.progress || 0,
          isCompleted: userParticipation.get(c.id)?.completed || false,
        }))
      );
    }

    setLoading(false);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("challenge_participants").insert({
      challenge_id: challengeId,
      user_id: user.id,
      progress: 0,
    });

    fetchChallenges();
  };

  const pillarIcons: Record<WellnessPillar, any> = {
    physical: Target,
    mental: Brain,
    fiscal: Wallet,
    social: UsersIcon,
    spiritual: Sparkles,
    intellectual: Lightbulb,
    occupational: Briefcase,
    environmental: Leaf,
  };

  const pillarColors: Record<WellnessPillar, string> = {
    physical: "from-[#667eea] to-[#764ba2]",
    mental: "from-[#f093fb] to-[#f5576c]",
    fiscal: "from-[#4facfe] to-[#00f2fe]",
    social: "from-[#f97316] to-[#fb923c]",
    spiritual: "from-[#8b5cf6] to-[#a78bfa]",
    intellectual: "from-[#eab308] to-[#fbbf24]",
    occupational: "from-[#22c55e] to-[#4ade80]",
    environmental: "from-[#14b8a6] to-[#2dd4bf]",
  };

  const getTargetDescription = (type: string, value: number) => {
    switch (type) {
      case "habit_count":
        return `Complete ${value} habits`;
      case "xp_earned":
        return `Earn ${value} XP`;
      case "streak_days":
        return `Maintain a ${value}-day streak`;
      default:
        return `Reach ${value}`;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Weekly Challenges
        </h1>
        <p className="text-white/60 mt-2">
          Join community challenges and earn bonus XP
        </p>
      </div>

      {/* My Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Challenges Joined</div>
          <div className="text-2xl font-bold text-white">
            {challenges.filter((c) => c.userProgress > 0).length}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Completed</div>
          <div className="text-2xl font-bold text-green-400">
            {challenges.filter((c) => c.isCompleted).length}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Bonus XP Earned</div>
          <div className="text-2xl font-bold text-purple-400">
            {challenges
              .filter((c) => c.isCompleted)
              .reduce((sum, c) => sum + c.xpReward, 0)} XP
          </div>
        </GlassCard>
      </div>

      {/* Active Challenges */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Active This Week</h2>
        {loading ? (
          <GlassCard className="text-center py-8">
            <div className="text-white/60">Loading challenges...</div>
          </GlassCard>
        ) : challenges.length === 0 ? (
          <GlassCard className="text-center py-8">
            <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 mb-2">No active challenges right now</p>
            <p className="text-white/40 text-sm">Check back next week for new challenges!</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const Icon = challenge.pillar ? pillarIcons[challenge.pillar] : Trophy;
              const gradient = challenge.pillar
                ? pillarColors[challenge.pillar]
                : "from-purple-500 to-pink-500";
              const progress = (challenge.userProgress / challenge.targetValue) * 100;
              const daysLeft = getDaysRemaining(challenge.endDate);
              const isJoined = challenge.userProgress > 0 || challenge.isCompleted;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlassCard className="relative overflow-hidden h-full">
                    {challenge.isCompleted && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                        ✓ Completed
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Goal</span>
                        <span className="text-white font-medium">
                          {getTargetDescription(challenge.targetType, challenge.targetValue)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Reward</span>
                        <span className="text-yellow-400 font-medium">
                          +{challenge.xpReward} XP
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Participants</span>
                        <span className="text-purple-400 font-medium">
                          {challenge.participants} joined
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Time left</span>
                        <span className="text-orange-400 font-medium">
                          {daysLeft} {daysLeft === 1 ? "day" : "days"}
                        </span>
                      </div>

                      {isJoined && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-white/60">Your Progress</span>
                            <span className="text-white font-medium">
                              {challenge.userProgress}/{challenge.targetValue}
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      {!isJoined ? (
                        <GlassButton
                          variant="primary"
                          className="w-full"
                          onClick={() => handleJoinChallenge(challenge.id)}
                        >
                          Join Challenge
                        </GlassButton>
                      ) : challenge.isCompleted ? (
                        <div className="text-center py-2 text-green-400 font-medium">
                          Challenge Completed! 🎉
                        </div>
                      ) : (
                        <div className="text-center py-2 text-purple-400 text-sm">
                          Keep going! You've got this 💪
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
