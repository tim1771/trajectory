// Wellness Analytics & Insights Engine
// Analyzes user data to discover patterns and personalize recommendations

import { SupabaseClient } from "@supabase/supabase-js";
import type { WellnessPillar } from "@/types";

const ALL_PILLARS: WellnessPillar[] = [
  "physical", "mental", "fiscal", "social", 
  "spiritual", "intellectual", "occupational", "environmental"
];

interface PillarScore {
  pillar: WellnessPillar;
  score: number;
  habitCount: number;
  completionRate: number;
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

interface Recommendation {
  type: "habit" | "habit_stack" | "pillar_focus" | "time_optimization" | "streak_recovery";
  title: string;
  description: string;
  primaryPillar?: WellnessPillar;
  secondaryPillar?: WellnessPillar;
  confidence: number;
  priority: number;
}

interface HabitCompletion {
  habit_id: string;
  completed_at: string;
  pillar?: string;
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

/**
 * Calculate wellness scores for each pillar based on habit completion
 */
export async function calculatePillarScores(
  supabase: SupabaseClient,
  userId: string,
  days: number = 30
): Promise<PillarScore[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get user's habits
  const { data: habits } = await supabase
    .from("habits")
    .select("id, pillar, name")
    .eq("user_id", userId)
    .eq("archived", false);
  
  if (!habits || habits.length === 0) {
    return ALL_PILLARS.map(pillar => ({
      pillar,
      score: 0,
      habitCount: 0,
      completionRate: 0,
    }));
  }
  
  // Get completions for the period
  const habitIds = habits.map(h => h.id);
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("habit_id, completed_at")
    .in("habit_id", habitIds)
    .gte("completed_at", startDate.toISOString());
  
  // Calculate scores per pillar
  const pillarScores: PillarScore[] = ALL_PILLARS.map(pillar => {
    const pillarHabits = habits.filter(h => h.pillar === pillar);
    const pillarHabitIds = pillarHabits.map(h => h.id);
    const pillarCompletions = (completions || []).filter(c => 
      pillarHabitIds.includes(c.habit_id)
    );
    
    // Expected completions (assuming daily habits)
    const expectedCompletions = pillarHabits.length * days;
    const actualCompletions = pillarCompletions.length;
    
    const completionRate = expectedCompletions > 0 
      ? (actualCompletions / expectedCompletions) * 100 
      : 0;
    
    // Score is weighted: completion rate + bonus for consistency
    const score = Math.min(100, Math.round(completionRate * 0.8 + (pillarHabits.length > 0 ? 20 : 0)));
    
    return {
      pillar,
      score,
      habitCount: pillarHabits.length,
      completionRate: Math.round(completionRate),
    };
  });
  
  return pillarScores;
}

/**
 * Determine the best time of day for habit completion
 */
export async function analyzeBestTimeOfDay(
  supabase: SupabaseClient,
  userId: string,
  days: number = 30
): Promise<{ morning: number; afternoon: number; evening: number }> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("completed_at")
    .eq("user_id", userId)
    .gte("completed_at", startDate.toISOString());
  
  const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
  
  (completions || []).forEach(c => {
    const hour = new Date(c.completed_at).getHours();
    if (hour >= 5 && hour < 12) timeSlots.morning++;
    else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
    else timeSlots.evening++;
  });
  
  const total = timeSlots.morning + timeSlots.afternoon + timeSlots.evening;
  
  return {
    morning: total > 0 ? Math.round((timeSlots.morning / total) * 100) : 33,
    afternoon: total > 0 ? Math.round((timeSlots.afternoon / total) * 100) : 33,
    evening: total > 0 ? Math.round((timeSlots.evening / total) * 100) : 34,
  };
}

/**
 * Analyze streak patterns
 */
export async function analyzeStreakPatterns(
  supabase: SupabaseClient,
  userId: string
): Promise<{ averageLength: number; recoveryRate: number }> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .single();
  
