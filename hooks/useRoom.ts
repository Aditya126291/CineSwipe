'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { safeStorage, safeSessionStorage } from '@/lib/storage';
import { supabase, hasSupabase } from '@/lib/supabase/client';
import type { Room, RoomMember, Swipe } from '@/lib/supabase/types';
import type { ContentItem } from '@/lib/tmdb/types';

export function useRoom(
  roomCode: string,
  username: string,
  avatarColor: string,
  isPremiumUser: boolean,
  onMatch: (movie: ContentItem, matchReason?: string) => void,
  isHostMode: boolean = false
) {
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [activeSwipes, setActiveSwipes] = useState<Record<number, Record<string, { direction: 'like' | 'dislike' | 'superlike', timestamp: number }>>>({});
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isSwipingStarted, setIsSwipingStarted] = useState<boolean>(false);

  const channelRef = useRef<any>(null);
  const matchedTrackerRef = useRef<Set<number>>(new Set());
  const superlikeTrackerRef = useRef<Set<string>>(new Set());
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
    let savedId = safeSessionStorage.getItem('cineswipe-user-id') || '';
    if (!savedId || !isValidUUID(savedId)) {
      savedId = generateUUID();
      safeSessionStorage.setItem('cineswipe-user-id', savedId);
    }
    setUserId(savedId);
  }, []);

  // Initialize room configuration
  useEffect(() => {
    if (!roomCode || !userId) return;

    const fetchOrCreateRoom = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isLocalMock) {
          // Cooperative server-side mock validation & registration
          if (isHostMode) {
            // Register room as host
            const createRes = await fetch('/api/rooms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: roomCode,
                userId: userId,
                isPremium: isPremiumUser,
              }),
            });
            if (!createRes.ok) {
              const errData = await createRes.json();
              throw new Error(errData.error || 'Failed to host mock room on server');
            }
            const data = await createRes.json();
            setRoom(data.room);
          } else {
            // Validate room exists for guest
            const verifyRes = await fetch(`/api/rooms?code=${roomCode}`);
            if (!verifyRes.ok) {
              const errData = await verifyRes.json();
              throw new Error(errData.error || 'This room does not exist yet. Please ask the host for the correct code!');
            }
            const data = await verifyRes.json();
            setRoom(data.room);
          }

          // Initial join sync to fetch current state
          const syncRes = await fetch(`/api/rooms/${roomCode}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              username: username || 'Anonymous Guest',
              avatarColor,
              isPremium: isPremiumUser,
            }),
          });

          if (!syncRes.ok) {
            const errData = await syncRes.json();
            throw new Error(errData.error || 'Failed to sync with room');
          }

          const syncData = await syncRes.json();
          setMembers(syncData.members || []);
          setActiveSwipes(syncData.activeSwipes || {});
          setIsSwipingStarted(!!syncData.isSwipingStarted);
          setIsJoined(true);
          setLoading(false);
          return;
        }

        // Live Supabase integration
        // 1. Ensure user profile exists in `users` table first to prevent Foreign Key violations
        const todayIso = new Date().toISOString().split('T')[0];
        const { error: userUpsertErr } = await supabase!
          .from('users')
          .upsert({
            id: userId,
            username: username || 'Anonymous Guest',
            is_premium: isPremiumUser,
            daily_swipe_count: 0,
            last_swipe_date: todayIso,
          });

        if (userUpsertErr) {
          console.warn('User profile upsert failed, continuing anyway:', userUpsertErr);
        }

        // Find existing room
        let { data: existingRoom, error: roomErr } = await supabase!
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .eq('status', 'active')
          .single();

        if (roomErr || !existingRoom) {
          // If we are NOT the host, fail with room not found error
          if (!isHostMode) {
            throw new Error('This room does not exist yet. Please ask the host for the correct code!');
          }

          // Create room if we are host
          const { data: newRoom, error: createErr } = await supabase!
            .from('rooms')
            .insert({
              code: roomCode,
              created_by: userId,
              max_members: isPremiumUser ? 10 : 3,
            })
            .select()
            .single();

          if (createErr) throw createErr;
          existingRoom = newRoom;
        }

        setRoom(existingRoom);

        // Before adding user, verify capacity
        const { count, error: countErr } = await supabase!
          .from('room_members')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', existingRoom.id);

        if (!isHostMode && count !== null && count >= existingRoom.max_members) {
          // Check if user is already a member
          const { data: me } = await supabase!
            .from('room_members')
            .select('user_id')
            .eq('room_id', existingRoom.id)
            .eq('user_id', userId)
            .single();

          if (!me) {
            throw new Error('This room is full. Capacity reached.');
          }
        }

        // Add user as member in the database for presence history
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

        // Fetch historical swipes from DB to rebuild current swipes state
        const { data: allSwipes } = await supabase!
          .from('swipes')
          .select('user_id, content_id, direction, swiped_at')
          .eq('room_id', existingRoom.id);

        if (allSwipes && allSwipes.length > 0) {
          const swipesMap: Record<number, Record<string, { direction: 'like' | 'dislike' | 'superlike', timestamp: number }>> = {};
          allSwipes.forEach((s) => {
            if (!swipesMap[s.content_id]) {
              swipesMap[s.content_id] = {};
            }
            swipesMap[s.content_id][s.user_id] = { 
              direction: s.direction as any, 
              timestamp: new Date(s.swiped_at || Date.now()).getTime() 
            };
          });
          setActiveSwipes(swipesMap);
          
          // If anyone has already swiped in this room, auto-resume active sessions
          console.log('Existing swipes detected. Resuming session immediately.');
          setIsSwipingStarted(true);
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

  // Polling for local mock sync
  useEffect(() => {
    if (!isLocalMock || !isJoined || !roomCode || !userId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const syncRes = await fetch(`/api/rooms/${roomCode}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            username: username || 'Anonymous Guest',
            avatarColor,
            isPremium: isPremiumUser,
          }),
        });

        if (!syncRes.ok) {
          console.warn('Sync polling failed');
          return;
        }

        const syncData = await syncRes.json();
        if (!isSubscribed) return;

        setMembers(syncData.members || []);
        setActiveSwipes(syncData.activeSwipes || {});
        setIsSwipingStarted(!!syncData.isSwipingStarted);

        // Check for matches dynamically from synced swipes
        if (syncData.activeSwipes) {
          const currentMembers = syncData.members || [];
          
          // Trigger superlike animations in mock mode
          if (isLocalMock) {
            Object.entries(syncData.activeSwipes).forEach(([movieIdStr, swipesObj]) => {
              const movieId = parseInt(movieIdStr, 10);
              Object.entries(swipesObj as Record<string, { direction: string; timestamp: number }>).forEach(([swipingUserId, swipeData]) => {
                if (swipeData.direction === 'superlike') {
                  const uniqueKey = `${movieId}-${swipingUserId}`;
                  if (!superlikeTrackerRef.current.has(uniqueKey)) {
                    superlikeTrackerRef.current.add(uniqueKey);
                    const swiperMember = currentMembers.find((m: any) => m.user_id === swipingUserId);
                    if (swiperMember) {
                      window.dispatchEvent(new CustomEvent('cineswipe-superlike', {
                        detail: { username: swiperMember.username, contentId: movieId }
                      }));
                    }
                  }
                }
              });
            });
          }

          if (currentMembers.length > 1) {
            Object.keys(syncData.activeSwipes).forEach((movieIdStr) => {
              const movieId = parseInt(movieIdStr, 10);
              const movieSwipes = syncData.activeSwipes[movieId] as Record<string, { direction: string, timestamp: number }>;
              const likes = Object.values(movieSwipes).filter((s) => s.direction === 'like' || s.direction === 'superlike');

              // If everyone has liked this movie and we haven't matched it yet locally
              if (likes.length >= currentMembers.length) {
                // Find movie info in syncData.movies
                const movie = syncData.movies?.[movieId];
                if (movie) {
                  if (!matchedTrackerRef.current.has(movieId)) {
                    matchedTrackerRef.current.add(movieId);
                    onMatch(movie, 'Instant Match!');
                  }
                }
              }
            });
          }
        }
      } catch (err) {
        console.error('Error during sync polling:', err);
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isLocalMock, isJoined, roomCode, userId, username, avatarColor, isPremiumUser]);

  // Subscribe to realtime database changes and broadcast
  const subscribeToRoom = (roomId: string) => {
    if (!supabase) return;

    const channel = supabase.channel(`cineswipe:room:${roomId}`, {
      config: {
        presence: { key: userId },
      },
    });

    channelRef.current = channel;

    // 1. WebSocket Realtime Presence synchronization for live lobby updates
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('Presence sync update:', presenceState);

        const activeMembers: RoomMember[] = [];
        Object.keys(presenceState).forEach((key) => {
          const userPresences = presenceState[key] as any[];
          if (userPresences && userPresences.length > 0) {
            const p = userPresences[0];
            activeMembers.push({
              room_id: roomId,
              user_id: p.user_id || key,
              username: p.username || 'Anonymous Guest',
              avatar_color: p.avatar_color || '#7c3aed',
              is_premium: !!p.is_premium,
              joined_at: p.joined_at || new Date().toISOString(),
            });
          }
        });

        if (activeMembers.length > 0) {
          activeMembers.sort((a, b) => a.joined_at.localeCompare(b.joined_at));
          setMembers(activeMembers);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Presence join:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Presence leave:', key, leftPresences);
      });

    // 2. Listen to WebSocket Broadcast for swipe actions (eliminates DB replication requirements)
    channel.on('broadcast', { event: 'swipe-action' }, (payload) => {
      const { user_id, content_id, direction, timestamp, username: swiperName } = payload.payload;
      recordRoomSwipe(user_id, content_id, direction, timestamp);
      
      // Superlike animation event
      if (direction === 'superlike' && swiperName) {
        // Dispatch a custom event to the window so MovieCard/SwipeDeck can show an animation
        window.dispatchEvent(new CustomEvent('cineswipe-superlike', {
          detail: { username: swiperName, contentId: content_id }
        }));
      }
    });

    channel.on('broadcast', { event: 'undo-swipe-action' }, (payload) => {
      const { user_id, content_id } = payload.payload;
      setActiveSwipes((prev) => {
        const movieSwipes = { ...prev[content_id] };
        delete movieSwipes[user_id];
        return { ...prev, [content_id]: movieSwipes };
      });
    });

    // 3. Listen to realtime Broadcast for match celebration triggers
    channel.on('broadcast', { event: 'match-trigger' }, (payload) => {
      onMatch(payload.payload.movie, payload.payload.reason);
    });

    // 4. Listen to realtime Broadcast for host session start trigger
    channel.on('broadcast', { event: 'session-start' }, () => {
      console.log('Session started via realtime broadcast event');
      setIsSwipingStarted(true);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to room realtime channel!');
        // Track our presence immediately
        await channel.track({
          user_id: userId,
          username: username || 'Anonymous Guest',
          avatar_color: avatarColor,
          is_premium: isPremiumUser,
          joined_at: new Date().toISOString(),
        });
      }
    });
  };

  const recordRoomSwipe = useCallback(
    (swipeUserId: string, contentId: number, direction: 'like' | 'dislike' | 'superlike', timestamp?: number) => {
      setActiveSwipes((prev) => {
        const currentMovieSwipes = prev[contentId] || {};
        const updatedMovieSwipes = { 
          ...currentMovieSwipes, 
          [swipeUserId]: { direction, timestamp: timestamp || Date.now() } 
        };
        return { ...prev, [contentId]: updatedMovieSwipes };
      });
    },
    []
  );

  // Send swipe logic
  const sendSwipe = async (content: ContentItem, direction: 'like' | 'dislike' | 'superlike') => {
    if (!room || !userId) return;

    if (isLocalMock) {
      // Record user's swipe locally
      recordRoomSwipe(userId, content.id, direction);
      
      // Post swipe to backend store
      try {
        await fetch(`/api/rooms/${roomCode}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            username: username || 'Anonymous Guest',
            avatarColor,
            isPremium: isPremiumUser,
            action: 'swipe',
            swipe: {
              contentId: content.id,
              mediaType: content.mediaType,
              direction: direction,
            },
            movie: content,
          }),
        });
      } catch (err) {
        console.error('Failed to post swipe in mock mode:', err);
      }
      return;
    }

    // Broadcast our swipe action to other clients in room via WebSockets instantly
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'swipe-action',
        payload: {
          user_id: userId,
          content_id: content.id,
          direction: direction,
          timestamp: Date.now(),
          username: username,
        },
      });
    }

    // Record swipe locally
    recordRoomSwipe(userId, content.id, direction);

    // Save swipe in Supabase database asynchronously for persistence
    try {
      supabase!.from('swipes').insert({
        user_id: userId,
        room_id: room.id,
        content_id: content.id,
        content_type: content.mediaType,
        direction: direction,
      }).then(({ error }) => {
        if (error) console.error('Supabase swipe persist error:', error);
      });

      // Verify matches in memory immediately using WebSocket state
      setActiveSwipes((currentSwipes) => {
        const movieSwipes = {
          ...(currentSwipes[content.id] || {}),
          [userId]: { direction, timestamp: Date.now() },
        };

        const likes = Object.values(movieSwipes).filter((s) => s.direction === 'like' || s.direction === 'superlike');

        // It is a MATCH if everyone in the room has swiped positively
        if (likes.length >= members.length && members.length > 1) {
          // Broadcast match-trigger to celebrate on all clients
          channelRef.current?.send({
            type: 'broadcast',
            event: 'match-trigger',
            payload: {
              movie: content,
              reason: direction === 'superlike' ? `${username} Super Liked this!` : 'Everyone Swiped Liked!',
            },
          });
          onMatch(content, direction === 'superlike' ? 'Super Liked!' : 'Instant Match!');
        }

        return currentSwipes;
      });
    } catch (err) {
      console.error('Failed to submit realtime swipe:', err);
    }
  };

  const undoSwipe = async (contentId: number) => {
    if (!room || !userId) return;

    // Locally revert
    setActiveSwipes((prev) => {
      const movieSwipes = { ...prev[contentId] };
      delete movieSwipes[userId];
      return { ...prev, [contentId]: movieSwipes };
    });

    if (isLocalMock) {
      try {
        await fetch(`/api/rooms/${roomCode}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            action: 'undo-swipe',
            contentId,
          }),
        });
      } catch (err) {}
      return;
    }

    // Broadcast our undo action to other clients in room via WebSockets instantly
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'undo-swipe-action',
        payload: {
          user_id: userId,
          content_id: contentId,
        },
      });
    }

    try {
      supabase!.from('swipes')
        .delete()
        .eq('user_id', userId)
        .eq('room_id', room.id)
        .eq('content_id', contentId)
        .then(({ error }) => {
          if (error) console.error('Supabase swipe delete error:', error);
        });
    } catch (err) {}
  };

  const startSession = useCallback(async () => {
    setIsSwipingStarted(true);

    if (isLocalMock) {
      try {
        await fetch(`/api/rooms/${roomCode}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            username: username || 'Anonymous Guest',
            avatarColor,
            isPremium: isPremiumUser,
            action: 'start-session',
          }),
        });
      } catch (err) {
        console.error('Failed to start session in mock mode:', err);
      }
      return;
    }

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'session-start',
        payload: {},
      });
    }
  }, [isLocalMock, roomCode, userId, username, avatarColor, isPremiumUser]);

  return {
    room,
    members,
    isJoined,
    loading,
    error,
    activeSwipes,
    userId,
    sendSwipe,
    undoSwipe,
    isSwipingStarted,
    startSession,
  };
}
