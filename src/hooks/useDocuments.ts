"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseClient, Document } from "@/lib/supabaseClient";
import { DocumentWithUser } from "@/lib/types/database";

interface UseDocumentsReturn {
  documents: DocumentWithUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uploadDocument: (
    file: File,
    classId: string,
    docName: string,
    docType?: string
  ) => Promise<Document | null>;
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
      const { data, error: fetchError } = await (
        supabaseClient.from("document") as any
      )
        .select(
          "doc_id, class_id, doc_path, doc_type, created_by, created_at, doc_name"
        )
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const docsWithUsers = (data || []).map((doc: any) => ({
        ...doc,
        user: {
          full_name: `User ${doc.created_by.slice(0, 8)}`,
          email: `user@cuny.edu`,
        },
      }));

      setDocuments(docsWithUsers);
    } catch (err: any) {
      setError(err.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const uploadDocument = async (
    file: File,
    classId: string,
    docName: string,
    docType?: string
  ): Promise<Document | null> => {
    setError(null);

    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload documents");
      }


      const { data: membershipData, error: membershipError } = await (
        supabaseClient.from("user_courses") as any
      )
        .select("role")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .single();

      // Explicitly type the membership to avoid TypeScript inference issues
      const membership: { role: string } | null = membershipData;

      if (membershipError) {
        throw new Error("You are not a member of this class");
      }


      const fileExt = file.name.split(".").pop();
      const fileName = `${classId}/${user.id}/${Date.now()}.${fileExt}`;


      const { data: uploadData, error: uploadError } =
        await supabaseClient.storage.from("documents").upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes("bucket")) {
        }
        throw uploadError;
      }


      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("documents").getPublicUrl(fileName);

      const detectedType = docType || getDocumentType(file.name);


      const { data: docData, error: docError } = await (
        supabaseClient.from("document") as any
      )
        .insert({
          class_id: classId,
          doc_path: publicUrl,
          doc_type: detectedType,
          doc_name: docName,
          created_by: user.id,
        })
        .select()
        .single();

      if (docError) {
        throw docError;
      }


      try {
        const { data: currentClass, error: fetchError } = await (
          supabaseClient.from("class") as any
        )
          .select("doc_count")
          .eq("class_id", classId)
          .single();

        if (!fetchError && currentClass) {
          const currentCount = currentClass.doc_count || 0;
          const newCount = currentCount + 1;

          const { error: updateError } = await (
            supabaseClient.from("class") as any
          )
            .update({ doc_count: newCount })
            .eq("class_id", classId);

          if (updateError) {
          }
        }
      } catch (countError) {
      }

      await fetchDocuments();

      return docData;
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
      return null;
    }
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    setError(null);

    try {
      const { data: doc, error: fetchError } = await (
        supabaseClient.from("document") as any
      )
        .select("doc_path, class_id")
        .eq("doc_id", docId)
        .single();

      if (fetchError) throw fetchError;

      if (doc?.doc_path?.includes("storage")) {
        const pathMatch = doc.doc_path.match(/documents\/(.+)$/);
        if (pathMatch) {
          const { error: storageError } = await supabaseClient.storage
            .from("documents")
            .remove([pathMatch[1]]);

          if (storageError) {
          }
        }
      }

      const { error: deleteError } = await (
        supabaseClient.from("document") as any
      )
        .delete()
        .eq("doc_id", docId);

      if (deleteError) throw deleteError;

      try {
        const classId = doc?.class_id;
        if (classId) {
          const { data: currentClass, error: fetchError } = await (
            supabaseClient.from("class") as any
          )
            .select("doc_count")
            .eq("class_id", classId)
            .single();

          if (!fetchError && currentClass) {
            const currentCount = currentClass.doc_count || 0;
            const newCount = Math.max(0, currentCount - 1);

            const { error: updateError } = await (
              supabaseClient.from("class") as any
            )
              .update({ doc_count: newCount })
              .eq("class_id", classId);

            if (updateError) {
              }
          }
        }
      } catch (countError) {
        // Don't throw here as the document was deleted successfully
      }

      setDocuments((prev) => prev.filter((doc) => doc.doc_id !== docId));

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
      return false;
    }
  };

  const downloadDocument = async (
    docPath: string,
    fileName: string
  ): Promise<void> => {
    try {
      if (docPath.includes("storage")) {
        const link = document.createElement("a");
        link.href = docPath;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(docPath, "_blank");
      }
    } catch (err: any) {
      setError(err.message || "Failed to download document");
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

function getDocumentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  const typeMap: Record<string, string> = {
    pdf: "pdf",
    doc: "document",
    docx: "document",
    txt: "document",
    ppt: "presentation",
    pptx: "presentation",
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    svg: "image",
    mp4: "video",
    avi: "video",
    mov: "video",
    zip: "archive",
    rar: "archive",
    "7z": "archive",
  };

  return typeMap[ext || ""] || "other";
}
