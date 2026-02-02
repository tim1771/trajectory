import type { Achievement, Habit, UserProfile } from "@/types";

// XP values for different actions
export const XP_VALUES = {
  HABIT_COMPLETE: 10,
  READING_COMPLETE: 20,
  STREAK_BONUS_7: 50,
  STREAK_BONUS_30: 200,
  DAILY_LOGIN: 5,
  ACHIEVEMENT_UNLOCK: 25,
  JOURNAL_ENTRY: 15,
};

// Level thresholds
export function getXPForLevel(level: number): number {
  // XP required increases exponentially
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(totalXP: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let level = 1;
  let xpAccumulated = 0;

  while (true) {
    const xpForThisLevel = getXPForLevel(level);
    if (xpAccumulated + xpForThisLevel > totalXP) {
      const currentXP = totalXP - xpAccumulated;
      return {
        level,
        currentXP,
        nextLevelXP: xpForThisLevel,
        progress: (currentXP / xpForThisLevel) * 100,
      };
    }
    xpAccumulated += xpForThisLevel;
    level++;
  }
}

// Achievement checking
export function checkAchievements(
  profile: UserProfile,
  habits: Habit[],
  completedReadings: number
): string[] {
  const newlyUnlocked: string[] = [];

  // Streak achievements
  if (profile.currentStreak >= 3) newlyUnlocked.push("streak_3");
  if (profile.currentStreak >= 7) newlyUnlocked.push("streak_7");
  if (profile.currentStreak >= 30) newlyUnlocked.push("streak_30");
  if (profile.currentStreak >= 100) newlyUnlocked.push("streak_100");

  // Level achievements
  if (profile.level >= 5) newlyUnlocked.push("level_5");
  if (profile.level >= 10) newlyUnlocked.push("level_10");
  if (profile.level >= 25) newlyUnlocked.push("level_25");

  // Pillar achievements
  const physicalCompletions = getTotalCompletions(habits, "physical");
  const mentalCompletions = getTotalCompletions(habits, "mental");
  const fiscalCompletions = getTotalCompletions(habits, "fiscal");

  if (physicalCompletions >= 1) newlyUnlocked.push("physical_first");
  if (physicalCompletions >= 10) newlyUnlocked.push("physical_10");
  if (physicalCompletions >= 50) newlyUnlocked.push("physical_50");

  if (mentalCompletions >= 1) newlyUnlocked.push("mental_first");
  if (mentalCompletions >= 10) newlyUnlocked.push("mental_10");
  if (mentalCompletions >= 50) newlyUnlocked.push("mental_50");

  if (fiscalCompletions >= 1) newlyUnlocked.push("fiscal_first");
  if (fiscalCompletions >= 10) newlyUnlocked.push("fiscal_10");
  if (fiscalCompletions >= 50) newlyUnlocked.push("fiscal_50");

  // Reading achievements
  if (completedReadings >= 1) newlyUnlocked.push("reader_first");
  if (completedReadings >= 5) newlyUnlocked.push("reader_5");

  // Balance achievement - check if all three pillars have completions today
  const today = new Date().toISOString().split("T")[0];
  const physicalToday = habits
    .filter((h) => h.pillar === "physical")
    .some((h) => h.completions?.some((c: any) => c.completed_at?.startsWith(today)));
  const mentalToday = habits
    .filter((h) => h.pillar === "mental")
    .some((h) => h.completions?.some((c: any) => c.completed_at?.startsWith(today)));
  const fiscalToday = habits
    .filter((h) => h.pillar === "fiscal")
    .some((h) => h.completions?.some((c: any) => c.completed_at?.startsWith(today)));

  if (physicalToday && mentalToday && fiscalToday) {
    newlyUnlocked.push("balanced");
  }

  return newlyUnlocked;
}

function getTotalCompletions(habits: Habit[], pillar: string): number {
  return habits
    .filter((h) => h.pillar === pillar)
    .reduce((sum, h) => sum + (h.completions?.length || 0), 0);
}

// Streak calculation
export function calculateStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  // Get all unique completion dates
  const allCompletions = habits.flatMap((h) => h.completions || []);
  const completionDates = new Set(
    allCompletions.map((c: any) => c.completed_at?.split("T")[0])
  );

  // Count consecutive days from today going backwards
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (completionDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Allow today to be incomplete
      break;
    }
  }

  return streak;
}

// Daily stats calculation
export function calculateDailyStats(habits: Habit[], date: string) {
  const dayHabits = habits.filter((h) => {
    // For now, assume all habits are daily
    return !h.archived;
  });

  const completed = dayHabits.filter((h) =>
    h.completions?.some((c: any) => c.completed_at?.startsWith(date))
  );

  return {
    date,
    habitsCompleted: completed.length,
    habitsTotal: dayHabits.length,
    xpEarned: completed.reduce((sum, h) => sum + h.xpReward, 0),
    completionRate: dayHabits.length > 0 
      ? (completed.length / dayHabits.length) * 100 
      : 0,
  };
}

// Motivational messages based on progress
export function getMotivationalMessage(
  streak: number,
  todayProgress: number
): string {
  if (streak === 0) {
    return "Every journey begins with a single step. Start today!";
  }

  if (todayProgress === 100) {
    if (streak >= 30) {
      return "Legendary! You're unstoppable. Keep this momentum!";
    }
    if (streak >= 7) {
      return "Perfect day! You're building amazing habits.";
    }
    return "All done for today! Great work staying consistent.";
  }

  if (todayProgress >= 50) {
    return "You're over halfway there! Finish strong.";
  }

  if (streak >= 7) {
    return `${streak}-day streak! Don't break the chain today.`;
  }

  return "Make today count. Your future self will thank you.";
}
