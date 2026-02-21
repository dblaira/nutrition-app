-- ============================================
-- Push Notification Kit — Database Migration
-- Run in Supabase SQL Editor
-- ============================================
--
-- This creates the two PORTABLE tables that work with any app.
--
-- NOT INCLUDED (app-specific, build your own):
--   - notification_responses table (tracks user actions on notifications)
--   - Columns on your app's content tables (surface_count, landed_count, etc.)
--   - Data migrations for existing records
--
-- See README.md for details on what to build next.
-- ============================================

-- 1. Push Subscriptions
-- Stores each device's push endpoint and encryption keys.
-- One row per user+device combination.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  device_name TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Service role can read all subscriptions (needed for cron jobs that send notifications)
CREATE POLICY "Service role reads all push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.role() = 'service_role');


-- 2. User Notification Preferences
-- Stores each user's preferred notification delivery times.
-- One row per user.
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  morning_time TEXT DEFAULT '07:00',
  midday_time TEXT DEFAULT '12:00',
  evening_time TEXT DEFAULT '18:00',
  timezone TEXT DEFAULT 'America/Los_Angeles',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users manage own preferences"
  ON user_notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Service role can read all preferences (needed for cron jobs)
CREATE POLICY "Service role reads all preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.role() = 'service_role');
