-- Migration: Add social features for network effects
-- Enables friends, achievement sharing, and community challenges

-- User connections (friends/accountability partners)
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

-- Shared achievements (public feed)
CREATE TABLE IF NOT EXISTS shared_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  message TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement likes
CREATE TABLE IF NOT EXISTS achievement_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_achievement_id UUID REFERENCES shared_achievements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shared_achievement_id, user_id)
);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pillar TEXT CHECK (pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental')),
  target_type TEXT NOT NULL CHECK (target_type IN ('habit_count', 'xp_earned', 'streak_days')),
  target_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge participation
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES weekly_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- User privacy settings
CREATE TABLE IF NOT EXISTS user_privacy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  profile_visibility TEXT DEFAULT 'friends' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_streak BOOLEAN DEFAULT TRUE,
  show_level BOOLEAN DEFAULT TRUE,
  show_achievements BOOLEAN DEFAULT TRUE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
CREATE INDEX IF NOT EXISTS idx_shared_achievements_user_id ON shared_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_achievements_visibility ON shared_achievements(visibility);
CREATE INDEX IF NOT EXISTS idx_shared_achievements_created_at ON shared_achievements(created_at);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active ON weekly_challenges(active);

-- Row Level Security Policies

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy ENABLE ROW LEVEL SECURITY;

-- User connections policies
CREATE POLICY "Users can view their own connections" ON user_connections
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can create connection requests" ON user_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their connections" ON user_connections
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can delete their connections" ON user_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Shared achievements policies
CREATE POLICY "Users can view public achievements" ON shared_achievements
  FOR SELECT USING (
    visibility = 'public' OR 
    user_id = auth.uid() OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM user_connections 
      WHERE (user_id = auth.uid() AND connected_user_id = shared_achievements.user_id AND status = 'accepted')
         OR (connected_user_id = auth.uid() AND user_id = shared_achievements.user_id AND status = 'accepted')
    ))
  );
CREATE POLICY "Users can share their own achievements" ON shared_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their shared achievements" ON shared_achievements
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their shared achievements" ON shared_achievements
  FOR DELETE USING (auth.uid() = user_id);

-- Achievement likes policies
CREATE POLICY "Users can view likes" ON achievement_likes
  FOR SELECT USING (true);
CREATE POLICY "Users can like achievements" ON achievement_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike achievements" ON achievement_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Weekly challenges are public
CREATE POLICY "Anyone can view active challenges" ON weekly_challenges
  FOR SELECT USING (active = true);

-- Challenge participants policies
CREATE POLICY "Users can view challenge leaderboards" ON challenge_participants
  FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Privacy settings policies
CREATE POLICY "Users can view their privacy settings" ON user_privacy
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can set their privacy settings" ON user_privacy
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their privacy settings" ON user_privacy
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-create default privacy settings
CREATE OR REPLACE FUNCTION create_default_privacy()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_privacy (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create privacy settings when profile is created
DROP TRIGGER IF EXISTS on_profile_created ON user_profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_privacy();

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shared_achievements
  SET likes_count = likes_count + 1
  WHERE id = NEW.shared_achievement_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_achievement_liked
  AFTER INSERT ON achievement_likes
  FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shared_achievements
  SET likes_count = likes_count - 1
  WHERE id = OLD.shared_achievement_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_achievement_unliked
  AFTER DELETE ON achievement_likes
  FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();
