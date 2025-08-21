"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { MessageWithUser } from "@/lib/types/database";
import { ChatSSE } from "@/lib/websocket";
import { User } from "@supabase/supabase-js";

interface UseWebSocketMessagesReturn {
  messages: MessageWithUser[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useWebSocketMessages(
  classId?: string
): UseWebSocketMessagesReturn {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const sseRef = useRef<ChatSSE | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!classId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabaseClient
        .from("messages")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      const messagesWithUsers = (data || []).map(
        (message: MessageWithUser) => ({
          ...message,
          user: {
            full_name: `User ${message.user_id.slice(0, 8)}`,
            email: "user@email.com",
          },
        })
      );

      setMessages(messagesWithUsers);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch messages";
      console.error("Error fetching messages:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (!classId || !user?.id) {
      setConnected(false);
      return;
    }

    console.log(
      `Setting up SSE connection for class ${classId}, user ${user.id}`
    );

    const connectSSE = () => {
      if (sseRef.current) {
        sseRef.current.disconnect();
      }

      sseRef.current = new ChatSSE(classId, user.id, {
        onMessage: (message: MessageWithUser) => {
          console.log("Received message via SSE:", message);
          setMessages((prev) => {
            const exists = prev.some(
              (msg) => msg.message_id === message.message_id
            );
            if (exists) return prev;
            return [...prev, message];
          });
        },
        onDelete: (messageId: string) => {
          console.log("Received delete via SSE:", messageId);
          setMessages((prev) =>
            prev.filter((msg) => msg.message_id !== messageId)
          );
        },
        onConnect: () => {
          console.log("SSE connected successfully");
          setConnected(true);
          setError(null);
        },
        onDisconnect: () => {
          console.log("SSE disconnected");
          setConnected(false);
        },
      });

      sseRef.current.connect();
    };

    connectSSE();

    return () => {
      if (sseRef.current) {
        console.log("Cleaning up SSE connection");
        sseRef.current.disconnect();
        sseRef.current = null;
      }
      setConnected(false);
    };
  }, [classId, user?.id]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!classId || !content.trim() || !user) return false;

    setError(null);

    try {
      const { data: membership, error: membershipError } = await supabaseClient
        .from("user_courses")
        .select("role")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .single();

      if (membershipError) {
        throw new Error("You are not a member of this course");
      }

      const { data, error: insertError } = await supabaseClient
        .from("messages")
        .insert({
          class_id: classId,
          user_id: user.id,
          content: content.trim(),
          message_type: "text",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const messageWithUser: MessageWithUser = {
        ...data,
        user: {
          full_name: `User ${user.id.slice(0, 8)}`,
          email: "user@email.com",
        },
      };

      // Always broadcast the message to all other users
      if (sseRef.current && sseRef.current.isConnected()) {
        console.log("Broadcasting message via SSE:", messageWithUser);
        await sseRef.current.broadcast("message", messageWithUser);
      } else {
        console.log("SSE not connected, broadcasting via API fallback");
        // Fallback: broadcast directly via API if SSE is not connected
        try {
          await fetch("/api/chat/broadcast", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              classId,
              type: "message",
              data: messageWithUser,
            }),
          });
        } catch (error) {
          console.error("Fallback broadcast failed:", error);
        }
      }

      // Add message to local state immediately for instant feedback
      setMessages((prev) => {
        const exists = prev.some(
          (msg) => msg.message_id === messageWithUser.message_id
        );
        if (exists) return prev;
        return [...prev, messageWithUser];
      });

      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      console.error("Error sending message:", err);
      setError(errorMessage);
      return false;
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    setError(null);

    try {
      const { error: deleteError } = await supabaseClient
        .from("messages")
        .delete()
        .eq("message_id", messageId);

      if (deleteError) throw deleteError;

      if (sseRef.current && sseRef.current.isConnected()) {
        console.log("Broadcasting delete via SSE:", messageId);
        await sseRef.current.broadcast("delete", { messageId });
      } else {
        console.log("SSE not connected, broadcasting delete via API fallback");
        try {
          await fetch("/api/chat/broadcast", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              classId,
              type: "delete",
              data: { messageId },
            }),
          });
        } catch (error) {
          console.error("Fallback delete broadcast failed:", error);
        }
      }

      setMessages((prev) => prev.filter((msg) => msg.message_id !== messageId));

      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete message";
      console.error("Error deleting message:", err);
      setError(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    if (classId && user) {
      fetchMessages();
    }
  }, [classId, user, fetchMessages]);

  return {
    messages,
    loading,
    error,
    connected,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}
