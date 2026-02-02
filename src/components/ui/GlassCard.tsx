"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "physical" | "mental" | "fiscal" | "none";
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = "none",
  ...props
}: GlassCardProps) {
  const glowColors = {
    physical: "hover:shadow-[0_0_40px_rgba(102,126,234,0.3)]",
    mental: "hover:shadow-[0_0_40px_rgba(240,147,251,0.3)]",
    fiscal: "hover:shadow-[0_0_40px_rgba(79,172,254,0.3)]",
    none: "",
  };

  return (
    <motion.div
      className={cn(
        "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-glass",
        hover && "transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]",
        glowColors[glow],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
