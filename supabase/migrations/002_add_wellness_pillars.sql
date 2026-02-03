-- Migration: Add 5 new wellness pillars
-- Expands from 3 pillars (physical, mental, fiscal) to 8 dimensions of wellness

-- The new pillars are:
-- social: Maintaining healthy relationships and community connections
-- spiritual: Finding meaning, purpose, and inner peace
-- intellectual: Lifelong learning and expanding knowledge
-- occupational: Career fulfillment and work-life balance
-- environmental: Harmony with surroundings and sustainability

-- Update habits table pillar constraint
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_pillar_check;
ALTER TABLE habits ADD CONSTRAINT habits_pillar_check 
  CHECK (pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental'));

-- Update goals table pillar constraint
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_pillar_check;
ALTER TABLE goals ADD CONSTRAINT goals_pillar_check 
  CHECK (pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental'));

-- Update journal_entries table pillar constraint
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_pillar_check;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_pillar_check 
  CHECK (pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental'));

-- Update reading_content table pillar constraint
ALTER TABLE reading_content DROP CONSTRAINT IF EXISTS reading_content_pillar_check;
ALTER TABLE reading_content ADD CONSTRAINT reading_content_pillar_check 
  CHECK (pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental'));

-- Update achievements table pillar constraint
ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_pillar_check;
ALTER TABLE achievements ADD CONSTRAINT achievements_pillar_check 
  CHECK (pillar IN ('physical', 'mental', 'fiscal', 'social', 'spiritual', 'intellectual', 'occupational', 'environmental'));
