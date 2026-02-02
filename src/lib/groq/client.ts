import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const SYSTEM_PROMPT = `You are an AI wellness coach for Trajectory, a holistic wellness app. You help users improve their physical health, mental wellness, and financial well-being.

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
- Suggest habits from any of the three pillars (physical, mental, fiscal) as appropriate
- Keep responses focused and under 200 words unless the user asks for more detail

Remember: You're here to guide users on their journey to becoming their best selves.`;

export async function generateCoachResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  userContext?: {
    level?: number;
    streak?: number;
    recentHabits?: string[];
    challenges?: string[];
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
  }

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

Create a balanced plan with 2-3 habits per pillar (physical, mental, fiscal) that:
1. Starts easy and builds gradually
2. Fits within their available time
3. Addresses their specific goals and challenges
4. Is realistic for a beginner

Format as JSON with this structure:
{
  "physical": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "mental": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "fiscal": [{ "name": "habit name", "description": "brief why", "xp": 10 }],
  "dailyTip": "motivational message for day 1"
}`;

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
      dailyTip: "Welcome to your journey! Start small, stay consistent.",
    };
  }
}

export default groq;