  // Simple calculation - in production would analyze historical streak data
  const currentStreak = profile?.current_streak || 0;
  const longestStreak = profile?.longest_streak || 0;
  
  return {
    averageLength: Math.round((currentStreak + longestStreak) / 2),
    recoveryRate: longestStreak > 0 ? Math.min(100, Math.round((currentStreak / longestStreak) * 100)) : 0,
  };
}

/**
 * Get cross-pillar correlations from aggregated data
 */
export async function getCorrelations(
  supabase: SupabaseClient,
  featured: boolean = true
): Promise<Correlation[]> {
  const query = supabase
    .from("pillar_correlations")
    .select("pillar_a, pillar_b, correlation_strength, insight_text")
    .order("correlation_strength", { ascending: false });
  
  if (featured) {
    query.eq("is_featured", true);
  }
  
  const { data } = await query;
  
  return (data || []).map(c => ({
    pillarA: c.pillar_a as WellnessPillar,
    pillarB: c.pillar_b as WellnessPillar,
    strength: c.correlation_strength,
    insightText: c.insight_text,
  }));
}

/**
 * Get recommended habit stacks
 */
export async function getHabitStacks(
  supabase: SupabaseClient,
  limit: number = 5
): Promise<HabitStack[]> {
  const { data } = await supabase
    .from("habit_stack_patterns")
    .select("*")
    .order("recommendation_score", { ascending: false })
    .limit(limit);
  
  return (data || []).map(s => ({
    habitTypeA: s.habit_type_a,
    habitTypeB: s.habit_type_b,
    pillarA: s.pillar_a as WellnessPillar,
    pillarB: s.pillar_b as WellnessPillar,
    completionRate: s.combined_completion_rate,
    suggestionText: s.suggestion_text,
    score: s.recommendation_score,
  }));
}

/**
 * Generate personalized recommendations based on user data
 */
