import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/groq/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  calculatePillarScores,
  getCorrelations,
  getHabitStacks,
} from "@/lib/analytics/insights";

const FREE_TIER_DAILY_LIMIT = 10;
const AI_RESPONSE_TIMEOUT_MS = 7500;

export const runtime = "nodejs";
export const maxDuration = 10;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  localContext?: {
    level?: number;
    streak?: number;
    tier?: "free" | "premium";
    challenges?: string[];
  };
};

function fallbackCoachMessage(messages: ChatMessage[] = []) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content || "your goal";

  return `I can help with that. The coach is running in fast fallback mode right now so the app does not time out.\n\nFor "${latestUserMessage}":\n1. Pick one action small enough to finish today.\n2. Make it measurable: what counts as done?\n3. Schedule the next repetition before you finish.\n4. If you miss, use the don't-miss-twice rule instead of restarting from zero.`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

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

    // Local/demo auth lives in browser localStorage, which server routes cannot
    // read. The client sends safe localContext for that mode, so skip Supabase
    // entirely when localContext exists. This prevents paused Supabase projects
    // from hanging long enough to hit Netlify's function timeout.
    if (!body.localContext) {
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
        console.warn("Supabase unavailable for chat; continuing without persisted context.", error);
      }
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

    const response = await withTimeout(
      generateCoachResponse(messages, {
        level: profile?.level,
        streak: profile?.current_streak || profile?.streak,
        recentHabits: habits.map((habit) => `${habit.name} (${habit.pillar})`),
        challenges: onboardingData?.challenges || profile?.challenges,
        insights: insightsContext,
      }),
      AI_RESPONSE_TIMEOUT_MS,
      fallbackCoachMessage(messages)
    );

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
