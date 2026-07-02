import Groq from "groq-sdk";

// Lazy initialization to avoid build-time errors
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export const SYSTEM_PROMPT = `You are an AI wellness coach for Trajectory, a holistic wellness app built on the 8 Dimensions of Wellness framework. You help users improve across all dimensions of their life.

The 8 Wellness Pillars you coach:
1. Physical - Exercise, nutrition, sleep, body care
2. Mental - Stress management, emotional health, mindfulness, therapy
3. Fiscal - Budgeting, saving, investing, financial literacy
4. Social - Relationships, community, communication, support networks
5. Spiritual - Purpose, meaning, values, meditation, faith/philosophy
6. Intellectual - Learning, creativity, critical thinking, skill development
7. Occupational - Career growth, work-life balance, job satisfaction, skills
8. Environmental - Sustainable living, organized spaces, nature connection

Your personality:
- Supportive and encouraging, but not overly enthusiastic
- Evidence-based and practical
- Empathetic to challenges while pushing for growth
- Concise and actionable in your advice

Guidelines:
- Give specific, actionable advice when possible
- Reference the user's tracked data and progress when relevant
- Celebrate wins, no matter how small
- When users struggle, help them find the root cause
- Recognize connections between pillars (e.g., better sleep improves focus, which helps career performance)
- Suggest habit stacking - combining habits from multiple pillars
- Keep responses focused and under 200 words unless the user asks for more detail

Remember: You're here to guide users on their holistic journey to becoming their best selves across all 8 dimensions.`;

export async function generateCoachResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  userContext?: {
    level?: number;
    streak?: number;
    recentHabits?: string[];
    challenges?: string[];
    insights?: {
      pillarScores?: string[];
      strongestPillar?: string;
      weakestPillar?: string;
      topCorrelation?: string;
      suggestedHabitStack?: string;
    };
  }
) {
  // Build context from user data
  let contextMessage = "";
  if (userContext) {
    contextMessage = `\n\nUser context:
- Level: ${userContext.level || 1}
- Current streak: ${userContext.streak || 0} days
${userContext.recentHabits?.length ? `- Recent habits: ${userContext.recentHabits.join(", ")}` : ""}
${userContext.challenges?.length ? `- Challenges they mentioned: ${userContext.challenges.join(", ")}` : ""}`;

    // Add insights from learning algorithm
    if (userContext.insights) {
      const ins = userContext.insights;
      contextMessage += `\n\nPersonalized Insights (use these to give better advice):`;
      if (ins.pillarScores?.length) {
        contextMessage += `\n- Pillar wellness scores: ${ins.pillarScores.join(", ")}`;
      }
      if (ins.strongestPillar) {
        contextMessage += `\n- Their strongest area: ${ins.strongestPillar}`;
      }
      if (ins.weakestPillar) {
        contextMessage += `\n- Area needing most attention: ${ins.weakestPillar}`;
      }
      if (ins.topCorrelation) {
        contextMessage += `\n- Relevant research insight: "${ins.topCorrelation}"`;
      }
      if (ins.suggestedHabitStack) {
        contextMessage += `\n- Suggested habit stack: "${ins.suggestedHabitStack}"`;
      }
    }
  }

  if (!process.env.GROQ_API_KEY) {
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "your goal";
    return `I can help with that. Supabase/local auth is working, but the AI provider key is not configured on the server yet, so here is a practical fallback:\n\n1. Pick one tiny action for: "${latestUserMessage}".\n2. Make it measurable and schedule it for today.\n3. Keep the streak rule simple: do not miss twice.\n4. Review what worked at the end of the week and adjust the plan.\n\nOnce GROQ_API_KEY is set in Netlify, I will give fully personalized AI coaching here.`;
  }

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT + contextMessage,
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || "I'm here to help. What would you like to work on today?";
}

