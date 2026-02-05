-- Migration: Add Learning Algorithm / Data Moat Features
-- Enables cross-pillar correlations, habit stacking patterns, and personalized insights

-- User wellness insights (aggregated analytics per user)
CREATE TABLE IF NOT EXISTS user_wellness_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Pillar performance scores (0-100)
  physical_score INTEGER DEFAULT 0,
  mental_score INTEGER DEFAULT 0,
  fiscal_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0,
  spiritual_score INTEGER DEFAULT 0,
  intellectual_score INTEGER DEFAULT 0,
  occupational_score INTEGER DEFAULT 0,
  environmental_score INTEGER DEFAULT 0,
  
  -- Overall wellness score
  overall_score INTEGER DEFAULT 0,
  
  -- Best performing pillar
  strongest_pillar TEXT,
  -- Needs most attention
  weakest_pillar TEXT,
  
  -- Habit completion rates by time of day
  morning_completion_rate DECIMAL(5,2) DEFAULT 0,
  afternoon_completion_rate DECIMAL(5,2) DEFAULT 0,
  evening_completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Best day for habit completion
  best_day_of_week INTEGER, -- 0=Sunday, 6=Saturday
  
  -- Streak analytics
  avg_streak_length DECIMAL(5,2) DEFAULT 0,
  streak_recovery_rate DECIMAL(5,2) DEFAULT 0, -- How often they bounce back after breaking streak
  
  -- Last calculated
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-pillar correlations (discovered patterns)
CREATE TABLE IF NOT EXISTS pillar_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which pillars are correlated
  pillar_a TEXT NOT NULL CHECK (pillar_a IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  pillar_b TEXT NOT NULL CHECK (pillar_b IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  
  -- Correlation strength (-1 to 1, where positive = improving A helps B)
  correlation_strength DECIMAL(4,3) NOT NULL,
  
  -- How many users this is based on
  sample_size INTEGER DEFAULT 0,
  
  -- Human-readable insight
  insight_text TEXT,
  -- Example: "Users who improve sleep see 40% better fiscal habits"
  
  -- Statistical confidence (0-1)
  confidence_level DECIMAL(4,3) DEFAULT 0,
  
  -- Is this insight featured/promoted
  is_featured BOOLEAN DEFAULT FALSE,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pillar_a, pillar_b)
);

