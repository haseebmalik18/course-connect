"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient";
import { DirectMessage, DirectMessageWithUser } from "@/lib/types/database";

interface UseDirectMessagesProps {
  currentUserId: string;
  recipientId: string;
}

export function useDirectMessages({ currentUserId, recipientId }: UseDirectMessagesProps) {
  const [messages, setMessages] = useState<DirectMessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !recipientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      const userIds = [...new Set([...data.map((m: any) => m.sender_id), ...data.map((m: any) => m.recipient_id)])];
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      const messagesWithUsers = (data || []).map((message: any) => ({
        ...message,
        sender: profileMap[message.sender_id],
        recipient: profileMap[message.recipient_id],
      }));

      setMessages(messagesWithUsers);
      setConnected(true);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, recipientId]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!currentUserId || !recipientId || !content.trim()) return false;

    try {
      const { data, error: insertError } = await (supabase as any)
        .from("direct_messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: content.trim(),
          message_type: "text" as const,
          is_read: false,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      const { data: senderProfile } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", data.sender_id)
        .single();
      
      const { data: recipientProfile } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", data.recipient_id)
        .single();

      const messageWithUser = {
        ...data,
        sender: senderProfile,
        recipient: recipientProfile,
      };

      setMessages((prev: DirectMessageWithUser[]) => [...prev, messageWithUser]);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      return false;
    }
  }, [currentUserId, recipientId]);

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await (supabase as any)
        .from("direct_messages")
        .delete()
        .eq("message_id", messageId)
        .eq("sender_id", currentUserId);

      if (deleteError) throw deleteError;

      setMessages((prev: DirectMessageWithUser[]) => prev.filter((msg: DirectMessageWithUser) => msg.message_id !== messageId));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete message");
      return false;
    }
  }, [currentUserId]);

  const markAsRead = useCallback(async (): Promise<void> => {
    if (!currentUserId || !recipientId) return;

    try {
      const { error: updateError } = await (supabase as any)
        .from("direct_messages")
        .update({ is_read: true })
        .eq("sender_id", recipientId)
        .eq("recipient_id", currentUserId)
        .eq("is_read", false);

      if (updateError) throw updateError;

      setMessages((prev: DirectMessageWithUser[]) => prev.map((msg: DirectMessageWithUser) => 
        msg.sender_id === recipientId && msg.recipient_id === currentUserId && !msg.is_read
          ? { ...msg, is_read: true }
          : msg
      ));
    } catch (err: any) {
      setError(err.message || "Failed to mark messages as read");
    }
  }, [currentUserId, recipientId]);

  useEffect(() => {
    if (!currentUserId || !recipientId) return;

    fetchMessages();

    const channel = supabase
      .channel(`direct_messages:${currentUserId < recipientId ? currentUserId : recipientId}:${currentUserId < recipientId ? recipientId : currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        async (payload: any) => {
          const newMessage = payload.new;
          const isRelevantMessage = 
            (newMessage.sender_id === currentUserId && newMessage.recipient_id === recipientId) ||
            (newMessage.sender_id === recipientId && newMessage.recipient_id === currentUserId);
          
          if (!isRelevantMessage) return;

          const { data: senderProfile } = await (supabase as any)
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", newMessage.sender_id)
            .single();
          
          const { data: recipientProfile } = await (supabase as any)
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", newMessage.recipient_id)
            .single();

          const messageWithUser = {
            ...newMessage,
            sender: senderProfile,
            recipient: recipientProfile,
          };

          setMessages((prev: DirectMessageWithUser[]) => {
            if (prev.some((msg: DirectMessageWithUser) => msg.message_id === messageWithUser.message_id)) {
              return prev;
            }
            return [...prev, messageWithUser];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "direct_messages",
        },
        (payload: any) => {
          const deletedMessage = payload.old;
          const isRelevantMessage = 
            (deletedMessage.sender_id === currentUserId && deletedMessage.recipient_id === recipientId) ||
            (deletedMessage.sender_id === recipientId && deletedMessage.recipient_id === currentUserId);
          
          if (!isRelevantMessage) return;
          
          setMessages((prev: DirectMessageWithUser[]) => prev.filter((msg: DirectMessageWithUser) => msg.message_id !== deletedMessage.message_id));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "direct_messages",
        },
        (payload: any) => {
          const updatedMessage = payload.new;
          const isRelevantMessage = 
            (updatedMessage.sender_id === currentUserId && updatedMessage.recipient_id === recipientId) ||
            (updatedMessage.sender_id === recipientId && updatedMessage.recipient_id === currentUserId);
          
          if (!isRelevantMessage) return;
          
          setMessages((prev: DirectMessageWithUser[]) => prev.map((msg: DirectMessageWithUser) => 
            msg.message_id === updatedMessage.message_id 
              ? { ...msg, ...updatedMessage }
              : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, recipientId, fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  return {
    messages,
    loading,
    error,
    connected,
    sendMessage,
    deleteMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}