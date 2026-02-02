"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target, Brain, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 glass-card px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">Your journey to excellence starts here</span>
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-shadow">
            <span className="gradient-text from-blue-400 via-purple-400 to-pink-400">
              Trajectory
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            The holistic wellness platform that transforms your 
            <span className="text-white font-semibold"> physical</span>, 
            <span className="text-white font-semibold"> mental</span>, and 
            <span className="text-white font-semibold"> fiscal </span> 
            health through AI-powered personalization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <GlassButton variant="primary" size="lg" className="group">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </Link>
            <Link href="/login">
              <GlassButton variant="secondary" size="lg">
                Sign In
              </GlassButton>
            </Link>
          </div>
        </motion.div>

        {/* Pillar Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 w-full"
        >
          <PillarCard
            icon={<Target className="w-8 h-8" />}
            title="Physical"
            description="Optimize your body with personalized fitness, nutrition, and sleep tracking"
            gradient="from-[#667eea] to-[#764ba2]"
            delay={0.1}
          />
          <PillarCard
            icon={<Brain className="w-8 h-8" />}
            title="Mental"
            description="Build resilience through meditation, journaling, and mindfulness practices"
            gradient="from-[#f093fb] to-[#f5576c]"
            delay={0.2}
          />
          <PillarCard
            icon={<Wallet className="w-8 h-8" />}
            title="Fiscal"
            description="Achieve financial wellness with budgeting, savings goals, and smart habits"
            gradient="from-[#4facfe] to-[#00f2fe]"
            delay={0.3}
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Powered by AI, backed by science, designed for results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-yellow-400" />}
              title="AI Coach"
              description="Get personalized guidance from our Groq-powered AI that understands your unique journey"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-green-400" />}
              title="Progress Tracking"
              description="Visualize your growth with beautiful charts, streaks, and milestone celebrations"
            />
            <FeatureCard
              icon={<Target className="w-6 h-6 text-blue-400" />}
              title="Smart Goals"
              description="Set SMART goals across all life domains and break them into achievable daily habits"
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-purple-400" />}
              title="Required Reading"
              description="Curated content from Harvard Health, NIH, and leading experts to deepen your knowledge"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/40 text-sm">
            2026 Trajectory. Your path to your best self.
          </div>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PillarCard({ 
  icon, 
  title, 
  description, 
  gradient,
  delay 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl opacity-50 blur-xl group-hover:opacity-70 transition-opacity`} />
      <GlassCard className="relative h-full">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{description}</p>
      </GlassCard>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-white/10">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-white/60 text-sm">{description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
