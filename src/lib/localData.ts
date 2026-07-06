import type { Habit, UserProfile, WellnessPillar } from "@/types";
import { getLocalHabits } from "@/lib/localHabits";

const READING_PROGRESS_PREFIX = "trajectory-local-reading-progress:";
const PRIVACY_PREFIX = "trajectory-local-privacy:";
const CHALLENGES_PREFIX = "trajectory-local-challenges:";

export type LocalPrivacySettings = {
  profileVisibility: "public" | "friends" | "private";
  showStreak: boolean;
  showLevel: boolean;
  showAchievements: boolean;
  allowFriendRequests: boolean;
};

export type LocalChallengeProgress = Record<string, { progress: number; completed: boolean }>;

export const DEFAULT_LOCAL_PRIVACY: LocalPrivacySettings = {
  profileVisibility: "friends",
  showStreak: true,
  showLevel: true,
  showAchievements: true,
  allowFriendRequests: true,
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalReadingProgress(userId: string): string[] {
  return readJson<string[]>(`${READING_PROGRESS_PREFIX}${userId}`, []);
}

export function addLocalReadingProgress(userId: string, contentId: string): string[] {
  const completed = getLocalReadingProgress(userId);
  const next = completed.includes(contentId) ? completed : [...completed, contentId];
  writeJson(`${READING_PROGRESS_PREFIX}${userId}`, next);
  return next;
}

export function getLocalPrivacy(userId: string): LocalPrivacySettings {
  return readJson<LocalPrivacySettings>(`${PRIVACY_PREFIX}${userId}`, DEFAULT_LOCAL_PRIVACY);
}

export function saveLocalPrivacy(userId: string, privacy: LocalPrivacySettings) {
  writeJson(`${PRIVACY_PREFIX}${userId}`, privacy);
}

export function getLocalChallengeProgress(userId: string): LocalChallengeProgress {
  return readJson<LocalChallengeProgress>(`${CHALLENGES_PREFIX}${userId}`, {});
}

export function joinLocalChallenge(userId: string, challengeId: string): LocalChallengeProgress {
  const progress = getLocalChallengeProgress(userId);
  const next = {
    ...progress,
    [challengeId]: progress[challengeId] || { progress: 1, completed: false },
  };
  writeJson(`${CHALLENGES_PREFIX}${userId}`, next);
  return next;
}

function completedAtFor(completion: any): string | null {
  return completion?.completed_at || completion?.completedAt || null;
}

export function calculateLocalTodayStats(habits: Habit[]) {
  const today = new Date().toISOString().split("T")[0];
  const todayCompletions = habits.filter((habit) =>
    habit.completions?.some((completion: any) => completedAtFor(completion)?.startsWith(today))
  );

  return {
    completed: todayCompletions.length,
    total: habits.length,
    xpEarned: todayCompletions.reduce((sum, habit) => sum + habit.xpReward, 0),
  };
}

export function calculateLocalInsights(habits: Habit[]) {
  const pillars: WellnessPillar[] = [
    "physical",
    "mental",
    "fiscal",
    "social",
    "spiritual",
    "intellectual",
    "occupational",
    "environmental",
  ];

  const pillarScores = pillars.map((pillar) => {
    const pillarHabits = habits.filter((habit) => habit.pillar === pillar);
    const completedCount = pillarHabits.reduce((sum, habit) => sum + (habit.completions?.length || 0), 0);
    const completionRate = pillarHabits.length > 0 ? Math.min(100, Math.round((completedCount / pillarHabits.length) * 100)) : 0;
    return {
      pillar,
      score: completionRate,
      habitCount: pillarHabits.length,
      completionRate,
    };
  });

  const activeScores = pillarScores.filter((score) => score.habitCount > 0);
  const strongest = [...activeScores].sort((a, b) => b.score - a.score)[0]?.pillar || null;
  const weakest = [...activeScores].sort((a, b) => a.score - b.score)[0]?.pillar || null;
  const overallScore = pillarScores.length
    ? Math.round(pillarScores.reduce((sum, score) => sum + score.score, 0) / pillarScores.length)
    : 0;

  return {
    overallScore,
    pillarScores,
    strongestPillar: strongest,
    weakestPillar: weakest,
    bestTimeOfDay: null,
    bestDayOfWeek: null,
    streakStats: {
      averageLength: 0,
      recoveryRate: 0,
    },
    recommendations: [
      ...(habits.length === 0
        ? [{
            type: "pillar_focus",
            title: "Start with one tiny habit",
            description: "Add one daily habit in any pillar so Trajectory can begin calculating your wellness trends locally.",
            primaryPillar: "physical" as WellnessPillar,
            confidence: 100,
            priority: 1,
          }]
        : []),
      ...(weakest
        ? [{
            type: "pillar_focus",
            title: `Strengthen your ${weakest} pillar`,
            description: `Your local data shows ${weakest} has the most room to grow. Add one simple habit there this week.`,
            primaryPillar: weakest,
            confidence: 80,
            priority: 2,
          }]
        : []),
    ],
  };
}

export function buildLocalExport(userId: string, profile: UserProfile | null) {
  return {
    mode: "local-demo",
    profile,
    habits: getLocalHabits(userId),
    readingProgress: getLocalReadingProgress(userId),
    privacy: getLocalPrivacy(userId),
    challenges: getLocalChallengeProgress(userId),
    exportedAt: new Date().toISOString(),
  };
}
