"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient, Document } from '@/lib/supabaseClient';
import { DocumentWithUser } from '@/lib/types/database';

interface UseDocumentsReturn {
  documents: DocumentWithUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uploadDocument: (file: File, classId: string, docType?: string) => Promise<Document | null>;
  deleteDocument: (docId: string) => Promise<boolean>;
  downloadDocument: (docPath: string, fileName: string) => Promise<void>;
}

export function useDocuments(classId?: string): UseDocumentsReturn {
  const [documents, setDocuments] = useState<DocumentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!classId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabaseClient
        .from('document')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // For each document, fetch user info (if we had a profiles table)
      // For now, we'll use placeholder data
      const docsWithUsers = (data || []).map(doc => ({
        ...doc,
        user: {
          full_name: `User ${doc.created_by.slice(0, 8)}`,
          email: `user@cuny.edu`,
        },
      }));

      setDocuments(docsWithUsers);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const uploadDocument = async (
    file: File,
    classId: string,
    docType?: string
  ): Promise<Document | null> => {
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to upload documents');
      }

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${classId}/${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // If bucket doesn't exist, try creating it first
        if (uploadError.message.includes('bucket')) {
          console.warn('Storage bucket may not exist. Please create a "documents" bucket in Supabase.');
        }
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabaseClient.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Determine document type from file extension
      const detectedType = docType || getDocumentType(file.name);

      // Create document record in database
      const { data: docData, error: docError } = await supabaseClient
        .from('document')
        .insert({
          class_id: classId,
          doc_path: publicUrl,
          doc_type: detectedType,
          created_by: user.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Refetch documents to update the list
      await fetchDocuments();

      return docData;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document');
      return null;
    }
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    setError(null);

    try {
      // First, get the document to find the storage path
      const { data: doc, error: fetchError } = await supabaseClient
        .from('document')
        .select('doc_path')
        .eq('doc_id', docId)
        .single();

      if (fetchError) throw fetchError;

      // Extract the file path from the URL if it's a storage URL
      if (doc?.doc_path?.includes('storage')) {
        const pathMatch = doc.doc_path.match(/documents\/(.+)$/);
        if (pathMatch) {
          // Delete from storage
          const { error: storageError } = await supabaseClient.storage
            .from('documents')
            .remove([pathMatch[1]]);

          if (storageError) {
            console.warn('Error deleting from storage:', storageError);
          }
        }
      }

      // Delete the database record
      const { error: deleteError } = await supabaseClient
        .from('document')
        .delete()
        .eq('doc_id', docId);

      if (deleteError) throw deleteError;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.doc_id !== docId));

      return true;
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
      return false;
    }
  };

  const downloadDocument = async (docPath: string, fileName: string): Promise<void> => {
    try {
      // If it's a storage URL, we can download directly
      if (docPath.includes('storage')) {
        // Create a temporary link and click it
        const link = document.createElement('a');
        link.href = docPath;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For external URLs, open in new tab
        window.open(docPath, '_blank');
      }
    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError(err.message || 'Failed to download document');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  };
}

// Helper function to determine document type from file name
function getDocumentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    pdf: 'pdf',
    doc: 'document',
    docx: 'document',
    txt: 'document',
    ppt: 'presentation',
    pptx: 'presentation',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    svg: 'image',
    mp4: 'video',
    avi: 'video',
    mov: 'video',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
  };

  return typeMap[ext || ''] || 'other';
}