"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Brain,
  Wallet,
  ExternalLink,
  CheckCircle,
  Clock,
  Filter,
  Lock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useUserStore } from "@/stores/userStore";
import type { ReadingContent } from "@/types";

// Curated reading content from reputable sources
const READING_CONTENT: ReadingContent[] = [
  // Physical
  {
    id: "1",
    pillar: "physical",
    title: "The Science of Sleep: Why It Matters for Your Health",
    description: "Harvard Medical School explains how sleep affects every aspect of your physical and mental health.",
    source: "Harvard Health",
    sourceUrl: "https://www.health.harvard.edu/topics/sleep",
    readingTime: 8,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  {
    id: "2",
    pillar: "physical",
    title: "Physical Activity Guidelines for Americans",
    description: "Official guidelines from the HHS on how much exercise you need for optimal health.",
    source: "HHS.gov",
    sourceUrl: "https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines",
    readingTime: 15,
    difficulty: "intermediate",
    xpReward: 30,
    premiumOnly: false,
  },
  {
    id: "3",
    pillar: "physical",
    title: "Nutrition Basics: Building a Healthy Diet",
    description: "NIH guide to understanding macronutrients, micronutrients, and building sustainable eating habits.",
    source: "NIH",
    sourceUrl: "https://www.nih.gov/health-information",
    readingTime: 12,
    difficulty: "beginner",
    xpReward: 25,
    premiumOnly: false,
  },
  // Mental
  {
    id: "4",
    pillar: "mental",
    title: "Mindfulness Meditation: A Research-Based Guide",
    description: "Evidence-based benefits of meditation and how to start a practice from the APA.",
    source: "APA",
    sourceUrl: "https://www.apa.org/topics/mindfulness/meditation",
    readingTime: 10,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  {
    id: "5",
    pillar: "mental",
    title: "Managing Stress: Principles and Strategies",
    description: "Mayo Clinic's comprehensive guide to understanding and managing stress effectively.",
    source: "Mayo Clinic",
    sourceUrl: "https://www.mayoclinic.org/healthy-lifestyle/stress-management",
    readingTime: 12,
    difficulty: "intermediate",
    xpReward: 25,
    premiumOnly: false,
  },
  {
    id: "6",
    pillar: "mental",
    title: "The Science of Gratitude and Well-being",
    description: "Research from UC Berkeley on how gratitude practices improve mental health outcomes.",
    source: "Greater Good Science Center",
    sourceUrl: "https://greatergood.berkeley.edu/topic/gratitude",
    readingTime: 8,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  // Fiscal
  {
    id: "7",
    pillar: "fiscal",
    title: "Budgeting 101: Creating Your First Budget",
    description: "NerdWallet's beginner guide to creating and sticking to a personal budget.",
    source: "NerdWallet",
    sourceUrl: "https://www.nerdwallet.com/article/finance/how-to-budget",
    readingTime: 10,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  {
    id: "8",
    pillar: "fiscal",
    title: "Emergency Fund: How Much Should You Save?",
    description: "Expert guidance on building financial security through emergency savings.",
    source: "Investopedia",
    sourceUrl: "https://www.investopedia.com/terms/e/emergency_fund.asp",
    readingTime: 8,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  {
    id: "9",
    pillar: "fiscal",
    title: "Introduction to Index Fund Investing",
    description: "Vanguard's guide to understanding and investing in low-cost index funds.",
    source: "Vanguard",
    sourceUrl: "https://investor.vanguard.com/investor-resources-education",
    readingTime: 15,
    difficulty: "intermediate",
    xpReward: 30,
    premiumOnly: true,
  },
  {
    id: "10",
    pillar: "fiscal",
    title: "Psychology of Money: Understanding Your Relationship with Finances",
    description: "Insights into behavioral finance and how emotions affect financial decisions.",
    source: "Behavioral Scientist",
    sourceUrl: "https://behavioralscientist.org/",
    readingTime: 12,
    difficulty: "advanced",
    xpReward: 35,
    premiumOnly: true,
  },
];

export default function LibraryPage() {
  const { profile } = useUserStore();
  const [activeFilter, setActiveFilter] = useState<"all" | "physical" | "mental" | "fiscal">("all");
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);

  const filteredContent = READING_CONTENT.filter(
    (content) => activeFilter === "all" || content.pillar === activeFilter
  );

  const freeArticlesRead = completedArticles.filter((id) => {
    const article = READING_CONTENT.find((c) => c.id === id);
    return article && !article.premiumOnly;
  }).length;

  const canAccessFree = profile?.tier === "premium" || freeArticlesRead < 5;

  const handleMarkComplete = (id: string) => {
    if (!completedArticles.includes(id)) {
      setCompletedArticles([...completedArticles, id]);
      const article = READING_CONTENT.find((c) => c.id === id);
      if (article) {
        useUserStore.getState().addXP(article.xpReward);
      }
    }
  };

  const pillarIcons = {
    physical: Target,
    mental: Brain,
    fiscal: Wallet,
  };

  const pillarColors = {
    physical: "from-[#667eea] to-[#764ba2]",
    mental: "from-[#f093fb] to-[#f5576c]",
    fiscal: "from-[#4facfe] to-[#00f2fe]",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" />
          Required Reading
        </h1>
        <p className="text-white/60 mt-2">
          Curated content from reputable sources to deepen your knowledge
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Articles Read</div>
          <div className="text-2xl font-bold text-white">
            {completedArticles.length}
            <span className="text-lg text-white/40">/{READING_CONTENT.length}</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">XP Earned from Reading</div>
          <div className="text-2xl font-bold text-purple-400">
            {completedArticles.reduce((sum, id) => {
              const article = READING_CONTENT.find((c) => c.id === id);
              return sum + (article?.xpReward || 0);
            }, 0)} XP
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-white/60 text-sm">Subscription</div>
          <div className="text-2xl font-bold text-white capitalize">
            {profile?.tier || "Free"}
          </div>
          {profile?.tier === "free" && (
            <div className="text-white/40 text-xs mt-1">
              {5 - freeArticlesRead} free articles remaining
            </div>
          )}
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
        {(["all", "physical", "mental", "fiscal"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${activeFilter === filter
                ? "bg-purple-500/30 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            {filter === "all" ? "All Topics" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredContent.map((content, index) => {
          const Icon = pillarIcons[content.pillar];
          const isCompleted = completedArticles.includes(content.id);
          const isLocked = content.premiumOnly && profile?.tier !== "premium";
          const isFreeButLimited = !content.premiumOnly && !canAccessFree && !isCompleted;

          return (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <GlassCard 
                className={`h-full ${isLocked || isFreeButLimited ? "opacity-60" : ""}`}
                hover={!isLocked && !isFreeButLimited}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${pillarColors[content.pillar]} flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold line-clamp-2">
                        {content.title}
                      </h3>
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                      {(isLocked || isFreeButLimited) && (
                        <Lock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-white/60 text-sm mb-3 line-clamp-2">
                      {content.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                      <span>{content.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {content.readingTime} min
                      </span>
                      <span className="capitalize">{content.difficulty}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 text-sm">+{content.xpReward} XP</span>
                      
                      {isLocked ? (
                        <GlassButton variant="secondary" size="sm" disabled>
                          <Lock className="w-3 h-3 mr-1" />
                          Premium
                        </GlassButton>
                      ) : isFreeButLimited ? (
                        <GlassButton variant="secondary" size="sm" disabled>
                          Limit Reached
                        </GlassButton>
                      ) : isCompleted ? (
                        <a
                          href={content.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <GlassButton variant="ghost" size="sm">
                            Read Again
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </GlassButton>
                        </a>
                      ) : (
                        <a
                          href={content.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleMarkComplete(content.id)}
                          className="inline-flex"
                        >
                          <GlassButton variant="primary" size="sm">
                            Read Article
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </GlassButton>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Premium Upsell */}
      {profile?.tier === "free" && (
        <GlassCard className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                Unlock Full Library Access
              </h3>
              <p className="text-white/60">
                Upgrade to Premium for unlimited reading, advanced analytics, 
                unlimited AI coaching, and more.
              </p>
            </div>
            <GlassButton variant="primary">
              Upgrade to Premium
            </GlassButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
