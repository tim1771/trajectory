import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateUserStreak } from "@/lib/streak";

// One-time endpoint to recalculate streak from existing completions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Recalculate and update streak
    const result = await updateUserStreak(supabase, user.id);

    return NextResponse.json({
      success: true,
      message: `Streak recalculated!`,
      streak: result,
    });
  } catch (error: any) {
    console.error("Streak recalculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recalculate streak" },
      { status: 500 }
    );
  }
}
