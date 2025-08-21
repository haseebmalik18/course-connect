"use client";

import { MessageWithUser } from '@/lib/types/database';

interface ChatMessageProps {
  message: MessageWithUser;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => void;
}

export default function ChatMessage({ message, isCurrentUser, onDelete }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message.message_id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isCurrentUser && onDelete) {
      e.preventDefault();
      handleDelete();
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
        {!isCurrentUser && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mb-1">
            {getInitials(message.user?.full_name || 'User')}
          </div>
        )}

        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} group`}>
          {!isCurrentUser && (
            <p className="text-xs text-gray-600 mb-1 px-1">
              {message.user?.full_name || 'Anonymous'}
            </p>
          )}

          <div
            className={`relative px-4 py-2 rounded-2xl max-w-full break-words cursor-pointer ${
              isCurrentUser
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md"
            }`}
            onContextMenu={handleContextMenu}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {isCurrentUser && onDelete && (
              <button
                onClick={handleDelete}
                className="absolute -top-3 -right-3 w-7 h-7 bg-white/95 backdrop-blur-sm border border-gray-200/60 text-gray-600 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 active:scale-95"
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
}