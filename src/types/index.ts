export * from "./database";

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  onboardingData: OnboardingData | null;
  onboardingCompleted: boolean;
  level: number;
  xpPoints: number;
  currentStreak: number;
  longestStreak: number;
  tier: "free" | "premium";
}

export interface OnboardingData {
  // Physical
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  exerciseGoals: string[];
  sleepHours: number;
  nutritionFocus: string[];
  
  // Mental
  stressLevel: number;
  mentalGoals: string[];
  meditationExperience: boolean;
  
  // Fiscal
  financialGoals: string[];
  budgetingExperience: "none" | "some" | "experienced";
  savingsGoal: number;
  
  // General
  availableTime: number; // minutes per day
  motivation: string;
  challenges: string[];
}

export interface Habit {
  id: string;
  userId: string;
  pillar: "physical" | "mental" | "fiscal";
  name: string;
  description: string | null;
  frequency: "daily" | "weekly" | "custom";
  targetDays: number[] | null;
  xpReward: number;
  completions: HabitCompletion[];
  archived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  notes: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  pillar: "physical" | "mental" | "fiscal";
  title: string;
  description: string | null;
  type: "habit" | "target" | "milestone" | "average";
  target: any;
  deadline: string | null;
  completed: boolean;
}

export interface ReadingContent {
  id: string;
  pillar: "physical" | "mental" | "fiscal";
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  readingTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  premiumOnly: boolean;
  completed?: boolean;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  pillar: "physical" | "mental" | "fiscal" | null;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface DailyStats {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  xpEarned: number;
  streakDay: number;
}
