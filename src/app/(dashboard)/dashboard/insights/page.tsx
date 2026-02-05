"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Lightbulb,
  Layers,
  Clock,
  Zap,
  ChevronRight,
  Loader2,
  Target,
  Heart,
  Wallet,
  Users,
  Sparkles,
  BookOpen,
  Briefcase,
  Leaf,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StaggeredList, StaggeredItem, FadeInOnScroll } from "@/components/ui/StaggeredList";
import { CountUp } from "@/components/ui/AnimatedCounter";
import Link from "next/link";
import type { WellnessPillar } from "@/types";

interface PillarScore {
  pillar: WellnessPillar;
  score: number;
  habitCount: number;
  completionRate: number;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  primaryPillar?: WellnessPillar;
  secondaryPillar?: WellnessPillar;
  confidence: number;
  priority: number;
}

interface Correlation {
  pillarA: WellnessPillar;
  pillarB: WellnessPillar;
  strength: number;
  insightText: string;
}

interface HabitStack {
  habitTypeA: string;
  habitTypeB: string;
  pillarA: WellnessPillar;
  pillarB: WellnessPillar;
  completionRate: number;
  suggestionText: string;
  score: number;
}

interface UserInsights {
  overallScore: number;
  pillarScores: PillarScore[];
  strongestPillar: WellnessPillar | null;
  weakestPillar: WellnessPillar | null;
  bestTimeOfDay: "morning" | "afternoon" | "evening" | null;
  bestDayOfWeek: number | null;
  streakStats: {
    averageLength: number;
    recoveryRate: number;
  };
  recommendations: Recommendation[];
}

const pillarIcons: Record<WellnessPillar, React.ReactNode> = {
  physical: <Target className="w-5 h-5" />,
  mental: <Brain className="w-5 h-5" />,
  fiscal: <Wallet className="w-5 h-5" />,
  social: <Users className="w-5 h-5" />,
  spiritual: <Sparkles className="w-5 h-5" />,
  intellectual: <BookOpen className="w-5 h-5" />,
  occupational: <Briefcase className="w-5 h-5" />,
  environmental: <Leaf className="w-5 h-5" />,
};

