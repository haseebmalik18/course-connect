"use client";

import { DocumentWithUser } from "@/lib/types/database";

interface DocumentCardProps {
  doc: DocumentWithUser;
  onDownload: (docPath: string, fileName: string) => void;
}

export default function DocumentCard({ doc, onDownload }: DocumentCardProps) {
  const fileName = doc.doc_path.split('/').pop() || 'Unknown file';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  
  const getDocIcon = (docType: string) => {
    const iconMap: { [key: string]: string } = {
      pdf: '📄',
      document: '📝',
      presentation: '📊',
      spreadsheet: '📈',
      image: '🖼️',
      video: '🎥',
      archive: '🗜️',
      other: '📎'
    };
    return iconMap[docType] || '📎';
  };

  const handleDownload = () => {
    onDownload(doc.doc_path, doc.doc_name || fileName);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex items-start space-x-3 mb-4">
        <div className="text-3xl">{getDocIcon(doc.doc_type)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
            {doc.doc_name || fileName.replace(/\.[^/.]+$/, "")}
          </h3>
          <p className="text-xs text-gray-500">
            {new Date(doc.created_at).toLocaleDateString()} • {fileExt.toUpperCase()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            by {doc.user?.full_name || 'Anonymous'}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-all text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Download</span>
      </button>
    </div>
  );
} 