"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { MessageWithUser } from '@/lib/types/database';
import { ChatSSE } from '@/lib/websocket';

interface UseWebSocketMessagesReturn {
  messages: MessageWithUser[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useWebSocketMessages(classId?: string): UseWebSocketMessagesReturn {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const sseRef = useRef<ChatSSE | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
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
        .from('messages')
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

  useEffect(() => {
    if (!classId || !user?.id) {
      return;
    }

    const connectSSE = () => {
      sseRef.current = new ChatSSE(classId, user.id, {
        onMessage: (message: MessageWithUser) => {
          setMessages(prev => {
            const exists = prev.some(msg => msg.message_id === message.message_id);
            if (exists) return prev;
            return [...prev, message];
          });
        },
        onDelete: (messageId: string) => {
          setMessages(prev => prev.filter(msg => msg.message_id !== messageId));
        },
        onConnect: () => {
          setConnected(true);
          setError(null);
        },
        onDisconnect: () => {
          setConnected(false);
        }
      });

      sseRef.current.connect();
    };

    connectSSE();

    return () => {
      if (sseRef.current) {
        sseRef.current.disconnect();
        sseRef.current = null;
      }
    };
  }, [classId, user?.id]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!classId || !content.trim() || !user) return false;

    setError(null);

    try {
      const { data: membership, error: membershipError } = await supabaseClient
        .from('user_courses')
        .select('role')
        .eq('user_id', user.id)
        .eq('class_id', classId)
        .single();

      if (membershipError) {
        throw new Error('You are not a member of this course');
      }

      const { data, error: insertError } = await supabaseClient
        .from('messages')
        .insert({
          class_id: classId,
          user_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const messageWithUser: MessageWithUser = {
        ...data,
        user: {
          full_name: `User ${user.id.slice(0, 8)}`,
          email: 'user@email.com',
        },
      };

      if (sseRef.current && sseRef.current.isConnected()) {
        await sseRef.current.broadcast('message', messageWithUser);
      } else {
        setMessages(prev => {
          const exists = prev.some(msg => msg.message_id === messageWithUser.message_id);
          if (exists) return prev;
          return [...prev, messageWithUser];
        });
      }

      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      return false;
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    setError(null);

    try {
      const { error: deleteError } = await supabaseClient
        .from('messages')
        .delete()
        .eq('message_id', messageId);

      if (deleteError) throw deleteError;

      if (sseRef.current && sseRef.current.isConnected()) {
        await sseRef.current.broadcast('delete', { messageId });
      }

      setMessages(prev => prev.filter(msg => msg.message_id !== messageId));

      return true;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message');
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