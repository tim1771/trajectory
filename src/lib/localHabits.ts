import type { Habit, HabitCompletion, WellnessPillar } from "@/types";

const HABITS_PREFIX = "trajectory-local-habits:";

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

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function storageKey(userId: string) {
  return `${HABITS_PREFIX}${userId}`;
}

export function getLocalHabits(userId: string, pillar?: WellnessPillar): Habit[] {
  const habits = readJson<Habit[]>(storageKey(userId), []);
  return habits.filter((habit) => !habit.archived && (!pillar || habit.pillar === pillar));
}

export function addLocalHabit(userId: string, pillar: WellnessPillar, name: string, xpReward = 10): Habit {
  const habit: Habit = {
    id: randomId("local-habit"),
    userId,
    pillar,
    name,
    description: null,
    frequency: "daily",
    targetDays: null,
    xpReward,
    completions: [],
    archived: false,
  };

  const habits = readJson<Habit[]>(storageKey(userId), []);
  writeJson(storageKey(userId), [...habits, habit]);
  return habit;
}

export function archiveLocalHabit(userId: string, habitId: string) {
  const habits = readJson<Habit[]>(storageKey(userId), []);
  writeJson(
    storageKey(userId),
    habits.map((habit) => (habit.id === habitId ? { ...habit, archived: true } : habit))
  );
}

export function completeLocalHabit(userId: string, habitId: string): { completion: HabitCompletion; habit: Habit } | null {
  const habits = readJson<Habit[]>(storageKey(userId), []);
  const today = new Date().toISOString().split("T")[0];
  const habit = habits.find((item) => item.id === habitId && item.userId === userId && !item.archived);

  if (!habit) return null;

  const alreadyCompleted = habit.completions?.some((completion: any) => {
    const completedAt = completion.completed_at || completion.completedAt;
    return typeof completedAt === "string" && completedAt.startsWith(today);
  });

  if (alreadyCompleted) {
    return null;
  }

  const completedAt = new Date().toISOString();
  const completion = {
    id: randomId("local-completion"),
    habitId,
    completedAt,
    notes: null,
    completed_at: completedAt,
  } as HabitCompletion & { completed_at: string };

  const nextHabit = {
    ...habit,
    completions: [...(habit.completions || []), completion],
  };

  writeJson(
    storageKey(userId),
    habits.map((item) => (item.id === habitId ? nextHabit : item))
  );

  return { completion, habit: nextHabit };
}
