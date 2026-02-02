"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Download,
  Trash2,
  Check,
  ChevronRight,
  Crown,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { profile, updateProfile } = useUserStore();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    streakWarning: true,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from("user_profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);

      updateProfile({ displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Fetch all user data
    const [habits, completions, profile] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", user.id),
      supabase.from("habit_completions").select("*").eq("user_id", user.id),
      supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
    ]);

    const exportData = {
      profile: profile.data,
      habits: habits.data,
      completions: completions.data,
      exportedAt: new Date().toISOString(),
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trajectory-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-white/60" />
          Settings
        </h1>
        <p className="text-white/60 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-white/60" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        <div className="space-y-4">
          <GlassInput
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />

          <div className="flex items-center gap-3">
            <GlassButton
              variant="primary"
              onClick={handleSaveProfile}
              loading={saving}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Subscription Section */}
      <GlassCard id="subscription">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-white/60" />
          <h2 className="text-lg font-semibold text-white">Subscription</h2>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mb-4">
          <div>
            <div className="text-white font-medium capitalize">
              {profile?.tier || "Free"} Plan
            </div>
            <div className="text-white/60 text-sm">
              {profile?.tier === "premium"
                ? "Full access to all features"
                : "Limited features and daily caps"}
            </div>
          </div>
          {profile?.tier !== "premium" && (
            <Crown className="w-6 h-6 text-yellow-400" />
          )}
        </div>

        {profile?.tier === "free" && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Upgrade to Premium
                </h3>
                <ul className="space-y-2 text-white/70 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Unlimited AI coaching messages
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Full reading library access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Advanced analytics & insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    3 streak freezes per month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Export your data
                  </li>
                </ul>
                <div className="flex items-center gap-4">
                  <GlassButton variant="primary">
                    Upgrade for $9.99/month
                  </GlassButton>
                  <span className="text-white/40 text-sm">
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {profile?.tier === "premium" && (
          <GlassButton variant="secondary">
            Manage Subscription
            <ChevronRight className="w-4 h-4 ml-1" />
          </GlassButton>
        )}
      </GlassCard>

      {/* Notifications Section */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-white/60" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: "dailyReminder", label: "Daily habit reminder", description: "Get reminded to complete your habits" },
            { key: "weeklyReport", label: "Weekly progress report", description: "Summary of your weekly achievements" },
            { key: "achievements", label: "Achievement unlocked", description: "Be notified when you earn achievements" },
            { key: "streakWarning", label: "Streak warning", description: "Alert when your streak is at risk" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5"
            >
              <div>
                <div className="text-white font-medium">{item.label}</div>
                <div className="text-white/60 text-sm">{item.description}</div>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof prev],
                  }))
                }
                className={`
                  w-12 h-6 rounded-full transition-colors relative
                  ${notifications[item.key as keyof typeof notifications]
                    ? "bg-purple-500"
                    : "bg-white/20"
                  }
                `}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  animate={{
                    left: notifications[item.key as keyof typeof notifications] ? "calc(100% - 20px)" : "4px",
                  }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Privacy & Data Section */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-white/60" />
          <h2 className="text-lg font-semibold text-white">Privacy & Data</h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleExportData}
            disabled={profile?.tier === "free"}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-white/60" />
              <div className="text-left">
                <div className="text-white font-medium">Export Your Data</div>
                <div className="text-white/60 text-sm">
                  Download all your data as JSON
                </div>
              </div>
            </div>
            {profile?.tier === "free" && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                Premium
              </span>
            )}
          </button>

          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors group">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-white/60 group-hover:text-red-400" />
              <div className="text-left">
                <div className="text-white font-medium group-hover:text-red-400">
                  Delete Account
                </div>
                <div className="text-white/60 text-sm">
                  Permanently delete your account and data
                </div>
              </div>
            </div>
          </button>
        </div>
      </GlassCard>

      {/* App Info */}
      <div className="text-center text-white/40 text-sm py-4">
        <p>Trajectory v1.0.0</p>
        <p className="mt-1">
          <a href="/privacy" className="hover:text-white/60">Privacy Policy</a>
          {" · "}
          <a href="/terms" className="hover:text-white/60">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
