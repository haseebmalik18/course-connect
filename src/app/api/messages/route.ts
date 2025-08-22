import { NextRequest } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return new Response("Missing classId parameter", { status: 400 });
  }

  if (!supabaseServerClient) {
    console.error(
      "Supabase server client not initialized - missing service role key"
    );
    return new Response("Server configuration error", { status: 500 });
  }

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
          const { data: initialMessages, error: fetchError } = await (
            supabaseServerClient.from("messages") as any
          )
            .select("*")
            .eq("class_id", classId)
            .order("created_at", { ascending: true })
            .limit(100);

          if (fetchError) {
            console.error("Error fetching initial messages:", fetchError);
            sendMessage({ type: "error", error: "Failed to load messages" });
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
              const { data: messages, error: pollError } = await (
                supabaseServerClient.from("messages") as any
              )
                .select("*")
                .eq("class_id", classId)
                .gt("created_at", lastMessageTime)
                .order("created_at", { ascending: true });

              if (pollError) {
                console.error("Error polling messages:", pollError);
                sendMessage({
                  type: "error",
                  error: "Failed to load messages",
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
                lastMessageTime = messages[messages.length - 1].created_at;
              }
            } catch (error) {
              console.error("Error polling messages:", error);
              sendMessage({ type: "error", error: "Failed to load messages" });
            }
          };

          const pollInterval = setInterval(pollMessages, 1000);

          return () => {
            if (intervalId) clearInterval(intervalId);
            clearInterval(pollInterval);
          };
        } catch (error) {
          console.error("Setup error:", error);
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
      console.error(
        "Supabase server client not initialized - missing service role key"
      );
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { classId, content, userId } = body;

    console.log("POST /api/messages received:", {
      classId,
      content,
      userId: userId?.slice(0, 8),
    });

    if (!classId || !content || !userId) {
      console.log("Missing required fields:", {
        classId: !!classId,
        content: !!content,
        userId: !!userId,
      });
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check user membership with better error handling
    const { data: membership, error: membershipError } = await (
      supabaseServerClient.from("user_courses") as any
    )
      .select("role")
      .eq("user_id", userId)
      .eq("class_id", classId)
      .single();

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("Error checking membership:", membershipError);
      return Response.json(
        { error: "Database error checking membership" },
        { status: 500 }
      );
    }

    // Check if user is course creator
    const { data: courseData, error: courseError } = await (
      supabaseServerClient.from("class") as any
    )
      .select("created_by")
      .eq("class_id", classId)
      .single();

    if (courseError) {
      console.error("Error checking course creator:", courseError);
      return Response.json(
        { error: "Database error checking course" },
        { status: 500 }
      );
    }

    const isCreator = courseData?.created_by === userId;
    const isMember = membership && !membershipError;

    console.log("Access check:", {
      isCreator,
      isMember,
      userId: userId?.slice(0, 8),
    });

    if (!isCreator && !isMember) {
      return Response.json(
        { error: "You are not a member of this course" },
        { status: 403 }
      );
    }

    // Insert message with better error handling
    const { data, error } = await (supabaseServerClient.from("messages") as any)
      .insert({
        class_id: classId,
        user_id: userId,
        content: content.trim(),
        message_type: "text",
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting message:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return Response.json(
        { error: `Failed to send message: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Message sent successfully:", data?.message_id);
    return Response.json({ success: true, message: data });
  } catch (error) {
    console.error("Unexpected error in POST /api/messages:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
