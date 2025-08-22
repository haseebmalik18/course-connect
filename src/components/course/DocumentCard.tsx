"use client";

import { useState } from "react";
import { DocumentWithUser } from "@/lib/types/database";

interface DocumentCardProps {
  doc: DocumentWithUser;
  currentUserId?: string;
  onDownload: (docPath: string, fileName: string) => void;
  onDelete?: (docId: string) => void;
}

export default function DocumentCard({ doc, currentUserId, onDownload, onDelete }: DocumentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileName = doc.doc_path.split('/').pop() || 'Unknown file';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  const isOwner = currentUserId && doc.created_by === currentUserId;
  
  const getDocIcon = (docType: string, fileExt: string) => {
    if (fileExt === 'pdf') {
      return (
        <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      return (
        <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src={doc.doc_path} 
            alt="Document preview"
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              `;
            }}
          />
        </div>
      );
    }
    
    const iconMap: { [key: string]: { icon: string; color: string; bg: string } } = {
      document: { 
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50 border-blue-200' 
      },
      presentation: { 
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>`, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50 border-orange-200' 
      },
      spreadsheet: { 
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>`, 
        color: 'text-green-600', 
        bg: 'bg-green-50 border-green-200' 
      },
      video: { 
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>`, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50 border-purple-200' 
      },
      archive: { 
        icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>`, 
        color: 'text-gray-600', 
        bg: 'bg-gray-50 border-gray-200' 
      },
    };
    
    const iconData = iconMap[docType] || { 
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>`, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50 border-gray-200' 
    };
    
    return (
      <div className={`w-12 h-12 ${iconData.bg} border rounded-lg flex items-center justify-center`}>
        <svg className={`w-6 h-6 ${iconData.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <g dangerouslySetInnerHTML={{ __html: iconData.icon }} />
        </svg>
      </div>
    );
  };

  const getThumbnail = () => {
    if (fileExt === 'pdf') {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg flex flex-col items-center justify-center mb-3 group-hover:from-red-100 group-hover:to-red-150 transition-colors">
          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-red-600 font-medium">PDF Document</span>
        </div>
      );
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      return (
        <div className="w-full h-32 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-3">
          <img 
            src={doc.doc_path} 
            alt="Document preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.currentTarget.parentElement!.innerHTML = `
                <div class="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-xs text-gray-500">Image Preview</span>
                </div>
              `;
            }}
          />
        </div>
      );
    }
    
    const typeColors: { [key: string]: { bg: string; text: string; name: string } } = {
      document: { bg: 'from-blue-50 to-blue-100 border-blue-200', text: 'text-blue-600', name: 'Document' },
      presentation: { bg: 'from-orange-50 to-orange-100 border-orange-200', text: 'text-orange-600', name: 'Presentation' },
      spreadsheet: { bg: 'from-green-50 to-green-100 border-green-200', text: 'text-green-600', name: 'Spreadsheet' },
      video: { bg: 'from-purple-50 to-purple-100 border-purple-200', text: 'text-purple-600', name: 'Video' },
      archive: { bg: 'from-gray-50 to-gray-100 border-gray-200', text: 'text-gray-600', name: 'Archive' },
    };
    
    const typeData = typeColors[doc.doc_type] || { bg: 'from-gray-50 to-gray-100 border-gray-200', text: 'text-gray-600', name: 'File' };
    
    return (
      <div className={`w-full h-32 bg-gradient-to-br ${typeData.bg} border rounded-lg flex flex-col items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform duration-200`}>
        {getDocIcon(doc.doc_type, fileExt)}
        <span className={`text-xs ${typeData.text} font-medium mt-2`}>{typeData.name}</span>
      </div>
    );
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(doc.doc_path, doc.doc_name || fileName);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(doc.doc_id);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer relative">
      {isOwner && (
        <button
          onClick={handleDeleteConfirm}
          className="absolute top-2 right-2 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          title="Delete document"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-20 border border-red-200">
          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-3 text-center px-2">Delete this document?</p>
          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {getThumbnail()}
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {doc.doc_name || fileName.replace(/\.[^/.]+$/, "")}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full font-medium">
            {fileExt.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-blue-600">
          by {doc.user?.full_name || 'Anonymous'}
          {isOwner && <span className="text-green-600 ml-1">(You)</span>}
        </p>
      </div>
      
      <div className="mt-3 space-y-2">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-all text-sm font-medium group-hover:bg-blue-50 group-hover:text-blue-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </div>
  );
} 