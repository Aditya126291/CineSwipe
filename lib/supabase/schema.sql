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

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  content_id INTEGER NOT NULL,
  content_type VARCHAR(5) DEFAULT 'movie' CHECK (content_type IN ('movie', 'tv')),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('like', 'dislike', 'superlike')),
  swiped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_swipes_room_content ON swipes(room_id, content_id);
CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE swipes;
ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Match detection function
CREATE OR REPLACE FUNCTION check_room_match(p_room_id UUID, p_content_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  member_count INTEGER;
  like_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count FROM room_members WHERE room_id = p_room_id;
  SELECT COUNT(*) INTO like_count FROM swipes 
    WHERE room_id = p_room_id 
    AND content_id = p_content_id 
    AND direction IN ('like', 'superlike');
  RETURN like_count >= member_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (tighten with auth later)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all on room_members" ON room_members FOR ALL USING (true);
CREATE POLICY "Allow all on swipes" ON swipes FOR ALL USING (true);
