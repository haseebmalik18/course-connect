import { NextRequest } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return new Response("Missing classId parameter", { status: 400 });
  }

  if (!supabaseServerClient) {
    return new Response("Server configuration error", { status: 500 });
  }

  // Type assertion: we know supabaseServerClient is not null after the check above
  const supabase = supabaseServerClient!;

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendMessage = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const sendHeartbeat = () => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      };

      let intervalId: NodeJS.Timeout;

      const setupSubscription = async () => {
        try {
          const { data: initialMessages, error: fetchError } = await supabase
            .from("messages")
            .select("*")
            .eq("class_id", classId)
            .order("created_at", { ascending: true })
            .limit(100);

          if (fetchError) {
            sendMessage({ type: "error", error: `Failed to load messages: ${fetchError.message}` });
            return;
          }

          if (initialMessages) {
            const messagesWithUsers = initialMessages.map((message: any) => ({
              ...message,
              user: {
                full_name: `User ${message.user_id.slice(0, 8)}`,
                email: "user@email.com",
              },
            }));

            sendMessage({ type: "initial", messages: messagesWithUsers });
          }

          intervalId = setInterval(() => {
            sendHeartbeat();
          }, 30000);

          let lastMessageTime = new Date().toISOString();

          const pollMessages = async () => {
            try {
              const { data: messages, error: pollError } = await supabase
                .from("messages")
                .select("*")
                .eq("class_id", classId)
                .gt("created_at", lastMessageTime)
                .order("created_at", { ascending: true });

              if (pollError) {
                sendMessage({
                  type: "error",
                  error: `Failed to load messages: ${pollError.message}`,
                });
                return;
              }

              if (messages && messages.length > 0) {
                messages.forEach((message: any) => {
                  const messageWithUser = {
                    ...message,
                    user: {
                      full_name: `User ${message.user_id.slice(0, 8)}`,
                      email: "user@email.com",
                    },
                  };
                  sendMessage({ type: "new", message: messageWithUser });
                });
                const lastMessage = messages[messages.length - 1] as any;
                lastMessageTime = lastMessage.created_at;
              }
            } catch (error) {
              
              sendMessage({ type: "error", error: "Failed to load messages" });
            }
          };

          const pollInterval = setInterval(pollMessages, 1000);

          return () => {
            if (intervalId) clearInterval(intervalId);
            clearInterval(pollInterval);
          };
        } catch (error) {
          
          sendMessage({ type: "error", error: "Failed to load messages" });
        }
      };

      setupSubscription();

      const cleanup = () => {
        if (intervalId) clearInterval(intervalId);
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, { headers });
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseServerClient) {
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Type assertion: we know supabaseServerClient is not null after the check above
    const supabase = supabaseServerClient!;

    const body = await request.json();
    const { classId, content, userId } = body;

    if (!classId || !content || !userId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, ensure the user has a profile (required by foreign key constraint)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, get user info from auth and create profile
      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserById(userId);

      if (authError) {
        return Response.json(
          { error: "User not found in auth system" },
          { status: 404 }
        );
      }

      const { error: createProfileError } = await (
        supabase.from("profiles") as any
      ).insert({
        id: userId,
        email: authUser.user?.email || "unknown@email.com",
        full_name: authUser.user?.user_metadata?.full_name || "Unknown User",
      });

      if (createProfileError) {
        return Response.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    } else if (profileError) {
      return Response.json(
        { error: "Database error checking user profile" },
        { status: 500 }
      );
    }

    // Check user membership with better error handling
    const { data: membershipData, error: membershipError } = await supabase
      .from("user_courses")
      .select("role")
      .eq("user_id", userId)
      .eq("class_id", classId)
      .single();

    // Explicitly type the membership to avoid TypeScript inference issues
    const membership: { role: string } | null = membershipData;


    if (membershipError && membershipError.code !== "PGRST116") {
      return Response.json(
        { error: "Database error checking membership" },
        { status: 500 }
      );
    }

    // Check if user is course creator
    const { data: courseData, error: courseError } = await supabase
      .from("class")
      .select("created_by")
      .eq("class_id", classId)
      .single();

    if (courseError) {
      return Response.json(
        { error: "Database error checking course" },
        { status: 500 }
      );
    }

    const isCreator = (courseData as any)?.created_by === userId;
    const isMember = membership && !membershipError;


    // Allow course creators to send messages even if not explicitly enrolled
    if (!isCreator && !isMember) {
      return Response.json(
        {
          error:
            "You are not a member of this course. Please join the course first.",
        },
        { status: 403 }
      );
    }

    // Insert message with better error handling
    const { data, error } = await (supabase.from("messages") as any)
      .insert({
        class_id: classId,
        user_id: userId,
        content: content.trim(),
        message_type: "text",
      })
      .select()
      .single();


    if (error) {
      return Response.json(
        { error: `Failed to send message: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({ success: true, message: data });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
