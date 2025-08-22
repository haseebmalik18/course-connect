"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { MessageWithUser } from "@/lib/types/database";
import { User } from "@supabase/supabase-js";
import { RealtimeChannel } from "@supabase/realtime-js";

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
  const channelRef = useRef<RealtimeChannel | null>(null);

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
      const { data, error: fetchError } = await (supabaseClient
        .from("messages") as any)
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
      `Setting up Supabase Realtime for class ${classId}, user ${user.id}`
    );

    // Fetch messages first
    fetchMessages();

    const channel = supabaseClient
      .channel(`class_messages:${classId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `class_id=eq.${classId}`
        },
        (payload) => {
          console.log('New message from Realtime:', payload);
          const newMessage = payload.new as any;
          
          const messageWithUser: MessageWithUser = {
            ...newMessage,
            user: {
              full_name: `User ${newMessage.user_id.slice(0, 8)}`,
              email: "user@email.com",
            },
          };

          setMessages((prev) => {
            const exists = prev.some(
              (msg) => msg.message_id === newMessage.message_id
            );
            
            if (exists) {
              console.log('Duplicate message detected, skipping:', newMessage.message_id);
              return prev;
            }
            
            console.log('Adding new message to state:', newMessage.message_id);
            return [...prev, messageWithUser];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `class_id=eq.${classId}`
        },
        (payload) => {
          console.log('Message deleted:', payload);
          const deletedMessage = payload.old as any;
          
          setMessages((prev) =>
            prev.filter((msg) => msg.message_id !== deletedMessage.message_id)
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to Realtime messages');
          setError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Subscription error:', status);
          setError('Real-time connection lost');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up Realtime subscription');
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setConnected(false);
    };
  }, [classId, user?.id]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!classId || !content.trim() || !user) return false;

    setError(null);

    try {
      const { error: membershipError } = await (supabaseClient
        .from("user_courses") as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .single();

      if (membershipError) {
        throw new Error("You are not a member of this course");
      }

      const { error: insertError } = await (supabaseClient
        .from("messages") as any)
        .insert({
          class_id: classId,
          user_id: user.id,
          content: content.trim(),
          message_type: "text",
        })
        .select()
        .single();

      if (insertError) throw insertError;


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
      const { error: deleteError } = await (supabaseClient
        .from("messages") as any)
        .delete()
        .eq("message_id", messageId);

      if (deleteError) throw deleteError;


      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete message";
      console.error("Error deleting message:", err);
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