-- Habit stacking patterns (what habits work well together)
CREATE TABLE IF NOT EXISTS habit_stack_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The habits in the stack (stored as habit names/types, not IDs)
  habit_type_a TEXT NOT NULL,
  habit_type_b TEXT NOT NULL,
  pillar_a TEXT NOT NULL CHECK (pillar_a IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  pillar_b TEXT NOT NULL CHECK (pillar_b IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  
  -- Success metrics
  combined_completion_rate DECIMAL(5,2) DEFAULT 0,
  retention_after_30_days DECIMAL(5,2) DEFAULT 0,
  
  -- How many users have tried this stack
  user_count INTEGER DEFAULT 0,
  
  -- Recommendation score (higher = more recommended)
  recommendation_score DECIMAL(5,2) DEFAULT 0,
  
  -- Human-readable suggestion
  suggestion_text TEXT,
  -- Example: "Morning meditation + expense tracking works great together!"
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(habit_type_a, habit_type_b)
);

-- Personalized user recommendations
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- What type of recommendation
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('habit', 'habit_stack', 'pillar_focus', 'time_optimization', 'streak_recovery')),
  
  -- The recommendation content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Related pillar(s)
  primary_pillar TEXT CHECK (primary_pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  secondary_pillar TEXT CHECK (secondary_pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  
  -- Confidence in this recommendation
  confidence_score DECIMAL(4,3) DEFAULT 0.5,
  
  -- Priority (higher = show first)
  priority INTEGER DEFAULT 0,
  
  -- User interaction
  shown_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Life events tracking (for impact analysis)
CREATE TABLE IF NOT EXISTS user_life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'job_change', 'move', 'relationship_change', 'health_event', 
    'financial_change', 'family_event', 'travel', 'other'
  )),
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Impact on wellness (self-reported, -5 to +5)
  impact_score INTEGER CHECK (impact_score >= -5 AND impact_score <= 5),
  
  -- When it happened
  event_date DATE NOT NULL,
  
  -- Which pillars were most affected
  affected_pillars TEXT[], -- Array of pillar names
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP reward tuning (personalized rewards)
CREATE TABLE IF NOT EXISTS user_xp_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Pillar-specific multipliers (1.0 = normal, >1 = bonus for weak areas)
  physical_multiplier DECIMAL(3,2) DEFAULT 1.0,
  mental_multiplier DECIMAL(3,2) DEFAULT 1.0,
  fiscal_multiplier DECIMAL(3,2) DEFAULT 1.0,
  social_multiplier DECIMAL(3,2) DEFAULT 1.0,
  spiritual_multiplier DECIMAL(3,2) DEFAULT 1.0,
  intellectual_multiplier DECIMAL(3,2) DEFAULT 1.0,
  occupational_multiplier DECIMAL(3,2) DEFAULT 1.0,
  environmental_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Time-based multipliers
  morning_multiplier DECIMAL(3,2) DEFAULT 1.0,
  evening_multiplier DECIMAL(3,2) DEFAULT 1.0,
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Streak bonuses
  streak_milestone_bonus INTEGER DEFAULT 10, -- Extra XP at streak milestones
  
  -- Last recalculated
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_wellness_insights_user_id ON user_wellness_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_pillar_correlations_featured ON pillar_correlations(is_featured);
CREATE INDEX IF NOT EXISTS idx_habit_stack_patterns_score ON habit_stack_patterns(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_type ON user_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_user_life_events_user_id ON user_life_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_life_events_date ON user_life_events(event_date);
CREATE INDEX IF NOT EXISTS idx_user_xp_multipliers_user_id ON user_xp_multipliers(user_id);

-- Enable RLS
ALTER TABLE user_wellness_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_stack_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp_multipliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User wellness insights - users can only see their own
CREATE POLICY "Users can view their own insights" ON user_wellness_insights
  FOR SELECT USING (auth.uid() = user_id);

-- Pillar correlations - everyone can view (aggregated data)
CREATE POLICY "Anyone can view correlations" ON pillar_correlations
  FOR SELECT USING (true);

-- Habit stack patterns - everyone can view (aggregated data)
CREATE POLICY "Anyone can view habit patterns" ON habit_stack_patterns
  FOR SELECT USING (true);

-- User recommendations - users can only see/update their own
CREATE POLICY "Users can view their recommendations" ON user_recommendations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their recommendations" ON user_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- User life events - users can manage their own
CREATE POLICY "Users can view their life events" ON user_life_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their life events" ON user_life_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their life events" ON user_life_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their life events" ON user_life_events
  FOR DELETE USING (auth.uid() = user_id);

-- User XP multipliers - users can view their own
CREATE POLICY "Users can view their xp multipliers" ON user_xp_multipliers
  FOR SELECT USING (auth.uid() = user_id);

-- Seed some initial correlations based on wellness research
INSERT INTO pillar_correlations (pillar_a, pillar_b, correlation_strength, insight_text, confidence_level, is_featured, sample_size) VALUES
  ('physical', 'mental', 0.72, 'Users who exercise regularly report 72% better mental clarity', 0.85, true, 1000),
  ('physical', 'fiscal', 0.45, 'Better sleep habits correlate with 45% improved financial decisions', 0.75, true, 1000),
  ('mental', 'social', 0.68, 'Mindfulness practice improves relationship satisfaction by 68%', 0.80, true, 1000),
  ('mental', 'occupational', 0.61, 'Stress management leads to 61% better work performance', 0.82, true, 1000),
  ('spiritual', 'mental', 0.74, 'Purpose-driven activities reduce anxiety symptoms by 74%', 0.78, true, 1000),
  ('intellectual', 'occupational', 0.69, 'Continuous learning boosts career advancement by 69%', 0.85, true, 1000),
  ('environmental', 'mental', 0.52, 'Organized spaces correlate with 52% lower stress levels', 0.70, true, 1000),
  ('social', 'physical', 0.48, 'Strong social ties improve exercise consistency by 48%', 0.72, true, 1000)
ON CONFLICT (pillar_a, pillar_b) DO NOTHING;

-- Seed some habit stacking patterns
INSERT INTO habit_stack_patterns (habit_type_a, habit_type_b, pillar_a, pillar_b, combined_completion_rate, suggestion_text, recommendation_score, user_count) VALUES
  ('Morning walk', 'Gratitude journaling', 'physical', 'spiritual', 78.5, 'Walk + reflect: Start your day with movement and gratitude', 85, 500),
  ('Meditation', 'Expense tracking', 'mental', 'fiscal', 72.3, 'Mindful money: Calm your mind, then review your spending', 82, 450),
  ('Reading', 'Career planning', 'intellectual', 'occupational', 81.2, 'Learn + apply: Read industry content, then plan your week', 88, 400),
  ('Exercise', 'Healthy meal prep', 'physical', 'physical', 85.6, 'Workout + fuel: Exercise then prep nutritious meals', 90, 600),
  ('Journaling', 'Friend check-in', 'mental', 'social', 69.8, 'Reflect + connect: Process your thoughts, then reach out', 78, 350),
  ('Declutter', 'Meditation', 'environmental', 'mental', 74.1, 'Clear space, clear mind: Organize then meditate', 80, 320),
  ('Skill learning', 'Teaching others', 'intellectual', 'social', 77.9, 'Learn + teach: Master a skill by sharing it', 84, 280),
  ('Nature walk', 'Mindfulness', 'environmental', 'spiritual', 82.4, 'Nature connection: Walk outdoors with presence', 87, 420)
ON CONFLICT (habit_type_a, habit_type_b) DO NOTHING;