export async function generateRecommendations(
  pillarScores: PillarScore[],
  timeAnalysis: { morning: number; afternoon: number; evening: number },
  correlations: Correlation[],
  habitStacks: HabitStack[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  // Sort pillars by score
  const sortedPillars = [...pillarScores].sort((a, b) => a.score - b.score);
  const weakest = sortedPillars[0];
  const strongest = sortedPillars[sortedPillars.length - 1];
  
  // Recommendation 1: Focus on weakest pillar
  if (weakest && weakest.score < 50) {
    recommendations.push({
      type: "pillar_focus",
      title: `Boost Your ${capitalize(weakest.pillar)} Wellness`,
      description: `Your ${weakest.pillar} pillar needs attention. Start with just one small habit to build momentum.`,
      primaryPillar: weakest.pillar,
      confidence: 0.85,
      priority: 100,
    });
  }
  
  // Recommendation 2: Leverage strongest pillar connection
  if (strongest && weakest) {
    const relevantCorrelation = correlations.find(
      c => (c.pillarA === strongest.pillar && c.pillarB === weakest.pillar) ||
           (c.pillarB === strongest.pillar && c.pillarA === weakest.pillar)
    );
    
    if (relevantCorrelation) {
      recommendations.push({
        type: "habit_stack",
        title: `Connect ${capitalize(strongest.pillar)} to ${capitalize(weakest.pillar)}`,
        description: relevantCorrelation.insightText,
        primaryPillar: strongest.pillar,
        secondaryPillar: weakest.pillar,
        confidence: relevantCorrelation.strength,
        priority: 90,
      });
    }
  }
  
  // Recommendation 3: Time optimization
  const bestTime = Object.entries(timeAnalysis).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0] as "morning" | "afternoon" | "evening";
  
  recommendations.push({
    type: "time_optimization",
    title: `Optimize Your ${capitalize(bestTime)} Routine`,
    description: `You complete ${timeAnalysis[bestTime]}% of habits in the ${bestTime}. Schedule important habits during this peak time.`,
    confidence: 0.75,
    priority: 70,
  });
  
  // Recommendation 4: Habit stacking suggestion
  if (habitStacks.length > 0) {
    const topStack = habitStacks[0];
    recommendations.push({
      type: "habit_stack",
      title: "Try This Habit Stack",
      description: topStack.suggestionText,
      primaryPillar: topStack.pillarA,
      secondaryPillar: topStack.pillarB,
      confidence: topStack.completionRate / 100,
      priority: 80,
    });
  }
  
  // Sort by priority
  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Get complete user insights
 */
export async function getUserInsights(
  supabase: SupabaseClient,
  userId: string
): Promise<UserInsights> {
  // Run analytics in parallel
  const [pillarScores, timeAnalysis, streakStats, correlations, habitStacks] = await Promise.all([
    calculatePillarScores(supabase, userId),
    analyzeBestTimeOfDay(supabase, userId),
    analyzeStreakPatterns(supabase, userId),
    getCorrelations(supabase, true),
    getHabitStacks(supabase, 5),
  ]);
  
  // Calculate overall score
  const overallScore = Math.round(
    pillarScores.reduce((sum, p) => sum + p.score, 0) / pillarScores.length
  );
  
  // Find strongest and weakest
  const sortedPillars = [...pillarScores].sort((a, b) => b.score - a.score);
  const strongestPillar = sortedPillars[0]?.score > 0 ? sortedPillars[0].pillar : null;
  const weakestPillar = sortedPillars[sortedPillars.length - 1]?.habitCount > 0 
    ? sortedPillars[sortedPillars.length - 1].pillar 
    : null;
  
  // Best time of day
  const timeEntries = Object.entries(timeAnalysis) as [string, number][];
  const bestTimeEntry = timeEntries.reduce((a, b) => a[1] > b[1] ? a : b);
  const bestTimeOfDay = bestTimeEntry[1] > 40 
    ? bestTimeEntry[0] as "morning" | "afternoon" | "evening" 
    : null;
  
  // Generate recommendations
  const recommendations = await generateRecommendations(
    pillarScores,
    timeAnalysis,
    correlations,
    habitStacks
  );
  
  return {
    overallScore,
    pillarScores,
    strongestPillar,
    weakestPillar,
    bestTimeOfDay,
    bestDayOfWeek: null, // Would need more historical data
    streakStats,
    recommendations,
  };
}

/**
 * Get XP multipliers for a user based on their performance
 */
export async function getXPMultipliers(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<WellnessPillar, number>> {
  // Check if user has custom multipliers
  const { data: customMultipliers } = await supabase
    .from("user_xp_multipliers")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (customMultipliers) {
    return {
      physical: customMultipliers.physical_multiplier,
      mental: customMultipliers.mental_multiplier,
      fiscal: customMultipliers.fiscal_multiplier,
      social: customMultipliers.social_multiplier,
      spiritual: customMultipliers.spiritual_multiplier,
      intellectual: customMultipliers.intellectual_multiplier,
      occupational: customMultipliers.occupational_multiplier,
      environmental: customMultipliers.environmental_multiplier,
    };
  }
  
  // Calculate dynamic multipliers based on pillar scores
  const pillarScores = await calculatePillarScores(supabase, userId);
  const multipliers: Record<WellnessPillar, number> = {} as Record<WellnessPillar, number>;
  
  // Weaker pillars get higher multipliers to encourage balance
  pillarScores.forEach(({ pillar, score }) => {
    // Score 0-30 = 1.5x, 30-60 = 1.2x, 60-100 = 1.0x
    if (score < 30) multipliers[pillar] = 1.5;
    else if (score < 60) multipliers[pillar] = 1.2;
    else multipliers[pillar] = 1.0;
  });
  
  return multipliers;
}

// Helper function
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export type { UserInsights, Recommendation, Correlation, HabitStack, PillarScore };