const pillarColors: Record<WellnessPillar, string> = {
  physical: "from-blue-500 to-purple-500",
  mental: "from-pink-500 to-purple-500",
  fiscal: "from-cyan-500 to-blue-500",
  social: "from-orange-500 to-red-500",
  spiritual: "from-violet-500 to-purple-500",
  intellectual: "from-yellow-500 to-orange-500",
  occupational: "from-green-500 to-emerald-500",
  environmental: "from-teal-500 to-cyan-500",
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [habitStacks, setHabitStacks] = useState<HabitStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const [insightsRes, correlationsRes, stacksRes] = await Promise.all([
          fetch("/api/insights?type=full"),
          fetch("/api/insights?type=correlations"),
          fetch("/api/insights?type=stacks"),
        ]);

        if (insightsRes.ok) {
          const data = await insightsRes.json();
          setInsights(data);
        }

        if (correlationsRes.ok) {
          const data = await correlationsRes.json();
          setCorrelations(data.correlations || []);
        }

        if (stacksRes.ok) {
          const data = await stacksRes.json();
          setHabitStacks(data.habitStacks || []);
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <FadeInOnScroll>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Insights</span>
          </h1>
          <p className="text-white/60 mt-2">
            Personalized analytics powered by your wellness data
          </p>
        </div>
      </FadeInOnScroll>

      {/* Overall Score */}
      <FadeInOnScroll delay={0.1}>
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <ProgressRing
                progress={insights?.overallScore || 0}
                size={140}
                strokeWidth={12}
                color="default"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">
                    <CountUp end={insights?.overallScore || 0} duration={1.5} />
                  </span>
                  <p className="text-white/50 text-xs">OVERALL</p>
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-white mb-2">
                Wellness Score
              </h2>
              <p className="text-white/60 mb-4">
                Based on your habit completion across all 8 pillars over the last 30 days
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {insights?.strongestPillar && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">
                      Strongest: {insights.strongestPillar}
                    </span>
                  </div>
                )}
                {insights?.weakestPillar && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full">
                    <Lightbulb className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-sm">
                      Focus: {insights.weakestPillar}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </FadeInOnScroll>

      {/* Pillar Scores Grid */}
      <FadeInOnScroll delay={0.15}>
        <h2 className="text-xl font-semibold text-white mb-4">Pillar Performance</h2>
      </FadeInOnScroll>
      <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-3" staggerDelay={0.05}>
        {(insights?.pillarScores || []).map((pillar) => (
          <StaggeredItem key={pillar.pillar}>
            <Link href={`/dashboard/${pillar.pillar}`}>
              <GlassCard hover className="p-4 h-full" glow={pillar.pillar}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillarColors[pillar.pillar]} flex items-center justify-center mb-3`}>
                  {pillarIcons[pillar.pillar]}
                </div>
                <h3 className="text-white font-medium capitalize mb-1">{pillar.pillar}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">
                    <CountUp end={pillar.score} duration={1} />
                  </span>
                  <span className="text-white/50 text-sm">%</span>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  {pillar.habitCount} habit{pillar.habitCount !== 1 ? "s" : ""} • {pillar.completionRate}% rate
                </p>
              </GlassCard>
            </Link>
          </StaggeredItem>
        ))}
      </StaggeredList>

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <>
          <FadeInOnScroll delay={0.2}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Personalized Recommendations
            </h2>
          </FadeInOnScroll>
          <StaggeredList className="space-y-3" staggerDelay={0.08}>
            {insights.recommendations.slice(0, 4).map((rec, index) => (
              <StaggeredItem key={index}>
                <GlassCard hover className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rec.type === "pillar_focus" ? "bg-orange-500/20" :
                      rec.type === "habit_stack" ? "bg-purple-500/20" :
                      rec.type === "time_optimization" ? "bg-blue-500/20" :
                      "bg-green-500/20"
                    }`}>
                      {rec.type === "pillar_focus" ? <Target className="w-5 h-5 text-orange-400" /> :
                       rec.type === "habit_stack" ? <Layers className="w-5 h-5 text-purple-400" /> :
                       rec.type === "time_optimization" ? <Clock className="w-5 h-5 text-blue-400" /> :
                       <Zap className="w-5 h-5 text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium">{rec.title}</h3>
                      <p className="text-white/60 text-sm mt-1">{rec.description}</p>
                      {(rec.primaryPillar || rec.secondaryPillar) && (
                        <div className="flex gap-2 mt-2">
                          {rec.primaryPillar && (
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${pillarColors[rec.primaryPillar]} text-white`}>
                              {rec.primaryPillar}
                            </span>
                          )}
                          {rec.secondaryPillar && (
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${pillarColors[rec.secondaryPillar]} text-white`}>
                              {rec.secondaryPillar}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-white/30">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </GlassCard>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </>
      )}

      {/* Research Insights */}
      {correlations.length > 0 && (
        <>
          <FadeInOnScroll delay={0.25}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Research-Backed Insights
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Cross-pillar correlations discovered from aggregated user data
            </p>
          </FadeInOnScroll>
          <StaggeredList className="grid grid-cols-1 md:grid-cols-2 gap-3" staggerDelay={0.06}>
            {correlations.slice(0, 6).map((corr, index) => (
              <StaggeredItem key={index}>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${pillarColors[corr.pillarA]} flex items-center justify-center`}>
                      {pillarIcons[corr.pillarA]}
                    </div>
                    <span className="text-white/40">→</span>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${pillarColors[corr.pillarB]} flex items-center justify-center`}>
                      {pillarIcons[corr.pillarB]}
                    </div>
                    <span className="ml-auto text-green-400 text-sm font-medium">
                      +{Math.round(corr.strength * 100)}%
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{corr.insightText}</p>
                </GlassCard>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </>
      )}

      {/* Habit Stacks */}
      {habitStacks.length > 0 && (
        <>
          <FadeInOnScroll delay={0.3}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Recommended Habit Stacks
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Combine these habits for maximum impact
            </p>
          </FadeInOnScroll>
          <StaggeredList className="grid grid-cols-1 md:grid-cols-2 gap-3" staggerDelay={0.06}>
            {habitStacks.slice(0, 4).map((stack, index) => (
              <StaggeredItem key={index}>
                <GlassCard hover className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs bg-gradient-to-r ${pillarColors[stack.pillarA]} text-white`}>
                      {stack.habitTypeA}
                    </span>
                    <span className="text-white/30">+</span>
                    <span className={`px-2 py-0.5 rounded text-xs bg-gradient-to-r ${pillarColors[stack.pillarB]} text-white`}>
                      {stack.habitTypeB}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{stack.suggestionText}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/40 text-xs">
                      {Math.round(stack.completionRate)}% success rate
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Zap className="w-3 h-3" />
                      Score: {Math.round(stack.score)}
                    </div>
                  </div>
                </GlassCard>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </>
      )}

      {/* Time & Streak Stats */}
      <FadeInOnScroll delay={0.35}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights?.bestTimeOfDay && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-medium">Best Time</h3>
              </div>
              <p className="text-2xl font-bold text-white capitalize">
                {insights.bestTimeOfDay}
              </p>
              <p className="text-white/50 text-sm mt-1">
                You&apos;re most productive completing habits during this time
              </p>
            </GlassCard>
          )}
          
          {insights?.streakStats && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-medium">Streak Analytics</h3>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-white">
                    <CountUp end={insights.streakStats.averageLength} duration={1} />
                  </p>
                  <p className="text-white/50 text-xs">Avg streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    <CountUp end={insights.streakStats.recoveryRate} duration={1} />%
                  </p>
                  <p className="text-white/50 text-xs">Recovery rate</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </FadeInOnScroll>
    </div>
  );
}
