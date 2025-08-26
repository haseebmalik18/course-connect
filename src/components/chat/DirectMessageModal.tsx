"use client";

import { useState } from "react";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { DirectMessageWithUser } from "@/lib/types/database";

interface Person {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  college?: string;
  avatar: string;
  role: "owner" | "student" | "mentor";
  joined_at?: string;
}

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Person;
  currentUserId: string;
}

export default function DirectMessageModal({ 
  isOpen, 
  onClose, 
  recipient, 
  currentUserId 
}: DirectMessageModalProps) {
  const [messageInput, setMessageInput] = useState("");
  const { 
    messages, 
    loading, 
    error, 
    connected, 
    sendMessage, 
    deleteMessage 
  } = useDirectMessages({
    currentUserId,
    recipientId: recipient.id,
  });

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      const success = await sendMessage(messageInput);
      if (success) {
        setMessageInput("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-2xl h-[600px] flex flex-col shadow-xl mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {recipient.avatar}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{recipient.name}</h2>
              <p className="text-sm text-gray-600">{recipient.year} • {recipient.major}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Connection Status */}
        {!connected && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-700">Connecting...</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium">Error loading messages</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600">Start the conversation by sending the first message!</p>
              </div>
            </div>
          )}

          {messages.map(message => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div key={message.message_id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2 group`}>
                  {!isCurrentUser && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mb-1">
                      {recipient.avatar}
                    </div>
                  )}

                  <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`relative px-4 py-2 rounded-2xl max-w-full break-words ${
                        isCurrentUser
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {isCurrentUser && (
                        <button
                          onClick={() => handleDeleteMessage(message.message_id)}
                          className="absolute -top-3 -right-3 w-7 h-7 bg-white/95 backdrop-blur-sm border border-gray-200/60 text-gray-600 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <p className={`text-xs text-gray-500 mt-1 px-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>

                  {isCurrentUser && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mb-1">
                      You
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex space-x-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${recipient.name}...`}
              disabled={loading || !connected}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || loading || !connected}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}