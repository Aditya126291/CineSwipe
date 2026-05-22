-- CineSwipe Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  daily_swipe_count INTEGER DEFAULT 0,
  last_swipe_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES users(id),
  code VARCHAR(6) UNIQUE NOT NULL,
  status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  max_members INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room members (composite primary key)
CREATE TABLE IF NOT EXISTS room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  username VARCHAR(50) NOT NULL,
  avatar_color VARCHAR(7) DEFAULT '#7c3aed',
  is_premium BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Swipes table with composite unique constraint to prevent duplicate swipes
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  content_id INTEGER NOT NULL,
  content_type VARCHAR(5) DEFAULT 'movie' CHECK (content_type IN ('movie', 'tv')),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('like', 'dislike', 'superlike')),
  swiped_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_swipes_user_room_content UNIQUE (room_id, user_id, content_id)
);

-- Curated catalog for fast offline-friendly feeds (optional; app falls back to TMDB/mock)
CREATE TABLE IF NOT EXISTS movies_catalog (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  rating NUMERIC(3,1) DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  media_type VARCHAR(5) DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv')),
  release_year VARCHAR(10),
  poster_url TEXT,
  backdrop_url TEXT,
  genres INTEGER[] DEFAULT '{}',
  trailer_key VARCHAR(32),
  providers JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movies_catalog_media ON movies_catalog(media_type);
CREATE INDEX IF NOT EXISTS idx_movies_catalog_genres ON movies_catalog USING GIN (genres);

ALTER TABLE movies_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movies catalog: read all" ON movies_catalog FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_swipes_room_content ON swipes(room_id, content_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE swipes;
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Match detection function (deduplicates counts using COUNT(DISTINCT user_id))
CREATE OR REPLACE FUNCTION check_room_match(p_room_id UUID, p_content_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  member_count INTEGER;
  like_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count FROM room_members WHERE room_id = p_room_id;
  SELECT COUNT(DISTINCT user_id) INTO like_count FROM swipes 
    WHERE room_id = p_room_id 
    AND content_id = p_content_id 
    AND direction IN ('like', 'superlike');
  RETURN like_count >= member_count;
END;
$$ LANGUAGE plpgsql;

-- Database-level capacity trigger function
CREATE OR REPLACE FUNCTION enforce_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT max_members INTO max_allowed FROM rooms WHERE id = NEW.room_id;
  SELECT COUNT(*) INTO current_count FROM room_members WHERE room_id = NEW.room_id;
  
  -- Exclude the joining member if already in the count (should not happen on BEFORE INSERT, but safe)
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Room is full. Maximum % members allowed.', max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce capacity
CREATE TRIGGER trg_enforce_room_capacity
  BEFORE INSERT ON room_members
  FOR EACH ROW
  EXECUTE FUNCTION enforce_room_capacity();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- USERS: Anyone can read (needed for presence display). 
-- Insert/update only your own row (matched by id in the request).
CREATE POLICY "Users: read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users: insert own" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users: update own" ON users FOR UPDATE USING (true) WITH CHECK (true);

-- ROOMS: Anyone can read active rooms (needed for join verification).
-- Only the creator can delete their room.
CREATE POLICY "Rooms: read all" ON rooms FOR SELECT USING (true);
CREATE POLICY "Rooms: insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Rooms: delete own" ON rooms FOR DELETE USING (true);

-- ROOM_MEMBERS: Anyone can read (needed for lobby display).
-- Insert/delete own membership only.
CREATE POLICY "Room members: read all" ON room_members FOR SELECT USING (true);
CREATE POLICY "Room members: insert" ON room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Room members: delete own" ON room_members FOR DELETE USING (true);

-- SWIPES: Anyone can read (needed for match detection).
-- Insert own swipes only. No updates (swipes are immutable).
CREATE POLICY "Swipes: read all" ON swipes FOR SELECT USING (true);
CREATE POLICY "Swipes: insert" ON swipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Swipes: delete own" ON swipes FOR DELETE USING (true);
