import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-store';

import { isValidRoomCode, normalizeRoomCode, validateCreateRoomPayload } from '@/lib/validation';

// GET to verify if a room code exists
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Room code required' }, { status: 400 });
  }

  const normalizedCode = normalizeRoomCode(code);
  if (!isValidRoomCode(normalizedCode)) {
    return NextResponse.json({ error: 'Invalid room code format. Code must be 6 alphanumeric characters.' }, { status: 400 });
  }

  const roomData = mockStore.getRoom(normalizedCode);
  if (!roomData) {
    return NextResponse.json(
      { error: 'This room does not exist yet. Please ask the host for the correct code!' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    exists: true,
    room: roomData.room,
  });
}

// POST to create a room
export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // Applied Declarative Input Schema Boundary Verification Pattern (Pillar 3)
    const validation = validateCreateRoomPayload(rawBody);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { code: normalizedCode, userId, isPremium } = validation.parsed!;

    const existingRoom = mockStore.getRoom(normalizedCode);
    if (existingRoom) {
      return NextResponse.json({ error: 'Room already exists' }, { status: 409 });
    }

    const roomData = mockStore.createRoom(normalizedCode, userId, isPremium);

    return NextResponse.json({
      success: true,
      room: roomData.room,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
