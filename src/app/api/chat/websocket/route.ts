import { NextRequest, NextResponse } from 'next/server';

const classRooms = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const userId = searchParams.get('userId');

  if (!classId || !userId) {
    return NextResponse.json({ error: 'Missing classId or userId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      if (!classRooms.has(classId)) {
        classRooms.set(classId, new Set());
      }
      classRooms.get(classId)!.add(controller);

      console.log(`User ${userId} joined class ${classId} via SSE`);

      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to chat' })}\n\n`);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        if (classRooms.has(classId)) {
          classRooms.get(classId)!.delete(controller);
          if (classRooms.get(classId)!.size === 0) {
            classRooms.delete(classId);
          }
        }
        console.log(`User ${userId} left class ${classId}`);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export function broadcastToRoom(classId: string, data: any) {
  if (classRooms.has(classId)) {
    const room = classRooms.get(classId)!;
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    room.forEach((controller) => {
      try {
        controller.enqueue(message);
      } catch (error) {
        room.delete(controller);
      }
    });

    if (room.size === 0) {
      classRooms.delete(classId);
    }
  }
}