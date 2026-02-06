"use client";

import { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/lib/supabase/client";
import { useSoundEffects } from "@/lib/sounds";

export default function SettingsPage() {
  const { profile, updateProfile, setProfile } = useUserStore();
  const sound = useSoundEffects();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [avatarGender, setAvatarGender] = useState<"male" | "female">(
    (profile?.onboardingData?.gender as "male" | "female") || "male"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    streakWarning: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "friends" as "public" | "friends" | "private",
    showStreak: true,
    showLevel: true,
    showAchievements: true,
    allowFriendRequests: true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(true);

  useEffect(() => {
    fetchPrivacySettings();
    setSoundEnabled(sound.isEnabled());
  }, []);

  const fetchPrivacySettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_privacy")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setPrivacy({
        profileVisibility: data.profile_visibility as "public" | "friends" | "private",
        showStreak: data.show_streak,
        showLevel: data.show_level,
        showAchievements: data.show_achievements,
        allowFriendRequests: data.allow_friend_requests,
      });
    }

    setPrivacyLoading(false);
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_privacy")
        .upsert({
          user_id: user.id,
          profile_visibility: privacy.profileVisibility,
          show_streak: privacy.showStreak,
          show_level: privacy.showLevel,
          show_achievements: privacy.showAchievements,
          allow_friend_requests: privacy.allowFriendRequests,
          updated_at: new Date().toISOString(),
        });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save privacy settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get current onboarding data and update gender
      const currentOnboardingData = profile?.onboardingData || {};
      const updatedOnboardingData = {
        ...currentOnboardingData,
        gender: avatarGender,
      };

      await supabase
        .from("user_profiles")
        .update({ 
          display_name: displayName,
          onboarding_data: updatedOnboardingData,
        })
        .eq("user_id", user.id);

      // Update local state
      updateProfile({ displayName });
      if (profile) {
        setProfile({
          ...profile,
          displayName,
          onboardingData: updatedOnboardingData,
        });
      }
      
      setSaved(true);
      sound.success();
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

        <div className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Avatar
            </label>
            <div className="flex gap-4">
              {/* Male Avatar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAvatarGender("male")}
                className={`relative rounded-xl overflow-hidden border-3 transition-all ${
                  avatarGender === "male"
                    ? "border-purple-500 shadow-lg shadow-purple-500/30"
                    : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src="/avatars/m1.png"
                  alt="Male Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover"
                />
                {avatarGender === "male" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                  <span className="text-white text-xs">Male</span>
                </div>
              </motion.button>

              {/* Female Avatar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAvatarGender("female")}
                className={`relative rounded-xl overflow-hidden border-3 transition-all ${
                  avatarGender === "female"
                    ? "border-pink-500 shadow-lg shadow-pink-500/30"
                    : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src="/avatars/f1.png"
                  alt="Female Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover"
                />
                {avatarGender === "female" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                  <span className="text-white text-xs">Female</span>
                </div>
              </motion.button>
            </div>
            <p className="text-white/40 text-xs mt-2">
              Your avatar evolves as you level up!
            </p>
          </div>

          {/* Display Name */}
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
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
        </div>

        <div className="space-y-4">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white/60" />
              ) : (
                <VolumeX className="w-5 h-5 text-white/60" />
              )}
              <div>
                <div className="text-white font-medium">Sound Effects</div>
                <div className="text-white/60 text-sm">
                  Haptic audio feedback for button clicks
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const newValue = !soundEnabled;
                setSoundEnabled(newValue);
                sound.setEnabled(newValue);
                if (newValue) sound.toggle();
              }}
              className={`
                w-12 h-6 rounded-full transition-colors relative
                ${soundEnabled ? "bg-purple-500" : "bg-white/20"}
              `}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
                animate={{
                  left: soundEnabled ? "calc(100% - 20px)" : "4px",
                }}
                transition={{ duration: 0.2 }}
              />
            </button>
          </div>

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
          <h2 className="text-lg font-semibold text-white">Privacy Settings</h2>
        </div>

        {privacyLoading ? (
          <div className="text-center py-4 text-white/60">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-white/60" />
                <div className="text-white font-medium">Profile Visibility</div>
              </div>
              <div className="text-white/60 text-sm mb-3">
                Who can see your profile and progress?
              </div>
              <div className="flex gap-2">
                {(["public", "friends", "private"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setPrivacy({ ...privacy, profileVisibility: option })}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${privacy.profileVisibility === option
                        ? "bg-purple-500 text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                      }
                    `}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Elements */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-white font-medium mb-3">Show on Profile</div>
              <div className="space-y-3">
                {[
                  { key: "showLevel", label: "Level & XP", icon: Crown },
                  { key: "showStreak", label: "Streak count", icon: Sparkles },
                  { key: "showAchievements", label: "Achievements", icon: Crown },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <button
                      onClick={() =>
                        setPrivacy({
                          ...privacy,
                          [item.key]: !privacy[item.key as keyof typeof privacy],
                        })
                      }
                      className={`
                        w-12 h-6 rounded-full transition-colors relative
                        ${privacy[item.key as keyof typeof privacy]
                          ? "bg-purple-500"
                          : "bg-white/20"
                        }
                      `}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        animate={{
                          left: privacy[item.key as keyof typeof privacy]
                            ? "calc(100% - 20px)"
                            : "4px",
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Friend Requests */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-white/60" />
                  <div>
                    <div className="text-white font-medium">Allow Friend Requests</div>
                    <div className="text-white/60 text-sm">
                      Let others send you connection requests
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPrivacy({
                      ...privacy,
                      allowFriendRequests: !privacy.allowFriendRequests,
                    })
                  }
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${privacy.allowFriendRequests ? "bg-purple-500" : "bg-white/20"}
                  `}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    animate={{
                      left: privacy.allowFriendRequests ? "calc(100% - 20px)" : "4px",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
              </div>
            </div>

            <GlassButton
              variant="primary"
              onClick={handleSavePrivacy}
              loading={saving}
              className="w-full"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Privacy Settings Saved!
                </>
              ) : (
                "Save Privacy Settings"
              )}
            </GlassButton>
          </div>
        )}
      </GlassCard>

      {/* Data Management Section */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-5 h-5 text-white/60" />
          <h2 className="text-lg font-semibold text-white">Data Management</h2>
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
