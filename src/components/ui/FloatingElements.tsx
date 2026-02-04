"use client";

import { motion } from "framer-motion";

// Floating orbs/sparkles for ambient background effect
export function FloatingOrbs() {
  const orbs = [
    { size: 300, x: "10%", y: "20%", delay: 0, duration: 20 },
    { size: 200, x: "80%", y: "60%", delay: 5, duration: 25 },
    { size: 150, x: "60%", y: "10%", delay: 10, duration: 18 },
    { size: 250, x: "30%", y: "70%", delay: 3, duration: 22 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-30 blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: i % 2 === 0 
              ? "radial-gradient(circle, rgba(102,126,234,0.4) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(240,147,251,0.3) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Subtle sparkle particles
export function Sparkles({ count = 20 }: { count?: number }) {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-white"
          style={{
            width: sparkle.size,
            height: sparkle.size,
            left: sparkle.x,
            top: sparkle.y,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Gradient mesh that slowly animates
export function AnimatedGradientMesh() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(102,126,234,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(240,147,251,0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(79,172,254,0.08) 0%, transparent 50%)
          `,
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Simple subtle pulse ring (for CTAs)
export function PulseRing({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-500/50"
        animate={{
          scale: [1, 1.5],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </div>
  );
}
