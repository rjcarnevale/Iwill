-- Contests table for "Contest This Will" feature
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  will_id UUID NOT NULL REFERENCES wills(id) ON DELETE CASCADE,
  contester_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- A user can only contest a will once
  UNIQUE(will_id, contester_user_id)
);

-- Indexes for performance
CREATE INDEX idx_contests_will_id ON contests(will_id);
CREATE INDEX idx_contests_contester_user_id ON contests(contester_user_id);
CREATE INDEX idx_contests_created_at ON contests(created_at DESC);

-- RLS policies
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Anyone can view contests (public wills are public drama)
CREATE POLICY "Contests are viewable by everyone"
  ON contests FOR SELECT
  USING (true);

-- Authenticated users can create contests
CREATE POLICY "Authenticated users can create contests"
  ON contests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contester_user_id);

-- Users can update their own contests (edit comment)
CREATE POLICY "Users can update their own contests"
  ON contests FOR UPDATE
  TO authenticated
  USING (auth.uid() = contester_user_id)
  WITH CHECK (auth.uid() = contester_user_id);

-- Users can delete their own contests
CREATE POLICY "Users can delete their own contests"
  ON contests FOR DELETE
  TO authenticated
  USING (auth.uid() = contester_user_id);

-- Add 'will_contested' to notification types if using enum
-- If notifications.type is just TEXT, no migration needed
