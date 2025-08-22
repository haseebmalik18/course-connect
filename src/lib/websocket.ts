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
        this.reconnectAttempts = 0;
        this.onConnect();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: ChatMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
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
        this.onDisconnect();
        this.attemptReconnect();
      };

    } catch (error) {
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
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
          data,
          excludeUserId: this.userId
        })
      });

      if (!response.ok) {
        throw new Error(`Broadcast failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Broadcast error:', error);
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