import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-store';

import { isValidRoomCode, normalizeRoomCode, validateSyncRoomPayload } from '@/lib/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalizedCode = normalizeRoomCode(code);

    if (!isValidRoomCode(normalizedCode)) {
      return NextResponse.json({ error: 'Invalid room code format' }, { status: 400 });
    }

    const rawBody = await request.json();

    // Applied Declarative Input Schema Boundary Verification Pattern (Pillar 3)
    const validation = validateSyncRoomPayload(rawBody);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { userId, username, avatarColor, isPremium, action, swipe, movie } = validation.parsed!;

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
        movie as any
      );
    } else if (action === 'undo-swipe') {
      const contentId = rawBody.contentId;
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
