"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ArrowLeft, Target, Brain, Wallet, 
  Sparkles, Check, Dumbbell, Moon, Salad, 
  HeartPulse, BookOpen, DollarSign, Clock,
  Users, Leaf, Briefcase, Lightbulb
} from "lucide-react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { createClient } from "@/lib/supabase/client";
import type { OnboardingData } from "@/types";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    gender: "male", // Default gender for avatar
    fitnessLevel: "beginner",
    exerciseGoals: [],
    sleepHours: 7,
    nutritionFocus: [],
    stressLevel: 5,
    mentalGoals: [],
    meditationExperience: false,
    financialGoals: [],
    budgetingExperience: "none",
    savingsGoal: 500,
    availableTime: 30,
    motivation: "",
    challenges: [],
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (key: keyof OnboardingData, item: string) => {
    const current = data[key] as string[];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateData({ [key]: updated });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        throw new Error("Not authenticated");
      }

      console.log("Saving onboarding data for user:", user.id);

      // Create or update user profile
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        onboarding_data: data,
        onboarding_completed: true,
        level: 1,
        xp_points: 50, // Welcome bonus
        current_streak: 0,
        longest_streak: 0,
        tier: "free",
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Onboarding saved successfully, redirecting to dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Failed to save onboarding:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Failed to complete onboarding"}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep data={data} updateData={updateData} />;
      case 2:
        return (
          <PhysicalStep
            data={data}
            updateData={updateData}
            toggleArrayItem={toggleArrayItem}
          />
        );
      case 3:
        return (
          <MentalStep
            data={data}
            updateData={updateData}
            toggleArrayItem={toggleArrayItem}
          />
        );
      case 4:
        return (
          <FiscalStep
            data={data}
            updateData={updateData}
            toggleArrayItem={toggleArrayItem}
          />
        );
      case 5:
        return (
          <FinalStep
            data={data}
            updateData={updateData}
            toggleArrayItem={toggleArrayItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <GlassButton
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </GlassButton>

          {step < TOTAL_STEPS ? (
            <GlassButton
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>
          ) : (
            <GlassButton
              variant="primary"
              onClick={handleComplete}
              loading={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start My Journey
            </GlassButton>
          )}
        </div>
      </div>
    </main>
  );
}

function WelcomeStep({ data, updateData }: { data: Partial<OnboardingData>; updateData: (updates: Partial<OnboardingData>) => void }) {
  const gender = (data.gender as "male" | "female") || "male";
  
  return (
    <GlassCard className="text-center py-8">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Trajectory
        </h1>
        <p className="text-white/60 text-base max-w-md mx-auto">
          Choose your avatar and begin your journey to becoming your best self
        </p>
      </motion.div>

      {/* Avatar Selection */}
      <div className="mb-8">
        <p className="text-white/70 text-sm mb-4">Select your character</p>
        <div className="flex justify-center gap-6">
          {/* Male Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateData({ gender: "male" })}
            className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
              gender === "male" 
                ? "border-purple-500 shadow-lg shadow-purple-500/30" 
                : "border-white/20 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src="/avatars/m1.png"
              alt="Male Avatar"
              width={120}
              height={120}
              className="w-28 h-28 md:w-32 md:h-32 object-cover"
            />
            {gender === "male" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1">
              <span className="text-white text-sm">Male</span>
            </div>
          </motion.button>

          {/* Female Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateData({ gender: "female" })}
            className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
              gender === "female" 
                ? "border-pink-500 shadow-lg shadow-pink-500/30" 
                : "border-white/20 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src="/avatars/f1.png"
              alt="Female Avatar"
              width={120}
              height={120}
              className="w-28 h-28 md:w-32 md:h-32 object-cover"
            />
            {gender === "female" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1">
              <span className="text-white text-sm">Female</span>
            </div>
          </motion.button>
        </div>
        <p className="text-white/40 text-xs mt-3">
          Your avatar evolves as you level up!
        </p>
      </div>

      {/* 8 Pillars Preview */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        <PillarBadge icon={<Target />} label="Physical" color="from-[#667eea] to-[#764ba2]" />
        <PillarBadge icon={<Brain />} label="Mental" color="from-[#f093fb] to-[#f5576c]" />
        <PillarBadge icon={<Wallet />} label="Fiscal" color="from-[#4facfe] to-[#00f2fe]" />
        <PillarBadge icon={<Users />} label="Social" color="from-[#f97316] to-[#ef4444]" />
        <PillarBadge icon={<Sparkles />} label="Spiritual" color="from-[#8b5cf6] to-[#6d28d9]" />
        <PillarBadge icon={<Lightbulb />} label="Intellectual" color="from-[#eab308] to-[#f97316]" />
        <PillarBadge icon={<Briefcase />} label="Career" color="from-[#22c55e] to-[#10b981]" />
        <PillarBadge icon={<Leaf />} label="Environment" color="from-[#14b8a6] to-[#06b6d4]" />
      </div>
    </GlassCard>
  );
}

function PillarBadge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="text-white/60 text-sm">{label}</span>
    </div>
  );
}

interface StepProps {
  data: Partial<OnboardingData>;
  updateData: (updates: Partial<OnboardingData>) => void;
  toggleArrayItem: (key: keyof OnboardingData, item: string) => void;
}

