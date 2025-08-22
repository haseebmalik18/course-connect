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
  const subscriptionRef = useRef<any>(null);

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
      `Setting up real-time subscription for class ${classId}, user ${user.id}`
    );

    // Fetch existing messages first
    fetchMessages();

    // Set up real-time subscription
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
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          
          // Create message with user info
          const messageWithUser: MessageWithUser = {
            ...newMessage,
            user: {
              full_name: `User ${newMessage.user_id.slice(0, 8)}`,
              email: "user@email.com",
            },
          };

          // Add message to state, checking for duplicates
          setMessages((prev) => {
            // Check for duplicate using message_id (more reliable than created_at + content)
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
        console.log('Subscription status:', status);
        setConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time messages');
          setError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('Subscription error:', status);
          setError('Real-time connection lost');
        }
      });

    subscriptionRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      if (subscriptionRef.current) {
        supabaseClient.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
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

      // Insert message - Supabase will automatically broadcast to all subscribers
      const { error: insertError } = await supabaseClient
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

      // No need to manually add to state - the subscription will handle it
      // This prevents duplicates and ensures all clients get the same message

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

      // No need to manually remove from state - the subscription will handle it

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