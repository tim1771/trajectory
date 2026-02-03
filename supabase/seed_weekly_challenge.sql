-- Seed file: Insert a sample weekly challenge
-- Run this manually in Supabase SQL Editor to create your first challenge

INSERT INTO weekly_challenges (
  title,
  description,
  pillar,
  target_type,
  target_value,
  xp_reward,
  start_date,
  end_date,
  active
) VALUES (
  '7-Day Wellness Streak',
  'Complete at least one habit every day for 7 days straight across any wellness pillar',
  NULL,  -- applies to all pillars
  'streak_days',
  7,
  200,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  TRUE
),
(
  'Physical Fitness Challenge',
  'Complete 10 physical wellness habits this week',
  'physical',
  'habit_count',
  10,
  150,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  TRUE
),
(
  'XP Warrior',
  'Earn 500 XP this week through any activities',
  NULL,
  'xp_earned',
  500,
  250,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  TRUE
);
