import { NextRequest } from 'next/server';
import { supabaseClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return new Response('Missing classId parameter', { status: 400 });
  }

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendMessage = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const sendHeartbeat = () => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      };

      let intervalId: NodeJS.Timeout;

      const setupSubscription = async () => {
        try {
          const { data: initialMessages } = await (supabaseClient
            .from("messages") as any)
            .select("*")
            .eq("class_id", classId)
            .order("created_at", { ascending: true })
            .limit(100);

          if (initialMessages) {
            const messagesWithUsers = initialMessages.map((message: any) => ({
              ...message,
              user: {
                full_name: `User ${message.user_id.slice(0, 8)}`,
                email: "user@email.com",
              },
            }));
            
            sendMessage({ type: 'initial', messages: messagesWithUsers });
          }

          intervalId = setInterval(() => {
            sendHeartbeat();
          }, 30000);

          let lastMessageTime = new Date().toISOString();
          
          const pollMessages = async () => {
            try {
              const { data: messages } = await (supabaseClient
                .from("messages") as any)
                .select("*")
                .eq("class_id", classId)
                .gt("created_at", lastMessageTime)
                .order("created_at", { ascending: true });

              if (messages && messages.length > 0) {
                messages.forEach((message: any) => {
                  const messageWithUser = {
                    ...message,
                    user: {
                      full_name: `User ${message.user_id.slice(0, 8)}`,
                      email: "user@email.com",
                    },
                  };
                  sendMessage({ type: 'new', message: messageWithUser });
                });
                lastMessageTime = messages[messages.length - 1].created_at;
              }
            } catch (error) {
              console.error('Error polling messages:', error);
              sendMessage({ type: 'error', error: 'Failed to load messages' });
            }
          };

          const pollInterval = setInterval(pollMessages, 1000);

          return () => {
            if (intervalId) clearInterval(intervalId);
            clearInterval(pollInterval);
          };
        } catch (error) {
          console.error('Setup error:', error);
          sendMessage({ type: 'error', error: 'Failed to load messages' });
        }
      };

      setupSubscription();

      const cleanup = () => {
        if (intervalId) clearInterval(intervalId);
      };

      request.signal.addEventListener('abort', cleanup);
    }
  });

  return new Response(stream, { headers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, content, userId } = body;

    if (!classId || !content || !userId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: membership, error: membershipError } = await (supabaseClient
      .from("user_courses") as any)
      .select("role")
      .eq("user_id", userId)
      .eq("class_id", classId)
      .single();

    const { data: courseData, error: courseError } = await (supabaseClient
      .from("class") as any)
      .select("created_by")
      .eq("class_id", classId)
      .single();

    const isCreator = courseData?.created_by === userId;
    const isMember = membership && !membershipError;

    if (!isCreator && !isMember) {
      return Response.json({ error: 'You are not a member of this course' }, { status: 403 });
    }

    const { data, error } = await (supabaseClient
      .from("messages") as any)
      .insert({
        class_id: classId,
        user_id: userId,
        content: content.trim(),
        message_type: "text",
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return Response.json({ success: true, message: data });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}