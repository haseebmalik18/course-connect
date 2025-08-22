"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { MessageWithUser } from "@/lib/types/database";
import { User } from "@supabase/supabase-js";
import { ChatSSE } from "@/lib/websocket";

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
  const chatSSERef = useRef<ChatSSE | null>(null);

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

    // Fetch existing messages first
    fetchMessages();

    // Set up SSE connection
    const chatSSE = new ChatSSE(classId, user.id, {
      onMessage: (message: MessageWithUser) => {
        console.log('Received message via SSE:', message);
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.message_id === message.message_id
          );
          
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          
          console.log('Adding new message to state');
          return [...prev, message];
        });
      },
      onDelete: (messageId: string) => {
        console.log('Received delete via SSE:', messageId);
        setMessages((prev) =>
          prev.filter((msg) => msg.message_id !== messageId)
        );
      },
      onConnect: () => {
        console.log('SSE connected for user:', user.id, 'class:', classId);
        setConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        console.log('SSE disconnected for user:', user.id, 'class:', classId);
        setConnected(false);
        setError('Real-time connection lost');
      }
    });

    chatSSE.connect();
    chatSSERef.current = chatSSE;

    // Cleanup on unmount
    return () => {
      if (chatSSERef.current) {
        chatSSERef.current.disconnect();
        chatSSERef.current = null;
      }
      setConnected(false);
    };
  }, [classId, user?.id, fetchMessages]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!classId || !content.trim() || !user) return false;

    setError(null);

    try {
      // Check membership first
      const { error: membershipError } = await supabaseClient
        .from("user_courses")
        .select("role")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .single();

      if (membershipError) {
        throw new Error("You are not a member of this course");
      }

      // Insert message to database
      const { data: newMessage, error: insertError } = await supabaseClient
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

      if (newMessage) {
        const messageWithUser = {
          ...newMessage,
          user: {
            full_name: `User ${user.id.slice(0, 8)}`,
            email: "user@email.com",
          },
        };
        
        // Add to sender's local state immediately for instant feedback
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.message_id === newMessage.message_id
          );
          if (exists) return prev;
          return [...prev, messageWithUser];
        });
        
        // Broadcast to other connected clients via SSE (excludes sender)
        if (chatSSERef.current) {
          console.log('Broadcasting message to other users:', messageWithUser);
          await chatSSERef.current.broadcast('message', messageWithUser);
        } else {
          console.log('No SSE connection available for broadcast');
        }
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

      // Broadcast deletion to other connected clients
      if (chatSSERef.current) {
        await chatSSERef.current.broadcast('delete', { messageId });
      }

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