import { createClient } from '@supabase/supabase-js';
import type { Class, Document, Profile } from './types/database';

export interface Database {
  public: {
    Tables: {
      class: {
        Row: Class;
        Insert: Omit<Class, 'class_id' | 'created_at'>;
        Update: Partial<Omit<Class, 'class_id' | 'created_at'>>;
      };
      document: {
        Row: Document;
        Insert: Omit<Document, 'doc_id' | 'created_at'>;
        Update: Partial<Omit<Document, 'doc_id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type { Class, Document, Profile } from './types/database';