"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { MessageWithUser } from "@/lib/types/database";
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
  const [user, setUser] = useState<User | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

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
      if (messagesWithUsers.length > 0) {
        lastMessageIdRef.current =
          messagesWithUsers[messagesWithUsers.length - 1].message_id;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch messages";
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


    fetchMessages();

    const eventSource = new EventSource(`/api/messages?classId=${classId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initial") {
          setMessages(data.messages);
          if (data.messages.length > 0) {
            lastMessageIdRef.current =
              data.messages[data.messages.length - 1].message_id;
          }
        } else if (data.type === "new") {
          const newMessage = data.message;

          if (lastMessageIdRef.current !== newMessage.message_id) {
            setMessages((prev) => {
              const exists = prev.some(
                (msg) => msg.message_id === newMessage.message_id
              );
              if (exists) {
                return prev;
              }

              lastMessageIdRef.current = newMessage.message_id;
              return [...prev, newMessage];
            });
          }
        } else if (data.type === "error") {
          setError(data.error);
        }
      } catch (err) {
      }
    };

    eventSource.onerror = (error) => {
      setConnected(false);
      setError("Connection lost");
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnected(false);
    };
  }, [classId, user?.id, fetchMessages]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!classId || !content.trim() || !user) return false;

    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId,
          content: content.trim(),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
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

      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete message";
      setError(errorMessage);
      return false;
    }
  };

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
