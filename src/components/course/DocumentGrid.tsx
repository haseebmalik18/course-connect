"use client";

import { DocumentWithUser } from "@/lib/types/database";
import DocumentCard from "./DocumentCard";

interface DocumentGridProps {
  documents: DocumentWithUser[];
  onDownload: (docPath: string, fileName: string) => void;
}

export default function DocumentGrid({ documents, onDownload }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-300 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-600 mb-4">Get started by uploading your first study material.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map(doc => (
        <DocumentCard
          key={doc.doc_id}
          doc={doc}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
} 