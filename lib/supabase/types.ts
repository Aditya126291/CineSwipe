export interface Room {
  id: string;
  created_by: string;
  code: string;
  status: 'active' | 'closed';
  created_at: string;
  max_members: number;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  username: string;
  avatar_color: string;
  is_premium: boolean;
  joined_at: string;
}

export interface Swipe {
  id?: string;
  user_id: string;
  room_id: string | null;
  content_id: number;
  content_type: 'movie' | 'tv';
  direction: 'like' | 'dislike' | 'superlike';
  swiped_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  is_premium: boolean;
  premium_purchased_at: string | null;
  daily_swipe_count: number;
  last_swipe_date: string;
  created_at: string;
}
