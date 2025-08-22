
export interface Class {
  class_id: string;
  college_name: string;
  class_subject: string;
  class_number: number;
  created_by: string;
  created_at: string;
}

export interface Document {
  doc_id: string;
  class_id: string;
  doc_path: string;
  doc_type: string;
  doc_name: string;
  created_by: string;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  major?: string;
  year?: string;
  college?: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  message_id: string;
  class_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  created_at: string;
  updated_at: string;
}

export interface MessageWithUser extends Message {
  user?: {
    full_name?: string;
    email?: string;
  };
}

export interface ClassWithStats extends Class {
  document_count?: number;
  member_count?: number;
}

export interface DocumentWithUser extends Document {
  user?: {
    full_name?: string;
    email?: string;
  };
}