import { NextRequest, NextResponse } from 'next/server';

const globalForConnections = globalThis as unknown as {
  classRooms: Map<string, Map<string, ReadableStreamDefaultController>> | undefined;
  connectionCount: number | undefined;
};

export const classRooms = globalForConnections.classRooms ?? new Map<string, Map<string, ReadableStreamDefaultController>>();
globalForConnections.classRooms = classRooms;

function getConnectionCount() {
  return globalForConnections.connectionCount ?? 0;
}

function incrementConnectionCount() {
  globalForConnections.connectionCount = getConnectionCount() + 1;
  return globalForConnections.connectionCount;
}

function decrementConnectionCount() {
  globalForConnections.connectionCount = Math.max(0, getConnectionCount() - 1);
  return globalForConnections.connectionCount;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const userId = searchParams.get('userId');

  if (!classId || !userId) {
    return NextResponse.json({ error: 'Missing classId or userId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      incrementConnectionCount();
      
      if (!classRooms.has(classId)) {
        classRooms.set(classId, new Map());
      }
      classRooms.get(classId)!.set(userId, controller);

      try {
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to chat' })}\n\n`);
      } catch (error) {
        console.error('Error sending connection message:', error);
      }

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          clearInterval(heartbeat);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        decrementConnectionCount();
        clearInterval(heartbeat);
        if (classRooms.has(classId)) {
          classRooms.get(classId)!.delete(userId);
        }
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

export function broadcastToRoom(classId: string, data: any, excludeUserId?: string) {
  if (!classRooms.has(classId)) {
    classRooms.set(classId, new Map());
  }
  
  const room = classRooms.get(classId)!;
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  console.log(`Broadcasting to room ${classId}, ${room.size} connected users, excluding: ${excludeUserId}`);
  
  if (room.size === 0) {
    console.log(`No users in room ${classId}`);
    return;
  }
  
  const disconnectedUserIds: string[] = [];
  let broadcastCount = 0;
  
  room.forEach((controller, userId) => {
    if (excludeUserId && userId === excludeUserId) {
      console.log(`Skipping sender ${userId}`);
      return;
    }

    try {
      controller.enqueue(message);
      broadcastCount++;
      console.log(`Message sent to user ${userId}`);
    } catch (error) {
      console.error(`Error sending message to user ${userId}:`, error);
      disconnectedUserIds.push(userId);
    }
  });

  console.log(`Broadcast complete: ${broadcastCount} messages sent, ${disconnectedUserIds.length} disconnections`);

  disconnectedUserIds.forEach(userId => {
    room.delete(userId);
    decrementConnectionCount();
  });
}