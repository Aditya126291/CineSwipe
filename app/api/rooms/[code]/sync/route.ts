import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-store';

const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

const VALID_ACTIONS = ['start-session', 'swipe', 'undo-swipe'];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalizedCode = code.toUpperCase();

    if (!ROOM_CODE_REGEX.test(normalizedCode)) {
      return NextResponse.json({ error: 'Invalid room code format' }, { status: 400 });
    }

    const body = await request.json();
    const { userId, username, avatarColor, isPremium, action, swipe, movie } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (action !== undefined && !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid action payload' }, { status: 400 });
    }

    const roomData = mockStore.getRoom(normalizedCode);
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Capacity enforcement
    const currentMembers = mockStore.getCleanMembers(normalizedCode);
    const isExistingMember = currentMembers.some(m => m.user_id === userId);
    
    if (!isExistingMember && currentMembers.length >= roomData.room.max_members) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 });
    }

    // Register heartbeat/presence
    mockStore.joinRoom(normalizedCode, {
      user_id: userId,
      username: username || 'Anonymous Guest',
      avatar_color: avatarColor || '#7c3aed',
      is_premium: !!isPremium,
      joined_at: new Date().toISOString(),
    });

    mockStore.updateHeartbeat(normalizedCode, userId);

    // Handle special actions
    if (action === 'start-session') {
      mockStore.startSession(normalizedCode);
    } else if (action === 'swipe' && swipe) {
      mockStore.addSwipe(
        normalizedCode,
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
      const contentId = body.contentId;
      if (contentId) {
        roomData.swipes = roomData.swipes.filter(
          s => !(s.user_id === userId && s.content_id === contentId)
        );
      }
    }

    // Get current clean members list
    const members = mockStore.getCleanMembers(normalizedCode);

    // Rebuild activeSwipes map in structure: Record<contentId, Record<userId, {direction, timestamp}>>
    const activeSwipes: Record<number, Record<string, {direction: 'like' | 'dislike' | 'superlike', timestamp: number}>> = {};
    roomData.swipes.forEach((s) => {
      if (!activeSwipes[s.content_id]) {
        activeSwipes[s.content_id] = {};
      }
      activeSwipes[s.content_id][s.user_id] = { 
        direction: s.direction, 
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
