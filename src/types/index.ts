export * from "./database";

// All 8 wellness dimensions
export type WellnessPillar = 
  | "physical" 
  | "mental" 
  | "fiscal" 
  | "social" 
  | "spiritual" 
  | "intellectual" 
  | "occupational" 
  | "environmental";

export const PILLAR_INFO: Record<WellnessPillar, { name: string; description: string; icon: string }> = {
  physical: {
    name: "Physical",
    description: "Optimize your body through exercise, nutrition, and sleep",
    icon: "Target",
  },
  mental: {
    name: "Mental",
    description: "Cultivate emotional resilience and psychological well-being",
    icon: "Brain",
  },
  fiscal: {
    name: "Fiscal",
    description: "Build financial security and smart money habits",
    icon: "Wallet",
  },
  social: {
    name: "Social",
    description: "Nurture meaningful relationships and community connections",
    icon: "Users",
  },
  spiritual: {
    name: "Spiritual",
    description: "Discover purpose and connect with your core values",
    icon: "Sparkles",
  },
  intellectual: {
    name: "Intellectual",
    description: "Expand knowledge and embrace lifelong learning",
    icon: "Lightbulb",
  },
  occupational: {
    name: "Occupational",
    description: "Find fulfillment and growth in your work life",
    icon: "Briefcase",
  },
  environmental: {
    name: "Environmental",
    description: "Create harmony with your surroundings and nature",
    icon: "Leaf",
  },
};

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
  
  // Social
  socialGoals: string[];
  relationshipFocus: string[];
  
  // Spiritual
  spiritualPractices: string[];
  valuesFocus: string[];
  
  // Intellectual
  learningGoals: string[];
  intellectualInterests: string[];
  
  // Occupational
  careerGoals: string[];
  workLifeBalance: number;
  
  // Environmental
  environmentalGoals: string[];
  sustainabilityLevel: "beginner" | "intermediate" | "advanced";
  
  // General
  availableTime: number; // minutes per day
  motivation: string;
  challenges: string[];
}

export interface Habit {
  id: string;
  userId: string;
  pillar: WellnessPillar;
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
  pillar: WellnessPillar;
  title: string;
  description: string | null;
  type: "habit" | "target" | "milestone" | "average";
  target: any;
  deadline: string | null;
  completed: boolean;
}

export interface ReadingContent {
  id: string;
  pillar: WellnessPillar;
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
  pillar: WellnessPillar | null;
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
