import { NextRequest, NextResponse } from 'next/server';

// Global in-memory store for active connections
const classRooms = new Map<string, Set<ReadableStreamDefaultController>>();

// Add connection tracking for debugging
let connectionCount = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const userId = searchParams.get('userId');

  if (!classId || !userId) {
    return NextResponse.json({ error: 'Missing classId or userId' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      connectionCount++;
      
      if (!classRooms.has(classId)) {
        classRooms.set(classId, new Set());
      }
      classRooms.get(classId)!.add(controller);

      console.log(`User ${userId} joined class ${classId} via SSE. Total connections: ${connectionCount}`);

      // Send immediate connection confirmation
      try {
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to chat' })}\n\n`);
      } catch (error) {
        console.error('Error sending connection confirmation:', error);
      }

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        connectionCount--;
        clearInterval(heartbeat);
        if (classRooms.has(classId)) {
          classRooms.get(classId)!.delete(controller);
          if (classRooms.get(classId)!.size === 0) {
            classRooms.delete(classId);
          }
        }
        console.log(`User ${userId} left class ${classId}. Total connections: ${connectionCount}`);
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
  console.log(`Broadcasting to room ${classId}:`, data);
  
  if (classRooms.has(classId)) {
    const room = classRooms.get(classId)!;
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    console.log(`Room ${classId} has ${room.size} active connections`);
    
    const disconnectedControllers: ReadableStreamDefaultController[] = [];
    
    room.forEach((controller) => {
      try {
        controller.enqueue(message);
        console.log(`Message sent to connection in room ${classId}`);
      } catch (error) {
        console.error(`Failed to send message to connection in room ${classId}:`, error);
        disconnectedControllers.push(controller);
      }
    });

    // Clean up disconnected controllers
    disconnectedControllers.forEach(controller => {
      room.delete(controller);
      connectionCount--;
    });

    if (room.size === 0) {
      classRooms.delete(classId);
      console.log(`Room ${classId} deleted - no active connections`);
    }
  } else {
    console.log(`No room found for classId: ${classId}`);
  }
}