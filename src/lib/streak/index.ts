// Streak Calculation and Update Logic
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Calculate the current streak based on habit completions
 * A streak day counts if the user completed at least one habit that day
 */
export async function calculateCurrentStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  // Get all habit completions, ordered by date descending
  const { data: completions } = await supabase
    .from("habit_completions")
    .select("completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (!completions || completions.length === 0) {
    return 0;
  }

  // Get unique dates with completions
  const completionDates = new Set<string>();
  completions.forEach((c) => {
    if (c.completed_at) {
      const date = c.completed_at.split("T")[0];
      completionDates.add(date);
    }
  });

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
    } else if (i === 0) {
      // Today can be incomplete - continue checking from yesterday
      continue;
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
}

/**
 * Update the user's streak in the database
 */
export async function updateUserStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<{ currentStreak: number; longestStreak: number; isNewRecord: boolean }> {
  // Calculate current streak
  const currentStreak = await calculateCurrentStreak(supabase, userId);

  // Get current profile to check longest streak
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .single();

  const previousLongest = profile?.longest_streak || 0;
  const isNewRecord = currentStreak > previousLongest;
  const longestStreak = Math.max(currentStreak, previousLongest);

  // Update the profile
  await supabase
    .from("user_profiles")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return {
    currentStreak,
    longestStreak,
    isNewRecord,
  };
}

/**
 * Check if today is the user's first completion
 * Used for awarding daily login XP bonus
 */
export async function isFirstCompletionToday(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("habit_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("completed_at", `${today}T00:00:00`)
    .lt("completed_at", `${today}T23:59:59`);

  // If count is 1, this was the first completion today
  return count === 1;
}

/**
 * Get streak milestone bonus XP
 * Returns bonus XP for reaching streak milestones
 */
export function getStreakBonusXP(
  oldStreak: number,
  newStreak: number
): { xp: number; milestone: string | null } {
  const milestones = [
    { days: 3, xp: 25, label: "3-day streak!" },
    { days: 7, xp: 50, label: "1 week streak!" },
    { days: 14, xp: 75, label: "2 week streak!" },
    { days: 30, xp: 200, label: "1 month streak!" },
    { days: 60, xp: 300, label: "2 month streak!" },
    { days: 90, xp: 500, label: "3 month streak!" },
    { days: 180, xp: 750, label: "6 month streak!" },
    { days: 365, xp: 1500, label: "1 year streak!" },
  ];

  // Check if we crossed a milestone
  for (const milestone of milestones) {
    if (oldStreak < milestone.days && newStreak >= milestone.days) {
      return { xp: milestone.xp, milestone: milestone.label };
    }
  }

  return { xp: 0, milestone: null };
}
