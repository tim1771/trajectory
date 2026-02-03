import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/groq/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const FREE_TIER_DAILY_LIMIT = 10;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();

    // Check rate limiting for free users
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier, level, current_streak, onboarding_data")
      .eq("user_id", user.id)
      .single();

    // Get existing conversation
    const { data: existingConversation } = await supabase
      .from("ai_conversations")
      .select("id, messages")
      .eq("user_id", user.id)
      .single();

    if (profile?.tier === "free" || !profile?.tier) {
      // Count user messages from today
      const today = new Date().toISOString().split("T")[0];
      const existingMessages = (existingConversation?.messages as any[]) || [];
      const todayUserMessages = existingMessages.filter(
        (m: any) => m.role === "user" && m.timestamp?.startsWith(today)
      );

      // Also count the new message being sent
      const totalTodayMessages = todayUserMessages.length + 1;

      if (totalTodayMessages > FREE_TIER_DAILY_LIMIT) {
        return NextResponse.json(
          { 
            error: `Daily message limit (${FREE_TIER_DAILY_LIMIT}) reached. Upgrade to Premium for unlimited messages.`,
            remainingMessages: 0 
          },
          { status: 429 }
        );
      }
    }

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

    // Add timestamps to user messages if missing
    const messagesWithTimestamps = messages.map((m: any) => ({
      ...m,
      timestamp: m.timestamp || new Date().toISOString(),
    }));

    // Create the assistant response with timestamp
    const assistantMessage = {
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };

    const allMessages = [...messagesWithTimestamps, assistantMessage];

    // Save conversation (upsert based on user_id)
    if (existingConversation?.id) {
      await supabase
        .from("ai_conversations")
        .update({
          messages: allMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConversation.id);
    } else {
      await supabase.from("ai_conversations").insert({
        user_id: user.id,
        messages: allMessages,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ message: response });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
