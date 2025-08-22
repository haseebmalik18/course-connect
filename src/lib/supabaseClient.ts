import { createClient } from "@supabase/supabase-js";
import type { Class, Document, Profile } from "./types/database";

export interface Database {
  public: {
    Tables: {
      class: {
        Row: Class;
        Insert: Omit<Class, "class_id" | "created_at"> & {
          doc_count?: number;
          student_count?: number;
        };
        Update: Partial<Omit<Class, "class_id" | "created_at">>;
      };
      document: {
        Row: Document;
        Insert: Omit<Document, "doc_id" | "created_at">;
        Update: Partial<Omit<Document, "doc_id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client-side Supabase client (anonymous key)
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Server-side Supabase client (service role key) - for API routes
export const supabaseServerClient = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export type { Class, Document, Profile } from "./types/database";
