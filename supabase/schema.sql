-- Iwill Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wills table
CREATE TYPE will_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE wills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  giver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email TEXT,
  item_description TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  status will_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(will_id, user_id)
);

-- Pending claims for non-users
CREATE TABLE pending_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  will_id UUID REFERENCES wills(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  claim_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wills_giver_id ON wills(giver_id);
CREATE INDEX idx_wills_recipient_id ON wills(recipient_id);
CREATE INDEX idx_wills_is_public ON wills(is_public);
CREATE INDEX idx_wills_created_at ON wills(created_at DESC);
CREATE INDEX idx_reactions_will_id ON reactions(will_id);
CREATE INDEX idx_pending_claims_email ON pending_claims(email);
CREATE INDEX idx_pending_claims_token ON pending_claims(claim_token);

-- Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Wills policies
CREATE POLICY "Public wills are viewable by everyone"
  ON wills FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own wills"
  ON wills FOR SELECT
  USING (auth.uid() = giver_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can create wills"
  ON wills FOR INSERT
  WITH CHECK (auth.uid() = giver_id);

CREATE POLICY "Recipients can update will status"
  ON wills FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Reactions policies
CREATE POLICY "Reactions are viewable by everyone"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Pending claims policies
CREATE POLICY "Claims are viewable by token"
  ON pending_claims FOR SELECT
  USING (true);

-- Enable Realtime for wills table
ALTER PUBLICATION supabase_realtime ADD TABLE wills;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create pending claim when will is created for non-user
CREATE OR REPLACE FUNCTION public.handle_new_will_for_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recipient_email IS NOT NULL AND NEW.recipient_id IS NULL THEN
    INSERT INTO public.pending_claims (will_id, email)
    VALUES (NEW.id, NEW.recipient_email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating pending claim
CREATE OR REPLACE TRIGGER on_will_created_for_email
  AFTER INSERT ON wills
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_will_for_email();
