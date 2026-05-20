// In-memory cooperative multiplayer mock store for local development
// This allows phone & desktop to sync perfectly in mock mode without Supabase environment variables!

import type { Room, RoomMember, Swipe } from '@/lib/supabase/types';
import type { ContentItem } from '@/lib/tmdb/types';

interface MockRoomData {
  room: Room;
  members: Record<string, RoomMember & { lastHeartbeat: number }>;
  swipes: Swipe[];
  movies: Record<number, ContentItem>;
  isSwipingStarted: boolean;
}

const globalStore = global as any;
if (!globalStore.mockRooms) {
  globalStore.mockRooms = new Map<string, MockRoomData>();
}

export const mockStore = {
  getRoom(code: string): MockRoomData | undefined {
    return globalStore.mockRooms.get(code.toUpperCase());
  },

  createRoom(code: string, userId: string, isPremium: boolean): MockRoomData {
    const cleanCode = code.toUpperCase();
    const newRoom: MockRoomData = {
      room: {
        id: `mock-room-id-${cleanCode}`,
        code: cleanCode,
        created_by: userId,
        status: 'active',
        created_at: new Date().toISOString(),
        max_members: isPremium ? 10 : 3,
      },
      members: {},
      swipes: [],
      movies: {},
      isSwipingStarted: false,
    };
    globalStore.mockRooms.set(cleanCode, newRoom);
    return newRoom;
  },

  joinRoom(code: string, member: Omit<RoomMember, 'room_id'>): boolean {
    const roomData = this.getRoom(code);
    if (!roomData) return false;

    roomData.members[member.user_id] = {
      ...member,
      room_id: roomData.room.id,
      joined_at: new Date().toISOString(),
      lastHeartbeat: Date.now(),
    };

    return true;
  },

  updateHeartbeat(code: string, userId: string) {
    const roomData = this.getRoom(code);
    if (roomData && roomData.members[userId]) {
      roomData.members[userId].lastHeartbeat = Date.now();
    }
  },

  cleanInactiveMembers(code: string) {
    const roomData = this.getRoom(code);
    if (!roomData) return;

    const timeout = 6000; // 6 seconds threshold
    const now = Date.now();
    Object.keys(roomData.members).forEach((userId) => {
      // Don't remove the host or recently active members
      if (userId !== roomData.room.created_by && now - roomData.members[userId].lastHeartbeat > timeout) {
        delete roomData.members[userId];
      }
    });
  },

  addSwipe(code: string, swipe: Omit<Swipe, 'id' | 'swiped_at'>, movie?: ContentItem) {
    const roomData = this.getRoom(code);
    if (!roomData) return;

    if (movie) {
      roomData.movies[movie.id] = movie;
    }

    // Check for duplicates
    const exists = roomData.swipes.some(
      (s) => s.user_id === swipe.user_id && s.content_id === swipe.content_id
    );
    if (!exists) {
      roomData.swipes.push({
        id: `swipe-uuid-${Date.now()}-${Math.random()}`,
        ...swipe,
        swiped_at: new Date().toISOString(),
      });
    }
  },

  startSession(code: string) {
    const roomData = this.getRoom(code);
    if (roomData) {
      roomData.isSwipingStarted = true;
    }
  },

  getCleanMembers(code: string): RoomMember[] {
    const roomData = this.getRoom(code);
    if (!roomData) return [];

    this.cleanInactiveMembers(code);
    return Object.values(roomData.members).map(({ lastHeartbeat, ...m }) => m);
  }
};
