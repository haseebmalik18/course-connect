"use client";

import { MessageWithUser } from '@/lib/types/database';

export type ChatMessage = {
  type: 'message' | 'delete' | 'connected' | 'heartbeat';
  data?: any;
  message?: string;
  timestamp?: number;
};

export class ChatSSE {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private classId: string;
  private userId: string;
  private onMessage: (message: MessageWithUser) => void;
  private onDelete: (messageId: string) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;

  constructor(
    classId: string,
    userId: string,
    callbacks: {
      onMessage: (message: MessageWithUser) => void;
      onDelete: (messageId: string) => void;
      onConnect: () => void;
      onDisconnect: () => void;
    }
  ) {
    this.classId = classId;
    this.userId = userId;
    this.onMessage = callbacks.onMessage;
    this.onDelete = callbacks.onDelete;
    this.onConnect = callbacks.onConnect;
    this.onDisconnect = callbacks.onDisconnect;
  }

  connect() {
    try {
      const sseUrl = `/api/chat/websocket?classId=${this.classId}&userId=${this.userId}`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        console.log('SSE connected');
        this.reconnectAttempts = 0;
        this.onConnect();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
              console.log('Connected to chat via SSE');
              break;
            case 'message':
              this.onMessage(message.data);
              break;
            case 'delete':
              this.onDelete(message.data.messageId);
              break;
            case 'heartbeat':
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        this.onDisconnect();
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  async broadcast(type: string, data: any) {
    try {
      const response = await fetch('/api/chat/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: this.classId,
          type,
          data
        })
      });

      if (!response.ok) {
        throw new Error('Broadcast failed');
      }
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}