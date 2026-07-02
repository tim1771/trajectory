import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/groq/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculatePillarScores,
  getCorrelations,
  getHabitStacks,
} from "@/lib/analytics/insights";

const FREE_TIER_DAILY_LIMIT = 10;

type ChatRequestBody = {
  messages?: { role: "user" | "assistant" | "system"; content: string }[];
  localContext?: {
    level?: number;
    streak?: number;
    tier?: "free" | "premium";
    challenges?: string[];
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "At least one message is required" }, { status: 400 });
    }

    let profile: any = body.localContext || null;
    let habits: { name: string; pillar: string }[] = [];
    let existingConversation: any = null;
    let userId: string | null = null;
    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> | null = null;

    // Supabase is optional now: local/demo auth stores its session in browser
    // localStorage, so this route must still answer when Supabase is paused or
    // there is no Supabase cookie on the request.
    try {
      supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;

      if (userId) {
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("tier, level, current_streak, onboarding_data")
          .eq("user_id", userId)
          .single();

        if (profileData) {
          profile = profileData;
        }

        const { data: conversationData } = await supabase
          .from("ai_conversations")
          .select("id, messages")
          .eq("user_id", userId)
          .single();
        existingConversation = conversationData;

        const { data: habitsData } = await supabase
          .from("habits")
          .select("name, pillar")
          .eq("user_id", userId)
          .limit(10);
        habits = habitsData || [];
      }
    } catch (error) {
      console.warn("Supabase unavailable for chat; continuing with local context.", error);
    }

    if (profile?.tier === "free" || !profile?.tier) {
      const today = new Date().toISOString().split("T")[0];
      const existingMessages = (existingConversation?.messages as any[]) || [];
      const todayUserMessages = existingMessages.filter(
        (message: any) => message.role === "user" && message.timestamp?.startsWith(today)
      );

      const totalTodayMessages = todayUserMessages.length + 1;
      if (userId && totalTodayMessages > FREE_TIER_DAILY_LIMIT) {
        return NextResponse.json(
          {
            error: `Daily message limit (${FREE_TIER_DAILY_LIMIT}) reached. Upgrade to Premium for unlimited messages.`,
            remainingMessages: 0,
          },
          { status: 429 }
        );
      }
    }

    const onboardingData = profile?.onboarding_data || profile?.onboardingData;

    let insightsContext: any = {};
    if (supabase && userId) {
      try {
        const [pillarScores, correlations, habitStacks] = await Promise.all([
          calculatePillarScores(supabase, userId),
          getCorrelations(supabase, true),
          getHabitStacks(supabase, 3),
        ]);

        const sortedPillars = [...pillarScores].sort((a, b) => b.score - a.score);
        const strongestPillar = sortedPillars[0];
        const weakestPillar = sortedPillars[sortedPillars.length - 1];

        insightsContext = {
          pillarScores: pillarScores.map((pillar) => `${pillar.pillar}: ${pillar.score}%`),
          strongestPillar: strongestPillar?.pillar,
          weakestPillar: weakestPillar?.pillar,
          topCorrelation: correlations[0]?.insightText,
          suggestedHabitStack: habitStacks[0]?.suggestionText,
        };
      } catch (error) {
        console.log("Insights not available:", error);
      }
    }

    const response = await generateCoachResponse(messages, {
      level: profile?.level,
      streak: profile?.current_streak || profile?.streak,
      recentHabits: habits.map((habit) => `${habit.name} (${habit.pillar})`),
      challenges: onboardingData?.challenges || profile?.challenges,
      insights: insightsContext,
    });

    if (supabase && userId) {
      const messagesWithTimestamps = messages.map((message: any) => ({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      }));

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      const allMessages = [...messagesWithTimestamps, assistantMessage];

      try {
        if (existingConversation?.id) {
          await supabase
            .from("ai_conversations")
            .update({ messages: allMessages, updated_at: new Date().toISOString() })
            .eq("id", existingConversation.id);
        } else {
          await supabase.from("ai_conversations").insert({
            user_id: userId,
            messages: allMessages,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn("Unable to save AI conversation; response still returned.", error);
      }
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
