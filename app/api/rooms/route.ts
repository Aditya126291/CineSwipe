import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock-store';

// GET to verify if a room code exists
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Room code required' }, { status: 400 });
  }

  const roomData = mockStore.getRoom(code);
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

    const roomData = mockStore.createRoom(code, userId, !!isPremium);

    return NextResponse.json({
      success: true,
      room: roomData.room,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
