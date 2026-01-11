-- HealthVoice Schema (prefixed with hv_ to avoid conflicts)
-- Safe for shared Supabase projects

-- HealthVoice user settings (separate from main profiles table)
CREATE TABLE IF NOT EXISTS hv_user_settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  display_name TEXT,
  preferences JSONB DEFAULT '{
    "categories": ["voeding", "supplement", "beweging", "slaap", "welzijn"],
    "apple_health_sync": false,
    "weekly_digest": false
  }'::jsonb NOT NULL
);

-- Main health logs table
CREATE TABLE IF NOT EXISTS hv_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  raw_transcript TEXT NOT NULL,
  audio_duration_ms INTEGER,

  category TEXT NOT NULL CHECK (category IN ('voeding', 'supplement', 'beweging', 'slaap', 'welzijn', 'overig')),
  subcategory TEXT,
  content JSONB NOT NULL,

  confidence_score FLOAT DEFAULT 1.0,
  was_edited BOOLEAN DEFAULT FALSE,
  apple_health_synced BOOLEAN DEFAULT FALSE
);

-- Extraction logs table (for debugging AI extraction)
CREATE TABLE IF NOT EXISTS hv_extraction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_log_id UUID REFERENCES hv_health_logs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  raw_transcript TEXT,
  llm_response JSONB,
  extraction_time_ms INTEGER,
  confidence_details JSONB
);

-- User stats table (for streaks and counts)
CREATE TABLE IF NOT EXISTS hv_user_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_logs INTEGER DEFAULT 0,
  category_counts JSONB DEFAULT '{}'::jsonb,
  word_frequency JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hv_health_logs_user_date ON hv_health_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_hv_health_logs_category ON hv_health_logs(user_id, category);
CREATE INDEX IF NOT EXISTS idx_hv_health_logs_created ON hv_health_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hv_extraction_logs_health_log ON hv_extraction_logs(health_log_id);

-- Enable Row Level Security
ALTER TABLE hv_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hv_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hv_extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hv_user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hv_user_settings
CREATE POLICY "hv_users_view_own_settings"
  ON hv_user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "hv_users_update_own_settings"
  ON hv_user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "hv_users_insert_own_settings"
  ON hv_user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for hv_health_logs
CREATE POLICY "hv_users_view_own_logs"
  ON hv_health_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "hv_users_insert_own_logs"
  ON hv_health_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "hv_users_update_own_logs"
  ON hv_health_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "hv_users_delete_own_logs"
  ON hv_health_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hv_extraction_logs
CREATE POLICY "hv_users_view_own_extraction_logs"
  ON hv_extraction_logs FOR SELECT
  USING (
    health_log_id IN (
      SELECT id FROM hv_health_logs WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "hv_users_insert_own_extraction_logs"
  ON hv_extraction_logs FOR INSERT
  WITH CHECK (
    health_log_id IN (
      SELECT id FROM hv_health_logs WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for hv_user_stats
CREATE POLICY "hv_users_view_own_stats"
  ON hv_user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "hv_users_update_own_stats"
  ON hv_user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "hv_users_insert_own_stats"
  ON hv_user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to initialize HealthVoice user on first use
CREATE OR REPLACE FUNCTION public.hv_init_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user settings if not exists
  INSERT INTO public.hv_user_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user stats if not exists
  INSERT INTO public.hv_user_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to init user on first health log
DROP TRIGGER IF EXISTS hv_on_first_log ON hv_health_logs;
CREATE TRIGGER hv_on_first_log
  BEFORE INSERT ON hv_health_logs
  FOR EACH ROW EXECUTE FUNCTION public.hv_init_user();

-- Function to update user stats after log insertion
CREATE OR REPLACE FUNCTION public.hv_update_stats_on_log()
RETURNS TRIGGER AS $$
DECLARE
  v_category_counts JSONB;
  v_current_count INTEGER;
BEGIN
  -- Get current category counts
  SELECT category_counts INTO v_category_counts
  FROM hv_user_stats
  WHERE user_id = NEW.user_id;

  -- Get current count for category
  v_current_count := COALESCE((v_category_counts ->> NEW.category)::INTEGER, 0);

  -- Update stats
  UPDATE hv_user_stats
  SET
    total_logs = total_logs + 1,
    category_counts = jsonb_set(
      COALESCE(category_counts, '{}'::jsonb),
      ARRAY[NEW.category],
      to_jsonb(v_current_count + 1)
    ),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for stats update on new log
DROP TRIGGER IF EXISTS hv_on_log_created ON hv_health_logs;
CREATE TRIGGER hv_on_log_created
  AFTER INSERT ON hv_health_logs
  FOR EACH ROW EXECUTE FUNCTION public.hv_update_stats_on_log();

-- Function to calculate streaks
CREATE OR REPLACE FUNCTION public.hv_calculate_streak(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER) AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_prev_date DATE;
  v_log_date DATE;
  v_temp_streak INTEGER := 0;
BEGIN
  FOR v_log_date IN
    SELECT DISTINCT DATE(logged_at) as log_date
    FROM hv_health_logs
    WHERE user_id = p_user_id
    ORDER BY log_date DESC
  LOOP
    IF v_prev_date IS NULL THEN
      v_temp_streak := 1;
      IF v_log_date >= CURRENT_DATE - INTERVAL '1 day' THEN
        v_current_streak := v_temp_streak;
      END IF;
    ELSIF v_prev_date - v_log_date = 1 THEN
      v_temp_streak := v_temp_streak + 1;
      IF v_current_streak > 0 THEN
        v_current_streak := v_temp_streak;
      END IF;
    ELSE
      IF v_temp_streak > v_longest_streak THEN
        v_longest_streak := v_temp_streak;
      END IF;
      v_temp_streak := 1;
      IF v_current_streak > 0 AND v_prev_date - v_log_date > 1 THEN
        v_current_streak := 0;
      END IF;
    END IF;
    v_prev_date := v_log_date;
  END LOOP;

  IF v_temp_streak > v_longest_streak THEN
    v_longest_streak := v_temp_streak;
  END IF;

  current_streak := v_current_streak;
  longest_streak := v_longest_streak;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
