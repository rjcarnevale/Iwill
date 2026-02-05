-- Funeral preferences table
CREATE TABLE IF NOT EXISTS funeral_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  funeral_type TEXT, -- burial, cremation, celebration_of_life, viking_funeral, surprise_me
  music_playlist TEXT,
  dress_code TEXT,
  venue_preference TEXT,
  casket_preference TEXT, -- open, closed, no_casket
  vibe_description TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funeral guest list table
CREATE TABLE IF NOT EXISTS funeral_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The funeral host
  guest_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- If guest is a user
  guest_email TEXT, -- If guest is invited by email
  guest_name TEXT, -- Display name for non-users
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'disinvited')),
  invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, guest_user_id),
  UNIQUE(user_id, guest_email)
);

-- RLS Policies for funeral_preferences
ALTER TABLE funeral_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funeral preferences"
ON funeral_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funeral preferences"
ON funeral_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funeral preferences"
ON funeral_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funeral preferences"
ON funeral_preferences FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for funeral_guests
ALTER TABLE funeral_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own guest list"
ON funeral_guests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view if they are invited"
ON funeral_guests FOR SELECT
USING (auth.uid() = guest_user_id);

CREATE POLICY "Anyone can view by invite token"
ON funeral_guests FOR SELECT
USING (true);

CREATE POLICY "Users can manage their guest list"
ON funeral_guests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their guest list"
ON funeral_guests FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their guest list"
ON funeral_guests FOR DELETE
USING (auth.uid() = user_id);
