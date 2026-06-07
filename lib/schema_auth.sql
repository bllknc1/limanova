-- ============================================================
-- LIMANOVA AUTH TABLES — Run this in Supabase SQL Editor
-- ============================================================

-- Add access_code column to citizens table
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS access_code TEXT;

-- Create citizen sessions table
CREATE TABLE IF NOT EXISTS citizen_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on sessions
ALTER TABLE citizen_sessions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything on sessions (API uses service role)
CREATE POLICY "Service role full access on sessions" ON citizen_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_sessions_token ON citizen_sessions(token);

-- Clean up expired sessions periodically (optional cron)
-- DELETE FROM citizen_sessions WHERE expires_at < NOW();
