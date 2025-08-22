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
              const { data: messages, error: pollError } = await supabase
                .from("messages")
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
                const lastMessage = messages[messages.length - 1] as any;
                lastMessageTime = lastMessage.created_at;
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
  console.log("=== POST /api/messages called ===");
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

    // Type assertion: we know supabaseServerClient is not null after the check above
    const supabase = supabaseServerClient!;

    const body = await request.json();
    const { classId, content, userId } = body;
    console.log("Request body:", { classId, content, userId });

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
        console.error("Error fetching auth user:", authError);
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
        console.error("Error creating profile:", createProfileError);
        return Response.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
      console.log("Created profile for user:", userId);
    } else if (profileError) {
      console.error("Error checking profile:", profileError);
      return Response.json(
        { error: "Database error checking user profile" },
        { status: 500 }
      );
    }

    // Check user membership with better error handling
    const { data: membership, error: membershipError } = await supabase
      .from("user_courses")
      .select("role")
      .eq("user_id", userId)
      .eq("class_id", classId)
      .single();

    console.log("Membership check result:", { membership, membershipError });

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("Error checking membership:", membershipError);
      console.error("Membership error details:", {
        code: membershipError.code,
        message: membershipError.message,
        details: membershipError.details,
        hint: membershipError.hint,
      });
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
      console.error("Error checking course creator:", courseError);
      return Response.json(
        { error: "Database error checking course" },
        { status: 500 }
      );
    }

    const isCreator = (courseData as any)?.created_by === userId;
    const isMember = membership && !membershipError;

    console.log("Access check:", {
      isCreator,
      isMember,
      membershipRole: membership?.role || null,
      courseCreator: (courseData as any)?.created_by?.slice(0, 8),
      userId: userId?.slice(0, 8),
    });

    // Allow course creators to send messages even if not explicitly enrolled
    if (!isCreator && !isMember) {
      console.log("User not authorized - not creator or member");
      return Response.json(
        {
          error:
            "You are not a member of this course. Please join the course first.",
        },
        { status: 403 }
      );
    }

    // Insert message with better error handling
    const { data, error } = await supabase
      .from("messages")
      .insert({
        class_id: classId,
        user_id: userId,
        content: content.trim(),
        message_type: "text",
      })
      .select()
      .single();

    console.log("Message insert result:", { data, error });

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
