import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, Habit, Goal, Achievement, DailyStats } from "@/types";

interface UserState {
  // User data
  profile: UserProfile | null;
  habits: Habit[];
  goals: Goal[];
  achievements: Achievement[];
  dailyStats: DailyStats | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  completeHabit: (habitId: string) => void;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  setAchievements: (achievements: Achievement[]) => void;
  unlockAchievement: (achievementId: string) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setDailyStats: (stats: DailyStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  profile: null,
  habits: [],
  goals: [],
  achievements: [],
  dailyStats: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      setHabits: (habits) => set({ habits }),

      addHabit: (habit) =>
        set((state) => ({
          habits: [...state.habits, habit],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      completeHabit: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (habit) {
          get().addXP(habit.xpReward);
        }
      },

      setGoals: (goals) => set({ goals }),

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
        })),

      setAchievements: (achievements) => set({ achievements }),

      unlockAchievement: (achievementId) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
              : a
          ),
        })),

      addXP: (amount) =>
        set((state) => {
          if (!state.profile) return state;
          
          const newXP = state.profile.xpPoints + amount;
          let newLevel = state.profile.level;
          
          // Simple level calculation: 100 XP per level with increasing requirement
          const xpForNextLevel = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
          
          let remainingXP = newXP;
          let level = 1;
          while (remainingXP >= xpForNextLevel(level)) {
            remainingXP -= xpForNextLevel(level);
            level++;
          }
          newLevel = level;
          
          return {
            profile: {
              ...state.profile,
              xpPoints: newXP,
              level: newLevel,
            },
          };
        }),

      incrementStreak: () =>
        set((state) => {
          if (!state.profile) return state;
          const newStreak = state.profile.currentStreak + 1;
          return {
            profile: {
              ...state.profile,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.profile.longestStreak),
            },
          };
        }),

      resetStreak: () =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, currentStreak: 0 }
            : null,
        })),

      setDailyStats: (stats) => set({ dailyStats: stats }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: "trajectory-user-store",
      partialize: (state) => ({
        profile: state.profile,
        dailyStats: state.dailyStats,
      }),
    }
  )
);
