"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Brain,
  Wallet,
  Users,
  Sparkles as SparklesIcon,
  Lightbulb,
  Briefcase,
  Leaf,
  MessageSquare,
  BookOpen,
  Trophy,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";
import { SoundscapePlayer } from "@/components/SoundscapePlayer";
import { FloatingOrbs } from "@/components/ui/FloatingElements";

// 8 Dimensions of Wellness navigation
const pillarItems = [
  { href: "/dashboard/physical", icon: Target, label: "Physical", color: "text-purple-400" },
  { href: "/dashboard/mental", icon: Brain, label: "Mental", color: "text-pink-400" },
  { href: "/dashboard/fiscal", icon: Wallet, label: "Fiscal", color: "text-cyan-400" },
  { href: "/dashboard/social", icon: Users, label: "Social", color: "text-orange-400" },
  { href: "/dashboard/spiritual", icon: SparklesIcon, label: "Spiritual", color: "text-violet-400" },
  { href: "/dashboard/intellectual", icon: Lightbulb, label: "Intellectual", color: "text-yellow-400" },
  { href: "/dashboard/occupational", icon: Briefcase, label: "Occupational", color: "text-green-400" },
  { href: "/dashboard/environmental", icon: Leaf, label: "Environmental", color: "text-teal-400" },
];

const toolItems = [
  { href: "/dashboard/coach", icon: MessageSquare, label: "AI Coach" },
  { href: "/dashboard/insights", icon: Brain, label: "Insights" },
  { href: "/dashboard/library", icon: BookOpen, label: "Library" },
  { href: "/dashboard/community", icon: Users, label: "Community" },
  { href: "/dashboard/challenges", icon: Zap, label: "Challenges" },
  { href: "/dashboard/achievements", icon: Trophy, label: "Achievements" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, setProfile } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile({
          id: profileData.id,
          userId: profileData.user_id,
          displayName: profileData.display_name,
          avatarUrl: profileData.avatar_url,
          onboardingData: profileData.onboarding_data as any,
          onboardingCompleted: profileData.onboarding_completed,
          level: profileData.level,
          xpPoints: profileData.xp_points,
          currentStreak: profileData.current_streak,
          longestStreak: profileData.longest_streak,
          tier: profileData.tier as "free" | "premium",
        });
      } else if (!pathname.includes("/onboarding")) {
        router.push("/onboarding");
      }
    };

    checkAuth();
  }, [router, setProfile, pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    useUserStore.getState().reset();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Ambient floating elements */}
      <FloatingOrbs />
      
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-xl"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-black/20 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4 mb-6">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold text-white">Trajectory</span>
          </Link>

          {/* User info */}
          {profile && (
            <div className="px-4 py-3 mb-6 rounded-xl bg-white/5">
              <div className="text-white font-medium truncate">
                {profile.displayName || "Traveler"}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Level {profile.level}</span>
                <span className="text-purple-400">
                  {profile.xpPoints} XP
                </span>
              </div>
              {profile.currentStreak > 0 && (
                <div className="text-sm text-orange-400 mt-1">
                  {profile.currentStreak} day streak
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {/* Dashboard Home */}
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${pathname === "/dashboard"
                  ? "bg-purple-500/20 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            {/* Wellness Pillars Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                Wellness Dimensions
              </div>
            </div>
            {pillarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? item.color : ""}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}

            {/* Tools Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                Tools
              </div>
            </div>
            {toolItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? "bg-purple-500/20 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Upgrade banner (for free users) */}
          {profile?.tier === "free" && (
            <div className="p-4 mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
              <div className="text-white font-medium mb-1">Go Premium</div>
              <div className="text-white/60 text-sm mb-3">
                Unlock unlimited AI coaching, advanced analytics, and more.
              </div>
              <Link
                href="/dashboard/settings#subscription"
                className="block text-center py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-8 w-full max-w-full">{children}</div>
      </main>

      {/* Floating soundscape player */}
      <SoundscapePlayer />
    </div>
  );
}
