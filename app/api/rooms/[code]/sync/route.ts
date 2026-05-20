import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-store';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { userId, username, avatarColor, isPremium, action, swipe, movie } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const roomData = mockStore.getRoom(code);
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Capacity enforcement
    const currentMembers = mockStore.getCleanMembers(code);
    const isExistingMember = currentMembers.some(m => m.user_id === userId);
    
    if (!isExistingMember && currentMembers.length >= roomData.room.max_members) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 });
    }

    // Register heartbeat/presence
    mockStore.joinRoom(code, {
      user_id: userId,
      username: username || 'Anonymous Guest',
      avatar_color: avatarColor || '#7c3aed',
      is_premium: !!isPremium,
      joined_at: new Date().toISOString(),
    });

    mockStore.updateHeartbeat(code, userId);

    // Handle special actions
    if (action === 'start-session') {
      mockStore.startSession(code);
    } else if (action === 'swipe' && swipe) {
      mockStore.addSwipe(
        code,
        {
          user_id: userId,
          room_id: roomData.room.id,
          content_id: swipe.contentId,
          content_type: swipe.mediaType,
          direction: swipe.direction,
        },
        movie
      );
    } else if (action === 'undo-swipe') {
      // Need to add removeSwipe to mockStore, or just do it inline
      const contentId = body.contentId;
      if (contentId) {
        roomData.swipes = roomData.swipes.filter(
          s => !(s.user_id === userId && s.content_id === contentId)
        );
      }
    }

    // Get current clean members list
    const members = mockStore.getCleanMembers(code);

    // Rebuild activeSwipes map in structure: Record<contentId, Record<userId, {direction, timestamp}>>
    const activeSwipes: Record<number, Record<string, {direction: 'like' | 'dislike' | 'superlike', timestamp: number}>> = {};
    roomData.swipes.forEach((s) => {
      if (!activeSwipes[s.content_id]) {
        activeSwipes[s.content_id] = {};
      }
      activeSwipes[s.content_id][s.user_id] = { 
        direction: s.direction as any, 
        timestamp: new Date(s.swiped_at).getTime() 
      };
    });

    return NextResponse.json({
      room: roomData.room,
      members,
      activeSwipes,
      movies: roomData.movies,
      isSwipingStarted: roomData.isSwipingStarted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
