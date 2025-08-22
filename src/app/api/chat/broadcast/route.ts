import { NextRequest, NextResponse } from 'next/server';
import { broadcastToRoom } from '../websocket/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, type, data, excludeUserId } = body;

    if (!classId || !type || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    broadcastToRoom(classId, { type, data }, excludeUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 });
  }
}