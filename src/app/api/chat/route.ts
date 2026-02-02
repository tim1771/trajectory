import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/groq/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limiting for free users
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier, level, current_streak, onboarding_data")
      .eq("user_id", user.id)
      .single();

    if (profile?.tier === "free") {
      // Check message count for today
      const today = new Date().toISOString().split("T")[0];
      const { data: conversation } = await supabase
        .from("ai_conversations")
        .select("messages")
        .eq("user_id", user.id)
        .gte("updated_at", today)
        .single();

      const todayMessages = (conversation?.messages as any[])?.filter(
        (m: any) => m.role === "user" && m.timestamp?.startsWith(today)
      ) || [];

      if (todayMessages.length >= 10) {
        return NextResponse.json(
          { error: "Daily message limit reached. Upgrade to Premium for unlimited messages." },
          { status: 429 }
        );
      }
    }

    const { messages } = await request.json();

    // Get user's recent habits for context
    const { data: habits } = await supabase
      .from("habits")
      .select("name, pillar")
      .eq("user_id", user.id)
      .limit(5);

    const onboardingData = profile?.onboarding_data as any;

    const response = await generateCoachResponse(messages, {
      level: profile?.level,
      streak: profile?.current_streak,
      recentHabits: habits?.map((h) => h.name),
      challenges: onboardingData?.challenges,
    });

    // Save conversation
    const newMessage = {
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };

    const allMessages = [...messages, newMessage];

    await supabase.from("ai_conversations").upsert({
      user_id: user.id,
      messages: allMessages,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: response });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
