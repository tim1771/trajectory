import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function calculateStreak(completions: { date: string; completed: boolean }[]): number {
  if (!completions.length) return 0;
  
  const sorted = [...completions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i].date);
    date.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (date.getTime() === expectedDate.getTime() && sorted[i].completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getXPForLevel(level: number): number {
  // XP required increases exponentially
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(xp: number): { level: number; currentXP: number; nextLevelXP: number } {
  let level = 1;
  let totalXP = 0;
  
  while (true) {
    const xpForLevel = getXPForLevel(level);
    if (totalXP + xpForLevel > xp) {
      return {
        level,
        currentXP: xp - totalXP,
        nextLevelXP: xpForLevel,
      };
    }
    totalXP += xpForLevel;
    level++;
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
