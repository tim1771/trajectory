"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export function StaggeredList({
  children,
  className = "",
  staggerDelay = 0.08,
}: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// Individual item wrapper
interface StaggeredItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredItem({ children, className = "" }: StaggeredItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Fade in on scroll
interface FadeInOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export function FadeInOnScroll({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: FadeInOnScrollProps) {
  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        y: directions[direction].y,
        x: directions[direction].x,
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        x: 0,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for attention
export function PulseOnce({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10,
      }}
    >
      {children}
    </motion.div>
  );
}
