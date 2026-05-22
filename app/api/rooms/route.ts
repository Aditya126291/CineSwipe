import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-store';

const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

// GET to verify if a room code exists
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Room code required' }, { status: 400 });
  }

  const normalizedCode = code.toUpperCase();
  if (!ROOM_CODE_REGEX.test(normalizedCode)) {
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
    const { code, userId, isPremium } = await request.json();

    if (!code || !userId) {
      return NextResponse.json({ error: 'Code and userId are required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase();
    if (!ROOM_CODE_REGEX.test(normalizedCode)) {
      return NextResponse.json({ error: 'Invalid room code format. Code must be 6 alphanumeric characters.' }, { status: 400 });
    }

    const existingRoom = mockStore.getRoom(normalizedCode);
    if (existingRoom) {
      return NextResponse.json({ error: 'Room already exists' }, { status: 409 });
    }

    const roomData = mockStore.createRoom(normalizedCode, userId, !!isPremium);

    return NextResponse.json({
      success: true,
      room: roomData.room,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