export async function generateGoalBreakdown(goal: string) {
  const fallback = {
    smart_goal: goal || "Build a meaningful goal with a clear finish line",
    identity_statement: "I am becoming the kind of person who follows through on the commitments that matter.",
    outcome_metric: "Weekly measurable progress toward the target outcome",
    target_date: "12 weeks from today",
    milestones: [
      "Clarify the exact outcome and success metric",
      "Complete the first two weeks of process habits",
      "Review pacing and adjust the plan",
      "Finish the final milestone and document the result",
    ],
    process_habits: [
      "Schedule three focused work blocks per week",
      "Log one progress note at the end of each day",
    ],
    first_action: "Spend 15 minutes today defining the measurable version of this goal.",
    risks: ["Planning too aggressively", "Missing a day and quitting"],
    mitigations: ["Use weekly review to re-plan", "Follow the don't-miss-twice rule"],
  };

  if (!goal.trim() || !process.env.GROQ_API_KEY) {
    return fallback;
  }

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are Trajectory's AI goal-breakdown engine. Convert vague ambitions into realistic SMART goals. Return valid JSON only with this exact shape: {"smart_goal":"string","identity_statement":"string","outcome_metric":"string","target_date":"string","milestones":["string"],"process_habits":["string"],"first_action":"string","risks":["string"],"mitigations":["string"]}. Keep it concise, practical, and encouraging.`,
      },
      { role: "user", content: goal },
    ],
    temperature: 0.35,
    max_tokens: 900,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  try {
    return { ...fallback, ...JSON.parse(content) };
  } catch {
    return fallback;
  }
}

export async function generatePersonalizedPlan(onboardingData: any) {
  const prompt = `Based on this user's onboarding data, create a personalized 7-day starter plan:

Fitness Level: ${onboardingData.fitnessLevel}
Exercise Goals: ${onboardingData.exerciseGoals?.join(", ")}
Sleep: ${onboardingData.sleepHours} hours average
Stress Level: ${onboardingData.stressLevel}/10
Mental Goals: ${onboardingData.mentalGoals?.join(", ")}
Meditation Experience: ${onboardingData.meditationExperience ? "Yes" : "No"}
Financial Goals: ${onboardingData.financialGoals?.join(", ")}
Budgeting Experience: ${onboardingData.budgetingExperience}
Available Time: ${onboardingData.availableTime} minutes/day
Challenges: ${onboardingData.challenges?.join(", ")}
Motivation: ${onboardingData.motivation}

Create a balanced plan across the 8 Wellness Pillars (physical, mental, fiscal, social, spiritual, intellectual, occupational, environmental) that:
1. Starts easy and builds gradually
2. Fits within their available time
3. Addresses their specific goals and challenges
4. Is realistic for a beginner
5. Shows how habits from different pillars complement each other

Format as JSON with this structure:
{
  "physical": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "mental": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "fiscal": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "social": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "spiritual": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "intellectual": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "occupational": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "environmental": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "dailyTip": "motivational message for day 1",
  "habitStack": "suggestion for combining 2-3 habits together"
}`;

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a wellness expert creating personalized habit plans. Always respond with valid JSON only, no additional text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      physical: [{ name: "30-minute walk", description: "Start with gentle movement", xp: 15 }],
      mental: [{ name: "5-minute meditation", description: "Build mindfulness habit", xp: 10 }],
      fiscal: [{ name: "Track one expense", description: "Build awareness", xp: 10 }],
      social: [{ name: "Reach out to a friend", description: "Nurture connections", xp: 10 }],
      spiritual: [{ name: "Gratitude journaling", description: "Cultivate appreciation", xp: 10 }],
      intellectual: [{ name: "Read for 15 minutes", description: "Expand your knowledge", xp: 10 }],
      occupational: [{ name: "Plan tomorrow's priorities", description: "Work smarter", xp: 10 }],
      environmental: [{ name: "Declutter one space", description: "Clear space, clear mind", xp: 10 }],
      dailyTip: "Welcome to your journey! Start small, stay consistent across all dimensions.",
      habitStack: "Try combining your morning walk with gratitude reflection",
    };
  }
}

export { getGroqClient };