function PhysicalStep({ data, updateData, toggleArrayItem }: StepProps) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-physical flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Physical Health</h2>
          <p className="text-white/60 text-sm">Let's understand your fitness journey</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Current fitness level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <SelectButton
                key={level}
                selected={data.fitnessLevel === level}
                onClick={() => updateData({ fitnessLevel: level as any })}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </SelectButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            What are your exercise goals? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "strength", label: "Build Strength", icon: <Dumbbell className="w-4 h-4" /> },
              { id: "cardio", label: "Improve Cardio", icon: <HeartPulse className="w-4 h-4" /> },
              { id: "flexibility", label: "Flexibility", icon: <Target className="w-4 h-4" /> },
              { id: "weight", label: "Lose Weight", icon: <Target className="w-4 h-4" /> },
            ].map((goal) => (
              <SelectButton
                key={goal.id}
                selected={data.exerciseGoals?.includes(goal.id)}
                onClick={() => toggleArrayItem("exerciseGoals", goal.id)}
                icon={goal.icon}
              >
                {goal.label}
              </SelectButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Average hours of sleep per night: {data.sleepHours}
          </label>
          <input
            type="range"
            min="4"
            max="12"
            value={data.sleepHours}
            onChange={(e) => updateData({ sleepHours: parseInt(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>4 hours</span>
            <span>12 hours</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function MentalStep({ data, updateData, toggleArrayItem }: StepProps) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-mental flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Mental Wellness</h2>
          <p className="text-white/60 text-sm">Your mind matters too</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Current stress level: {data.stressLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={data.stressLevel}
            onChange={(e) => updateData({ stressLevel: parseInt(e.target.value) })}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>Low stress</span>
            <span>High stress</span>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            What would you like to improve? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "focus", label: "Focus & Clarity" },
              { id: "anxiety", label: "Reduce Anxiety" },
              { id: "sleep", label: "Better Sleep" },
              { id: "mindfulness", label: "Mindfulness" },
              { id: "gratitude", label: "Gratitude" },
              { id: "productivity", label: "Productivity" },
            ].map((goal) => (
              <SelectButton
                key={goal.id}
                selected={data.mentalGoals?.includes(goal.id)}
                onClick={() => toggleArrayItem("mentalGoals", goal.id)}
              >
                {goal.label}
              </SelectButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Do you have meditation experience?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <SelectButton
              selected={data.meditationExperience === true}
              onClick={() => updateData({ meditationExperience: true })}
            >
              Yes, I meditate
            </SelectButton>
            <SelectButton
              selected={data.meditationExperience === false}
              onClick={() => updateData({ meditationExperience: false })}
            >
              New to meditation
            </SelectButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function FiscalStep({ data, updateData, toggleArrayItem }: StepProps) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-fiscal flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Financial Wellness</h2>
          <p className="text-white/60 text-sm">Build a healthier relationship with money</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Budgeting experience
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "none", label: "None" },
              { id: "some", label: "Some" },
              { id: "experienced", label: "Experienced" },
            ].map((level) => (
              <SelectButton
                key={level.id}
                selected={data.budgetingExperience === level.id}
                onClick={() => updateData({ budgetingExperience: level.id as any })}
              >
                {level.label}
              </SelectButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            What are your financial goals? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "save", label: "Save More" },
              { id: "debt", label: "Pay Off Debt" },
              { id: "invest", label: "Start Investing" },
              { id: "budget", label: "Stick to Budget" },
              { id: "emergency", label: "Emergency Fund" },
              { id: "retire", label: "Retirement Planning" },
            ].map((goal) => (
              <SelectButton
                key={goal.id}
                selected={data.financialGoals?.includes(goal.id)}
                onClick={() => toggleArrayItem("financialGoals", goal.id)}
              >
                {goal.label}
              </SelectButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            Monthly savings goal: ${data.savingsGoal}
          </label>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={data.savingsGoal}
            onChange={(e) => updateData({ savingsGoal: parseInt(e.target.value) })}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>$50</span>
            <span>$2,000+</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function FinalStep({ data, updateData, toggleArrayItem }: StepProps) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Almost There!</h2>
          <p className="text-white/60 text-sm">A few more questions to personalize your plan</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            How much time can you dedicate daily? {data.availableTime} minutes
          </label>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={data.availableTime}
            onChange={(e) => updateData({ availableTime: parseInt(e.target.value) })}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>10 min</span>
            <span>2 hours</span>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            What challenges do you face? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "time", label: "Limited Time", icon: <Clock className="w-4 h-4" /> },
              { id: "motivation", label: "Staying Motivated" },
              { id: "consistency", label: "Being Consistent" },
              { id: "knowledge", label: "Lack of Knowledge" },
              { id: "accountability", label: "Accountability" },
              { id: "overwhelm", label: "Feeling Overwhelmed" },
            ].map((challenge) => (
              <SelectButton
                key={challenge.id}
                selected={data.challenges?.includes(challenge.id)}
                onClick={() => toggleArrayItem("challenges", challenge.id)}
              >
                {challenge.label}
              </SelectButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-3">
            What motivates you the most?
          </label>
          <textarea
            value={data.motivation}
            onChange={(e) => updateData({ motivation: e.target.value })}
            placeholder="e.g., I want to be healthier for my family..."
            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-24"
          />
        </div>
      </div>
    </GlassCard>
  );
}

function SelectButton({
  children,
  selected,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
        flex items-center justify-center gap-2
        ${selected
          ? "bg-purple-500/30 border-purple-500/50 text-white"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
        }
        border
      `}
    >
      {icon}
      {children}
      {selected && <Check className="w-4 h-4" />}
    </button>
  );
}
