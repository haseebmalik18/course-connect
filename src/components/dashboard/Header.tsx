"use client";

import { useState, useRef, useEffect } from "react";
import SearchBar from "./SearchBar";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User;
  courses: any[];
  searchAllCourses: (query: string) => Promise<any[]>;
  joinCourse: (courseId: string) => Promise<boolean>;
  onSignOut: () => Promise<void>;
  onMobileMenuToggle: (isOpen: boolean) => void;
}

export default function Header({ user, courses, searchAllCourses, joinCourse, onSignOut, onMobileMenuToggle }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || "";
  const userDisplayName = user?.user_metadata?.full_name || "";
  
  const getFirstName = (displayName: string, email: string) => {
    if (displayName) {
      return displayName.split(' ')[0];
    }
    if (email) {
      const username = email.split('@')[0];
      const firstName = username.split('.')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    return "User";
  };
  
  const firstName = getFirstName(userDisplayName, userEmail);
  const userInitial = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle(newState);
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <h1 className="ml-2 lg:ml-0 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              CourseConnect
            </h1>
          </div>

          {/* Search Bar */}
          <SearchBar 
            searchAllCourses={searchAllCourses}
            joinCourse={joinCourse}
            userCourses={courses}
          />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105 flex-shrink-0">
                  {userInitial}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  Hello, {firstName}
                </p>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-all duration-200 group-hover:text-gray-600 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-300 transform origin-top-right ${
              isProfileOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
              {/* User Info Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                    {userInitial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{firstName}</p>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <button className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 transition-all duration-200 group cursor-pointer">
                  <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">View Profile</span>
                </button>
                
                <button className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 transition-all duration-200 group cursor-pointer">
                  <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Account Settings</span>
                </button>
                
                <button className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 transition-all duration-200 group cursor-pointer">
                  <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Help & Support</span>
                </button>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>
              
              {/* Sign Out */}
              <div className="py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-5 py-3 text-red-600 hover:bg-red-50/80 transition-all duration-200 group cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 