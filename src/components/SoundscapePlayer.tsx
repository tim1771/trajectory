"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SOUNDSCAPES, type SoundscapeId } from "@/lib/soundscapes";
import { useUserStore } from "@/stores/userStore";

export function SoundscapePlayer() {
  const { profile } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundscapeId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [playTime, setPlayTime] = useState(0); // seconds
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isFree = profile?.tier === "free";
  const freeTimeLimit = 600; // 10 minutes in seconds

  // Track play time for free users
  useEffect(() => {
    if (!isPlaying || !isFree) return;

    const interval = setInterval(() => {
      setPlayTime((t) => {
        if (t >= freeTimeLimit) {
          handleStop();
          return t;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isFree]);

  // Initialize audio when sound changes
  useEffect(() => {
    if (!activeSound) return;

    const sound = SOUNDSCAPES.find((s) => s.id === activeSound);
    if (!sound) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    if (isPlaying) {
      audio.play().catch((err) => console.error("Audio play failed:", err));
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [activeSound]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlay = async (soundId: SoundscapeId) => {
    if (isFree && playTime >= freeTimeLimit) {
      alert("You've reached the free tier limit (10 min/day). Upgrade to Premium for unlimited access!");
      return;
    }

    // If switching to a new sound, update it first
    if (activeSound !== soundId) {
      setActiveSound(soundId);
      // Wait for useEffect to create new audio
      setTimeout(() => {
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.error("Audio play failed:", err);
            alert("Failed to play audio. Please check your browser permissions.");
          });
        }
      }, 100);
    } else {
      // Resume current sound
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Audio play failed:", err);
          alert("Failed to play audio. Please check your browser permissions.");
        });
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveSound(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = isFree ? freeTimeLimit - playTime : null;

  return (
    <>
      {/* Floating sound button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Soundscape panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-40 w-80"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  🎧 Soundscapes
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isFree && (
                <div className="mb-4 p-3 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <p className="text-orange-300 text-xs">
                    Free tier: {formatTime(timeRemaining || 0)} remaining today
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Upgrade for unlimited playback
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {SOUNDSCAPES.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => {
                      if (activeSound === sound.id) {
                        isPlaying ? handlePause() : handlePlay(sound.id);
                      } else {
                        handlePlay(sound.id);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl
                      transition-all duration-200
                      ${activeSound === sound.id
                        ? "bg-teal-500/20 border border-teal-500/30"
                        : "bg-white/5 hover:bg-white/10"
                      }
                    `}
                  >
                    <span className="text-2xl">{sound.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium text-sm">
                        {sound.name}
                      </div>
                      <div className="text-white/40 text-xs capitalize">
                        {sound.pillar}
                      </div>
                    </div>
                    {activeSound === sound.id && (
                      <div className="text-teal-400">
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Volume control */}
              {activeSound && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <VolumeX className="w-4 h-4" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4" />
                  </div>
                  
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={handleStop}
                    className="w-full"
                  >
                    Stop
                  </GlassButton>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
