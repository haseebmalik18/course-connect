"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { validateCunyEmail, getCunyEmailErrorMessage } from "@/lib/validation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateCunyEmail(email)) {
      setError(getCunyEmailErrorMessage(email));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("Signing up with Supabase...", { email, password });

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        throw new Error(signUpError.message);
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        setSuccess(true);
      } else {
        throw new Error("No user data returned");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center animate-in fade-in duration-700">
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6 animate-in slide-in-from-top-2 duration-500 shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="font-medium">Registration successful!</span>
          </div>
          <p>Please check your email for the verification link.</p>
        </div>
        <p className="text-sm text-gray-600 animate-in fade-in duration-700 delay-300">
          Click the link in your email to verify your account and access the
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top duration-300">
          {error}
        </div>
      )}
      
      <div className="space-y-5">
        <div className="group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
            CUNY Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value && !validateCunyEmail(e.target.value)) {
                setEmailError(getCunyEmailErrorMessage(e.target.value));
              } else {
                setEmailError("");
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400"
            style={{
              "--tw-ring-color": "rgb(26, 115, 232)",
              "--tw-ring-opacity": "0.5"
            } as React.CSSProperties}
            placeholder="your.name@cuny.edu"
            required
          />
          {emailError && (
            <div className="text-red-600 text-sm mt-2 animate-in slide-in-from-top duration-200">
              {emailError}
            </div>
          )}
        </div>
        
        <div className="group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400"
              style={{
                "--tw-ring-color": "rgb(26, 115, 232)",
                "--tw-ring-opacity": "0.5"
              } as React.CSSProperties}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="group">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400"
              style={{
                "--tw-ring-color": "rgb(26, 115, 232)",
                "--tw-ring-opacity": "0.5"
              } as React.CSSProperties}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-md"
        style={{
          backgroundColor: "rgb(26, 115, 232)",
          "--tw-ring-color": "rgb(26, 115, 232)",
          "--tw-ring-opacity": "0.5"
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "rgb(21, 101, 208)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = "rgb(26, 115, 232)";
          }
        }}
      >
        <span className="flex items-center justify-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {loading ? "Creating account..." : "Create account"}
        </span>
      </button>
    </form>
  );
}
