"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useUserStore } from "@/stores/userStore";

// Avatar tier thresholds based on level
const AVATAR_TIERS = [
  { minLevel: 1, maxLevel: 5, tier: 1, title: "Novice" },
  { minLevel: 6, maxLevel: 15, tier: 2, title: "Apprentice" },
  { minLevel: 16, maxLevel: 30, tier: 3, title: "Warrior" },
  { minLevel: 31, maxLevel: Infinity, tier: 4, title: "Legend" },
];

function getAvatarTier(level: number): { tier: number; title: string } {
  for (const t of AVATAR_TIERS) {
    if (level >= t.minLevel && level <= t.maxLevel) {
      return { tier: t.tier, title: t.title };
    }
  }
  return { tier: 1, title: "Novice" };
}

function getAvatarPath(gender: "male" | "female", tier: number): string {
  const prefix = gender === "male" ? "m" : "f";
  return `/avatars/${prefix}${tier}.png`;
}

interface UserAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTitle?: boolean;
  showProgress?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const imageSizes = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 192,
};

export function UserAvatar({ 
  size = "md", 
  showTitle = false, 
  showProgress = false,
  className = "" 
}: UserAvatarProps) {
  const profile = useUserStore((state) => state.profile);
  
  if (!profile) return null;

  // Get gender from onboarding data, default to male
  const gender = (profile.onboardingData?.gender as "male" | "female") || "male";
  const level = profile.level || 1;
  const { tier, title } = getAvatarTier(level);
  const avatarPath = getAvatarPath(gender, tier);

  // Calculate progress to next tier
  const currentTierData = AVATAR_TIERS.find(t => t.tier === tier);
  const nextTierData = AVATAR_TIERS.find(t => t.tier === tier + 1);
  
  let progressToNextTier = 100;
  let levelsToNextTier = 0;
  
  if (nextTierData && currentTierData) {
    const levelsInCurrentTier = currentTierData.maxLevel - currentTierData.minLevel + 1;
    const currentProgress = level - currentTierData.minLevel;
    progressToNextTier = Math.round((currentProgress / levelsInCurrentTier) * 100);
    levelsToNextTier = currentTierData.maxLevel - level + 1;
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-white/20 shadow-lg`}
      >
        {/* Glow effect for higher tiers */}
        {tier >= 3 && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 ${
              tier === 4 
                ? "bg-gradient-to-r from-yellow-500/30 via-purple-500/30 to-pink-500/30" 
                : "bg-gradient-to-r from-purple-500/20 to-pink-500/20"
            } blur-xl`}
          />
        )}
        
        <Image
          src={avatarPath}
          alt={`${title} Avatar`}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-cover relative z-10"
          priority
        />
        
        {/* Tier badge */}
        <div className="absolute bottom-1 right-1 z-20 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
          <span className={`text-xs font-bold ${
            tier === 4 ? "text-yellow-400" :
            tier === 3 ? "text-purple-400" :
            tier === 2 ? "text-blue-400" :
            "text-white/70"
          }`}>
            T{tier}
          </span>
        </div>
      </motion.div>

      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-center"
        >
          <p className={`font-semibold ${
            tier === 4 ? "text-yellow-400" :
            tier === 3 ? "text-purple-400" :
            tier === 2 ? "text-blue-400" :
            "text-white/80"
          }`}>
            {title}
          </p>
        </motion.div>
      )}

      {showProgress && nextTierData && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 w-full max-w-[120px]"
        >
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextTier}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
          <p className="text-white/40 text-xs text-center mt-1">
            {levelsToNextTier} level{levelsToNextTier !== 1 ? "s" : ""} to next tier
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Large showcase version for dashboard
export function AvatarShowcase() {
  const profile = useUserStore((state) => state.profile);
  
  if (!profile) return null;

  const gender = (profile.onboardingData?.gender as "male" | "female") || "male";
  const level = profile.level || 1;
  const { tier, title } = getAvatarTier(level);
  const avatarPath = getAvatarPath(gender, tier);
  
  const currentTierData = AVATAR_TIERS.find(t => t.tier === tier);
  const nextTierData = AVATAR_TIERS.find(t => t.tier === tier + 1);
  
  let progressPercent = 100;
  
  if (nextTierData && currentTierData) {
    const levelsInTier = currentTierData.maxLevel - currentTierData.minLevel + 1;
    const currentProgress = level - currentTierData.minLevel;
    progressPercent = Math.round((currentProgress / levelsInTier) * 100);
  }

  return (
    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl"
          >
            {tier >= 3 && (
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-xl"
              />
            )}
            <Image
              src={avatarPath}
              alt={title}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-lg font-bold ${
              tier === 4 ? "text-yellow-400" :
              tier === 3 ? "text-purple-400" :
              tier === 2 ? "text-blue-400" :
              "text-white"
            }`}>
              {title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
              Tier {tier}
            </span>
          </div>
          
          <p className="text-white/60 text-sm mb-2">
            Level {level} • {profile.xpPoints.toLocaleString()} XP
          </p>

          {/* Progress to next tier */}
          {nextTierData && (
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Progress to {nextTierData.title}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${
                    tier === 3 ? "bg-gradient-to-r from-purple-500 to-yellow-500" :
                    tier === 2 ? "bg-gradient-to-r from-blue-500 to-purple-500" :
                    "bg-gradient-to-r from-white/50 to-blue-500"
                  }`}
                />
              </div>
            </div>
          )}
          
          {!nextTierData && (
            <p className="text-yellow-400/80 text-sm">
              ✨ Maximum tier achieved!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { getAvatarTier, getAvatarPath, AVATAR_TIERS };
