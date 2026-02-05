import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateUserStreak, getStreakBonusXP, isFirstCompletionToday } from "@/lib/streak";
import { XP_VALUES } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await request.json();

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }

    // Get the habit
    const { data: habit } = await supabase
      .from("habits")
      .select("*")
      .eq("id", habitId)
      .eq("user_id", user.id)
      .single();

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check if already completed today
    const today = new Date().toISOString().split("T")[0];
    const { data: existingCompletion } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("habit_id", habitId)
      .eq("user_id", user.id)
      .gte("completed_at", `${today}T00:00:00`)
      .lt("completed_at", `${today}T23:59:59`)
      .single();

    if (existingCompletion) {
      return NextResponse.json({ 
        error: "Already completed today",
        alreadyCompleted: true 
      }, { status: 400 });
    }

    // Get current profile for streak calculation
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("current_streak, xp_points")
      .eq("user_id", user.id)
      .single();

    const oldStreak = profile?.current_streak || 0;

    // Create the completion
    const { data: completion, error: completionError } = await supabase
      .from("habit_completions")
      .insert({
        habit_id: habitId,
        user_id: user.id,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (completionError) {
      console.error("Completion error:", completionError);
      return NextResponse.json({ error: "Failed to complete habit" }, { status: 500 });
    }

    // Update streak
    const streakResult = await updateUserStreak(supabase, user.id);

    // Calculate XP to award
    let totalXP = habit.xp_reward;
    let bonusXP = 0;
    let milestone: string | null = null;

    // Check for streak bonus
    const streakBonus = getStreakBonusXP(oldStreak, streakResult.currentStreak);
    if (streakBonus.xp > 0) {
      bonusXP += streakBonus.xp;
      milestone = streakBonus.milestone;
    }

    // Check for first completion today bonus
    const isFirst = await isFirstCompletionToday(supabase, user.id);
    if (isFirst) {
      bonusXP += XP_VALUES.DAILY_LOGIN;
    }

    totalXP += bonusXP;

    // Award XP
    const newXP = (profile?.xp_points || 0) + totalXP;
    await supabase
      .from("user_profiles")
      .update({ xp_points: newXP })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      completion,
      xpEarned: habit.xp_reward,
      bonusXP,
      totalXP,
      milestone,
      streak: {
        current: streakResult.currentStreak,
        longest: streakResult.longestStreak,
        isNewRecord: streakResult.isNewRecord,
      },
    });
  } catch (error: any) {
    console.error("Habit completion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete habit" },
      { status: 500 }
    );
  }
}
