'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, hasSupabase } from '@/lib/supabase/client';
import type { Room, RoomMember, Swipe } from '@/lib/supabase/types';
import type { ContentItem } from '@/lib/tmdb/types';

export function useRoom(
  roomCode: string,
  username: string,
  avatarColor: string,
  isPremiumUser: boolean,
  onMatch: (movie: ContentItem, matchReason?: string) => void
) {
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [activeSwipes, setActiveSwipes] = useState<Record<number, Record<string, 'like' | 'dislike' | 'superlike'>>>({});
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  const channelRef = useRef<any>(null);
  const isLocalMock = !hasSupabase() || !supabase;

  // Helper to generate a valid RFC4122 v4 UUID
  const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Generate or retrieve a unique user UUID
  useEffect(() => {
    let savedId = localStorage.getItem('cineswipe-user-id') || '';
    if (!savedId || !isValidUUID(savedId)) {
      savedId = generateUUID();
      localStorage.setItem('cineswipe-user-id', savedId);
    }
    setUserId(savedId);
  }, []);

  // Initialize room configuration
  useEffect(() => {
    if (!roomCode || !userId) return;

    if (isLocalMock) {
      // Simulate Room Local Mock Setup
      setTimeout(() => {
        setRoom({
          id: 'mock-room-id',
          created_by: userId,
          code: roomCode,
          status: 'active',
          created_at: new Date().toISOString(),
          max_members: isPremiumUser ? 10 : 3,
        });

        // Initialize local members list
        const initialMembers: RoomMember[] = [
          {
            room_id: 'mock-room-id',
            user_id: userId,
            username: username || 'You (Surfer)',
            avatar_color: avatarColor,
            is_premium: isPremiumUser,
            joined_at: new Date().toISOString(),
          },
          // Simulate two funny active mock surfers for cooperative swipe simulation!
          {
            room_id: 'mock-room-id',
            user_id: 'mock-user-amy',
            username: 'Amy (Cinephile)',
            avatar_color: '#ec4899',
            is_premium: false,
            joined_at: new Date().toISOString(),
          },
          {
            room_id: 'mock-room-id',
            user_id: 'mock-user-raj',
            username: 'Raj (Popcorn Lover)',
            avatar_color: '#eab308',
            is_premium: true,
            joined_at: new Date().toISOString(),
          },
        ];
        setMembers(initialMembers);
        setIsJoined(true);
        setLoading(false);
      }, 500);
      return;
    }

    // Live Supabase integration
    const fetchOrCreateRoom = async () => {
      try {
        setLoading(true);
        // Find existing room
        let { data: existingRoom, error: roomErr } = await supabase!
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .eq('status', 'active')
          .single();

        if (roomErr || !existingRoom) {
          // Create room if we are host
          const { data: newRoom, error: createErr } = await supabase!
            .from('rooms')
            .insert({
              code: roomCode,
              max_members: isPremiumUser ? 10 : 3,
            })
            .select()
            .single();

          if (createErr) throw createErr;
          existingRoom = newRoom;
        }

        setRoom(existingRoom);

        // Add user as member
        const memberData = {
          room_id: existingRoom.id,
          user_id: userId,
          username: username || 'Anonymous Guest',
          avatar_color: avatarColor,
          is_premium: isPremiumUser,
        };

        const { error: joinErr } = await supabase!
          .from('room_members')
          .upsert(memberData);

        if (joinErr) throw joinErr;

        // Fetch current members
        const { data: memberList } = await supabase!
          .from('room_members')
          .select('*')
          .eq('room_id', existingRoom.id);

        if (memberList) {
          setMembers(memberList);
        }

        setIsJoined(true);
        subscribeToRoom(existingRoom.id);
      } catch (err: any) {
        console.error('Room connection failure:', err);
        setError(err.message || 'Failed to connect to multiplayer session');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateRoom();

    return () => {
      if (channelRef.current) {
        supabase!.removeChannel(channelRef.current);
      }
    };
  }, [roomCode, userId, isLocalMock]);

  // Subscribe to realtime database changes and broadcast
  const subscribeToRoom = (roomId: string) => {
    if (!supabase) return;

    const channel = supabase.channel(`cineswipe:room:${roomId}`, {
      config: {
        presence: { key: userId },
      },
    });

    channelRef.current = channel;

    // 1. Listen for new members joining/leaving
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_members',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        const newMember = payload.new as RoomMember;
        setMembers((prev) => {
          if (prev.some((m) => m.user_id === newMember.user_id)) return prev;
          return [...prev, newMember];
        });
      }
    );

    // 2. Listen to synchronized swipes in room
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'swipes',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        const newSwipe = payload.new as Swipe;
        recordRoomSwipe(newSwipe.user_id, newSwipe.content_id, newSwipe.direction);
      }
    );

    // 3. Listen to realtime Broadcast for match celebration triggers
    channel.on('broadcast', { event: 'match-trigger' }, (payload) => {
      onMatch(payload.payload.movie, payload.payload.reason);
    });

    channel.subscribe();
  };

  const recordRoomSwipe = useCallback(
    (swipeUserId: string, contentId: number, direction: 'like' | 'dislike' | 'superlike') => {
      setActiveSwipes((prev) => {
        const currentMovieSwipes = prev[contentId] || {};
        const updatedMovieSwipes = { ...currentMovieSwipes, [swipeUserId]: direction };
        const newSwipesState = { ...prev, [contentId]: updatedMovieSwipes };

        // Verify if all present room members liked it!
        const totalMembers = members.filter((m) => m.user_id !== swipeUserId || true); // safe count
        const likes = Object.values(updatedMovieSwipes).filter((d) => d === 'like' || d === 'superlike');

        if (likes.length >= members.length && members.length > 1) {
          // It's a MATCH! The calling component can handle it.
        }

        return newSwipesState;
      });
    },
    [members]
  );

  // Send swipe logic
  const sendSwipe = async (content: ContentItem, direction: 'like' | 'dislike' | 'superlike') => {
    if (!room || !userId) return;

    if (isLocalMock) {
      // Record user's swipe
      recordRoomSwipe(userId, content.id, direction);

      // Simulate match logic in Mock Mode
      if (direction === 'like' || direction === 'superlike') {
        // Amy and Raj like movies with a high random chance to simulate natural matches!
        const willAmyLike = content.rating > 7.0 || Math.random() > 0.4;
        const willRajLike = content.rating > 7.5 || Math.random() > 0.3;

        setTimeout(() => {
          if (willAmyLike) {
            recordRoomSwipe('mock-user-amy', content.id, 'like');
          }
          setTimeout(() => {
            if (willRajLike) {
              recordRoomSwipe('mock-user-raj', content.id, 'like');
              // Trigger match celebration locally
              onMatch(content, 'Everyone swiped Liked!');
            }
          }, 1200);
        }, 800);
      }
      return;
    }

    // Supabase Live database insert
    try {
      await supabase!.from('swipes').insert({
        user_id: userId,
        room_id: room.id,
        content_id: content.id,
        content_type: content.mediaType,
        direction: direction,
      });

      recordRoomSwipe(userId, content.id, direction);

      // Verify server side / client side matching
      const { data: allSwipes } = await supabase!
        .from('swipes')
        .select('user_id, direction')
        .eq('room_id', room.id)
        .eq('content_id', content.id)
        .in('direction', ['like', 'superlike']);

      if (allSwipes && allSwipes.length >= members.length) {
        // Broadcast the match to all clients in room
        await channelRef.current.send({
          type: 'broadcast',
          event: 'match-trigger',
          payload: {
            movie: content,
            reason: direction === 'superlike' ? `${username} Super Liked this!` : 'Everyone Swiped Liked!',
          },
        });
        onMatch(content, direction === 'superlike' ? 'Super Liked!' : 'Instant Match!');
      }
    } catch (err) {
      console.error('Failed to submit realtime swipe:', err);
    }
  };

  return {
    room,
    members,
    isJoined,
    loading,
    error,
    activeSwipes,
    userId,
    sendSwipe,
  };
}
