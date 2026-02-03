"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Brain,
  Wallet,
  Users,
  Sparkles,
  Lightbulb,
  Briefcase,
  Leaf,
  ExternalLink,
  CheckCircle,
  Clock,
  Filter,
  Lock,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { useUserStore } from "@/stores/userStore";
import { createClient } from "@/lib/supabase/client";
import type { ReadingContent, WellnessPillar } from "@/types";

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
  // Social
  {
    id: "11",
    pillar: "social",
    title: "The Science of Social Connection",
    description: "Harvard research on how relationships impact health, longevity, and happiness.",
    source: "Harvard Study of Adult Development",
    sourceUrl: "https://www.adultdevelopmentstudy.org/",
    readingTime: 10,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  {
    id: "12",
    pillar: "social",
    title: "Building Meaningful Relationships",
    description: "APA's guide to developing and maintaining healthy social connections.",
    source: "APA",
    sourceUrl: "https://www.apa.org/topics/relationships",
    readingTime: 12,
    difficulty: "intermediate",
    xpReward: 25,
    premiumOnly: false,
  },
  // Spiritual
  {
    id: "13",
    pillar: "spiritual",
    title: "Finding Purpose and Meaning in Life",
    description: "Research-backed approaches to discovering your life's purpose and values.",
    source: "Greater Good Science Center",
    sourceUrl: "https://greatergood.berkeley.edu/topic/purpose",
    readingTime: 15,
    difficulty: "intermediate",
    xpReward: 30,
    premiumOnly: false,
  },
  {
    id: "14",
    pillar: "spiritual",
    title: "The Benefits of Mindfulness and Meditation",
    description: "NIH overview of how contemplative practices improve well-being.",
    source: "NIH NCCIH",
    sourceUrl: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-what-you-need-to-know",
    readingTime: 10,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  // Intellectual
  {
    id: "15",
    pillar: "intellectual",
    title: "The Science of Learning: How to Learn Anything Faster",
    description: "Evidence-based strategies for effective learning and skill acquisition.",
    source: "Coursera - Learning How to Learn",
    sourceUrl: "https://www.coursera.org/learn/learning-how-to-learn",
    readingTime: 20,
    difficulty: "intermediate",
    xpReward: 35,
    premiumOnly: false,
  },
  {
    id: "16",
    pillar: "intellectual",
    title: "Critical Thinking: A Beginner's Guide",
    description: "Stanford Encyclopedia's introduction to rational thought and decision making.",
    source: "Stanford Encyclopedia of Philosophy",
    sourceUrl: "https://plato.stanford.edu/entries/critical-thinking/",
    readingTime: 15,
    difficulty: "intermediate",
    xpReward: 30,
    premiumOnly: true,
  },
  // Occupational
  {
    id: "17",
    pillar: "occupational",
    title: "Work-Life Balance: Strategies for Success",
    description: "Harvard Business Review's guide to maintaining balance in your career.",
    source: "Harvard Business Review",
    sourceUrl: "https://hbr.org/topic/subject/work-life-balance",
    readingTime: 12,
    difficulty: "intermediate",
    xpReward: 25,
    premiumOnly: false,
  },
  {
    id: "18",
    pillar: "occupational",
    title: "Finding Career Fulfillment",
    description: "Research on aligning your work with your values and strengths.",
    source: "Gallup",
    sourceUrl: "https://www.gallup.com/cliftonstrengths/",
    readingTime: 15,
    difficulty: "intermediate",
    xpReward: 30,
    premiumOnly: true,
  },
  // Environmental
  {
    id: "19",
    pillar: "environmental",
    title: "The Health Benefits of Nature",
    description: "EPA research on how your environment affects physical and mental health.",
    source: "EPA",
    sourceUrl: "https://www.epa.gov/report-environment/health-and-environment",
    readingTime: 10,
    difficulty: "beginner",
    xpReward: 20,
    premiumOnly: false,
  },
  {
    id: "20",
    pillar: "environmental",
    title: "Creating a Healthy Home Environment",
    description: "CDC guidelines for maintaining a healthy living space.",
    source: "CDC",
    sourceUrl: "https://www.cdc.gov/nceh/publications/books/housing/housing.htm",
    readingTime: 12,
    difficulty: "beginner",
    xpReward: 25,
    premiumOnly: false,
  },
];

export default function LibraryPage() {
  const { profile, updateProfile } = useUserStore();
  const [activeFilter, setActiveFilter] = useState<"all" | WellnessPillar>("all");
  const [completedArticles, setCompletedArticles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load completed articles from database on mount
  useEffect(() => {
    const loadProgress = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("reading_progress")
        .select("content_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (data) {
        setCompletedArticles(data.map((r: any) => r.content_id));
      }
    };
    loadProgress();
  }, []);

  const filteredContent = READING_CONTENT.filter(
    (content) => activeFilter === "all" || content.pillar === activeFilter
  );

  const freeArticlesRead = completedArticles.filter((id) => {
    const article = READING_CONTENT.find((c) => c.id === id);
    return article && !article.premiumOnly;
  }).length;

  const canAccessFree = profile?.tier === "premium" || freeArticlesRead < 5;

  const handleMarkComplete = async (id: string) => {
    if (completedArticles.includes(id) || loading) return;
    
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const article = READING_CONTENT.find((c) => c.id === id);
      if (!article) return;

      // Save reading progress to database
      await supabase.from("reading_progress").upsert({
        user_id: user.id,
        content_id: id,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      // Update XP in database
      const newXP = (profile?.xpPoints || 0) + article.xpReward;
      await supabase
        .from("user_profiles")
        .update({ xp_points: newXP })
        .eq("user_id", user.id);

      // Update local state
      setCompletedArticles([...completedArticles, id]);
      useUserStore.getState().addXP(article.xpReward);
      
    } catch (err) {
      console.error("Failed to mark article complete:", err);
    } finally {
      setLoading(false);
    }
  };

  const pillarIcons: Record<WellnessPillar, any> = {
    physical: Target,
    mental: Brain,
    fiscal: Wallet,
    social: Users,
    spiritual: Sparkles,
    intellectual: Lightbulb,
    occupational: Briefcase,
    environmental: Leaf,
  };

  const pillarColors: Record<WellnessPillar, string> = {
    physical: "from-[#667eea] to-[#764ba2]",
    mental: "from-[#f093fb] to-[#f5576c]",
    fiscal: "from-[#4facfe] to-[#00f2fe]",
    social: "from-[#f97316] to-[#fb923c]",
    spiritual: "from-[#8b5cf6] to-[#a78bfa]",
    intellectual: "from-[#eab308] to-[#fbbf24]",
    occupational: "from-[#22c55e] to-[#4ade80]",
    environmental: "from-[#14b8a6] to-[#2dd4bf]",
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
        <div className="flex gap-2">
          {(["all", "physical", "mental", "fiscal", "social", "spiritual", "intellectual", "occupational", "environmental"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                ${activeFilter === filter
                  ? "bg-purple-500/30 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
                }
              `}
            >
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
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
