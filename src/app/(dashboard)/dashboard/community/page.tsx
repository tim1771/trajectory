"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Check,
  X,
  Heart,
  MessageCircle,
  Trophy,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/lib/supabase/client";

interface Friend {
  id: string;
  displayName: string;
  level: number;
  currentStreak: number;
  avatarUrl: string | null;
  status: "pending" | "accepted";
}

interface SharedAchievement {
  id: string;
  userName: string;
  userLevel: number;
  achievementName: string;
  achievementIcon: string;
  message: string | null;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export default function CommunityPage() {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState<"friends" | "feed">("feed");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [feed, setFeed] = useState<SharedAchievement[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "friends") {
      fetchFriends();
    } else {
      fetchFeed();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get accepted connections
    const { data: connections } = await supabase
      .from("user_connections")
      .select("*, connected_user:auth.users!connected_user_id(id, email)")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    // Get their profiles
    if (connections) {
      const friendIds = connections.map((c: any) => c.connected_user_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, level, current_streak, avatar_url")
        .in("user_id", friendIds);

      if (profiles) {
        setFriends(
          profiles.map((p: any) => ({
            id: p.user_id,
            displayName: p.display_name,
            level: p.level,
            currentStreak: p.current_streak,
            avatarUrl: p.avatar_url,
            status: "accepted",
          }))
        );
      }
    }

    // Get pending requests (incoming)
    const { data: pending } = await supabase
      .from("user_connections")
      .select("*, requester:auth.users!user_id(id, email)")
      .eq("connected_user_id", user.id)
      .eq("status", "pending");

    if (pending) {
      const requesterIds = pending.map((c: any) => c.user_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, level, current_streak, avatar_url")
        .in("user_id", requesterIds);

      if (profiles) {
        setPendingRequests(
          profiles.map((p: any) => ({
            id: p.user_id,
            displayName: p.display_name,
            level: p.level,
            currentStreak: p.current_streak,
            avatarUrl: p.avatar_url,
            status: "pending",
          }))
        );
      }
    }
  };

  const fetchFeed = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get shared achievements from friends and public
    const { data: shared } = await supabase
      .from("shared_achievements")
      .select(`
        id,
        user_id,
        achievement_id,
        message,
        likes_count,
        created_at,
        user_profile:user_profiles!user_id(display_name, level),
        achievement:achievements!achievement_id(name, icon)
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (shared) {
      // Check which ones current user has liked
      const sharedIds = shared.map((s: any) => s.id);
      const { data: likes } = await supabase
        .from("achievement_likes")
        .select("shared_achievement_id")
        .eq("user_id", user.id)
        .in("shared_achievement_id", sharedIds);

      const likedIds = new Set(likes?.map((l: any) => l.shared_achievement_id) || []);

      setFeed(
        shared.map((s: any) => ({
          id: s.id,
          userName: s.user_profile.display_name || "Anonymous",
          userLevel: s.user_profile.level,
          achievementName: s.achievement.name,
          achievementIcon: s.achievement.icon,
          message: s.message,
          likesCount: s.likes_count,
          isLiked: likedIds.has(s.id),
          createdAt: s.created_at,
        }))
      );
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    
    setLoading(true);
    setSearchResult(null);
    
    try {
      const supabase = createClient();
      
      // Search by email (users table is not directly accessible, so we search profiles)
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, level, current_streak, avatar_url")
        .limit(1);
      
      // In production, you'd want a cloud function to search by email securely
      setSearchResult(null);
      alert("User search coming soon! For now, share your profile link with friends.");
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_connections").insert({
      user_id: user.id,
      connected_user_id: userId,
      status: "pending",
    });

    alert("Friend request sent!");
    setSearchResult(null);
  };

  const handleAcceptRequest = async (requesterId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_connections")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("user_id", requesterId)
      .eq("connected_user_id", user.id);

    fetchFriends();
  };

  const handleRejectRequest = async (requesterId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_connections")
      .delete()
      .eq("user_id", requesterId)
      .eq("connected_user_id", user.id);

    fetchFriends();
  };

  const handleLike = async (sharedAchievementId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const achievement = feed.find((a) => a.id === sharedAchievementId);
    if (!achievement) return;

    if (achievement.isLiked) {
      // Unlike
      await supabase
        .from("achievement_likes")
        .delete()
        .eq("shared_achievement_id", sharedAchievementId)
        .eq("user_id", user.id);
    } else {
      // Like
      await supabase.from("achievement_likes").insert({
        shared_achievement_id: sharedAchievementId,
        user_id: user.id,
      });
    }

    fetchFeed();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-400" />
          Community
        </h1>
        <p className="text-white/60 mt-2">
          Connect with others on their wellness journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Friends</div>
          <div className="text-2xl font-bold text-white">
            {friends.length}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Pending Requests</div>
          <div className="text-2xl font-bold text-orange-400">
            {pendingRequests.length}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Your Rank</div>
          <div className="text-2xl font-bold text-purple-400">
            #{profile?.level || 1}
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <GlassButton
          variant={activeTab === "feed" ? "primary" : "ghost"}
          onClick={() => setActiveTab("feed")}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Activity Feed
        </GlassButton>
        <GlassButton
          variant={activeTab === "friends" ? "primary" : "ghost"}
          onClick={() => setActiveTab("friends")}
        >
          <Users className="w-4 h-4 mr-2" />
          Friends ({friends.length})
        </GlassButton>
      </div>

      {/* Content */}
      {activeTab === "friends" ? (
        <div className="space-y-6">
          {/* Add Friends */}
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Add Friends</h2>
            <p className="text-white/60 text-sm mb-4">
              Connect with friends for accountability and motivation! Share your profile link:
            </p>
            <div className="p-3 rounded-lg bg-white/5 mb-4">
              <code className="text-purple-400 text-sm break-all">
                https://trajectorypro.netlify.app/profile/{profile?.userId}
              </code>
            </div>
            <p className="text-white/40 text-xs">
              Friends can visit this link to send you a connection request
            </p>
          </GlassCard>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <GlassCard>
              <h2 className="text-lg font-semibold text-white mb-4">
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-3">
                {pendingRequests.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {friend.displayName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{friend.displayName}</div>
                      <div className="text-white/60 text-sm">Level {friend.level}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(friend.id)}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-400" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(friend.id)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Friends List */}
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">
              Your Friends ({friends.length})
            </h2>
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 mb-2">No friends yet</p>
                <p className="text-white/40 text-sm">
                  Share your profile link to connect with others!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {friend.displayName?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{friend.displayName}</div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-purple-400">Level {friend.level}</span>
                        {friend.currentStreak > 0 && (
                          <span className="text-orange-400">
                            🔥 {friend.currentStreak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                    <GlassButton variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </GlassButton>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        // Activity Feed
        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Achievements</h2>
            {feed.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 mb-2">No recent activity</p>
                <p className="text-white/40 text-sm">
                  Add friends to see their achievements here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {item.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {item.userName}
                          <span className="text-purple-400 text-sm ml-2">
                            Level {item.userLevel}
                          </span>
                        </div>
                        <div className="text-white/60 text-sm">
                          Unlocked: <span className="text-white">{item.achievementName}</span>
                        </div>
                        {item.message && (
                          <p className="text-white/70 text-sm mt-2 italic">
                            "{item.message}"
                          </p>
                        )}
                        <div className="text-white/40 text-xs mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-13">
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          item.isLiked ? "text-pink-400" : "text-white/60 hover:text-pink-400"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${item.isLiked ? "fill-current" : ""}`} />
                        {item.likesCount}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
