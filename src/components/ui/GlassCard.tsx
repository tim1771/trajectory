"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WellnessPillar } from "@/types";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: WellnessPillar | "none";
  animate?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = "none",
  animate = false,
  ...props
}: GlassCardProps) {
  const glowColors: Record<WellnessPillar | "none", string> = {
    physical: "hover:shadow-[0_0_40px_rgba(102,126,234,0.3)] active:shadow-[0_0_30px_rgba(102,126,234,0.4)]",
    mental: "hover:shadow-[0_0_40px_rgba(240,147,251,0.3)] active:shadow-[0_0_30px_rgba(240,147,251,0.4)]",
    fiscal: "hover:shadow-[0_0_40px_rgba(79,172,254,0.3)] active:shadow-[0_0_30px_rgba(79,172,254,0.4)]",
    social: "hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] active:shadow-[0_0_30px_rgba(249,115,22,0.4)]",
    spiritual: "hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] active:shadow-[0_0_30px_rgba(139,92,246,0.4)]",
    intellectual: "hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] active:shadow-[0_0_30px_rgba(234,179,8,0.4)]",
    occupational: "hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] active:shadow-[0_0_30px_rgba(34,197,94,0.4)]",
    environmental: "hover:shadow-[0_0_40px_rgba(20,184,166,0.3)] active:shadow-[0_0_30px_rgba(20,184,166,0.4)]",
    none: "",
  };

  const baseAnimation = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  } : {};

  const hoverAnimation = hover ? {
    whileHover: { 
      scale: 1.02, 
      y: -2,
      transition: { duration: 0.2 } 
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 } 
    },
  } : {};

  return (
    <motion.div
      className={cn(
        "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "transition-all duration-300",
        hover && "cursor-pointer hover:bg-white/[0.12] hover:border-white/30",
        glowColors[glow],
        className
      )}
      {...baseAnimation}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stat card with large number display
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  color?: "purple" | "pink" | "cyan" | "orange" | "green";
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = "",
  color = "purple",
}: StatCardProps) {
  const colorClasses = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
    pink: "from-pink-500/20 to-pink-600/10 border-pink-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
    green: "from-green-500/20 to-green-600/10 border-green-500/20",
  };

  const valueColors = {
    purple: "text-purple-400",
    pink: "text-pink-400",
    cyan: "text-cyan-400",
    orange: "text-orange-400",
    green: "text-green-400",
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 border",
        "bg-gradient-to-br backdrop-blur-xl",
        colorClasses[color],
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-white/60 text-sm font-medium">{label}</span>
        {icon && <span className="text-white/40">{icon}</span>}
      </div>
      <div className={cn("text-3xl md:text-4xl font-bold", valueColors[color])}>
        {value}
      </div>
      {trend && trendValue && (
        <div className={cn(
          "mt-2 text-sm flex items-center gap-1",
          trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-white/40"
        )}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          {trendValue}
        </div>
      )}
    </motion.div>
  );
}
