"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { validateCunyEmail, getCunyEmailErrorMessage } from "@/lib/validation";
import LoadingSpinner from "@/components/LoadingSpinner";

// Function to parse email and extract first and last name
const parseEmailToFullName = (email: string): string => {
  // Remove the @domain part
  const localPart = email.split('@')[0];
  
  // Split by dots
  const parts = localPart.split('.');
  
  console.log("Parsing email parts:", { localPart, parts });
  
  // Filter out parts that are ONLY numbers (like "70")
  const nameParts = parts.filter(part => {
    // Keep parts that contain letters, even if they also contain numbers
    return /[a-zA-Z]/.test(part);
  });
  
  console.log("Filtered name parts:", nameParts);
  
  if (nameParts.length >= 2) {
    // Convert to title case and join, removing any remaining numbers
    const firstName = nameParts[0].replace(/\d+/g, '').charAt(0).toUpperCase() + nameParts[0].replace(/\d+/g, '').slice(1).toLowerCase();
    const lastName = nameParts[1].replace(/\d+/g, '').charAt(0).toUpperCase() + nameParts[1].replace(/\d+/g, '').slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  } else if (nameParts.length === 1) {
    // If only one part, capitalize it and remove numbers
    const cleanPart = nameParts[0].replace(/\d+/g, '');
    return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1).toLowerCase();
  }
  
  // Fallback: return the local part without numbers
  return localPart.replace(/\d+/g, '').replace(/\./g, ' ');
};

export default function Register() {
  // Test the parsing function with a sample email
  console.log("Testing email parsing:", parseEmailToFullName("faikar.herzaman70@myhunter.cuny.edu"));
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
          emailRedirectTo: undefined
        }
      });

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        throw new Error(signUpError.message);
      }

      if (data.user) {
        console.log("User created successfully:", data.user);
        
        // Parse email to get full name
        const fullName = parseEmailToFullName(email);
        console.log("Original email:", email);
        console.log("Parsed full name:", fullName);
        console.log("Parsing breakdown:", {
          localPart: email.split('@')[0],
          parts: email.split('@')[0].split('.').filter(part => !/\d+/.test(part)),
          fullName
        });
        
        // Insert profile record
        try {
          console.log("Attempting to insert profile with data:", {
            id: data.user.id,
            email: email.toLowerCase(),
            full_name: fullName,
          });

          // First, let's check if a profile already exists
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error("Error checking existing profile:", checkError);
          } else if (existingProfile) {
            console.log("Profile already exists:", existingProfile);
            // Try to update instead
            const { data: updateData, error: updateError } = await supabase
              .from('profiles')
              .update({ full_name: fullName })
              .eq('id', data.user.id)
              .select();

            if (updateError) {
              console.error("Profile update error:", updateError);
              setError(`Account created but profile update failed: ${updateError.message}`);
            } else {
              console.log("Profile updated successfully:", updateData);
            }
          } else {
            // Insert new profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: email.toLowerCase(),
                full_name: fullName,
                // major, year, and college will be null for now as requested
              })
              .select(); // Add select to see what was actually inserted

            if (profileError) {
              console.error("Profile creation error:", profileError);
              // Show error to user but don't prevent redirect
              setError(`Account created but profile setup failed: ${profileError.message}`);
            } else {
              console.log("Profile created successfully:", profileData);
            }
          }
        } catch (profileErr) {
          console.error("Profile creation failed:", profileErr);
          // Show error to user but don't prevent redirect
          setError(`Account created but profile setup failed: ${profileErr instanceof Error ? profileErr.message : 'Unknown error'}`);
        }

        // Redirect to dashboard after a short delay to show any errors
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000);
      } else {
        throw new Error("No user data returned");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false); // Only set loading to false on error
    }
    // Remove the finally block - don't set loading to false on success
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && <LoadingSpinner message="Creating your account..." size="lg" />}
      
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
    </>
  );
}
