"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Plus,
  BookOpen,
  Puzzle,
  GraduationCap,
  Podcast,
  PenTool,
  CheckCircle2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/lib/supabase/client";
import { useSoundEffects } from "@/lib/sounds";
import type { Habit } from "@/types";

const HABIT_TEMPLATES = [
  { name: "Read for 30 minutes", icon: BookOpen, xp: 20 },
  { name: "Solve a puzzle or brain teaser", icon: Puzzle, xp: 15 },
  { name: "Learn something new (course/tutorial)", icon: GraduationCap, xp: 25 },
  { name: "Listen to an educational podcast", icon: Podcast, xp: 15 },
  { name: "Write/journal creative ideas", icon: PenTool, xp: 15 },
];

export default function IntellectualPage() {
  const { habits, setHabits, addHabit, removeHabit } = useUserStore();
  const sound = useSoundEffects();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(false);

  const intellectualHabits = habits.filter((h) => h.pillar === "intellectual");
  const today = new Date().toISOString().split("T")[0];

  const completedToday = intellectualHabits.filter((h) =>
    h.completions?.some((c: any) => c.completed_at?.startsWith(today))
  ).length;

  const progress = intellectualHabits.length > 0
    ? Math.round((completedToday / intellectualHabits.length) * 100)
    : 0;

  useEffect(() => {
    const fetchHabits = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("user_id", user.id)
        .eq("pillar", "intellectual")
        .eq("archived", false);

      if (habitsData) {
        const formattedHabits = habitsData.map((h: any) => ({
          id: h.id,
          userId: h.user_id,
          pillar: h.pillar,
          name: h.name,
          description: h.description,
          frequency: h.frequency,
          targetDays: h.target_days,
          xpReward: h.xp_reward,
          archived: h.archived,
          completions: h.habit_completions || [],
        }));
        const otherHabits = habits.filter((h) => h.pillar !== "intellectual");
        setHabits([...otherHabits, ...formattedHabits]);
      }
    };

    fetchHabits();
  }, []);

  const handleAddHabit = async (name: string, xp: number = 10) => {
    console.log("handleAddHabit called with:", name, xp);
    if (!name.trim()) {
      console.log("Empty name, returning");
      return;
    }
    
    setLoading(true);
    console.log("Loading set to true");
    sound.click();
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found");
        return;
      }

      console.log("Inserting habit for user:", user.id);
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          pillar: "intellectual",
          name,
          frequency: "daily",
          xp_reward: xp,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Habit inserted successfully:", data);
      addHabit({
        id: data.id,
        userId: data.user_id,
        pillar: data.pillar,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        targetDays: data.target_days,
        xpReward: data.xp_reward,
        archived: data.archived,
        completions: [],
      });

      sound.success();
      setShowAddModal(false);
      setNewHabitName("");
      console.log("Habit added successfully, modal closed");
    } catch (err) {
      console.error("Failed to add habit:", err);
      sound.error();
      alert(`Failed to add habit: ${err}`);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("habits")
        .update({ archived: true })
        .eq("id", habitId);

      removeHabit(habitId);
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  };

  const handleToggleComplete = async (habit: Habit) => {
    const isCompletedToday = habit.completions?.some(
      (c: any) => c.completed_at?.startsWith(today)
    );

    if (!isCompletedToday) {
      try {
        const response = await fetch("/api/habits/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId: habit.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.alreadyCompleted) return;
          throw new Error(data.error);
        }

        const updatedHabits = habits.map((h) =>
          h.id === habit.id
            ? { ...h, completions: [...h.completions, data.completion] }
            : h
        );
        setHabits(updatedHabits);

        useUserStore.getState().addXP(data.totalXP);

        if (data.streak) {
          useUserStore.getState().setProfile({
            ...useUserStore.getState().profile!,
            currentStreak: data.streak.current,
            longestStreak: data.streak.longest,
          });
        }

        if (data.milestone) {
          alert(`🎉 ${data.milestone} +${data.bonusXP} bonus XP!`);
        }
      } catch (err) {
        console.error("Failed to complete habit:", err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-intellectual flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            Intellectual Wellness
          </h1>
          <p className="text-white/60 mt-2">
            Expand your knowledge and embrace lifelong learning
          </p>
        </div>
        <GlassButton variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Habit
        </GlassButton>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-6">
          <ProgressRing progress={progress} color="intellectual" />
          <div>
            <div className="text-2xl font-bold text-white">
              {completedToday}/{intellectualHabits.length}
            </div>
            <div className="text-white/60">Habits completed today</div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-white/60 text-sm mb-1">Learning Streak</div>
          <div className="text-3xl font-bold text-white">
            {useUserStore.getState().profile?.currentStreak || 0}
            <span className="text-lg text-white/60 ml-1">days</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-white/60 text-sm mb-1">Total XP Earned</div>
          <div className="text-3xl font-bold text-yellow-400">
            {intellectualHabits.reduce((sum, h) => {
              const completed = h.completions?.length || 0;
              return sum + completed * h.xpReward;
            }, 0)}
            <span className="text-lg text-white/60 ml-1">XP</span>
          </div>
        </GlassCard>
      </div>

      {/* Habits List */}
      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-6">Your Learning Habits</h2>

        {intellectualHabits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60 mb-2">No intellectual habits yet</p>
            <p className="text-white/40 text-sm mb-6">
              Feed your curiosity and sharpen your mind
            </p>
            <GlassButton variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Your First Habit
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-3">
            {intellectualHabits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={() => handleToggleComplete(habit)}
                onDelete={() => handleDeleteHabit(habit.id)}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg"
          >
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Add Learning Habit</h2>

              {/* Templates */}
              <div className="mb-6">
                <h3 className="text-sm text-white/60 mb-3">Quick Add Templates</h3>
                <div className="grid grid-cols-1 gap-2">
                  {HABIT_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => handleAddHabit(template.name, template.xp)}
                      disabled={loading}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-intellectual flex items-center justify-center flex-shrink-0">
                        <template.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium">{template.name}</div>
                        <div className="text-white/40 text-sm">+{template.xp} XP</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Habit */}
              <div>
                <h3 className="text-sm text-white/60 mb-3">Or Create Custom</h3>
                <div className="flex gap-3">
                  <GlassInput
                    placeholder="Enter habit name..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="flex-1"
                  />
                  <GlassButton
                    variant="primary"
                    onClick={() => handleAddHabit(newHabitName)}
                    disabled={!newHabitName.trim() || loading}
                  >
                    Add
                  </GlassButton>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <GlassButton variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function HabitRow({
  habit,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const isCompletedToday = habit.completions?.some(
    (c: any) => c.completed_at?.startsWith(today)
  );
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      className={`
        flex items-center gap-4 p-4 rounded-xl bg-white/5 
        border-l-4 border-l-yellow-500
        ${isCompletedToday ? "opacity-60" : ""}
      `}
    >
      <button
        onClick={onToggle}
        disabled={isCompletedToday}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${isCompletedToday
            ? "bg-green-500 border-green-500"
            : "border-white/30 hover:border-yellow-500"
          }
        `}
      >
        {isCompletedToday && <CheckCircle2 className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1">
        <div className={`font-medium ${isCompletedToday ? "text-white/60 line-through" : "text-white"}`}>
          {habit.name}
        </div>
        <div className="text-white/40 text-sm">
          {habit.completions?.length || 0} completions
        </div>
      </div>

      <div className="text-yellow-400 text-sm">+{habit.xpReward} XP</div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-white/60" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-32 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
