export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Pillar = "physical" | "mental" | "fiscal";
export type SubscriptionTier = "free" | "premium";
export type HabitFrequency = "daily" | "weekly" | "custom";
export type GoalType = "habit" | "target" | "milestone" | "average";

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          onboarding_data: Json | null;
          onboarding_completed: boolean;
          level: number;
          xp_points: number;
          current_streak: number;
          longest_streak: number;
          tier: SubscriptionTier;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_data?: Json | null;
          onboarding_completed?: boolean;
          level?: number;
          xp_points?: number;
          current_streak?: number;
          longest_streak?: number;
          tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_data?: Json | null;
          onboarding_completed?: boolean;
          level?: number;
          xp_points?: number;
          current_streak?: number;
          longest_streak?: number;
          tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          pillar: Pillar;
          title: string;
          description: string | null;
          type: GoalType;
          target: Json | null;
          deadline: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar: Pillar;
          title: string;
          description?: string | null;
          type: GoalType;
          target?: Json | null;
          deadline?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pillar?: Pillar;
          title?: string;
          description?: string | null;
          type?: GoalType;
          target?: Json | null;
          deadline?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          pillar: Pillar;
          name: string;
          description: string | null;
          frequency: HabitFrequency;
          target_days: number[] | null;
          xp_reward: number;
          created_at: string;
          updated_at: string;
          archived: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar: Pillar;
          name: string;
          description?: string | null;
          frequency?: HabitFrequency;
          target_days?: number[] | null;
          xp_reward?: number;
          created_at?: string;
          updated_at?: string;
          archived?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          pillar?: Pillar;
          name?: string;
          description?: string | null;
          frequency?: HabitFrequency;
          target_days?: number[] | null;
          xp_reward?: number;
          created_at?: string;
          updated_at?: string;
          archived?: boolean;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          notes?: string | null;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          pillar: Pillar | null;
          title: string | null;
          content: string;
          mood: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pillar?: Pillar | null;
          title?: string | null;
          content: string;
          mood?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pillar?: Pillar | null;
          title?: string | null;
          content?: string;
          mood?: number | null;
          created_at?: string;
        };
      };
      reading_content: {
        Row: {
          id: string;
          pillar: Pillar;
          title: string;
          description: string;
          source: string;
          source_url: string;
          reading_time: number;
          difficulty: "beginner" | "intermediate" | "advanced";
          xp_reward: number;
          premium_only: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          pillar: Pillar;
          title: string;
          description: string;
          source: string;
          source_url: string;
          reading_time: number;
          difficulty?: "beginner" | "intermediate" | "advanced";
          xp_reward?: number;
          premium_only?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          pillar?: Pillar;
          title?: string;
          description?: string;
          source?: string;
          source_url?: string;
          reading_time?: number;
          difficulty?: "beginner" | "intermediate" | "advanced";
          xp_reward?: number;
          premium_only?: boolean;
          created_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string;
          icon: string;
          xp_reward: number;
          pillar: Pillar | null;
          requirement: Json;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description: string;
          icon: string;
          xp_reward?: number;
          pillar?: Pillar | null;
          requirement: Json;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          description?: string;
          icon?: string;
          xp_reward?: number;
          pillar?: Pillar | null;
          requirement?: Json;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
