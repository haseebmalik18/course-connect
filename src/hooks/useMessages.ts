"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { MessageWithUser } from '@/lib/types/database';

interface UseMessagesReturn {
  messages: MessageWithUser[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useMessages(classId?: string): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        .from('messages') as any)
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      const messagesWithUsers = (data || []).map((message: any) => ({
        ...message,
        user: {
          full_name: `User ${message.user_id.slice(0, 8)}`,
          email: 'user@email.com',
        },
      }));

      setMessages(messagesWithUsers);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!classId || !content.trim()) return false;

    setError(null);

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send messages');
      }

      const { data: membership, error: membershipError } = await (supabaseClient
        .from('user_courses') as any)
        .select('role')
        .eq('user_id', user.id)
        .eq('class_id', classId)
        .single();

      if (membershipError) {
        throw new Error('You are not a member of this course');
      }

      const { data, error: insertError } = await (supabaseClient
        .from('messages') as any)
        .insert({
          class_id: classId,
          user_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      await fetchMessages();
      
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      return false;
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    setError(null);

    try {
      const { error: deleteError } = await (supabaseClient
        .from('messages') as any)
        .delete()
        .eq('message_id', messageId);

      if (deleteError) throw deleteError;

      setMessages(prev => prev.filter(msg => msg.message_id !== messageId));

      return true;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message');
      return false;
    }
  };

  useEffect(() => {
    if (classId) {
      fetchMessages();
    }
  }, [classId, fetchMessages]);


  return {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}