"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Trophy, Zap } from "lucide-react";
import { useSoundEffects } from "@/lib/sounds";
import { useUserStore } from "@/stores/userStore";

// Encouraging messages for different level ranges
const LEVEL_MESSAGES: Record<string, string[]> = {
  early: [ // Levels 1-5
    "You're building momentum! Keep it up!",
    "Amazing start! Your journey is taking shape!",
    "You're on fire! The path to greatness begins here!",
    "Incredible progress! You're becoming unstoppable!",
    "Fantastic work! Every level makes you stronger!",
  ],
  growing: [ // Levels 6-15
    "You're really hitting your stride now!",
    "Impressive dedication! Your habits are paying off!",
    "You're becoming a wellness warrior!",
    "Your commitment is inspiring! Keep pushing!",
    "Look at you go! Nothing can stop you now!",
  ],
  advanced: [ // Levels 16-30
    "You're in the top tier of achievers!",
    "Legendary progress! You're mastering your wellness!",
    "Your discipline is remarkable! True champion energy!",
    "Elite level unlocked! You're an inspiration!",
    "Phenomenal achievement! You're rewriting your story!",
  ],
  master: [ // Levels 31+
    "You've achieved mastery! Absolutely incredible!",
    "You're a wellness legend! Bow-worthy achievement!",
    "Peak performance unlocked! You're in rare air!",
    "Transcendent! You've become your best self!",
    "Mythical status achieved! You're unstoppable!",
  ],
};

function getRandomMessage(level: number): string {
  let category: string;
  if (level <= 5) category = "early";
  else if (level <= 15) category = "growing";
  else if (level <= 30) category = "advanced";
  else category = "master";

  const messages = LEVEL_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Fun facts/tips for each level
const LEVEL_TIPS: string[] = [
  "Tip: Stack habits together for better consistency!",
  "Did you know? Morning routines boost productivity by 25%!",
  "Fun fact: It takes 66 days on average to form a new habit!",
  "Pro tip: Small wins compound into big transformations!",
  "Remember: Progress, not perfection, is the goal!",
  "Insight: Your strongest pillar can boost your weakest!",
  "Fact: People who track habits are 40% more likely to succeed!",
  "Tip: Celebrate small victories—they fuel bigger ones!",
];

export function LevelUpCelebration() {
  const [show, setShow] = useState(false);
  const [levelData, setLevelData] = useState<{ level: number; message: string; tip: string } | null>(null);
  const profile = useUserStore((state) => state.profile);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const sound = useSoundEffects();

  useEffect(() => {
    if (!profile) return;

    // Initialize previous level
    if (previousLevel === null) {
      setPreviousLevel(profile.level);
      return;
    }

    // Check for level up
    if (profile.level > previousLevel) {
      // Level up detected!
      const message = getRandomMessage(profile.level);
      const tip = LEVEL_TIPS[Math.floor(Math.random() * LEVEL_TIPS.length)];
      
      setLevelData({ level: profile.level, message, tip });
      setShow(true);
      sound.levelUp();

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);

      setPreviousLevel(profile.level);
      return () => clearTimeout(timer);
    }

    setPreviousLevel(profile.level);
  }, [profile?.level, previousLevel, sound]);

  return (
    <AnimatePresence>
      {show && levelData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        >
          {/* Backdrop with particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShow(false)}
          />

          {/* Celebration card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative z-10 pointer-events-auto"
            onClick={() => setShow(false)}
          >
            <div className="relative bg-gradient-to-br from-purple-900/90 via-violet-900/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md text-center overflow-hidden">
              {/* Animated background glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
              />

              {/* Floating stars */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-20, -60, -100],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10), (i % 2 === 0 ? 2 : -2) * (15 + i * 5)],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}

              {/* Content */}
              <div className="relative z-10">
                {/* Level badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2, damping: 10 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{levelData.level}</div>
                    <div className="text-xs text-white/80 uppercase tracking-wide">Level</div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    Level Up!
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </h2>
                </motion.div>

                {/* Encouraging message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 mb-4 font-medium"
                >
                  {levelData.message}
                </motion.p>

                {/* Tip */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 rounded-xl px-4 py-3 mb-4"
                >
                  <p className="text-white/70 text-sm flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {levelData.tip}
                  </p>
                </motion.div>

                {/* Dismiss hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-white/40 text-xs"
                >
                  Tap anywhere to continue
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
