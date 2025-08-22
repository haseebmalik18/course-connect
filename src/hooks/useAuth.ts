"use client";

import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Handle different auth events
      switch (event) {
        case "SIGNED_IN":
          router.push("/dashboard");
          break;
        case "SIGNED_OUT":
          router.push("/");
          break;
        case "TOKEN_REFRESHED":
          console.log("Token refreshed successfully");
          break;
        case "USER_UPDATED":
          console.log("User profile updated");
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      setUser(data.user);
      setSession(data.session);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setError("Please check your email to confirm your account");
      } else {
        setUser(data.user);
        setSession(data.session);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message || "Failed to sign out");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      setUser(data.user);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
}
