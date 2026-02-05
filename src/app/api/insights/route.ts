import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { 
  getUserInsights, 
  getCorrelations, 
  getHabitStacks,
  getXPMultipliers,
} from "@/lib/analytics/insights";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "full";

    switch (type) {
      case "full":
        // Get complete user insights
        const insights = await getUserInsights(supabase, user.id);
        return NextResponse.json(insights);

      case "correlations":
        // Get pillar correlations only
        const correlations = await getCorrelations(supabase, true);
        return NextResponse.json({ correlations });

      case "stacks":
        // Get habit stack recommendations
        const stacks = await getHabitStacks(supabase, 8);
        return NextResponse.json({ habitStacks: stacks });

      case "multipliers":
        // Get XP multipliers
        const multipliers = await getXPMultipliers(supabase, user.id);
        return NextResponse.json({ multipliers });

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get insights" },
      { status: 500 }
    );
  }
}
